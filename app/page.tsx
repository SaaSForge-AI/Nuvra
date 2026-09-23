import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, GraduationCap, BarChart3, Users, Mail, GitBranch, Store, Link2, Shield, Sparkles, Check } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-white">
      {/* Minimal top nav - floating pill */}
      <div className="sticky top-0 z-50 flex justify-center pt-6 px-4">
        <div className="flex items-center gap-8 rounded-full border border-border bg-surface/80 backdrop-blur-xl px-6 py-3 shadow-soft">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-accent flex items-center justify-center font-bold text-sm">N</div>
            <span className="font-semibold tracking-tight">NUVRA</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-[13px] text-muted">
            <a href="#platform" className="hover:text-white transition-colors">Platform</a>
            <a href="#academy" className="hover:text-white transition-colors">Academy</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-[13px] text-muted hover:text-white transition-colors px-3 py-1.5">Login</Link>
            <Link href="/register">
              <Button size="sm" className="rounded-full">Start for free</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accentMuted px-3 py-1 text-[12px] text-accent mb-8">
          <Sparkles className="h-3.5 w-3.5" />
          Plateforme gratuite + Formation à 197$
        </div>
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[0.95] mb-6">
          Create. Sell.
          <br />
          <span className="text-accent">Teach. Scale.</span>
        </h1>
        <p className="mx-auto max-w-2xl text-[17px] leading-relaxed text-muted mb-10">
          Nuvra est gratuit pour vendre tes produits digitaux. On prend seulement 5%. Achète la formation Nuvra à <span className="text-white font-medium">197$</span> une fois, accède à vie, et revends-la en gardant 90%.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="rounded-full px-8">
              Commencer gratuitement <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="#pricing">
            <Button variant="outline" size="lg" className="rounded-full px-8">
              Voir l'offre à 197$
            </Button>
          </Link>
        </div>

        {/* Dashboard preview */}
        <div className="mt-20 rounded-[24px] border border-border bg-surface p-2 shadow-[0_0_80px_rgba(59,130,255,0.15)]">
          <div className="rounded-[16px] border border-border bg-background overflow-hidden">
            <div className="h-12 border-b border-border bg-surface2 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[#FF5F56]" />
                <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                <div className="h-3 w-3 rounded-full bg-[#27C93F]" />
              </div>
              <div className="ml-6 text-[12px] text-muted">nuvra.com/dashboard</div>
            </div>
            <div className="grid grid-cols-12 gap-0 min-h-[400px]">
              <div className="col-span-3 border-r border-border bg-surface p-4 space-y-3 hidden md:block">
                <div className="h-8 w-24 rounded-lg bg-surface3" />
                <div className="space-y-2 pt-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-8 rounded-lg bg-surface2" />
                  ))}
                </div>
              </div>
              <div className="col-span-12 md:col-span-9 p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card><CardContent className="p-5"><div className="h-4 w-20 bg-surface3 rounded mb-3" /><div className="h-8 w-32 bg-accent/20 rounded" /></CardContent></Card>
                  <Card><CardContent className="p-5"><div className="h-4 w-20 bg-surface3 rounded mb-3" /><div className="h-8 w-24 bg-surface3 rounded" /></CardContent></Card>
                  <Card><CardContent className="p-5"><div className="h-4 w-20 bg-surface3 rounded mb-3" /><div className="h-8 w-28 bg-surface3 rounded" /></CardContent></Card>
                </div>
                <div className="h-[200px] rounded-2xl bg-surface2 border border-border flex items-center justify-center">
                  <BarChart3 className="h-10 w-10 text-muted2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="platform" className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Plateforme gratuite, business model transparent</h2>
          <p className="text-muted max-w-2xl mx-auto">Pas d'abonnement caché. Tu vends, on prend 5%. Tu achètes la formation à 197$ une fois, tu peux la revendre à vie avec 90% pour toi.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Store, title: "Vends gratuitement", desc: "Plateforme gratuite pour tous. 95% pour toi, 5% pour Nuvra après frais Stripe. Pas d'abonnement." },
            { icon: GraduationCap, title: "Formation à 197$", desc: "Nuvra Academy complète : 8 modules, 50+ leçons. Accès à vie. Droit de revente inclus." },
            { icon: Users, title: "Revends à 90%", desc: "Tu achètes à 197$, tu revends à 197$, tu gardes 90% (~167$ net). Nuvra 10%. Frais Stripe transparents." },
            { icon: GitBranch, title: "Funnel Builder", desc: "Landing, capture, sales, checkout, thank you. Conversion tracking entre étapes." },
            { icon: Mail, title: "CRM + Emails + Automations", desc: "Leads, customers, broadcasts, séquences, workflows. Tout intégré." },
            { icon: BarChart3, title: "Analytics + Ledger", desc: "Revenu, conversion, ledger immuable, payouts 14j, refunds recalcul auto." },
            { icon: Link2, title: "Link in Bio", desc: "Ta page /@username avec produits, formations, newsletter." },
            { icon: Shield, title: "Paiements Stripe", desc: "Checkout propre, Apple/Google Pay, coupons, taxes, Connect ready." },
            { icon: Users, title: "Marketplace", desc: "Publie tes formations, vends via marketplace. 95% pour toi." },
          ].map((f) => (
            <Card key={f.title} className="p-6 hover:border-accent/20 transition-colors group">
              <div className="h-10 w-10 rounded-xl bg-surface3 border border-border flex items-center justify-center mb-4 group-hover:bg-accentMuted group-hover:border-accent/20 transition-colors">
                <f.icon className="h-5 w-5 text-muted group-hover:text-accent" />
              </div>
              <h3 className="font-medium mb-2">{f.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Academy */}
      <section id="academy" className="border-y border-border bg-surface/50">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface2 px-3 py-1 text-[12px] mb-6">
                <GraduationCap className="h-3.5 w-3.5" /> Nuvra Academy - 197$ une fois
              </div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Achète une fois, revends à vie</h2>
              <p className="text-muted leading-relaxed mb-8">
                Pas d'abonnement. 197$ = formation complète + accès plateforme à vie + droit de revente. La plateforme reste gratuite pour vendre tes propres produits (5% Nuvra).
              </p>
              <div className="space-y-3 mb-8">
                {[
                  "8 modules, 50+ leçons - contenu réel, pas du fluff",
                  "Accès plateforme gratuit à vie pour vendre tes produits",
                  "Droit de revente : tu gardes 90% sur chaque vente à 197$",
                  "Payouts 14j, ledger transparent, refunds recalcul auto",
                  "Plateforme : funnels, pages, CRM, emails, automations, analytics",
                ].map((m) => (
                  <div key={m} className="flex items-center gap-3 text-sm">
                    <div className="h-5 w-5 rounded-full bg-success/20 flex items-center justify-center">
                      <span className="text-[10px] text-success">✓</span>
                    </div>
                    <span className="text-muted">{m}</span>
                  </div>
                ))}
              </div>
              <Link href="/register"><Button className="rounded-full">Commencer gratuitement</Button></Link>
            </div>
            <Card className="p-2">
              <div className="rounded-xl bg-background p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Modèle 197$ - Transparent</h4>
                  <span className="text-xs px-2 py-1 rounded-full bg-success/20 text-success">90% pour toi</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted">Prix formation</span><span className="font-medium">$197.00</span></div>
                  <div className="flex justify-between"><span className="text-muted">Frais Stripe (2.9% + 30c)</span><span className="text-muted">-$6.01</span></div>
                  <div className="flex justify-between"><span className="text-muted">Après frais</span><span>$190.99</span></div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between"><span className="text-muted">Nuvra 10%</span><span className="text-muted">-$19.10</span></div>
                  <div className="flex justify-between font-semibold text-success"><span>Ton net (90%)</span><span>$171.89</span></div>
                  <div className="h-px bg-border" />
                  <div className="pt-2">
                    <p className="text-xs font-medium mb-1">Et pour tes propres produits :</p>
                    <div className="flex justify-between text-xs"><span className="text-muted">Vente à 100$ → 95$ toi / 5$ Nuvra après frais</span></div>
                  </div>
                </div>
                <p className="text-[11px] text-muted">Plateforme gratuite pour tous. 197$ débloque formation + droit revente. Pas d'abonnement mensuel.</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing - NEW MODEL */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">Un seul prix. Pas d'abonnement.</h2>
          <p className="text-muted">Gratuit pour vendre. 197$ pour apprendre et revendre.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="p-8 border-border">
            <h3 className="text-lg font-semibold mb-1">Gratuit</h3>
            <p className="text-sm text-muted mb-4">Pour vendre tes produits digitaux</p>
            <div className="flex items-baseline gap-1 mb-6"><span className="text-3xl font-semibold">$0</span><span className="text-muted text-sm">/toujours</span></div>
            <div className="space-y-3 mb-8">
              {[
                "Plateforme complète gratuite",
                "Produits illimités",
                "Funnels illimités",
                "Pages illimitées",
                "CRM, emails, automations",
                "Link in bio /@username",
                "Marketplace",
                "95% pour toi / 5% Nuvra après frais Stripe",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-success" /><span className="text-muted">{f}</span></div>
              ))}
            </div>
            <Link href="/register"><Button variant="outline" className="w-full rounded-full">Commencer gratuitement</Button></Link>
          </Card>

          <Card className="p-8 border-accent/30 shadow-glow relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex text-[11px] px-3 py-1 rounded-full bg-accent text-white">Recommandé</div>
            <h3 className="text-lg font-semibold mb-1">Nuvra Academy</h3>
            <p className="text-sm text-muted mb-4">Formation + droit de revente à vie</p>
            <div className="flex items-baseline gap-1 mb-6"><span className="text-3xl font-semibold">$197</span><span className="text-muted text-sm">/une fois, à vie</span></div>
            <div className="space-y-3 mb-8">
              {[
                "Tout du gratuit inclus",
                "Formation complète 8 modules, 50+ leçons",
                "Accès à vie + mises à jour",
                "Droit de revente : 90% pour toi",
                "Page de vente personnalisable",
                "Dashboard revendeur + payouts 14j",
                "Certificat + support",
                "Idéal pour démarrer sans créer de produit",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-success" /><span className="text-white">{f}</span></div>
              ))}
            </div>
            <Link href="/register"><Button className="w-full rounded-full">Acheter à 197$ et revendre</Button></Link>
            <p className="text-[11px] text-muted text-center mt-3">Paiement unique, pas d'abonnement. 30j garantie.</p>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto mt-8 p-4 rounded-2xl bg-surface2 border border-border text-center">
          <p className="text-xs text-muted">
            <span className="text-white font-medium">Modèle transparent :</span> Plateforme gratuite → 5% Nuvra sur tes ventes perso. Formation 197$ → 90% toi / 10% Nuvra après frais Stripe (2.9%+30c). Refunds recalculent auto. Payouts dispo après 14j.
          </p>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-accent flex items-center justify-center font-bold text-sm">N</div>
              <span className="font-semibold">NUVRA</span>
            </div>
            <p className="text-sm text-muted max-w-xs">Plateforme gratuite + formation à 197$. 95% pour toi sur tes ventes, 90% sur revente Academy.</p>
          </div>
          <div className="grid grid-cols-3 gap-12 text-sm">
            <div><p className="font-medium mb-3">Product</p><div className="space-y-2 text-muted"><a href="#" className="block hover:text-white">Features</a><a href="#" className="block hover:text-white">Academy</a><a href="#" className="block hover:text-white">Pricing</a></div></div>
            <div><p className="font-medium mb-3">Legal</p><div className="space-y-2 text-muted"><a href="/privacy" className="block hover:text-white">Privacy</a><a href="/terms" className="block hover:text-white">Terms</a><a href="/refund" className="block hover:text-white">Refund</a></div></div>
            <div><p className="font-medium mb-3">Support</p><div className="space-y-2 text-muted"><a href="/help" className="block hover:text-white">Help</a><a href="/contact" className="block hover:text-white">Contact</a><a href="/marketplace" className="block hover:text-white">Marketplace</a></div></div>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-6 mt-12 pt-8 border-t border-border flex justify-between text-xs text-muted">
          <span>© 2026 Nuvra, Inc. All rights reserved.</span>
          <span>197$ une fois, pas d'abonnement.</span>
        </div>
      </footer>
    </div>
  );
}
