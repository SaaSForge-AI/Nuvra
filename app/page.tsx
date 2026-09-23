import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Zap, GraduationCap, BarChart3, Users, Mail, GitBranch, Store, Link2, Shield, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-white">
      {/* Minimal top nav - not a classic header, more like a floating pill */}
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
          All-in-one platform for creators
        </div>
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[0.95] mb-6">
          Create. Sell.
          <br />
          <span className="text-accent">Teach. Scale.</span>
        </h1>
        <p className="mx-auto max-w-2xl text-[17px] leading-relaxed text-muted mb-10">
          Nuvra replaces 12 tools with one. Build funnels, launch courses, sell products, automate emails, and grow your audience — from a single dashboard.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="rounded-full px-8">
              Start for free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/marketplace">
            <Button variant="outline" size="lg" className="rounded-full px-8">
              Explore Nuvra
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
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Everything you need, in one place</h2>
          <p className="text-muted max-w-2xl mx-auto">Stop stitching tools together. Nuvra gives you a coherent system that actually works together.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: GitBranch, title: "Funnel Builder", desc: "Visual flow builder with conversion tracking between steps." },
            { icon: Store, title: "Digital Store", desc: "Sell courses, ebooks, templates, coaching in one checkout." },
            { icon: GraduationCap, title: "LMS & Academy", desc: "Nuvra Academy + your own courses with certificates." },
            { icon: Users, title: "CRM", desc: "Leads, customers, segments, tags - all integrated." },
            { icon: Mail, title: "Email & Automations", desc: "Broadcasts, sequences, workflows triggered by events." },
            { icon: BarChart3, title: "Analytics", desc: "Revenue, conversion, funnel performance - proprietary tracking." },
            { icon: Link2, title: "Link in Bio", desc: "Your /@username page with products and funnels." },
            { icon: Users, title: "Affiliates & Resell", desc: "90% for resellers of Nuvra Academy. Your own affiliate program." },
            { icon: Shield, title: "Payments", desc: "Stripe + Connect, ledger, payouts, refunds, tax-ready." },
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
                <GraduationCap className="h-3.5 w-3.5" /> Nuvra Academy Included
              </div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Learn to build a real digital business</h2>
              <p className="text-muted leading-relaxed mb-8">
                8 modules, 50+ lessons, built directly into Nuvra. From finding your offer to scaling. Real content, not fluff. Plus, resell it and keep 90%.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  "Module 1: Ecosystem & Value Prop",
                  "Module 2: Offer & Pricing",
                  "Module 3: Funnels",
                  "Module 4: Course Creation",
                  "Module 5-8: Acquisition, Conversion, Automation, Growth",
                ].map((m) => (
                  <div key={m} className="flex items-center gap-3 text-sm">
                    <div className="h-5 w-5 rounded-full bg-success/20 flex items-center justify-center">
                      <span className="text-[10px] text-success">✓</span>
                    </div>
                    <span className="text-muted">{m}</span>
                  </div>
                ))}
              </div>
              <Link href="/register"><Button className="rounded-full">Start learning now</Button></Link>
            </div>
            <Card className="p-2">
              <div className="rounded-xl bg-background p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Resell Nuvra Academy</h4>
                  <span className="text-xs px-2 py-1 rounded-full bg-success/20 text-success">90% commission</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted">Sale Price</span><span>$497.00</span></div>
                  <div className="flex justify-between"><span className="text-muted">Stripe Fees (2.9% + 30c)</span><span className="text-muted">-$14.71</span></div>
                  <div className="flex justify-between"><span className="text-muted">Nuvra Share (10%)</span><span className="text-muted">-$48.23</span></div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between font-medium"><span>Your Net</span><span className="text-success">$434.06</span></div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">Simple pricing, built to scale</h2>
          <p className="text-muted">Start free, upgrade when you grow. No hidden fees.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { name: "Free", price: "$0", desc: "For exploring Nuvra", features: ["1 product", "1 funnel", "100 leads", "Nuvra Academy preview", "Community access"] },
            { name: "Pro", price: "$49", desc: "For creators starting to sell", features: ["Unlimited products", "Unlimited funnels", "5,000 leads", "Full Academy", "Email marketing", "Reseller program"], popular: true },
            { name: "Business", price: "$149", desc: "For scaling businesses", features: ["Everything in Pro", "50,000 leads", "Affiliate program", "Priority support", "Custom domain", "Advanced analytics"] },
          ].map((tier) => (
            <Card key={tier.name} className={`p-6 ${tier.popular ? "border-accent/30 shadow-glow" : ""}`}>
              {tier.popular && <div className="inline-flex text-[11px] px-2 py-1 rounded-full bg-accent text-white mb-4">Most Popular</div>}
              <h3 className="text-lg font-semibold mb-1">{tier.name}</h3>
              <p className="text-sm text-muted mb-4">{tier.desc}</p>
              <div className="flex items-baseline gap-1 mb-6"><span className="text-3xl font-semibold">{tier.price}</span><span className="text-muted text-sm">/month</span></div>
              <div className="space-y-3 mb-8">
                {tier.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm"><div className="h-1 w-1 rounded-full bg-muted" /><span className="text-muted">{f}</span></div>
                ))}
              </div>
              <Button variant={tier.popular ? "default" : "outline"} className="w-full rounded-full">{tier.price === "$0" ? "Start free" : "Get started"}</Button>
            </Card>
          ))}
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
            <p className="text-sm text-muted max-w-xs">Create. Sell. Teach. Scale. The all-in-one platform for creators and entrepreneurs.</p>
          </div>
          <div className="grid grid-cols-3 gap-12 text-sm">
            <div><p className="font-medium mb-3">Product</p><div className="space-y-2 text-muted"><a href="#" className="block hover:text-white">Features</a><a href="#" className="block hover:text-white">Academy</a><a href="#" className="block hover:text-white">Pricing</a></div></div>
            <div><p className="font-medium mb-3">Legal</p><div className="space-y-2 text-muted"><a href="/privacy" className="block hover:text-white">Privacy</a><a href="/terms" className="block hover:text-white">Terms</a><a href="/refund" className="block hover:text-white">Refund</a></div></div>
            <div><p className="font-medium mb-3">Support</p><div className="space-y-2 text-muted"><a href="/help" className="block hover:text-white">Help</a><a href="/contact" className="block hover:text-white">Contact</a><a href="/marketplace" className="block hover:text-white">Marketplace</a></div></div>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-6 mt-12 pt-8 border-t border-border flex justify-between text-xs text-muted">
          <span>© 2026 Nuvra, Inc. All rights reserved.</span>
          <span>Built for creators, by creators.</span>
        </div>
      </footer>
    </div>
  );
}
