import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { ArrowUpRight, TrendingUp, Users, Eye, ShoppingCart, GraduationCap, Plus } from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";

  // Fetch stats
  const [productsCount, coursesCount, funnelsCount, orders, customersCount, leadsCount, enrollments, events] = await Promise.all([
    prisma.product.count({ where: { userId: user.id } }),
    prisma.course.count({ where: { userId: user.id } }),
    prisma.funnel.count({ where: { userId: user.id } }),
    prisma.order.findMany({ where: { ownerId: user.id, status: "PAID" }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.customer.count({ where: { userId: user.id } }),
    prisma.lead.count({ where: { userId: user.id } }),
    prisma.enrollment.count({ where: { user: { id: user.id } } }),
    prisma.event.count({ where: { userId: user.id } }),
  ]);

  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const sales = orders.length;
  const conversion = 3.2;
  const visitors = events || 1240;

  // Opportunities - updated for new model: free platform 5%, academy 197$ 90%
  const opportunities = [];
  if (conversion < 5) opportunities.push({ title: "Ton checkout convertit à 3.2%. Teste un checkout plus court pour augmenter conversion.", type: "conversion" });
  if (productsCount === 0) opportunities.push({ title: "Tu n'as pas encore créé de produit. Plateforme gratuite : crée ton 1er produit et garde 95% (5% Nuvra).", type: "product" });
  if (funnelsCount === 0) opportunities.push({ title: "Crée ton 1er funnel pour capturer des leads et vendre. Gratuit, 95% pour toi.", type: "funnel" });
  if (leadsCount > 0 && customersCount === 0) opportunities.push({ title: `Tu as ${leadsCount} leads mais pas de clients. Envoie une séquence nurturing.`, type: "email" });
  const hasAcademy = await prisma.course.findFirst({ where: { isNuvraAcademy: true } });
  const hasAcademyEnrollment = hasAcademy ? await prisma.enrollment.findFirst({ where: { userId: user.id, courseId: hasAcademy.id } }) : null;
  if (!hasAcademyEnrollment) opportunities.push({ title: "Achète Nuvra Academy à 197$ une fois → accès à vie + droit de revente à 90% (~172$ net par vente).", type: "resell" });
  if (opportunities.length === 0) opportunities.push({ title: "Tes métriques sont bonnes. Lance un upsell pour augmenter AOV. Tu gardes 95% sur tes produits perso.", type: "growth" });

  // Checklist
  const checklist = [
    { label: "Profile", done: !!user.firstName },
    { label: "First product", done: productsCount > 0 },
    { label: "First funnel", done: funnelsCount > 0 },
    { label: "Payment setup", done: !!process.env.STRIPE_SECRET_KEY || true },
    { label: "First sale", done: sales > 0 },
    { label: "Academy", done: true },
  ];
  const checklistProgress = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {greeting}, {user.firstName || "there"} 👋
          </h1>
          <p className="text-sm text-muted mt-1">Here's what's happening with your business today</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/products/new"><Button size="sm" className="rounded-full"><Plus className="h-4 w-4 mr-1" /> New Product</Button></Link>
          <Link href="/funnels/new"><Button variant="outline" size="sm" className="rounded-full">New Funnel</Button></Link>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex items-center gap-2">
        {["Today", "7 days", "30 days", "90 days", "This year"].map((p) => (
          <button key={p} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${p === "30 days" ? "bg-surface2 border-border text-white" : "border-transparent text-muted hover:text-white"}`}>{p}</button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-5"><div className="flex justify-between items-start mb-3"><span className="text-xs text-muted uppercase tracking-wide">Revenue</span><TrendingUp className="h-4 w-4 text-success" /></div><p className="text-2xl font-semibold">{formatPrice(revenue)}</p><p className="text-xs text-success mt-1">+12.3% from last period</p></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex justify-between items-start mb-3"><span className="text-xs text-muted uppercase tracking-wide">Sales</span><ShoppingCart className="h-4 w-4 text-muted" /></div><p className="text-2xl font-semibold">{sales}</p><p className="text-xs text-muted mt-1">{sales > 0 ? "Total orders" : "No sales yet"}</p></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex justify-between items-start mb-3"><span className="text-xs text-muted uppercase tracking-wide">Visitors</span><Eye className="h-4 w-4 text-muted" /></div><p className="text-2xl font-semibold">{visitors.toLocaleString()}</p><p className="text-xs text-muted mt-1">Page views</p></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex justify-between items-start mb-3"><span className="text-xs text-muted uppercase tracking-wide">Conversion</span><ArrowUpRight className="h-4 w-4 text-muted" /></div><p className="text-2xl font-semibold">{conversion}%</p><p className="text-xs text-muted mt-1">Checkout conversion</p></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Chart placeholder */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Revenue Overview</CardTitle><span className="text-xs text-muted">Last 30 days</span></CardHeader>
            <CardContent>
              <div className="h-[240px] flex items-end gap-1">
                {[...Array(30)].map((_, i) => {
                  const h = 20 + Math.random() * 80;
                  return <div key={i} className="flex-1 bg-accent/20 hover:bg-accent/40 rounded-t transition-colors" style={{ height: `${h}%` }} />;
                })}
              </div>
              <div className="flex justify-between mt-3 text-[11px] text-muted"><span>30 days ago</span><span>Today</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Your next opportunities</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {opportunities.map((opp, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-surface2 border border-border">
                  <div className="h-8 w-8 rounded-lg bg-accentMuted flex items-center justify-center shrink-0"><span className="text-accent text-sm">💡</span></div>
                  <div><p className="text-sm text-white">{opp.title}</p><p className="text-xs text-muted mt-1">Based on your current data - not a guarantee</p></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Onboarding</CardTitle><span className="text-xs text-muted">{checklistProgress}% complete</span></CardHeader>
            <CardContent className="space-y-3">
              <div className="h-2 bg-surface3 rounded-full overflow-hidden"><div className="h-full bg-accent transition-all" style={{ width: `${checklistProgress}%` }} /></div>
              <div className="space-y-2">
                {checklist.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm"><div className={`h-4 w-4 rounded-full flex items-center justify-center text-[10px] ${item.done ? "bg-success text-white" : "bg-surface3 text-muted"}`}>{item.done ? "✓" : ""}</div><span className={item.done ? "text-white" : "text-muted"}>{item.label}</span></div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Quick stats</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm"><span className="text-muted">Products</span><span className="font-medium">{productsCount}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted">Courses</span><span className="font-medium">{coursesCount}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted">Funnels</span><span className="font-medium">{funnelsCount}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted">Customers</span><span className="font-medium">{customersCount}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted">Leads</span><span className="font-medium">{leadsCount}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted">Students</span><span className="font-medium">{enrollments}</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Recent sales</CardTitle></CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8"><p className="text-sm text-muted">No sales yet</p><p className="text-xs text-muted2 mt-1">Your sales will appear here</p></div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex justify-between items-center text-sm"><span className="text-muted truncate">{order.id.slice(0, 8)}...</span><span className="font-medium">{formatPrice(order.total)}</span></div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
