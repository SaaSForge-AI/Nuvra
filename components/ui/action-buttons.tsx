"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

export function PublishButton({ id, type, isPublished }: { id: string; type: "products" | "funnels" | "pages" | "courses"; isPublished: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/${type}/${id}/publish`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      toast.success(isPublished ? "Passé en brouillon" : "Publié avec succès !");
      router.refresh();
    } catch {
      toast.error("Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handle}
      disabled={loading}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${isPublished ? "bg-zinc-800 text-white hover:bg-zinc-700" : "bg-white text-black hover:bg-zinc-200"} disabled:opacity-50`}
    >
      {loading ? "..." : isPublished ? "Dépublier" : "Publier"}
    </button>
  );
}

export function AddModuleButton({ courseId }: { courseId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handle = async () => {
    const title = prompt("Nom du module:");
    if (!title) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/modules`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }) });
      if (!res.ok) throw new Error();
      toast.success("Module ajouté");
      router.refresh();
    } catch {
      toast.error("Erreur");
    } finally {
      setLoading(false);
    }
  };
  return (
    <button onClick={handle} disabled={loading} className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 disabled:opacity-50">
      {loading ? "..." : "+ Add Module"}
    </button>
  );
}

export function AddStepButton({ funnelId }: { funnelId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handle = async () => {
    const name = prompt("Nom de l'étape:");
    if (!name) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/funnels/${funnelId}/steps`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, type: "LANDING" }) });
      if (!res.ok) throw new Error();
      toast.success("Étape ajoutée");
      router.refresh();
    } catch {
      toast.error("Erreur");
    } finally {
      setLoading(false);
    }
  };
  return (
    <button onClick={handle} disabled={loading} className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 disabled:opacity-50">
      {loading ? "..." : "+ Add Step"}
    </button>
  );
}

export function AddLeadButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handle = async () => {
    const email = prompt("Email du lead:");
    if (!email) return;
    const name = prompt("Nom (optionnel):") || "";
    setLoading(true);
    try {
      const res = await fetch(`/api/leads`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name }) });
      if (!res.ok) throw new Error();
      toast.success("Lead ajouté");
      router.refresh();
    } catch {
      toast.error("Erreur");
    } finally {
      setLoading(false);
    }
  };
  return (
    <button onClick={handle} disabled={loading} className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 disabled:opacity-50">
      {loading ? "..." : "+ Ajouter un lead"}
    </button>
  );
}

export function ExportButton({ type }: { type: "customers" | "leads" }) {
  const handle = () => {
    window.location.href = `/api/${type}/export`;
  };
  return (
    <button onClick={handle} className="px-4 py-2 rounded-lg bg-zinc-800 text-white text-sm font-medium hover:bg-zinc-700 border border-zinc-700">
      Export CSV
    </button>
  );
}

export function PayoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handle = async () => {
    if (!confirm("Demander un payout de tous les gains en attente?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/payouts`, { method: "POST" });
      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch {
        throw new Error(text.includes("<!DOCTYPE") ? "Erreur serveur - vérifie DATABASE_URL" : "Erreur");
      }
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success(`Payout de ${(data.total / 100).toFixed(2)}€ demandé`);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };
  return (
    <button onClick={handle} disabled={loading} className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 disabled:opacity-50">
      {loading ? "..." : "Demander un payout"}
    </button>
  );
}

export function CreateCampaignButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handle = async () => {
    const name = prompt("Nom de la campagne:");
    if (!name) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/emails/campaigns`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      if (!res.ok) throw new Error();
      toast.success("Campagne créée");
      router.refresh();
    } catch {
      toast.error("Erreur");
    } finally {
      setLoading(false);
    }
  };
  return (
    <button onClick={handle} disabled={loading} className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 disabled:opacity-50">
      {loading ? "..." : "+ Nouvelle campagne"}
    </button>
  );
}

export function CreateAutomationButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handle = async () => {
    const name = prompt("Nom de l'automation:");
    if (!name) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/automations/create`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, trigger: "PURCHASE" }) });
      if (!res.ok) throw new Error();
      toast.success("Automation créée");
      router.refresh();
    } catch {
      toast.error("Erreur");
    } finally {
      setLoading(false);
    }
  };
  return (
    <button onClick={handle} disabled={loading} className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 disabled:opacity-50">
      {loading ? "..." : "+ Nouvelle automation"}
    </button>
  );
}

export function SaveProfileButton({ data }: { data: { name: string; bio: string; customSlug: string } }) {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/settings/profile`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error();
      toast.success("Profil sauvegardé");
    } catch {
      toast.error("Erreur");
    } finally {
      setLoading(false);
    }
  };
  return (
    <button onClick={handle} disabled={loading} className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 disabled:opacity-50">
      {loading ? "..." : "Sauvegarder"}
    </button>
  );
}

export function DuplicateFunnelButton({ funnelId }: { funnelId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/funnels/${funnelId}/duplicate`, { method: "POST" });
      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch { throw new Error("Erreur"); }
      if (!res.ok) throw new Error(data.error);
      toast.success("Funnel dupliqué !");
      router.push(`/funnels/${data.id}`);
    } catch (e: any) {
      toast.error(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };
  return (
    <button onClick={handle} disabled={loading} className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white text-sm border border-zinc-700 hover:bg-zinc-700 disabled:opacity-50">
      {loading ? "..." : "Duplicate"}
    </button>
  );
}
