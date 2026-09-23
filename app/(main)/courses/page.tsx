import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GraduationCap, Plus } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default async function CoursesPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const courses = await prisma.course.findMany({ where: { userId: user.id, isNuvraAcademy: false }, include: { modules: true }, orderBy: { createdAt: "desc" } });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-xl font-semibold">Courses</h1><p className="text-sm text-muted mt-1">LMS builder with modules, lessons, quizzes, certificates</p></div><Link href="/courses/new"><Button className="rounded-full"><Plus className="h-4 w-4 mr-2" />New Course</Button></Link></div>

      {courses.length === 0 ? (
        <Card className="border-dashed"><CardContent className="p-12 text-center"><div className="h-12 w-12 rounded-2xl bg-surface3 border border-border flex items-center justify-center mx-auto mb-4"><GraduationCap className="h-6 w-6 text-muted" /></div><h3 className="font-medium mb-2">Create your first course</h3><p className="text-sm text-muted mb-6 max-w-sm mx-auto">Structure modules, add videos, PDFs, quizzes, and issue certificates</p><Link href="/courses/new"><Button className="rounded-full">Create course</Button></Link></CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <Link key={c.id} href={`/courses/${c.id}`}><Card className="hover:border-accent/20 transition-colors"><CardContent className="p-5"><div className="h-32 rounded-xl bg-surface3 border border-border mb-4 flex items-center justify-center"><GraduationCap className="h-8 w-8 text-muted2" /></div><h3 className="font-medium mb-1 truncate">{c.title}</h3><p className="text-xs text-muted mb-3 line-clamp-2">{c.description || "No description"}</p><div className="flex justify-between text-xs"><span>{c.modules.length} modules</span><span>{c.isFree ? "Free" : formatPrice(c.price)}</span></div><div className="mt-2"><span className={`text-[11px] px-2 py-1 rounded-full border ${c.status === "PUBLISHED" ? "bg-success/10 text-success border-success/20" : "bg-surface2 text-muted"}`}>{c.status}</span></div></CardContent></Card></Link>
          ))}
        </div>
      )}
    </div>
  );
}
