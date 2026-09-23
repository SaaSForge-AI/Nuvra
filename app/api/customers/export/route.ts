import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const customers = await prisma.customer.findMany({ where: { userId: session.id } });

  const csv = [
    "email,name,totalSpent,orders,createdAt",
    ...customers.map(c => `${c.email},${c.name || ""},${c.totalSpent},${c.totalOrders},${c.createdAt}`),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=customers.csv",
    },
  });
}
