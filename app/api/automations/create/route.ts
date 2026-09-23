import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, trigger } = body;

  const automation = await prisma.automation.create({
    data: {
      userId: session.id,
      name: name || "New Automation",
      trigger: trigger || "PURCHASE",
      isActive: true,
      totalRuns: 0,
    },
  });

  return NextResponse.json(automation);
}
