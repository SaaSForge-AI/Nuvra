import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, subject } = body;

  const campaign = await prisma.emailCampaign.create({
    data: {
      userId: session.id,
      name: name || "New Campaign",
      subject: subject || "Hello from Nuvra",
      status: "DRAFT",
      sentCount: 0,
      openRate: 0,
      clickRate: 0,
    },
  });

  return NextResponse.json(campaign);
}
