import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { ExportButton } from "@/components/ui/action-buttons";

export default async function CustomersPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const customers = await prisma.customer.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-xl font-semibold">Customers</h1><p className="text-sm text-muted mt-1">Manage customers and segments • 95% revenue pour toi</p></div><ExportButton type="customers" /></div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted uppercase">Total Customers</p><p className="text-xl font-semibold mt-1">{customers.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted uppercase">VIP</p><p className="text-xl font-semibold mt-1">{customers.filter((c) => c.totalSpent > 50000).length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted uppercase">Avg Spent</p><p className="text-xl font-semibold mt-1">{customers.length ? formatPrice(Math.round(customers.reduce((s, c) => s + c.totalSpent, 0) / customers.length)) : "$0"}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted uppercase">Segments</p><p className="text-xl font-semibold mt-1">5</p></CardContent></Card>
      </div>

      <Card><CardContent className="p-0 overflow-auto"><table className="w-full text-sm"><thead className="border-b border-border text-xs text-muted uppercase"><tr><th className="text-left p-3">Customer</th><th className="text-left p-3">Email</th><th className="text-left p-3">Orders</th><th className="text-left p-3">Spent</th><th className="text-left p-3">Tags</th></tr></thead><tbody>{customers.map((c) => (<tr key={c.id} className="border-b border-border/50 hover:bg-surface2/50"><td className="p-3">{c.firstName} {c.lastName}</td><td className="p-3 text-muted">{c.email}</td><td className="p-3">{c.ordersCount}</td><td className="p-3">{formatPrice(c.totalSpent)}</td><td className="p-3 text-xs text-muted">{c.tags ? JSON.parse(c.tags).join(", ") : "—"}</td></tr>))}{customers.length===0 && <tr><td colSpan={5} className="p-8 text-center text-muted">No customers yet</td></tr>}</tbody></table></CardContent></Card>
    </div>
  );
}
