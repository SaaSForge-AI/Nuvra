import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const found = await prisma.user.findUnique({ where: { id: session.id } });
    if (!found) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // Never send the password hash to the browser.
    const { passwordHash: _omit, ...user } = found as any;
    return NextResponse.json({ user });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}
