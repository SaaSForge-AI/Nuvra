"use client";
import { useState } from "react";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";

export function CopyResellLink({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/r/${slug}`;
  const handle = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Lien copié !");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex gap-2">
      <input value={url} readOnly className="flex-1 px-3 py-2 rounded-xl bg-surface2 border border-border text-sm" />
      <button onClick={handle} className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200">{copied ? "Copié !" : "Copier"}</button>
    </div>
  );
}

export function ActivateResellButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handle = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reseller", { method: "POST" });
      if (!res.ok) throw new Error();
      toast.success("Revente activée ! 90% pour toi");
      router.refresh();
    } catch {
      toast.error("Erreur");
    } finally {
      setLoading(false);
    }
  };
  return <button onClick={handle} disabled={loading} className="w-full px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 disabled:opacity-50">{loading ? "..." : "Activer revente à 90%"}</button>;
}

export function BuyAcademyButton() {
  const handle = () => {
    window.location.href = "/academy";
  };
  return <button onClick={handle} className="w-full px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200">Acheter à 197$ pour devenir revendeur</button>;
}
