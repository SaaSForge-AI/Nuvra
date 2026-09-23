"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

export function SuspendResellerButton({ id, status }: { id: string; status: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handle = async () => {
    if (!confirm(`${status === "ACTIVE" ? "Suspendre" : "Réactiver"} ce revendeur?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/resellers/${id}/suspend`, { method: "POST" });
      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch { throw new Error("Erreur"); }
      if (!res.ok) throw new Error(data.error);
      toast.success(`Reseller ${data.status}`);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };
  return <button onClick={handle} disabled={loading} className="px-2 py-1 rounded-lg bg-zinc-800 text-white text-xs border border-zinc-700 hover:bg-zinc-700 disabled:opacity-50">{loading ? "..." : status === "ACTIVE" ? "Suspend" : "Activate"}</button>;
}

export function ApproveMarketplaceButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handle = async (action: "approve" | "reject") => {
    const reason = action === "reject" ? prompt("Raison du rejet:") : undefined;
    if (action === "reject" && !reason) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/marketplace/${id}/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason }) });
      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch { throw new Error("Erreur"); }
      if (!res.ok) throw new Error(data.error);
      toast.success(action === "approve" ? "Approuvé !" : "Rejeté");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex gap-2">
      <button onClick={() => handle("approve")} disabled={loading} className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-medium hover:bg-zinc-200 disabled:opacity-50">{loading ? "..." : "Approve"}</button>
      <button onClick={() => handle("reject")} disabled={loading} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-white text-xs border border-zinc-700 hover:bg-zinc-700 disabled:opacity-50">{loading ? "..." : "Reject"}</button>
    </div>
  );
}
