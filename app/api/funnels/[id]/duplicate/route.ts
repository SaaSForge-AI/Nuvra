import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const funnel = await prisma.funnel.findUnique({ where: { id: params.id }, include: { steps: true } });
    if (!funnel || funnel.userId !== session.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const newFunnel = await prisma.funnel.create({
      data: {
        userId: session.id,
        name: `${funnel.name} (Copy)`,
        description: funnel.description,
        slug: slugify(`${funnel.name}-copy-${Date.now()}`),
        isPublished: false,
      },
    });

    for (const step of funnel.steps) {
      await prisma.funnelStep.create({
        data: {
          funnelId: newFunnel.id,
          type: step.type,
          name: step.name,
          position: step.position,
          views: 0,
          conversions: 0,
        },
      });
    }

    return NextResponse.json(newFunnel);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
