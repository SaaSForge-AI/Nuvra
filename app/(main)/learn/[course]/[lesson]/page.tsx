import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function LessonPage({ params }: { params: { course: string; lesson: string } }) {
  const user = await getCurrentUser();
  if (!user) return notFound();

  const course = await prisma.course.findUnique({ where: { slug: params.course }, include: { modules: { include: { lessons: { orderBy: { position: "asc" } } }, orderBy: { position: "asc" } } } });
  if (!course) return notFound();

  const lesson = await prisma.lesson.findUnique({ where: { id: params.lesson }, include: { quiz: { include: { questions: { include: { answers: true } } } } } });
  if (!lesson) return notFound();

  const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: course.id } }, include: { progresses: true } });
  if (!enrollment) return notFound();

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
  const nextLesson = allLessons[currentIndex + 1];
  const prevLesson = allLessons[currentIndex - 1];
  const progress = enrollment.progresses.filter((p) => p.isCompleted).length;
  const total = allLessons.length;
  const percent = Math.round((progress / total) * 100);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardContent className="p-4">
              <h3 className="font-medium text-sm mb-3">{course.title}</h3>
              <div className="h-2 bg-surface3 rounded-full overflow-hidden mb-2"><div className="h-full bg-accent" style={{ width: `${percent}%` }} /></div>
              <p className="text-xs text-muted mb-4">{percent}% complete</p>
              <div className="space-y-4">
                {course.modules.map((mod) => (
                  <div key={mod.id}>
                    <p className="text-xs font-medium text-muted uppercase mb-2">{mod.title}</p>
                    <div className="space-y-1">
                      {mod.lessons.map((l) => {
                        const isCompleted = enrollment.progresses.some((p) => p.lessonId === l.id && p.isCompleted);
                        const isCurrent = l.id === lesson.id;
                        return (
                          <Link key={l.id} href={`/learn/${course.slug}/${l.id}`} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${isCurrent ? "bg-accentMuted border border-accent/20 text-white" : "hover:bg-surface2 text-muted hover:text-white"}`}>
                            <div className={`h-4 w-4 rounded-full flex items-center justify-center text-[10px] ${isCompleted ? "bg-success text-white" : "bg-surface3"}`}>{isCompleted ? "✓" : ""}</div>
                            <span className="truncate">{l.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/learn"><Button variant="ghost" size="sm">← Back to learning</Button></Link>
            <div className="flex gap-2">
              {prevLesson && <Link href={`/learn/${course.slug}/${prevLesson.id}`}><Button variant="outline" size="sm">Previous</Button></Link>}
              {nextLesson && <Link href={`/learn/${course.slug}/${nextLesson.id}`}><Button size="sm">Next</Button></Link>}
            </div>
          </div>

          <Card>
            <CardContent className="p-0 overflow-hidden">
              <div className="aspect-video bg-surface3 flex items-center justify-center border-b border-border">
                {lesson.videoUrl ? <video src={lesson.videoUrl} controls className="w-full h-full" /> : <span className="text-muted">Video: {lesson.title}</span>}
              </div>
              <div className="p-6">
                <h1 className="text-xl font-semibold mb-2">{lesson.title}</h1>
                <p className="text-sm text-muted mb-6">{lesson.description || "Lesson content"}</p>
                {lesson.content && <div className="prose prose-invert prose-sm max-w-none"><p className="text-sm leading-relaxed whitespace-pre-wrap">{lesson.content}</p></div>}

                {lesson.quiz && (
                  <Card className="mt-6 bg-surface2"><CardContent className="p-5"><h3 className="font-medium mb-3">{lesson.quiz.title}</h3><div className="space-y-3">{lesson.quiz.questions.map((q) => (<div key={q.id}><p className="text-sm mb-2">{q.question}</p><div className="space-y-1">{q.answers.map((a) => (<label key={a.id} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-surface3 text-sm cursor-pointer hover:border-accent/20"><input type="radio" name={q.id} /><span>{a.answer}</span></label>))}</div></div>))}</div><Button size="sm" className="mt-4">Submit Quiz</Button></CardContent></Card>
                )}

                <div className="flex gap-3 mt-8">
                  <form action={`/api/progress/complete`} method="POST"><input type="hidden" name="lessonId" value={lesson.id} /><input type="hidden" name="courseId" value={course.id} /><Button type="submit" className="rounded-full">Mark as complete</Button></form>
                  {nextLesson && <Link href={`/learn/${course.slug}/${nextLesson.id}`}><Button variant="outline" className="rounded-full">Next lesson →</Button></Link>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
