import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { blocks, bio, displayName } = body;

    const existing = await prisma.linkInBio.findUnique({ where: { userId: session.id } });
    if (existing) {
      const updated = await prisma.linkInBio.update({
        where: { userId: session.id },
        data: { blocks: JSON.stringify(blocks || []), bio: bio || existing.bio, displayName: displayName || existing.displayName },
      });
      return NextResponse.json(updated);
    } else {
      const user = await prisma.user.findUnique({ where: { id: session.id } });
      const created = await prisma.linkInBio.create({
        data: {
          userId: session.id,
          username: user?.username || `user-${session.id.slice(0,6)}`,
          displayName: displayName || `${user?.firstName} ${user?.lastName}`,
          bio: bio || "Creator on Nuvra",
          blocks: JSON.stringify(blocks || []),
        },
      });
      return NextResponse.json(created);
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}
