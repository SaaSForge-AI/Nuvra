import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { email, name, tags } = body;

  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const lead = await prisma.lead.create({
    data: {
      userId: session.id,
      email,
      name: name || "",
      source: "MANUAL",
      tags: tags || [],
      status: "NEW",
    },
  });

  return NextResponse.json(lead);
}
