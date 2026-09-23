import { describe, it, expect, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  splitSqlStatements,
  migrationChecksum,
  ensurePostgresSchema,
  getBootstrapStatus,
  __resetBootstrapForTests,
} from "../lib/db-bootstrap";
import { INIT_MIGRATION_NAME, INIT_MIGRATION_SQL } from "../lib/db-bootstrap-sql";

const root = path.resolve(__dirname, "..");

/** Minimal fake of the Prisma client surface used by the bootstrap. */
function fakeClient(opts: { exists?: boolean; failConnect?: boolean } = {}) {
  let exists = !!opts.exists;
  const executed: string[] = [];
  const client: any = {
    executed,
    async $queryRawUnsafe(sql: string) {
      if (opts.failConnect) throw new Error("Can't reach database server at `db:5432`");
      if (sql.includes("to_regclass")) return [{ exists }];
      return [];
    },
    async $executeRawUnsafe(sql: string) {
      executed.push(sql);
      if (sql.startsWith('CREATE TABLE "User"')) exists = true;
      return 0;
    },
    async $transaction(fn: any) {
      return fn(client);
    },
  };
  return client;
}

describe("DB auto-bootstrap (empty Postgres on Vercel)", () => {
  beforeEach(() => __resetBootstrapForTests());

  it("embedded SQL is in sync with prisma/migrations (run scripts/gen-bootstrap-sql.mjs)", () => {
    const file = path.join(root, "prisma", "migrations", INIT_MIGRATION_NAME, "migration.sql");
    expect(fs.readFileSync(file, "utf8")).toBe(INIT_MIGRATION_SQL);
  });

  it("init migration creates a table for every Prisma model", () => {
    const schema = fs.readFileSync(path.join(root, "prisma", "schema.prisma"), "utf8");
    const models = (schema.match(/^model \w+ \{/gm) || []).map((m) => m.split(" ")[1]);
    expect(models.length).toBeGreaterThan(40);
    for (const m of models) expect(INIT_MIGRATION_SQL).toContain(`CREATE TABLE "${m}" (`);
  });

  it("splits the migration into clean statements", () => {
    const stmts = splitSqlStatements(INIT_MIGRATION_SQL);
    expect(stmts.length).toBeGreaterThan(100);
    expect(stmts.every((s) => !s.startsWith("--") && !s.endsWith(";"))).toBe(true);
    expect(stmts.some((s) => s.startsWith('CREATE TABLE "User"'))).toBe(true);
  });

  it("checksum matches Prisma's format (sha256 hex)", () => {
    expect(migrationChecksum()).toMatch(/^[a-f0-9]{64}$/);
  });

  it("creates the schema on an empty database and records the migration", async () => {
    const c = fakeClient({ exists: false });
    await ensurePostgresSchema(c);
    expect(c.executed[0]).toContain("pg_advisory_xact_lock");
    expect(c.executed.some((s: string) => s.startsWith('CREATE TABLE "User"'))).toBe(true);
    expect(c.executed.some((s: string) => s.includes('INSERT INTO "_prisma_migrations"'))).toBe(true);
    expect(getBootstrapStatus()).toEqual({ state: "ready", created: true });
  });

  it("does nothing when the schema already exists", async () => {
    const c = fakeClient({ exists: true });
    await ensurePostgresSchema(c);
    expect(c.executed).toHaveLength(0);
    expect(getBootstrapStatus()).toEqual({ state: "ready", created: false });
  });

  it("runs once for concurrent cold-start requests", async () => {
    const c = fakeClient({ exists: false });
    await Promise.all([ensurePostgresSchema(c), ensurePostgresSchema(c), ensurePostgresSchema(c)]);
    expect(c.executed.filter((s: string) => s.startsWith('CREATE TABLE "User"'))).toHaveLength(1);
  });

  it("unreachable DB -> clear error, not cached (retries next request)", async () => {
    await expect(ensurePostgresSchema(fakeClient({ failConnect: true }))).rejects.toThrow(/DATABASE_URL/);
    expect(getBootstrapStatus().state).toBe("error");
    await ensurePostgresSchema(fakeClient({ exists: true }));
    expect(getBootstrapStatus().state).toBe("ready");
  });

  it("can be disabled with NUVRA_DB_AUTO_BOOTSTRAP=0", async () => {
    process.env.NUVRA_DB_AUTO_BOOTSTRAP = "0";
    try {
      const c = fakeClient({ exists: false });
      await ensurePostgresSchema(c);
      expect(c.executed).toHaveLength(0);
      expect(getBootstrapStatus().state).toBe("disabled");
    } finally {
      delete process.env.NUVRA_DB_AUTO_BOOTSTRAP;
    }
  });
});
