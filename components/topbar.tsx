"use client";

import { useState } from "react";
import { Search, Bell, Command } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

export function Topbar({ onSearchOpen }: { onSearchOpen?: () => void }) {
  return (
    <div className="sticky top-0 z-30 flex h-[64px] items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-6">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onSearchOpen}
          className="flex items-center gap-3 w-full rounded-xl border border-border bg-surface2 px-4 py-2.5 text-sm text-muted hover:text-white hover:border-borderSubtle transition-all group"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Search products, courses, customers...</span>
          <span className="hidden sm:flex items-center gap-1 rounded-md bg-surface3 px-1.5 py-0.5 text-[11px] border border-border">
            <Command className="h-3 w-3" />K
          </span>
        </button>
      </div>

      <div className="flex items-center gap-3 ml-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent" />
        </Button>
        <div className="h-6 w-px bg-border" />
        <div className="text-right hidden sm:block">
          <p className="text-[13px] font-medium text-white">Workspace</p>
          <p className="text-[11px] text-muted">Pro Plan</p>
        </div>
      </div>
    </div>
  );
}
