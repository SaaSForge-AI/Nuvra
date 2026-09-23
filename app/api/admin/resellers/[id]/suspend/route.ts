import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user?.isSuperAdmin && user?.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const reseller = await prisma.reseller.findUnique({ where: { id: params.id } });
  if (!reseller) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const newStatus = reseller.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
  const updated = await prisma.reseller.update({ where: { id: params.id }, data: { status: newStatus } });

  return NextResponse.json(updated);
}
