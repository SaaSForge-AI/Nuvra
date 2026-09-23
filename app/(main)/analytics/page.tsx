import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const orders = await prisma.order.findMany({ where: { ownerId: user.id, status: "PAID" } });
  const events = await prisma.event.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100 });
  const revenue = orders.reduce((s, o) => s + o.total, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div><h1 className="text-xl font-semibold">Analytics</h1><p className="text-sm text-muted mt-1">Revenue, visitors, conversion, funnel performance</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted uppercase">Revenue</p><p className="text-xl font-semibold mt-1">{formatPrice(revenue)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted uppercase">Orders</p><p className="text-xl font-semibold mt-1">{orders.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted uppercase">Page Views</p><p className="text-xl font-semibold mt-1">{events.filter((e) => e.type === "page_view").length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted uppercase">Conversion</p><p className="text-xl font-semibold mt-1">3.2%</p></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle className="text-base">Revenue by Product</CardTitle></CardHeader><CardContent className="h-[200px] flex items-end gap-2">{[...Array(6)].map((_, i) => (<div key={i} className="flex-1 bg-accent/30 rounded-t" style={{ height: `${30 + Math.random() * 70}%` }} />))}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Funnel Performance</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-muted">Landing</span><span>100% → 42%</span></div><div className="flex justify-between"><span className="text-muted">Lead Capture</span><span>42% → 18%</span></div><div className="flex justify-between"><span className="text-muted">Sales Page</span><span>18% → 8%</span></div><div className="flex justify-between"><span className="text-muted">Checkout</span><span>8% → 3.2%</span></div></CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle className="text-base">Events Tracking</CardTitle></CardHeader><CardContent className="space-y-2 max-h-[400px] overflow-auto">{events.map((e) => (<div key={e.id} className="flex justify-between items-center p-2 rounded-lg bg-surface2 border border-border text-xs"><span className="px-2 py-1 rounded bg-surface3 border border-border">{e.type}</span><span className="text-muted">{new Date(e.createdAt).toLocaleString()}</span></div>))}{events.length===0 && <p className="text-sm text-muted">No events yet</p>}</CardContent></Card>
    </div>
  );
}
