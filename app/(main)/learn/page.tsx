import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GraduationCap, Play } from "lucide-react";

export default async function LearnPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: { course: { include: { modules: { include: { lessons: true } } } }, progresses: true },
    orderBy: { enrolledAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div><h1 className="text-xl font-semibold">My Learning</h1><p className="text-sm text-muted mt-1">Track progress, continue lessons, get certificates</p></div>

      {enrollments.length === 0 ? (
        <Card><CardContent className="p-12 text-center"><div className="h-12 w-12 rounded-2xl bg-surface3 border border-border flex items-center justify-center mx-auto mb-4"><GraduationCap className="h-6 w-6 text-muted" /></div><h3 className="font-medium mb-2">No courses yet</h3><p className="text-sm text-muted mb-6">Enroll in a course from marketplace to start learning</p><Link href="/marketplace"><Button className="rounded-full">Browse Marketplace</Button></Link></CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enr) => {
            const totalLessons = enr.course.modules.reduce((s, m) => s + m.lessons.length, 0);
            const completed = enr.progresses.filter((p) => p.isCompleted).length;
            const progress = totalLessons ? Math.round((completed / totalLessons) * 100) : 0;
            const nextLesson = enr.course.modules.flatMap((m) => m.lessons).find((l) => !enr.progresses.some((p) => p.lessonId === l.id && p.isCompleted));

            return (
              <Card key={enr.id} className="hover:border-accent/20 transition-colors">
                <CardContent className="p-5">
                  <div className="h-32 rounded-xl bg-surface3 border border-border mb-4 flex items-center justify-center"><GraduationCap className="h-8 w-8 text-muted2" /></div>
                  <h3 className="font-medium mb-1 truncate">{enr.course.title}</h3>
                  <div className="h-2 bg-surface3 rounded-full overflow-hidden mb-2"><div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} /></div>
                  <div className="flex justify-between text-xs text-muted mb-4"><span>{progress}% complete</span><span>{completed}/{totalLessons} lessons</span></div>
                  {nextLesson ? (
                    <Link href={`/learn/${enr.course.slug}/${nextLesson.id}`}><Button size="sm" className="w-full rounded-full"><Play className="h-4 w-4 mr-2" />Continue</Button></Link>
                  ) : (
                    <Link href={`/certificate/${enr.certificate ? "" : ""}`}><Button variant="outline" size="sm" className="w-full rounded-full">View Certificate</Button></Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
