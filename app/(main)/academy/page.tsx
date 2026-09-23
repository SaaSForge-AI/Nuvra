import { academyModules } from "@/lib/academy/content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GraduationCap, Play, CheckCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { calculateResellerSplit } from "@/lib/utils";

export default async function AcademyPage() {
  const user = await getCurrentUser();
  let reseller = null;
  let enrollments: any[] = [];
  let hasAcademy = false;
  let academyCourse: any = null;
  let academyProgress = 0;
  let completedLessons = 0;
  const totalLessons = 50;

  if (user) {
    reseller = await prisma.reseller.findUnique({ where: { userId: user.id } });
    enrollments = await prisma.enrollment.findMany({ where: { userId: user.id } });
    academyCourse = await prisma.course.findFirst({ where: { isNuvraAcademy: true } });
    if (academyCourse) {
      const enr = await prisma.enrollment.findFirst({ where: { userId: user.id, courseId: academyCourse.id }, include: { progresses: true } as any });
      hasAcademy = !!enr;
      if (enr) {
        academyProgress = Math.round((enr.progress || 0) * 100);
        completedLessons = (enr as any).progresses ? (enr as any).progresses.filter((p: any) => p.isCompleted).length : Math.round((enr.progress || 0) * totalLessons);
      }
    }
  }

  const price = 19700;
  const split = calculateResellerSplit(price);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="rounded-[24px] border border-border bg-surface p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accentMuted px-3 py-1 text-xs text-accent mb-4"><GraduationCap className="h-3.5 w-3.5" /> Nuvra Academy - 197$ une fois • {academyProgress}% réel</div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Achète à 197$, revends à vie à 90%</h1>
          <p className="text-muted max-w-2xl mb-6">Plateforme gratuite pour tous (95% toi / 5% Nuvra sur tes ventes). Formation à 197$ une fois = accès à vie + droit de revente. Pas d'abonnement mensuel. Progression réelle depuis DB: {completedLessons}/{totalLessons}.</p>
          <div className="flex gap-3 flex-wrap">
            <Link href="#modules"><Button className="rounded-full">Voir modules</Button></Link>
            {!hasAcademy && <Link href="/checkout/nuvra-academy"><Button variant="outline" className="rounded-full">Acheter à 197$ - accès + revente</Button></Link>}
            {hasAcademy && !reseller && <Link href="/academy/resell"><Button variant="outline" className="rounded-full">Devenir revendeur - 90% (~171€)</Button></Link>}
            {reseller && <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-xs">Revendeur Actif: {reseller.status} • {reseller.totalSales} ventes • ${(reseller.totalCommission/100).toFixed(2)}</span>}
          </div>
          <p className="text-[11px] text-muted mt-3">Modèle : Gratuit → 5% Nuvra sur tes produits perso. Formation 197$ → 90% toi sur revente Academy. Ledger transparent, payouts 14j.</p>
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
                    <p className="text-[11px] text-muted mt-2">{mod.lessons.length} leçons • {mod.objectives.join(", ")}</p>
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
                  {mod.lessons.length > 3 && <p className="text-xs text-muted">+{mod.lessons.length - 3} autres leçons</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card><CardHeader><CardTitle className="text-base">Ta progression réelle</CardTitle></CardHeader><CardContent className="space-y-3"><div className="h-2 bg-surface3 rounded-full overflow-hidden"><div className="h-full bg-accent transition-all" style={{ width: `${academyProgress}%` }} /></div><p className="text-xs text-muted">{academyProgress}% complété • {completedLessons}/{totalLessons} leçons • DB live</p><div className="pt-2 space-y-2">{academyModules.slice(0,3).map((m, i) => (<div key={m.id} className="flex items-center gap-2 text-xs"><div className={`h-4 w-4 rounded-full flex items-center justify-center ${i===0 && academyProgress>0 ? "bg-success text-white" : "bg-surface3 text-muted"}`}>{i===0 && academyProgress>0 ? "✓" : i+1}</div><span className={i===0 && academyProgress>0 ? "text-white" : "text-muted"}>{m.title}</span></div>))}</div></CardContent></Card>

          <Card className="border-accent/20"><CardHeader><CardTitle className="text-base">Revente Academy - 197$ - 90/10</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
            <div className="p-3 rounded-xl bg-background border border-border space-y-2">
              <div className="flex justify-between"><span className="text-muted">Prix vente</span><span>${(split.price/100).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Frais Stripe 2.9%+30c</span><span className="text-muted">-${(split.stripeFees/100).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Après frais</span><span>${(split.afterFees/100).toFixed(2)}</span></div>
              <div className="h-px bg-border" />
              <div className="flex justify-between"><span className="text-muted">Nuvra 10%</span><span className="text-muted">-${(split.nuvraShare/100).toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold text-success"><span>Ton net 90%</span><span>${(split.resellerShare/100).toFixed(2)}</span></div>
            </div>
            <p className="text-[11px] text-muted">Exemple réel: 197$ → tu touches ~171.89$ net. Transparent.</p>
            <Link href="/academy/resell"><Button size="sm" className="w-full rounded-full">Gérer revente → /r/slug</Button></Link>
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base">Certificat vérifiable</CardTitle></CardHeader><CardContent><p className="text-xs text-muted mb-3">Termine tous les modules pour obtenir ton certificat /certificate/[id] vérifiable publiquement</p><div className="h-24 rounded-xl bg-surface2 border border-border border-dashed flex items-center justify-center"><span className="text-xs text-muted">🔒 {academyProgress}% - {academyProgress>=100 ? "Débloqué !" : "Verrouillé"}</span></div></CardContent></Card>
        </div>
      </div>
    </div>
  );
}
