import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, entityId, metadata } = body;
  const session = await getSession();

  await prisma.event.create({
    data: {
      type,
      userId: session?.id,
      entityId,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });

  return NextResponse.json({ success: true });
}
