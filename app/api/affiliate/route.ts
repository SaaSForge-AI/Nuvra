import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const affiliate = await prisma.affiliate.upsert({
    where: { userId: session.id },
    update: {},
    create: { userId: session.id, commissionRate: 30, cookieDays: 30, isActive: true },
  });

  return NextResponse.json(affiliate);
}
