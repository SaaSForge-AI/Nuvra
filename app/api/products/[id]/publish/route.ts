import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product || product.userId !== session.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.product.update({
    where: { id: params.id },
    data: { isPublished: !product.isPublished },
  });

  return NextResponse.json(updated);
}
