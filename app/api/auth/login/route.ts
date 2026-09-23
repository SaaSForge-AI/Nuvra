import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createToken, setSessionCookie } from "@/lib/auth";
import { readJsonBody, serverErrorResponse } from "@/lib/api-errors";

export async function POST(req: NextRequest) {
  try {
    const body = await readJsonBody<{ email?: string; password?: string }>(req);
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await createToken({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin,
      username: user.username,
      onboardingDone: user.onboardingDone,
    });

    await setSessionCookie(token);

    // Audit logging must never block a successful login.
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "LOGIN",
        entity: "User",
        entityId: user.id,
        ip: req.headers.get("x-forwarded-for") || "unknown",
      },
    }).catch((err: any) => console.error("[auth] audit log failed:", err?.message));

    return NextResponse.json({ success: true, onboardingDone: user.onboardingDone });
  } catch (e: any) {
    return serverErrorResponse(e, "Login failed");
  }
}
