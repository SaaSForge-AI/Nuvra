"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function NewFunnelPage() {
  const [form, setForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/funnels", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (res.ok) router.push(`/funnels/${data.id}`);
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Create Funnel</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">Funnel details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div><label className="text-[13px] font-medium mb-1.5 block">Name</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="My First Funnel" required /></div>
            <div><label className="text-[13px] font-medium mb-1.5 block">Description</label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this funnel for?" /></div>
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Creating..." : "Create Funnel"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
