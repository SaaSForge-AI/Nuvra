import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function AffiliatesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const affiliate = await prisma.affiliate.findUnique({ where: { userId: user.id }, include: { clicks: true, sales: true } });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Affiliates</h1>
      <p className="text-sm text-muted">Your own affiliate program - separate from Nuvra Academy Reseller</p>

      {!affiliate ? (
        <Card><CardContent className="p-8 text-center"><h3 className="font-medium mb-2">Create your affiliate program</h3><p className="text-sm text-muted mb-4">Let others sell your products for commission</p><form action="/api/affiliate" method="POST"><Button>Create Affiliate Program</Button></form></CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card><CardHeader><CardTitle className="text-base">Program Settings</CardTitle></CardHeader><CardContent className="space-y-4 text-sm"><div className="flex justify-between"><span className="text-muted">Commission Rate</span><span>{affiliate.commissionRate}%</span></div><div className="flex justify-between"><span className="text-muted">Cookie Days</span><span>{affiliate.cookieDays} days</span></div><div className="flex justify-between"><span className="text-muted">Status</span><span className={affiliate.isActive ? "text-success" : "text-muted"}>{affiliate.isActive ? "Active" : "Inactive"}</span></div><div><label className="text-xs font-medium mb-1 block">Affiliate Link</label><div className="flex gap-2"><Input value={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/a/${user.username}`} readOnly /><Button size="sm">Copy</Button></div></div></CardContent></Card>

            <Card><CardHeader><CardTitle className="text-base">Sales</CardTitle></CardHeader><CardContent>{affiliate.sales.length===0 ? <p className="text-sm text-muted">No affiliate sales yet</p> : affiliate.sales.map((s) => (<div key={s.id} className="p-2 rounded-lg bg-surface2 border border-border text-sm flex justify-between"><span>{s.code}</span><span>{s.commission}</span></div>))}</CardContent></Card>
          </div>

          <div className="space-y-6">
            <Card><CardContent className="p-4"><p className="text-xs text-muted uppercase">Clicks</p><p className="text-xl font-semibold mt-1">{affiliate.clicks.length}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted uppercase">Sales</p><p className="text-xl font-semibold mt-1">{affiliate.sales.length}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted uppercase">Conversion</p><p className="text-xl font-semibold mt-1">{affiliate.clicks.length ? ((affiliate.sales.length / affiliate.clicks.length) * 100).toFixed(1) : 0}%</p></CardContent></Card>
          </div>
        </div>
      )}
    </div>
  );
}
