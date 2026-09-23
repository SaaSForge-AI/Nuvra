import { NextRequest, NextResponse } from "next/server";

/** Parse a JSON request body without throwing (empty/invalid body -> null). */
export async function readJsonBody<T = any>(req: NextRequest): Promise<T | null> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? (body as T) : null;
  } catch {
    return null;
  }
}

/** Heuristic: errors coming from the DB layer (unreachable, not configured, schema). */
export function isDatabaseError(e: any): boolean {
  const msg = String(e?.message || "");
  const code = String(e?.code || "");
  return (
    code.startsWith("P1") || // P1001 can't reach server, P1000 auth failed, ...
    e?.name === "PrismaClientInitializationError" ||
    /DATABASE_URL|Base de données|Can't reach database|does not exist in the current database|ECONNREFUSED|ENOTFOUND|getaddrinfo|Prisma Client/i.test(msg)
  );
}

/** Always-JSON 500 so the browser never has to parse an HTML error page. */
export function serverErrorResponse(e: any, fallback: string) {
  console.error(e);
  if (isDatabaseError(e)) {
    return NextResponse.json(
      { error: "Service indisponible : base de données non configurée ou injoignable.", detail: String(e?.message || "").split("\n").map((l) => l.trim()).filter(Boolean).pop() },
      { status: 503 }
    );
  }
  return NextResponse.json({ error: fallback }, { status: 500 });
}
