import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const funnels = await prisma.funnel.findMany({ where: { userId: session.id }, include: { steps: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(funnels);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, description } = body;

  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const slug = slugify(`${name}-${Date.now()}`);

  const funnel = await prisma.funnel.create({
    data: {
      userId: session.id,
      name,
      description,
      slug,
      steps: {
        create: [
          { type: "LANDING", name: "Landing Page", position: 0 },
          { type: "LEAD_CAPTURE", name: "Lead Capture", position: 1 },
          { type: "SALES", name: "Sales Page", position: 2 },
          { type: "CHECKOUT", name: "Checkout", position: 3 },
          { type: "THANK_YOU", name: "Thank You", position: 4 },
        ],
      },
    },
    include: { steps: true },
  });

  return NextResponse.json(funnel);
}
