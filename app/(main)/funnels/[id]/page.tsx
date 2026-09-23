import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PublishButton, AddStepButton, DuplicateFunnelButton } from "@/components/ui/action-buttons";

export default async function FunnelDetail({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const funnel = await prisma.funnel.findUnique({ where: { id: params.id }, include: { steps: { orderBy: { position: "asc" } } } });
  if (!funnel || funnel.userId !== user?.id) return notFound();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold">{funnel.name}</h1><p className="text-sm text-muted">{funnel.description} • 95% creator revenue</p></div>
        <div className="flex gap-2">
          <Link href="/funnels"><Button variant="outline" size="sm">Back</Button></Link>
          <PublishButton id={funnel.id} type="funnels" isPublished={funnel.isPublished} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Flow Diagram</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnel.steps.map((step, i) => (
                  <div key={step.id} className="relative">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-xl bg-accentMuted border border-accent/20 flex items-center justify-center text-accent font-medium text-xs">{i + 1}</div>
                        {i < funnel.steps.length - 1 && <div className="w-px h-12 bg-border mt-2" />}
                      </div>
                      <Card className="flex-1">
                        <CardContent className="p-4 flex justify-between items-center">
                          <div><p className="text-sm font-medium">{step.name}</p><p className="text-xs text-muted">{step.type}</p></div>
                          <div className="text-right"><p className="text-xs text-muted">Conversion</p><p className="text-sm font-medium">{step.conversionRate || 0}%</p><p className="text-[11px] text-muted">{step.views} views • {step.conversions} conv</p></div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
                {funnel.steps.length === 0 && <p className="text-sm text-muted text-center py-8">Aucune étape. Ajoutez votre première étape.</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card><CardHeader><CardTitle className="text-base">Stats</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-muted">Total Views</span><span>{funnel.steps.reduce((s, st) => s + st.views, 0)}</span></div><div className="flex justify-between"><span className="text-muted">Total Conversions</span><span>{funnel.steps.reduce((s, st) => s + st.conversions, 0)}</span></div><div className="flex justify-between"><span className="text-muted">Overall Conv</span><span>3.2%</span></div></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Actions</CardTitle></CardHeader><CardContent className="space-y-2"><AddStepButton funnelId={funnel.id} /><Link href={`/f/${funnel.slug}`} target="_blank"><Button variant="outline" size="sm" className="w-full">Preview Funnel</Button></Link><DuplicateFunnelButton funnelId={funnel.id} /></CardContent></Card>
        </div>
      </div>
    </div>
  );
}
