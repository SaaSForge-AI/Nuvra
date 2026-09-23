import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { SuspendResellerButton, ApproveMarketplaceButton } from "@/components/admin/admin-client";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) return redirect("/login");

  const [usersCount, productsCount, coursesCount, ordersCount, resellersCount, listings, auditLogs, orders] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.course.count(),
    prisma.order.count(),
    prisma.reseller.count(),
    prisma.marketplaceListing.findMany({ include: { course: true }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  const users = await prisma.user.findMany({ take: 10, orderBy: { createdAt: "desc" } });
  const resellers = await prisma.reseller.findMany({ include: { user: true }, take: 10, orderBy: { createdAt: "desc" } });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div><h1 className="text-xl font-semibold">Admin Panel - Nuvra Academy 197$ + 5% platform</h1><p className="text-sm text-muted mt-1">Super admin dashboard • Ledger, payouts, refunds, marketplace</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted uppercase">Users</p><p className="text-xl font-semibold mt-1">{usersCount}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted uppercase">Products</p><p className="text-xl font-semibold mt-1">{productsCount}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted uppercase">Courses</p><p className="text-xl font-semibold mt-1">{coursesCount}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted uppercase">Orders</p><p className="text-xl font-semibold mt-1">{ordersCount}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted uppercase">Resellers</p><p className="text-xl font-semibold mt-1">{resellersCount}</p></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle className="text-base">Users (10 derniers)</CardTitle></CardHeader><CardContent className="space-y-2">{users.map((u) => (<div key={u.id} className="flex justify-between items-center p-2 rounded-lg bg-surface2 border border-border text-sm"><div><p className="font-medium">{u.firstName} {u.lastName}</p><p className="text-xs text-muted">{u.email} • {u.role}</p></div><span className={`text-[11px] px-2 py-1 rounded-full border ${u.isSuperAdmin ? "bg-accent/10 text-accent border-accent/20" : "bg-surface3 text-muted"}`}>{u.isSuperAdmin ? "Admin" : u.role}</span></div>))}</CardContent></Card>

        <Card><CardHeader><CardTitle className="text-base">Resellers Moderation - 90/10</CardTitle></CardHeader><CardContent className="space-y-2">{resellers.map((r) => (<div key={r.id} className="flex justify-between items-center p-2 rounded-lg bg-surface2 border border-border text-sm"><div><p className="font-medium">{r.user?.email || r.userId}</p><p className="text-xs text-muted">{r.totalSales} sales • ${(r.totalCommission/100).toFixed(2)} • {r.status}</p></div><div className="flex gap-1"><SuspendResellerButton id={r.id} status={r.status} /></div></div>))}{resellers.length===0 && <p className="text-sm text-muted">No resellers - les revendeurs apparaissent après achat Academy 197$</p>}</CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle className="text-base">Marketplace Moderation</CardTitle></CardHeader><CardContent className="space-y-3">
          {listings.length === 0 ? <p className="text-sm text-muted">No listings</p> : listings.map((l) => (
            <div key={l.id} className="p-3 rounded-xl bg-surface2 border border-border space-y-2">
              <div className="flex justify-between items-start">
                <div><p className="text-sm font-medium">{l.course?.title || l.courseId}</p><p className="text-xs text-muted">Status: {l.isApproved ? "Approved" : "Pending"} {l.featured ? "• Featured" : ""}</p></div>
                <span className={`text-[11px] px-2 py-1 rounded-full border ${l.isApproved ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"}`}>{l.isApproved ? "Approved" : "Pending"}</span>
              </div>
              <ApproveMarketplaceButton id={l.id} />
            </div>
          ))}
        </CardContent></Card>
        <div className="space-y-6">
          <Card><CardHeader><CardTitle className="text-base">Audit Logs (sécurité)</CardTitle></CardHeader><CardContent className="space-y-2 max-h-[300px] overflow-auto">{auditLogs.map((log) => (<div key={log.id} className="p-2 rounded-lg bg-surface2 border border-border text-xs"><div className="flex justify-between"><span>{log.action} • {log.entity}</span><span className="text-muted">{new Date(log.createdAt).toLocaleDateString()}</span></div><p className="text-muted truncate">{log.ip} • {log.userId?.slice(0,8)}</p></div>))}{auditLogs.length===0 && <p className="text-xs text-muted">Logs: login, course published, payment, refund - tout est tracé</p>}</CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Orders récents</CardTitle></CardHeader><CardContent className="space-y-2">{orders.map((o) => (<div key={o.id} className="flex justify-between text-xs p-2 rounded-lg bg-surface2 border border-border"><span>{o.id.slice(0,8)} • {o.status}</span><span>${(o.total/100).toFixed(2)}</span></div>))}</CardContent></Card>
        </div>
      </div>
    </div>
  );
}
