import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calculateResellerSplit } from "@/lib/utils";

export default async function ResellPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  let reseller = await prisma.reseller.findUnique({ where: { userId: user.id }, include: { sales: true } });
  const price = 49700; // $497
  const split = calculateResellerSplit(price);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Resell Nuvra Academy</h1>
      <p className="text-sm text-muted">Earn 90% on every sale. Nuvra handles delivery, support, and platform. You focus on marketing.</p>

      <div className="grid md:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle className="text-base">Your Reseller Status</CardTitle></CardHeader><CardContent className="space-y-4">
          {reseller ? (
            <>
              <div className="flex justify-between text-sm"><span className="text-muted">Status</span><span className={`px-2 py-1 rounded-full text-xs border ${reseller.status === "ACTIVE" ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"}`}>{reseller.status}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted">Total Sales</span><span>{reseller.totalSales}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted">Total Revenue</span><span>${(reseller.totalRevenue/100).toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted">Your Commission</span><span className="text-success">${(reseller.totalCommission/100).toFixed(2)}</span></div>
              <div className="pt-4"><label className="text-xs font-medium mb-1 block">Your Resell Link</label><div className="flex gap-2"><Input value={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/r/${reseller.customSlug || user.username}`} readOnly /><Button size="sm">Copy</Button></div></div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted">You are not yet a reseller. Apply now - instant approval for demo.</p>
              <form action="/api/reseller/apply" method="POST"><Button className="w-full">Apply to become reseller</Button></form>
              <p className="text-[11px] text-muted">By applying you agree to Reseller Terms. No spam, no misleading claims. Commission paid after 14 days to handle refunds.</p>
            </>
          )}
        </CardContent></Card>

        <Card className="border-accent/20"><CardHeader><CardTitle className="text-base">Financial Breakdown</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
          <div className="p-3 rounded-xl bg-background border border-border space-y-2">
            <div className="flex justify-between"><span className="text-muted">Sale Price</span><span className="font-medium">${(split.price/100).toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Stripe Fees (2.9% + 30c)</span><span className="text-muted">-${(split.stripeFees/100).toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted">After fees</span><span>${(split.afterFees/100).toFixed(2)}</span></div>
            <div className="h-px bg-border" />
            <div className="flex justify-between"><span className="text-muted">Nuvra Share (10%)</span><span className="text-muted">-${(split.nuvraShare/100).toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold text-success"><span>Your Share (90%)</span><span>${(split.resellerShare/100).toFixed(2)}</span></div>
          </div>
          <p className="text-[11px] text-muted">Fees are shown separately and transparently. No hidden deductions. Payouts: pending → available (14d) → processing → paid. Ledger is immutable.</p>
          <div className="space-y-2 pt-2">
            <h4 className="font-medium text-xs">Rules</h4>
            <ul className="text-[11px] text-muted list-disc pl-4 space-y-1">
              <li>90% to reseller, 10% to Nuvra after Stripe fees</li>
              <li>Refunds recalculate 90/10 automatically</li>
              <li>Suspended resellers keep history but can't sell</li>
              <li>Fraud detection + manual review for large volumes</li>
              <li>Custom branding allowed within limits</li>
            </ul>
          </div>
        </CardContent></Card>
      </div>

      {reseller && (
        <Card><CardHeader><CardTitle className="text-base">Sales History</CardTitle></CardHeader><CardContent>
          {reseller.sales.length === 0 ? <p className="text-sm text-muted">No sales yet. Share your link to start earning.</p> : (
            <div className="space-y-2">
              {reseller.sales.map((s) => (
                <div key={s.id} className="flex justify-between items-center p-3 rounded-xl bg-surface2 border border-border text-sm"><span>{s.id.slice(0,8)} • ${(s.productPrice/100).toFixed(2)}</span><span className="text-success">+${(s.resellerShare/100).toFixed(2)}</span><span className="text-xs text-muted">{new Date(s.createdAt).toLocaleDateString()}</span></div>
              ))}
            </div>
          )}
        </CardContent></Card>
      )}
    </div>
  );
}
