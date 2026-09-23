"use client";
import { useState } from "react";
import { toast } from "@/lib/toast";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Lien copié !");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handle} className="w-full px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200">
      {copied ? "Copié !" : "Copy Link"}
    </button>
  );
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copié !");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handle} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-white text-xs border border-zinc-700 hover:bg-zinc-700">
      {copied ? "Copié !" : label}
    </button>
  );
}
