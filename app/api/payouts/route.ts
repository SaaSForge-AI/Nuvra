import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const entries = await prisma.ledgerEntry.findMany({
    where: { userId: session.id, type: "COMMISSION", status: "PENDING" },
  });

  if (entries.length === 0) {
    return NextResponse.json({ error: "No pending earnings" }, { status: 400 });
  }

  const total = entries.reduce((s, e) => s + e.netAmount, 0);

  // Mark as paid after 14 days logic would be here, for demo mark all pending as paid
  await prisma.ledgerEntry.updateMany({
    where: { id: { in: entries.map(e => e.id) } },
    data: { status: "PAID" },
  });

  const payout = await prisma.payout.create({
    data: {
      userId: session.id,
      amount: total,
      status: "PROCESSING",
      method: "STRIPE",
    },
  });

  return NextResponse.json({ payout, total });
}
