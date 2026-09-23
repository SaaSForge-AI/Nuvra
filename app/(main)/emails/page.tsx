import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateCampaignButton } from "@/components/ui/action-buttons";

export default async function EmailsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const campaigns = await prisma.emailCampaign.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-xl font-semibold">Emails</h1><p className="text-sm text-muted mt-1">Broadcasts, templates, sequences • Inclus gratuit</p></div><CreateCampaignButton /></div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card><CardHeader><CardTitle className="text-base">Campaigns</CardTitle></CardHeader><CardContent className="space-y-3">{campaigns.length===0 ? <p className="text-sm text-muted">No campaigns yet. Create welcome, purchase, abandoned cart sequences.</p> : campaigns.map((c) => (<div key={c.id} className="flex justify-between items-center p-3 rounded-xl bg-surface2 border border-border text-sm"><div><p className="font-medium">{c.name}</p><p className="text-xs text-muted">{c.subject}</p></div><span className="text-[11px] px-2 py-1 rounded-full bg-surface3 border border-border">{c.status}</span></div>))}</CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base">Automated Sequences</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
            <div className="p-3 rounded-xl bg-surface2 border border-border flex justify-between"><span>Welcome sequence</span><span className="text-success text-xs">Active • 3 emails</span></div>
            <div className="p-3 rounded-xl bg-surface2 border border-border flex justify-between"><span>Purchase confirmation</span><span className="text-success text-xs">Active • 1 email</span></div>
            <div className="p-3 rounded-xl bg-surface2 border border-border flex justify-between"><span>Course onboarding</span><span className="text-success text-xs">Active • 5 emails</span></div>
            <div className="p-3 rounded-xl bg-surface2 border border-border flex justify-between"><span>Abandoned checkout</span><span className="text-success text-xs">Active • 2 emails</span></div>
            <div className="p-3 rounded-xl bg-surface2 border border-border flex justify-between"><span>Certificate</span><span className="text-success text-xs">Active • 1 email</span></div>
          </CardContent></Card>
        </div>

        <div className="space-y-6">
          <Card><CardHeader><CardTitle className="text-base">Templates</CardTitle></CardHeader><CardContent className="space-y-2 text-xs"><div className="p-2 rounded-lg bg-surface2 border border-border">Welcome</div><div className="p-2 rounded-lg bg-surface2 border border-border">Purchase</div><div className="p-2 rounded-lg bg-surface2 border border-border">Abandoned Cart</div><div className="p-2 rounded-lg bg-surface2 border border-border">Certificate</div></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Stats</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-muted">Sent</span><span>1,240</span></div><div className="flex justify-between"><span className="text-muted">Open Rate</span><span>42%</span></div><div className="flex justify-between"><span className="text-muted">Click Rate</span><span>8.3%</span></div></CardContent></Card>
        </div>
      </div>
    </div>
  );
}
