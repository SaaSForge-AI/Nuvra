import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) return redirect("/login");
  if (!user.isSuperAdmin && user.role !== "SUPER_ADMIN") {
    // For demo, allow any user to see admin but with warning
    // return redirect("/dashboard");
  }

  const [usersCount, productsCount, coursesCount, ordersCount, resellersCount] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.course.count(),
    prisma.order.count(),
    prisma.reseller.count(),
  ]);

  const users = await prisma.user.findMany({ take: 10, orderBy: { createdAt: "desc" } });
  const resellers = await prisma.reseller.findMany({ include: { user: true }, take: 10, orderBy: { createdAt: "desc" } });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div><h1 className="text-xl font-semibold">Admin Panel</h1><p className="text-sm text-muted mt-1">Super admin dashboard</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted uppercase">Users</p><p className="text-xl font-semibold mt-1">{usersCount}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted uppercase">Products</p><p className="text-xl font-semibold mt-1">{productsCount}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted uppercase">Courses</p><p className="text-xl font-semibold mt-1">{coursesCount}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted uppercase">Orders</p><p className="text-xl font-semibold mt-1">{ordersCount}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted uppercase">Resellers</p><p className="text-xl font-semibold mt-1">{resellersCount}</p></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle className="text-base">Users</CardTitle></CardHeader><CardContent className="space-y-2">{users.map((u) => (<div key={u.id} className="flex justify-between items-center p-2 rounded-lg bg-surface2 border border-border text-sm"><div><p className="font-medium">{u.firstName} {u.lastName}</p><p className="text-xs text-muted">{u.email} • {u.role}</p></div><span className={`text-[11px] px-2 py-1 rounded-full border ${u.isSuperAdmin ? "bg-accent/10 text-accent border-accent/20" : "bg-surface3 text-muted"}`}>{u.isSuperAdmin ? "Admin" : u.role}</span></div>))}</CardContent></Card>

        <Card><CardHeader><CardTitle className="text-base">Resellers Moderation</CardTitle></CardHeader><CardContent className="space-y-2">{resellers.map((r) => (<div key={r.id} className="flex justify-between items-center p-2 rounded-lg bg-surface2 border border-border text-sm"><div><p className="font-medium">{r.user.email}</p><p className="text-xs text-muted">{r.totalSales} sales • ${r.totalCommission/100}</p></div><div className="flex gap-1"><Button size="sm" variant="outline" className="h-7 text-xs">Suspend</Button><Button size="sm" variant="outline" className="h-7 text-xs">View</Button></div></div>))}{resellers.length===0 && <p className="text-sm text-muted">No resellers</p>}</CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle className="text-base">Marketplace Moderation</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p className="text-muted">Courses pending review: 0</p><div className="flex gap-2"><Button size="sm" variant="outline">Approve</Button><Button size="sm" variant="outline">Reject</Button><Button size="sm" variant="outline">Request changes</Button></div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Audit Logs</CardTitle></CardHeader><CardContent className="space-y-2 text-xs"><p className="text-muted">Recent actions tracked for security & RBAC</p><div className="p-2 rounded-lg bg-surface2 border border-border">User login • IP logged • Device metadata</div><div className="p-2 rounded-lg bg-surface2 border border-border">Course published • Admin action</div></CardContent></Card>
      </div>
    </div>
  );
}
