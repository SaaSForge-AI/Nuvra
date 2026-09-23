import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function LeadsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const leads = await prisma.lead.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-xl font-semibold">Leads</h1><p className="text-sm text-muted mt-1">Prospects and lead capture</p></div><Button size="sm" className="rounded-full">Add Lead</Button></div>

      <Card><CardContent className="p-0 overflow-auto"><table className="w-full text-sm"><thead className="border-b border-border text-xs text-muted uppercase"><tr><th className="text-left p-3">Lead</th><th className="text-left p-3">Email</th><th className="text-left p-3">Source</th><th className="text-left p-3">Status</th><th className="text-left p-3">Date</th></tr></thead><tbody>{leads.map((l) => (<tr key={l.id} className="border-b border-border/50 hover:bg-surface2/50"><td className="p-3">{l.firstName} {l.lastName}</td><td className="p-3 text-muted">{l.email}</td><td className="p-3 text-xs">{l.source || "—"}</td><td className="p-3"><span className="text-[11px] px-2 py-1 rounded-full bg-surface2 border border-border">{l.status}</span></td><td className="p-3 text-xs text-muted">{new Date(l.createdAt).toLocaleDateString()}</td></tr>))}{leads.length===0 && <tr><td colSpan={5} className="p-8 text-center text-muted">No leads yet - create a funnel with lead capture</td></tr>}</tbody></table></CardContent></Card>
    </div>
  );
}
