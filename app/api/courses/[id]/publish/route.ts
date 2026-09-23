import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const course = await prisma.course.findUnique({ where: { id: params.id } });
  if (!course || course.userId !== session.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const newStatus = course.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
  const updated = await prisma.course.update({
    where: { id: params.id },
    data: { status: newStatus },
  });

  if (newStatus === "PUBLISHED") {
    await prisma.marketplaceListing.upsert({
      where: { courseId: course.id },
      update: { isApproved: true, approvedAt: new Date().toISOString() },
      create: { id: `ml-${course.id}`, courseId: course.id, isApproved: true, approvedAt: new Date().toISOString() },
    });
  }

  return NextResponse.json(updated);
}
