import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const products = await prisma.product.findMany({ where: { userId: session.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, type, price, isFree } = body;

  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const slug = slugify(`${title}-${Date.now()}`);

  const product = await prisma.product.create({
    data: {
      userId: session.id,
      title,
      description,
      type: type || "COURSE",
      price: isFree ? 0 : Math.round(price * 100) || 0,
      isFree: !!isFree,
      slug,
    },
  });

  await prisma.event.create({
    data: { type: "product_created", userId: session.id, entityId: product.id },
  });

  return NextResponse.json(product);
}
