// Zero-config Postgres bootstrap.
//
// Problem this solves: on a fresh Vercel deploy, DATABASE_URL points to an empty
// Postgres database (Neon/Supabase/Vercel Postgres). Nothing in the build creates
// the tables, so the very first query (login/register) fails with
// "The table `public.User` does not exist".
//
// On first DB access we check whether the schema exists and, if not, apply the
// init migration (prisma/migrations/*_init) inside a single transaction guarded by
// a Postgres advisory lock, so concurrent cold starts cannot race each other.
// The migration is also recorded in `_prisma_migrations` with Prisma's checksum,
// so a later `prisma migrate deploy` treats it as already applied.
//
// Opt out with NUVRA_DB_AUTO_BOOTSTRAP=0 (e.g. if you manage migrations yourself).

import { createHash, randomUUID } from "crypto";
import { INIT_MIGRATION_NAME, INIT_MIGRATION_SQL } from "./db-bootstrap-sql";

// Arbitrary constant key for pg_advisory_xact_lock ("nuvra" in ASCII-ish digits).
const LOCK_KEY = 78_117_118_114;

export type BootstrapStatus =
  | { state: "idle" }
  | { state: "running" }
  | { state: "ready"; created: boolean }
  | { state: "disabled" }
  | { state: "error"; error: string };

let status: BootstrapStatus = { state: "idle" };
let inflight: Promise<void> | null = null;

export function getBootstrapStatus(): BootstrapStatus {
  return status;
}

export function isAutoBootstrapEnabled() {
  const v = (process.env.NUVRA_DB_AUTO_BOOTSTRAP || "").toLowerCase();
  return !(v === "0" || v === "false" || v === "off");
}

/** Split the Prisma-generated migration into individual statements. */
export function splitSqlStatements(sql: string): string[] {
  return sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((s) =>
      s
        .split(/\r?\n/)
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim()
    )
    .filter(Boolean);
}

export function migrationChecksum(sql: string = INIT_MIGRATION_SQL) {
  return createHash("sha256").update(sql).digest("hex");
}

async function schemaExists(client: any): Promise<boolean> {
  const rows: Array<{ exists: boolean }> = await client.$queryRawUnsafe(
    `SELECT to_regclass('public."User"') IS NOT NULL AS "exists"`
  );
  return !!rows?.[0]?.exists;
}

async function runBootstrap(base: any): Promise<boolean> {
  // Fast path: schema already there (created by a previous cold start,
  // `prisma db push` or `prisma migrate deploy`).
  if (await schemaExists(base)) return false;

  let created = false;
  await base.$transaction(
    async (tx: any) => {
      await tx.$executeRawUnsafe(`SELECT pg_advisory_xact_lock(${LOCK_KEY})`);
      // Another instance may have finished while we were waiting for the lock.
      if (await schemaExists(tx)) return;

      console.log(`[DB] Empty database detected - applying ${INIT_MIGRATION_NAME} (auto-bootstrap)`);
      for (const stmt of splitSqlStatements(INIT_MIGRATION_SQL)) {
        await tx.$executeRawUnsafe(stmt);
      }

      // Same shape as Prisma's own bookkeeping table, so `migrate deploy` is happy later.
      await tx.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        "id" VARCHAR(36) PRIMARY KEY NOT NULL,
        "checksum" VARCHAR(64) NOT NULL,
        "finished_at" TIMESTAMPTZ,
        "migration_name" VARCHAR(255) NOT NULL,
        "logs" TEXT,
        "rolled_back_at" TIMESTAMPTZ,
        "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "applied_steps_count" INTEGER NOT NULL DEFAULT 0
      )`);
      await tx.$executeRawUnsafe(
        `INSERT INTO "_prisma_migrations" ("id","checksum","finished_at","migration_name","applied_steps_count")
         VALUES ($1, $2, now(), $3, 1)`,
        randomUUID(),
        migrationChecksum(),
        INIT_MIGRATION_NAME
      );
      created = true;
    },
    { maxWait: 30_000, timeout: 120_000 }
  );
  if (created) console.log("[DB] Auto-bootstrap complete - schema created");
  return created;
}

/**
 * Ensure the Postgres schema exists. Memoized per server instance; a failure is
 * not cached, so the next request retries (e.g. DB was temporarily unreachable).
 */
export function ensurePostgresSchema(base: any): Promise<void> {
  if (!isAutoBootstrapEnabled()) {
    status = { state: "disabled" };
    return Promise.resolve();
  }
  if (status.state === "ready") return Promise.resolve();
  if (!inflight) {
    status = { state: "running" };
    inflight = runBootstrap(base)
      .then((created) => {
        status = { state: "ready", created };
      })
      .catch((e: any) => {
        const msg = e?.message || String(e);
        status = { state: "error", error: msg };
        console.error("[DB] Auto-bootstrap failed:", msg);
        const detail = [e?.code, ...msg.split("\n").map((l: string) => l.trim()).filter((l: string) => l && !/^Invalid `/.test(l))]
          .filter(Boolean)
          .join(" ")
          .slice(0, 300);
        throw new Error(`Base de données injoignable ou non initialisable (DATABASE_URL). Détail: ${detail || "inconnu"}`);
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/** Test helper. */
export function __resetBootstrapForTests() {
  status = { state: "idle" };
  inflight = null;
}
