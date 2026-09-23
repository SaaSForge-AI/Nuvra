import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PublishButton, AddModuleButton } from "@/components/ui/action-buttons";

export default async function CourseDetail({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const course = await prisma.course.findUnique({ where: { id: params.id }, include: { modules: { include: { lessons: true }, orderBy: { position: "asc" } } } });
  if (!course || course.userId !== user?.id) return notFound();

  const isPublished = course.status === "PUBLISHED";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-xl font-semibold">{course.title}</h1><div className="flex gap-2"><Link href="/courses"><Button variant="outline" size="sm">Back</Button></Link><PublishButton id={course.id} type="courses" isPublished={isPublished} /></div></div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card><CardHeader><CardTitle className="text-base">Curriculum</CardTitle></CardHeader><CardContent className="space-y-4">
            {course.modules.length === 0 ? <p className="text-sm text-muted">No modules yet. Add your first module.</p> : course.modules.map((mod) => (
              <Card key={mod.id} className="bg-surface2"><CardContent className="p-4"><div className="flex justify-between items-center mb-2"><h4 className="font-medium text-sm">{mod.title}</h4><span className="text-xs text-muted">{mod.lessons.length} lessons</span></div><div className="space-y-2">{mod.lessons.map((lesson) => (<div key={lesson.id} className="flex justify-between items-center p-2 rounded-lg bg-surface3 border border-border text-xs"><span>{lesson.title}</span><span className="text-muted">{lesson.duration ? `${Math.floor(lesson.duration/60)}m` : "—"}</span></div>))}{mod.lessons.length===0 && <p className="text-xs text-muted">No lessons • Ajoutez des leçons depuis l'API ou le seed</p>}</div></CardContent></Card>
            ))}
            <AddModuleButton courseId={course.id} />
          </CardContent></Card>
        </div>

        <div className="space-y-6">
          <Card><CardHeader><CardTitle className="text-base">Settings</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-muted">Status</span><span>{course.status}</span></div><div className="flex justify-between"><span className="text-muted">Category</span><span>{course.category}</span></div><div className="flex justify-between"><span className="text-muted">Level</span><span>{course.level}</span></div><div className="flex justify-between"><span className="text-muted">Revenue</span><span className="text-success">95% / 5%</span></div></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Publish to Marketplace</CardTitle></CardHeader><CardContent className="space-y-3"><p className="text-xs text-muted">Publier = apparition auto en marketplace (modération auto pour l'instant)</p><PublishButton id={course.id} type="courses" isPublished={isPublished} /></CardContent></Card>
        </div>
      </div>
    </div>
  );
}
