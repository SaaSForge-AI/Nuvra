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
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (res.ok) router.push(`/products/${data.id}`);
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Create Product</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">Product details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div><label className="text-[13px] font-medium mb-1.5 block">Title</label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="My Awesome Course" required /></div>
            <div><label className="text-[13px] font-medium mb-1.5 block">Description</label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this product about?" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[13px] font-medium mb-1.5 block">Type</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full h-11 rounded-xl border border-border bg-surface2 px-4 text-sm text-white"><option value="COURSE">Course</option><option value="EBOOK">Ebook</option><option value="DIGITAL_FILE">Digital File</option><option value="TEMPLATE">Template</option><option value="COACHING">Coaching</option><option value="CONSULTATION">Consultation</option><option value="BUNDLE">Bundle</option></select></div>
              <div><label className="text-[13px] font-medium mb-1.5 block">Price (USD)</label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })} disabled={form.isFree} /></div>
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFree} onChange={(e) => setForm({ ...form, isFree: e.target.checked })} /> Free product</label>
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Creating..." : "Create Product"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
