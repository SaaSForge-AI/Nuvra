import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  const customSlug = slugify(`${user?.username || "reseller"}-${Date.now()}`);

  const reseller = await prisma.reseller.upsert({
    where: { userId: session.id },
    update: { status: "ACTIVE", activatedAt: new Date(), customSlug },
    create: {
      userId: session.id,
      status: "ACTIVE",
      activatedAt: new Date(),
      customSlug,
    },
  });

  return NextResponse.redirect(new URL("/academy/resell", req.url));
}
