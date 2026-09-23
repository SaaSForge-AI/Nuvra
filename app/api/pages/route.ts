import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const pages = await prisma.page.findMany({ where: { userId: session.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(pages);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description } = body;

  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const slug = slugify(`${title}-${Date.now()}`);

  const page = await prisma.page.create({
    data: {
      userId: session.id,
      title,
      description,
      slug,
      content: JSON.stringify([
        { type: "hero", content: { title, subtitle: description || "Welcome", cta: "Get Started" } },
      ]),
    },
  });

  return NextResponse.json(page);
}
