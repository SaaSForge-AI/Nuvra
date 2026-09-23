import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let lessonId: string = "";
  let courseId: string = "";
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      const body = await req.json();
      lessonId = body.lessonId;
      courseId = body.courseId;
    } catch {}
  }
  if (!lessonId) {
    const form = await req.formData().catch(()=>null);
    if (form) {
      lessonId = form.get("lessonId") as string;
      courseId = form.get("courseId") as string;
    }
  }

  if (!lessonId || !courseId) return NextResponse.json({ error: "Missing" }, { status: 400 });

  const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: session.id, courseId } } });
  if (!enrollment) return NextResponse.json({ error: "Not enrolled" }, { status: 404 });

  await prisma.progress.upsert({
    where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } },
    update: { isCompleted: true, completedAt: new Date() },
    create: { enrollmentId: enrollment.id, lessonId, isCompleted: true, completedAt: new Date() },
  });

  // Check if course completed
  const course = await prisma.course.findUnique({ where: { id: courseId }, include: { modules: { include: { lessons: true } } } });
  if (course) {
    const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);
    const completedCount = await prisma.progress.count({ where: { enrollmentId: enrollment.id, isCompleted: true } });
    const progress = totalLessons ? completedCount / totalLessons : 0;

    await prisma.enrollment.update({ where: { id: enrollment.id }, data: { progress, completed: progress >= 1, completedAt: progress >= 1 ? new Date() : null } });

    if (progress >= 1 && course.certificateEnabled) {
      const existingCert = await prisma.certificate.findUnique({ where: { enrollmentId: enrollment.id } });
      if (!existingCert) {
        const user = await prisma.user.findUnique({ where: { id: session.id } });
        await prisma.certificate.create({
          data: {
            userId: session.id,
            enrollmentId: enrollment.id,
            code: `CERT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
            studentName: `${user?.firstName} ${user?.lastName}`,
            courseTitle: course.title,
            creatorName: "Nuvra",
          },
        });
      }
    }
  }

  await prisma.event.create({ data: { type: "lesson_completed", userId: session.id, entityId: lessonId } });

  return NextResponse.redirect(new URL(`/learn/${course?.slug}/${lessonId}`, req.url));
}
