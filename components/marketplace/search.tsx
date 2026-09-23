"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export function MarketplaceSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set("q", q);
    else params.delete("q");
    router.push(`/marketplace?${params.toString()}`);
  };

  return (
    <form onSubmit={handle} className="flex-1 relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
      <input
        placeholder="Search courses... 95% creator, Academy 197$"
        className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-surface2 text-sm text-white placeholder:text-muted"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
    </form>
  );
}
