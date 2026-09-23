import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const funnel = await prisma.funnel.findUnique({ where: { id: params.id } });
  if (!funnel || funnel.userId !== session.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.funnel.update({
    where: { id: params.id },
    data: { isPublished: !funnel.isPublished },
  });

  return NextResponse.json(updated);
}
