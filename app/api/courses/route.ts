import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const courses = await prisma.course.findMany({ where: { userId: session.id }, include: { modules: { include: { lessons: true } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, category, level, price, isFree } = body;

  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const slug = slugify(`${title}-${Date.now()}`);

  const course = await prisma.course.create({
    data: {
      userId: session.id,
      title,
      description,
      shortDesc: description?.slice(0, 150),
      category: category || "Business",
      level: level || "beginner",
      price: isFree ? 0 : Math.round(price * 100) || 0,
      isFree: !!isFree,
      slug,
      status: "DRAFT",
    },
  });

  return NextResponse.json(course);
}
