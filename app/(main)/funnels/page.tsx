import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GitBranch, Plus } from "lucide-react";

export default async function FunnelsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const funnels = await prisma.funnel.findMany({ where: { userId: user.id }, include: { steps: true }, orderBy: { createdAt: "desc" } });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold">Funnels</h1><p className="text-sm text-muted mt-1">Visual funnel builder with conversion tracking</p></div>
        <Link href="/funnels/new"><Button className="rounded-full"><Plus className="h-4 w-4 mr-2" />New Funnel</Button></Link>
      </div>

      {funnels.length === 0 ? (
        <Card className="border-dashed"><CardContent className="p-12 text-center"><div className="h-12 w-12 rounded-2xl bg-surface3 border border-border flex items-center justify-center mx-auto mb-4"><GitBranch className="h-6 w-6 text-muted" /></div><h3 className="font-medium mb-2">Your first funnel starts here</h3><p className="text-sm text-muted mb-6 max-w-sm mx-auto">Build landing → lead capture → sales → checkout → thank you flow</p><Link href="/funnels/new"><Button className="rounded-full">Create your first funnel</Button></Link></CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {funnels.map((f) => (
            <Link key={f.id} href={`/funnels/${f.id}`}>
              <Card className="hover:border-accent/20 transition-colors">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4"><h3 className="font-medium">{f.name}</h3><span className="text-[11px] px-2 py-1 rounded-full bg-surface2 border border-border text-muted">{f.steps.length} steps</span></div>
                  <div className="flex items-center gap-1 mb-3">
                    {f.steps.slice(0, 5).map((s, i) => (
                      <div key={s.id} className="flex items-center gap-1">
                        <div className="h-6 px-2 rounded-full bg-surface3 border border-border text-[10px] flex items-center text-muted">{s.type.slice(0,3)}</div>
                        {i < f.steps.length -1 && <div className="h-px w-3 bg-border" />}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted truncate">{f.description || "No description"}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
