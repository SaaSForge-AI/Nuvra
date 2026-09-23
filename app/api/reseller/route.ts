import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const reseller = await prisma.reseller.findUnique({ where: { userId: session.id }, include: { sales: true } });
  return NextResponse.json(reseller);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.reseller.findUnique({ where: { userId: session.id } });
  if (existing) return NextResponse.json(existing);

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  const customSlug = slugify(`${user?.username || "reseller"}-${Date.now()}`);

  const reseller = await prisma.reseller.create({
    data: {
      userId: session.id,
      status: "ACTIVE",
      activatedAt: new Date(),
      customSlug,
    },
  });

  return NextResponse.json(reseller);
}
