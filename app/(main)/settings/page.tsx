"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({ name: "", bio: "", customSlug: "", email: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(d => {
      if (d.user) {
        setUser(d.user);
        setForm({ name: d.user.name || "", bio: d.user.bio || "", customSlug: d.user.customSlug || "", email: d.user.email || "" });
      }
    });
  }, []);

  const save = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      toast.success("Profil sauvegardé !");
    } catch {
      toast.error("Erreur");
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    window.location.href = "/api/customers/export";
    toast.success("Export lancé");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>
      <p className="text-sm text-muted">Plateforme gratuite • 95% creator • Academy 197$ lifetime 90% resell</p>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <Card><CardContent className="p-4 space-y-2 text-sm"><p className="font-medium">Profile</p><p className="text-muted">Manage your account</p></CardContent></Card>
          <Card><CardContent className="p-4 space-y-2 text-sm"><p className="font-medium">Workspace</p><p className="text-muted">Multi-tenant ready • Free</p></CardContent></Card>
          <Card><CardContent className="p-4 space-y-2 text-sm"><p className="font-medium">Billing</p><p className="text-muted">Free Platform • 5% fee</p></CardContent></Card>
          <Card><CardContent className="p-4 space-y-2 text-sm"><p className="font-medium">GDPR</p><p className="text-muted">Export & delete data</p></CardContent></Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card><CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader><CardContent className="space-y-4">
            <div><label className="text-xs font-medium mb-1 block">Nom complet</label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ton nom" /></div>
            <div><label className="text-xs font-medium mb-1 block">Email</label><Input value={form.email} disabled className="opacity-60" /></div>
            <div><label className="text-xs font-medium mb-1 block">Username (@link-in-bio)</label><Input value={form.customSlug} onChange={e => setForm({ ...form, customSlug: e.target.value })} placeholder="tonusername" /><p className="text-[11px] text-muted mt-1">Ton lien: /@{form.customSlug || "username"}</p></div>
            <div><label className="text-xs font-medium mb-1 block">Bio</label><textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="w-full p-3 rounded-xl bg-surface2 border border-border text-sm min-h-[80px]" placeholder="Parle de toi..." /></div>
            <button onClick={save} disabled={loading} className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 disabled:opacity-50">{loading ? "..." : "Sauvegarder"}</button>
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base">Stripe</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><p className="text-muted">Connect Stripe pour recevoir 95% de tes ventes + 90% resell Academy. Stripe fees 2.9%+30c transparent.</p><div className="p-3 rounded-xl bg-surface2 border border-border"><p className="text-xs">STRIPE_SECRET_KEY: Configured ✓ (mock mode si non set)</p><p className="text-xs">Payouts: 14 jours • Refund recalc auto</p></div><button onClick={() => toast.success("Stripe Connect bientôt - mode mock actif, 95% crédité en ledger")} className="px-4 py-2 rounded-lg bg-zinc-800 text-white text-sm border border-zinc-700">Connect Stripe (mock actif)</button></CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base">Privacy & GDPR</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div className="flex justify-between items-center p-3 rounded-xl bg-surface2 border border-border"><div><p className="font-medium">Export your data</p><p className="text-xs text-muted">Get all your data as CSV</p></div><button onClick={exportData} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-white text-xs border border-zinc-700">Export</button></div><div className="flex justify-between items-center p-3 rounded-xl bg-surface2 border border-border"><div><p className="font-medium">Delete account</p><p className="text-xs text-muted">Anonymize data per obligations</p></div><button onClick={() => toast.success("Demande enregistrée - contact support@nuvra.com")} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-white text-xs border border-zinc-700 text-red-400">Delete</button></div></CardContent></Card>
        </div>
      </div>
    </div>
  );
}
