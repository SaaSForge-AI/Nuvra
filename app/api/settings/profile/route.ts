import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, bio, customSlug } = body;

  const updated = await prisma.user.update({
    where: { id: session.id },
    data: {
      name: name || undefined,
      bio: bio || undefined,
      customSlug: customSlug || undefined,
    },
  });

  return NextResponse.json(updated);
}
