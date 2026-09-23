import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { PayoutButton } from "@/components/ui/action-buttons";

export default async function PaymentsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const orders = await prisma.order.findMany({ where: { ownerId: user.id }, include: { payment: true }, orderBy: { createdAt: "desc" } });
  const ledger = await prisma.ledgerEntry.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 });
  const payouts = await prisma.payout.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  const resellerSales = await prisma.resellerSale.findMany({ where: { reseller: { userId: user.id } }, orderBy: { createdAt: "desc" } });

  const totalRevenue = orders.filter((o) => o.status === "PAID").reduce((s, o) => s + o.total, 0);
  const totalFees = ledger.filter((l) => l.type === "FEE").reduce((s, l) => s + l.amount, 0);
  const totalCommission = ledger.filter((l) => l.type === "COMMISSION").reduce((s, l) => s + l.amount, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div><h1 className="text-xl font-semibold">Payments - Nouveau modèle 197$ + 5%</h1><p className="text-sm text-muted mt-1">Plateforme gratuite : 95% toi / 5% Nuvra. Formation 197$ : 90% revendeur / 10% Nuvra. Ledger transparent.</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted uppercase">Revenu total</p><p className="text-xl font-semibold mt-1">{formatPrice(totalRevenue)}</p><p className="text-[11px] text-muted mt-1">197$ formation + ventes perso</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted uppercase">Net (95% / 90%)</p><p className="text-xl font-semibold mt-1 text-success">{formatPrice(totalCommission)}</p><p className="text-[11px] text-muted mt-1">Après frais Stripe + part Nuvra</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted uppercase">Frais Stripe</p><p className="text-xl font-semibold mt-1">{formatPrice(totalFees)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted uppercase">Payouts (14j)</p><p className="text-xl font-semibold mt-1">{payouts.length}</p></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card><CardHeader><CardTitle className="text-base">Orders</CardTitle></CardHeader><CardContent className="space-y-2">{orders.slice(0,10).map((o) => (<div key={o.id} className="flex justify-between items-center p-3 rounded-xl bg-surface2 border border-border text-sm"><div><p className="font-medium">{o.id.slice(0,8)} • {o.status}</p><p className="text-xs text-muted">{new Date(o.createdAt).toLocaleDateString()}</p></div><span className="font-medium">{formatPrice(o.total)}</span></div>))}{orders.length===0 && <p className="text-sm text-muted">No orders yet</p>}</CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base">Reseller Sales (90/10)</CardTitle></CardHeader><CardContent className="space-y-2">{resellerSales.map((s) => (<div key={s.id} className="p-3 rounded-xl bg-surface2 border border-border text-xs space-y-1"><div className="flex justify-between"><span>Price</span><span>{formatPrice(s.productPrice)}</span></div><div className="flex justify-between text-muted"><span>Stripe Fees</span><span>-{formatPrice(s.stripeFees)}</span></div><div className="flex justify-between text-muted"><span>Nuvra 10%</span><span>-{formatPrice(s.nuvraShare)}</span></div><div className="flex justify-between font-medium text-success"><span>Your 90%</span><span>{formatPrice(s.resellerShare)}</span></div></div>))}{resellerSales.length===0 && <p className="text-sm text-muted">No reseller sales yet - vendez Nuvra Academy à 197$ et touchez ~171.89€</p>}</CardContent></Card>
        </div>

        <div className="space-y-6">
          <Card><CardHeader><CardTitle className="text-base">Ledger (Immutable)</CardTitle></CardHeader><CardContent className="space-y-2 max-h-[400px] overflow-auto">{ledger.map((l) => (<div key={l.id} className="p-2 rounded-lg bg-surface2 border border-border text-xs"><div className="flex justify-between"><span className={`px-1.5 py-0.5 rounded text-[10px] border ${l.type === "SALE" ? "bg-accent/10 text-accent border-accent/20" : l.type === "COMMISSION" ? "bg-success/10 text-success border-success/20" : "bg-surface3 text-muted"}`}>{l.type}</span><span>{formatPrice(l.amount)}</span></div><p className="text-muted mt-1 truncate">{l.description}</p></div>))}{ledger.length===0 && <p className="text-sm text-muted">No ledger entries</p>}</CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base">Payouts</CardTitle></CardHeader><CardContent className="space-y-3"><p className="text-xs text-muted">Payouts: pending → available (14d) → processing → paid. Ledger permet de reconstituer le solde.</p><PayoutButton /><div className="space-y-2 pt-2">{payouts.map((p) => (<div key={p.id} className="flex justify-between text-xs"><span>{p.status}</span><span>{formatPrice(p.amount)}</span></div>))}</div></CardContent></Card>
        </div>
      </div>
    </div>
  );
}
