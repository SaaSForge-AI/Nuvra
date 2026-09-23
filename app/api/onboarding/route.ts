import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { activity, goal, usageType } = body;

    await prisma.user.update({
      where: { id: session.id },
      data: {
        activity,
        goal,
        usageType,
        onboardingDone: true,
      },
    });

    await prisma.automation.create({
      data: {
        userId: session.id,
        name: "Welcome sequence",
        description: "Send welcome email when user signs up",
        triggerType: "USER_CREATED",
        isActive: true,
      },
    }).catch(()=>{});

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}
