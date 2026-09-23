import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calculateResellerSplit, calculateCreatorRevenue } from "@/lib/utils";

export default async function ResellPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  let reseller = await prisma.reseller.findUnique({ where: { userId: user.id }, include: { sales: true } });
  const price = 19700; // $197 new model
  const split = calculateResellerSplit(price);
  const creatorExample = calculateCreatorRevenue(10000); // $100 product example

  // Check if user bought academy
  const academyCourse = await prisma.course.findFirst({ where: { isNuvraAcademy: true } });
  let hasAcademy = false;
  if (academyCourse && user) {
    const enr = await prisma.enrollment.findFirst({ where: { userId: user.id, courseId: academyCourse.id } });
    hasAcademy = !!enr;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Revendre Nuvra Academy - Modèle 197$</h1>
      <p className="text-sm text-muted">Plateforme gratuite pour tous (5% Nuvra sur tes ventes perso). Formation à 197$ une fois = droit de revente à vie avec 90% pour toi. Pas d'abonnement.</p>

      <div className="grid md:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle className="text-base">Ton statut revendeur</CardTitle></CardHeader><CardContent className="space-y-4">
          {!hasAcademy ? (
            <>
              <div className="p-3 rounded-xl bg-warning/10 border border-warning/20 text-sm">
                <p className="font-medium text-warning">Tu dois d'abord acheter la formation à 197$</p>
                <p className="text-xs text-muted mt-1">Achète Nuvra Academy pour débloquer le droit de revente. Accès plateforme gratuit déjà inclus.</p>
              </div>
              <Button className="w-full">Acheter à 197$ pour devenir revendeur</Button>
            </>
          ) : reseller ? (
            <>
              <div className="flex justify-between text-sm"><span className="text-muted">Statut</span><span className={`px-2 py-1 rounded-full text-xs border ${reseller.status === "ACTIVE" ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"}`}>{reseller.status}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted">Ventes totales</span><span>{reseller.totalSales}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted">Revenu total</span><span>${(reseller.totalRevenue/100).toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted">Ta commission (90%)</span><span className="text-success">${(reseller.totalCommission/100).toFixed(2)}</span></div>
              <div className="pt-4"><label className="text-xs font-medium mb-1 block">Ton lien de revente</label><div className="flex gap-2"><Input value={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/r/${reseller.customSlug || user.username}`} readOnly /><Button size="sm">Copier</Button></div><p className="text-[11px] text-muted mt-1">Partage ce lien : /r/{reseller.customSlug} → checkout 197$ → 90% pour toi</p></div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted">Tu as acheté la formation ! Active ton statut revendeur maintenant (approbation instantanée).</p>
              <form action="/api/reseller" method="POST"><Button className="w-full">Activer revente à 90%</Button></form>
              <p className="text-[11px] text-muted">En activant tu acceptes les Conditions Revendeur. Pas de spam, pas de fausses promesses. Payouts après 14j pour gérer refunds.</p>
            </>
          )}
        </CardContent></Card>

        <div className="space-y-6">
          <Card className="border-accent/20"><CardHeader><CardTitle className="text-base">Breakdown 197$ - Revente Academy</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
            <div className="p-3 rounded-xl bg-background border border-border space-y-2">
              <div className="flex justify-between"><span className="text-muted">Prix vente</span><span className="font-medium">${(split.price/100).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Frais Stripe (2.9% + 30c)</span><span className="text-muted">-${(split.stripeFees/100).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Après frais</span><span>${(split.afterFees/100).toFixed(2)}</span></div>
              <div className="h-px bg-border" />
              <div className="flex justify-between"><span className="text-muted">Nuvra 10%</span><span className="text-muted">-${(split.nuvraShare/100).toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold text-success"><span>Ton net 90%</span><span>${(split.resellerShare/100).toFixed(2)}</span></div>
            </div>
            <p className="text-[11px] text-muted">Exemple réel : vente à 197$ → tu touches ~172$ net après frais Stripe et part Nuvra. Transparent, pas de frais cachés.</p>
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base">Breakdown tes produits perso - 5%</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
            <div className="p-3 rounded-xl bg-background border border-border space-y-2">
              <div className="flex justify-between"><span className="text-muted">Exemple vente 100$</span><span>$100.00</span></div>
              <div className="flex justify-between"><span className="text-muted">Frais Stripe</span><span className="text-muted">-${(creatorExample.stripeFees/100).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Après frais</span><span>${(creatorExample.afterFees/100).toFixed(2)}</span></div>
              <div className="h-px bg-border" />
              <div className="flex justify-between"><span className="text-muted">Nuvra 5%</span><span className="text-muted">-${(creatorExample.nuvraShare/100).toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold text-success"><span>Ton net 95%</span><span>${(creatorExample.creatorShare/100).toFixed(2)}</span></div>
            </div>
            <p className="text-[11px] text-muted">Plateforme gratuite : tu vends tes formations, ebooks, templates. Nuvra prend 5% seulement. Pas d'abonnement.</p>
          </CardContent></Card>
        </div>
      </div>

      <Card><CardHeader><CardTitle className="text-base">Règles & Payouts</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-6 text-xs">
        <div><p className="font-medium mb-2">Revente Academy 197$</p><ul className="space-y-1 text-muted list-disc pl-4"><li>90% revendeur / 10% Nuvra après frais Stripe</li><li>Accès à vie, pas d'abonnement</li><li>Refund recalcul auto 90/10</li><li>Payouts : pending → available (14j) → processing → paid</li><li>Ledger immuable</li></ul></div>
        <div><p className="font-medium mb-2">Tes produits perso</p><ul className="space-y-1 text-muted list-disc pl-4"><li>95% toi / 5% Nuvra après frais Stripe</li><li>Plateforme gratuite pour tous</li><li>Pas de limite produits/funnels/pages</li><li>Marketplace inclus</li><li>Pas d'abonnement mensuel</li></ul></div>
      </CardContent></Card>

      {reseller && (
        <Card><CardHeader><CardTitle className="text-base">Historique ventes</CardTitle></CardHeader><CardContent>
          {reseller.sales.length === 0 ? <p className="text-sm text-muted">Pas encore de ventes. Partage ton lien /r/{reseller.customSlug}</p> : (
            <div className="space-y-2">
              {reseller.sales.map((s: any) => (
                <div key={s.id} className="flex justify-between items-center p-3 rounded-xl bg-surface2 border border-border text-sm"><span>{s.id.slice(0,8)} • ${(s.productPrice/100).toFixed(2)}</span><span className="text-success">+${(s.resellerShare/100).toFixed(2)}</span><span className="text-xs text-muted">{new Date(s.createdAt).toLocaleDateString()}</span></div>
              ))}
            </div>
          )}
        </CardContent></Card>
      )}
    </div>
  );
}
