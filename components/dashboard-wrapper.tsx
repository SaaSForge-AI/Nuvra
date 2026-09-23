"use client";

import { useState, useEffect } from "react";
import { Topbar } from "./topbar";
import { CommandPalette } from "./command-palette";

export function DashboardWrapper({ children }: { children: React.ReactNode }) {
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <Topbar onSearchOpen={() => setCommandOpen(true)} />
      <main className="p-6 pb-20 lg:pb-6">{children}</main>
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </>
  );
}
