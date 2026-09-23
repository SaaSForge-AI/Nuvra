"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function NewCoursePage() {
  const [form, setForm] = useState({ title: "", description: "", category: "Business", level: "beginner", price: 99, isFree: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch { throw new Error("Erreur serveur"); }
      if (!res.ok) throw new Error(data.error || "Failed");
      router.push(`/courses/${data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Create Course - 95% revenue</h1>
      <p className="text-sm text-muted">Crée ta formation, vends-la, garde 95% après Stripe. Pas d'abonnement.</p>
      <Card><CardHeader><CardTitle className="text-base">Course details</CardTitle></CardHeader><CardContent><form onSubmit={handleSubmit} className="space-y-5">
        {error && <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-sm text-danger">{error}</div>}
        <div><label className="text-[13px] font-medium mb-1.5 block">Title</label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="My First Course" required /></div><div><label className="text-[13px] font-medium mb-1.5 block">Description</label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div><div className="grid grid-cols-2 gap-4"><div><label className="text-[13px] font-medium mb-1.5 block">Category</label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div><div><label className="text-[13px] font-medium mb-1.5 block">Level</label><select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="w-full h-11 rounded-xl border border-border bg-surface2 px-4 text-sm text-white"><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div></div><div><label className="text-[13px] font-medium mb-1.5 block">Price (USD)</label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })} disabled={form.isFree} /></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFree} onChange={(e) => setForm({ ...form, isFree: e.target.checked })} /> Free course</label><Button type="submit" disabled={loading} className="w-full">{loading ? "Creating..." : "Create Course"}</Button></form></CardContent></Card>
    </div>
  );
}
