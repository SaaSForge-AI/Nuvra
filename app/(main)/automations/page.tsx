import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { CreateAutomationButton } from "@/components/ui/action-buttons";

export default async function AutomationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const automations = await prisma.automation.findMany({ where: { userId: user.id }, include: { actions: true }, orderBy: { createdAt: "desc" } });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-xl font-semibold">Automations</h1><p className="text-sm text-muted mt-1\">Workflow builder with triggers, actions, conditions • Gratuit inclus</p></div><CreateAutomationButton /></div>

      {automations.length === 0 ? (
        <Card className="border-dashed"><CardContent className="p-12 text-center"><div className="h-12 w-12 rounded-2xl bg-surface3 border border-border flex items-center justify-center mx-auto mb-4"><Zap className="h-6 w-6 text-muted" /></div><h3 className="font-medium mb-2\">Automate your business</h3><p className="text-sm text-muted mb-6 max-w-sm mx-auto">Triggers: user.created, lead.created, product.purchased, checkout.abandoned, course.started, lesson.completed, course.completed</p><CreateAutomationButton /></CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {automations.map((a) => (
            <Card key={a.id}><CardHeader><div className="flex justify-between items-start"><div><CardTitle className="text-sm">{a.name}</CardTitle><p className="text-xs text-muted mt-1">{a.description}</p></div><span className={`text-[11px] px-2 py-1 rounded-full border ${a.isActive ? "bg-success/10 text-success border-success/20" : "bg-surface2 text-muted"}`}>{a.isActive ? "Active" : "Inactive"}</span></div></CardHeader><CardContent><div className="space-y-2 text-xs"><div className="flex items-center gap-2"><span className="px-2 py-1 rounded bg-accentMuted text-accent border border-accent/20">Trigger: {a.triggerType}</span></div><div className="space-y-1">{a.actions.map((act) => (<div key={act.id} className="p-2 rounded-lg bg-surface2 border border-border flex justify-between"><span>{act.type}</span><span className="text-muted">→</span></div>))}</div></div></CardContent></Card>
          ))}
        </div>
      )}

      <Card><CardHeader><CardTitle className="text-base">Available Triggers & Actions</CardTitle></CardHeader><CardContent className="grid md:grid-cols-3 gap-6 text-xs">
        <div><p className="font-medium mb-2">Triggers</p><ul className="space-y-1 text-muted"><li>user.created</li><li>lead.created</li><li>product.purchased</li><li>checkout.abandoned</li><li>course.started</li><li>lesson.completed</li><li>course.completed</li><li>reseller.approved</li><li>affiliate.sale</li></ul></div>
        <div><p className="font-medium mb-2">Actions</p><ul className="space-y-1 text-muted"><li>send_email</li><li>add_tag</li><li>remove_tag</li><li>create_customer</li><li>send_notification</li><li>enroll_course</li><li>wait</li><li>webhook</li></ul></div>
        <div><p className="font-medium mb-2">Conditions</p><ul className="space-y-1 text-muted"><li>has_tag</li><li>purchased_product</li><li>email_contains</li><li>user_role</li><li>course_progress</li></ul></div>
      </CardContent></Card>
    </div>
  );
}
