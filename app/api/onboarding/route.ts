import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
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

  // Create default automation for new user
  await prisma.automation.create({
    data: {
      userId: session.id,
      name: "Welcome sequence",
      description: "Send welcome email when user signs up",
      triggerType: "USER_CREATED",
      isActive: true,
      actions: {
        create: [
          { type: "SEND_EMAIL", config: JSON.stringify({ template: "welcome" }), position: 0 },
        ],
      },
    },
  });

  return NextResponse.json({ success: true });
}
