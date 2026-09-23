import { NextResponse } from "next/server";
import { prisma, dbInitError } from "@/lib/db";
import { getBootstrapStatus } from "@/lib/db-bootstrap";

// Must run per request: a statically prerendered health check only reports the
// state of the build machine (it used to always say "sqlite" on Vercel).
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const db = process.env.DATABASE_URL?.startsWith("postgres") ? "postgres" : "sqlite";
  const base = {
    timestamp: new Date().toISOString(),
    db,
    databaseUrlSet: !!process.env.DATABASE_URL,
    vercel: !!process.env.VERCEL,
  };
  try {
    if (dbInitError) throw new Error(dbInitError);
    // First model query also triggers the auto-bootstrap on an empty Postgres DB.
    const userCount = await prisma.user.count({});
    return NextResponse.json({ status: "ok", ...base, users: userCount, bootstrap: getBootstrapStatus() });
  } catch (e: any) {
    return NextResponse.json(
      { status: "error", ...base, error: e?.message || String(e), bootstrap: getBootstrapStatus() },
      { status: 503 }
    );
  }
}
