"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function NewProductPage() {
  const [form, setForm] = useState({ title: "", description: "", type: "COURSE", price: 49, isFree: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch { throw new Error("Erreur serveur - réponse invalide"); }
      if (!res.ok) throw new Error(data.error || "Failed");
      router.push(`/products/${data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Create Product - 95% pour toi</h1>
      <p className="text-sm text-muted">Plateforme gratuite, Nuvra prend 5% seulement après frais Stripe. Pas d'abonnement.</p>
      <Card>
        <CardHeader><CardTitle className="text-base">Product details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-sm text-danger">{error}</div>}
            <div><label className="text-[13px] font-medium mb-1.5 block">Title</label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="My Awesome Course" required /></div>
            <div><label className="text-[13px] font-medium mb-1.5 block">Description</label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this product about?" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[13px] font-medium mb-1.5 block">Type</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full h-11 rounded-xl border border-border bg-surface2 px-4 text-sm text-white"><option value="COURSE">Course</option><option value="EBOOK">Ebook</option><option value="DIGITAL_FILE">Digital File</option><option value="TEMPLATE">Template</option><option value="COACHING">Coaching</option><option value="CONSULTATION">Consultation</option><option value="BUNDLE">Bundle</option></select></div>
              <div><label className="text-[13px] font-medium mb-1.5 block">Price (USD)</label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })} disabled={form.isFree} /></div>
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFree} onChange={(e) => setForm({ ...form, isFree: e.target.checked })} /> Free product (100% gratuit pour buyer)</label>
            <div className="p-3 rounded-xl bg-surface2 border border-border text-xs text-muted">
              <p>Exemple: prix 100$ → Stripe ~3.20$ → après frais 96.80$ → toi 95% = 91.96$ net</p>
            </div>
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Creating..." : "Create Product"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
