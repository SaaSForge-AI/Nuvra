"use client";
import { useState } from "react";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";

export function SaveLinksButton({ initialBlocks }: { initialBlocks: any[] }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handle = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks: initialBlocks }),
      });
      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch { throw new Error("Erreur"); }
      if (!res.ok) throw new Error(data.error);
      toast.success("Link-in-bio sauvegardé !");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };
  return <button onClick={handle} disabled={loading} className="w-full mt-4 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 disabled:opacity-50">{loading ? "..." : "Save"}</button>;
}
