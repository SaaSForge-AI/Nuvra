"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Package, GraduationCap, Users, GitBranch, BarChart3, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const commands = [
  { id: "dashboard", label: "Go to Dashboard", href: "/dashboard", icon: BarChart3 },
  { id: "create-product", label: "Create Product", href: "/products/new", icon: Package },
  { id: "create-course", label: "Create Course", href: "/courses/new", icon: GraduationCap },
  { id: "create-funnel", label: "Create Funnel", href: "/funnels/new", icon: GitBranch },
  { id: "customers", label: "Open Customers", href: "/customers", icon: Users },
  { id: "emails", label: "Create Email Campaign", href: "/emails", icon: Mail },
  { id: "analytics", label: "Open Analytics", href: "/analytics", icon: BarChart3 },
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        // toggle handled by parent
      }
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onClose]);

  const filtered = commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[640px] rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden animate-scale-in">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-5 w-5 text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-white placeholder:text-muted outline-none text-sm"
          />
          <span className="text-[11px] text-muted border border-border rounded px-1.5 py-0.5">ESC</span>
        </div>
        <div className="max-h-[320px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-muted text-sm">No results for "{query}"</div>
          ) : (
            filtered.map((cmd) => (
              <button
                key={cmd.id}
                onClick={() => {
                  router.push(cmd.href);
                  onClose();
                }}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white hover:bg-surface2 transition-colors text-left"
              >
                <div className="h-8 w-8 rounded-lg bg-surface3 flex items-center justify-center">
                  <cmd.icon className="h-4 w-4 text-muted" />
                </div>
                <span>{cmd.label}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
