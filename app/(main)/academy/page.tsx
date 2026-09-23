import { academyModules } from "@/lib/academy/content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GraduationCap, Play, CheckCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export default async function AcademyPage() {
  const user = await getCurrentUser();
  let reseller = null;
  let enrollments: any[] = [];
  if (user) {
    reseller = await prisma.reseller.findUnique({ where: { userId: user.id } });
    enrollments = await prisma.enrollment.findMany({ where: { userId: user.id } });
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="rounded-[24px] border border-border bg-surface p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accentMuted px-3 py-1 text-xs text-accent mb-4"><GraduationCap className="h-3.5 w-3.5" /> Nuvra Academy</div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Master the creator economy</h1>
          <p className="text-muted max-w-2xl mb-6">8 modules, 50+ lessons, built by practitioners. From 0 to first 100k. Real tactics, no fluff. And resell it with 90% commission.</p>
          <div className="flex gap-3">
            <Link href="#modules"><Button className="rounded-full">Start learning</Button></Link>
            {!reseller && <Link href="/academy/resell"><Button variant="outline" className="rounded-full">Become reseller - 90%</Button></Link>}
            {reseller && <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-xs">Reseller Active: {reseller.status}</span>}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4" id="modules">
          {academyModules.map((mod, idx) => (
            <Card key={mod.id} className="hover:border-accent/20 transition-colors">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-surface3 border border-border flex items-center justify-center text-sm font-medium shrink-0">{idx + 1}</div>
                  <div>
                    <CardTitle className="text-base">{mod.title}</CardTitle>
                    <p className="text-xs text-muted mt-1">{mod.description}</p>
                    <p className="text-[11px] text-muted mt-2">{mod.lessons.length} lessons • {mod.objectives.join(", ")}</p>
                  </div>
                </div>
                <Link href={`/academy/${mod.id}`}><Button variant="ghost" size="sm"><Play className="h-4 w-4" /></Button></Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mod.lessons.slice(0,3).map((lesson) => (
                    <div key={lesson.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-surface2 border border-border text-sm">
                      <CheckCircle className="h-4 w-4 text-muted2" />
                      <span className="flex-1 truncate">{lesson.title}</span>
                      <span className="text-[11px] text-muted">5m</span>
                    </div>
                  ))}
                  {mod.lessons.length > 3 && <p className="text-xs text-muted">+{mod.lessons.length - 3} more lessons</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card><CardHeader><CardTitle className="text-base">Your progress</CardTitle></CardHeader><CardContent className="space-y-3"><div className="h-2 bg-surface3 rounded-full overflow-hidden"><div className="h-full bg-accent" style={{ width: "24%" }} /></div><p className="text-xs text-muted">24% completed • 12/50 lessons</p><div className="pt-2 space-y-2">{academyModules.slice(0,3).map((m, i) => (<div key={m.id} className="flex items-center gap-2 text-xs"><div className={`h-4 w-4 rounded-full flex items-center justify-center ${i===0 ? "bg-success text-white" : "bg-surface3 text-muted"}`}>{i===0 ? "✓" : i+1}</div><span className={i===0 ? "text-white" : "text-muted"}>{m.title}</span></div>))}</div></CardContent></Card>

          <Card className="border-accent/20"><CardHeader><CardTitle className="text-base">Resell Academy</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-muted">Price</span><span>$497</span></div><div className="flex justify-between"><span className="text-muted">Your commission</span><span className="text-success font-medium">90% • $447</span></div><div className="flex justify-between"><span className="text-muted">Nuvra share</span><span>10%</span></div><div className="h-px bg-border" /><p className="text-xs text-muted">When you resell, you get your own checkout link, custom page, and dashboard. Stripe fees shown separately.</p><Link href="/academy/resell"><Button size="sm" className="w-full rounded-full">Manage Reseller</Button></Link></CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base">Certificate</CardTitle></CardHeader><CardContent><p className="text-xs text-muted mb-3">Complete all modules to earn your Nuvra Academy certificate with verification URL</p><div className="h-24 rounded-xl bg-surface2 border border-border border-dashed flex items-center justify-center"><span className="text-xs text-muted">🔒 Locked - 24% complete</span></div></CardContent></Card>
        </div>
      </div>
    </div>
  );
}
