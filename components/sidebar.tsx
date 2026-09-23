"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  GitBranch,
  FileText,
  Store,
  Package,
  GraduationCap,
  ShoppingBag,
  Users,
  UserPlus,
  Mail,
  Zap,
  BarChart3,
  CreditCard,
  Settings,
  HelpCircle,
  Link2,
  Award,
  Users2,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Funnels", href: "/funnels", icon: GitBranch },
  { label: "Pages", href: "/pages", icon: FileText },
  { label: "Products", href: "/products", icon: Package },
  { label: "Store", href: "/store", icon: Store },
  { label: "Academy", href: "/academy", icon: GraduationCap },
  { label: "My Learning", href: "/learn", icon: Award },
  { label: "Marketplace", href: "/marketplace", icon: ShoppingBag },
  { label: "Link in Bio", href: "/links", icon: Link2 },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Leads", href: "/leads", icon: UserPlus },
  { label: "Emails", href: "/emails", icon: Mail },
  { label: "Automations", href: "/automations", icon: Zap },
  { label: "Affiliates", href: "/affiliates", icon: Users2 },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Payments", href: "/payments", icon: CreditCard },
];

const bottomItems = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help", href: "/help", icon: HelpCircle },
];

export function Sidebar({ user }: { user?: any }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-surface/95 backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      <div className="flex h-[64px] items-center gap-3 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white font-bold text-sm">
          N
        </div>
        {!collapsed && (
          <span className="text-[15px] font-semibold tracking-tight text-white">NUVRA</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all",
                  isActive
                    ? "bg-accentMuted text-white border border-accent/20"
                    : "text-muted hover:text-white hover:bg-surface2"
                )}
              >
                <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-accent")} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-border p-3 space-y-1">
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-muted hover:text-white hover:bg-surface2 transition-all"
          >
            <item.icon className="h-[18px] w-[18px]" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}

        {user && (
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-surface2 p-3 border border-borderSubtle">
            <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-semibold">
              {user.firstName?.[0] || user.email?.[0]?.toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-white truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[11px] text-muted truncate">{user.email}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

export function MobileNav({ user }: { user?: any }) {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-surface/95 backdrop-blur-xl px-2 py-2 lg:hidden">
      {navItems.slice(0, 5).map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg px-3 py-1.5",
              isActive ? "text-accent" : "text-muted"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
