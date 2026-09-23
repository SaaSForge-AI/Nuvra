import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const course = await prisma.course.findUnique({ where: { id: params.id } });
  if (!course || course.userId !== session.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { title } = body;

  const count = await prisma.courseModule.count({ where: { courseId: params.id } });

  const mod = await prisma.courseModule.create({
    data: {
      courseId: params.id,
      title: title || `Module ${count + 1}`,
      position: count,
      isPublished: true,
    },
  });

  return NextResponse.json(mod);
}
