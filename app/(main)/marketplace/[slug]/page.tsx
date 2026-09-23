import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Check, Play, Star, Users, Clock, Award } from "lucide-react";

export default async function CoursePublicPage({ params }: { params: { slug: string } }) {
  const course = await prisma.course.findUnique({ where: { slug: params.slug }, include: { user: true, modules: { include: { lessons: true }, orderBy: { position: "asc" } }, reviews: true, enrollments: true } });
  if (!course) return notFound();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div><div className="inline-flex gap-2 mb-3"><span className="text-[11px] px-2 py-1 rounded-full bg-surface2 border border-border text-muted">{course.category}</span><span className="text-[11px] px-2 py-1 rounded-full bg-surface2 border border-border text-muted">{course.level}</span></div><h1 className="text-3xl font-semibold tracking-tight mb-3">{course.title}</h1><p className="text-muted leading-relaxed">{course.description}</p><div className="flex items-center gap-4 mt-4 text-sm text-muted"><span className="flex items-center gap-1"><Users className="h-4 w-4" />{course.enrollments.length} students</span><span className="flex items-center gap-1"><Clock className="h-4 w-4" />{course.modules.reduce((s, m) => s + m.lessons.length, 0)} lessons</span><span className="flex items-center gap-1"><Award className="h-4 w-4" />Certificate</span></div></div>

          <Card><CardHeader><CardTitle className="text-base">What you'll learn</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-3">{(course.learningOutcomes ? JSON.parse(course.learningOutcomes) : ["Build real skills", "Apply immediately", "Get certified"]).map((o: string, i: number) => (<div key={i} className="flex gap-2 text-sm"><Check className="h-4 w-4 text-success shrink-0 mt-0.5" /><span>{o}</span></div>))}</CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base">Curriculum</CardTitle></CardHeader><CardContent className="space-y-3">{course.modules.map((mod, idx) => (<div key={mod.id} className="border border-border rounded-xl overflow-hidden"><div className="p-4 bg-surface2 flex justify-between items-center"><h4 className="font-medium text-sm">Module {idx + 1}: {mod.title}</h4><span className="text-xs text-muted">{mod.lessons.length} lessons</span></div><div className="divide-y divide-border">{mod.lessons.map((lesson) => (<div key={lesson.id} className="p-3 flex justify-between items-center text-sm hover:bg-surface2/50"><div className="flex items-center gap-3"><Play className="h-4 w-4 text-muted" /><span>{lesson.title}</span>{lesson.isFree && <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/10 text-success">Free preview</span>}</div><span className="text-xs text-muted">{lesson.duration ? `${Math.floor(lesson.duration/60)}m` : ""}</span></div>))}</div></div>))}</CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base">Instructor</CardTitle></CardHeader><CardContent className="flex gap-4"><div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center text-white font-medium">{course.user.firstName?.[0]}{course.user.lastName?.[0]}</div><div><p className="font-medium">{course.user.firstName} {course.user.lastName}</p><p className="text-sm text-muted">{course.user.email}</p><p className="text-xs text-muted mt-1">Creator on Nuvra</p></div></CardContent></Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-6"><CardContent className="p-6 space-y-4"><div className="h-40 rounded-xl bg-surface3 border border-border flex items-center justify-center"><span className="text-muted">Course Preview</span></div><div className="flex items-baseline gap-2"><span className="text-2xl font-semibold">{course.isFree ? "Free" : formatPrice(course.price)}</span>{!course.isFree && <span className="text-sm text-muted line-through">$199</span>}</div><form action="/api/checkout" method="POST"><input type="hidden" name="courseId" value={course.id} /><Button className="w-full rounded-full" type="submit">Enroll now</Button></form><p className="text-[11px] text-muted text-center">30-day money-back guarantee • Secure checkout with Stripe</p><div className="space-y-2 pt-2 text-xs"><div className="flex justify-between"><span className="text-muted">Level</span><span>{course.level}</span></div><div className="flex justify-between"><span className="text-muted">Category</span><span>{course.category}</span></div><div className="flex justify-between"><span className="text-muted">Certificate</span><span>Yes</span></div><div className="flex justify-between"><span className="text-muted">Access</span><span>Lifetime</span></div></div></CardContent></Card>
        </div>
      </div>
    </div>
  );
}
