"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  CheckCircle2,
  ClipboardList,
  BarChart3,
  User,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { label: "Workflows", href: "/app/workflows", icon: FileText },
  { label: "Approvals", href: "/app/approvals", icon: CheckCircle2 },
  { label: "Audit Trail", href: "/app/audit", icon: ClipboardList },
  { label: "Metrics", href: "/app/metrics", icon: BarChart3 },
  { label: "Profile", href: "/app/profile", icon: User },
];

export function AppSidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
      aria-label="Main navigation"
    >
      {/* Logo / Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
          <Shield className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-semibold text-sidebar-foreground">Business AI Workflow Orchestrator</span>
            <span className="truncate text-xs text-sidebar-foreground/60">User Console</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4" role="navigation">
        <ul className="flex flex-col gap-1" role="list">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-sidebar-border p-2">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-lg p-2 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
