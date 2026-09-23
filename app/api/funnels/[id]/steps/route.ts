import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const funnel = await prisma.funnel.findUnique({ where: { id: params.id } });
  if (!funnel || funnel.userId !== session.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { type, name } = body;

  const count = await prisma.funnelStep.count({ where: { funnelId: params.id } });

  const step = await prisma.funnelStep.create({
    data: {
      funnelId: params.id,
      type: type || "LANDING",
      name: name || `Step ${count + 1}`,
      position: count,
      views: 0,
      conversions: 0,
    },
  });

  return NextResponse.json(step);
}
