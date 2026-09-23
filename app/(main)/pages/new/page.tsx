"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function NewPageBuilder() {
  const [form, setForm] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/pages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (res.ok) router.push(`/pages/${data.id}`);
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Create Page</h1>
      <Card><CardHeader><CardTitle className="text-base">Page details</CardTitle></CardHeader><CardContent><form onSubmit={handleSubmit} className="space-y-5"><div><label className="text-[13px] font-medium mb-1.5 block">Title</label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="My Landing Page" required /></div><div><label className="text-[13px] font-medium mb-1.5 block">Description</label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div><Button type="submit" disabled={loading} className="w-full">{loading ? "Creating..." : "Create Page"}</Button></form></CardContent></Card>
    </div>
  );
}
