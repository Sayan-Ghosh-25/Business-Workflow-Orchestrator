"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/auth-context";
import { Bell, LogOut, User, Settings, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationsDropdown } from "@/components/app/notifications-dropdown";

interface TopbarProps {
  onMobileMenuToggle: () => void;
}

export function Topbar({ onMobileMenuToggle }: TopbarProps) {
  const { user, logout } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      {/* Left: Mobile menu + page context */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMobileMenuToggle}
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden sm:block">
          <h1 className="text-sm font-semibold text-foreground">Business AI Workflow Orchestrator</h1>
        </div>
      </div>

      {/* Right: Notifications + User menu */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <NotificationsDropdown open={notificationsOpen} onOpenChange={setNotificationsOpen} />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2" aria-label="User menu">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {user?.name?.charAt(0) || "U"}
              </div>
              <span className="hidden text-sm font-medium text-foreground md:block">{user?.name || "User"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/app/profile" className="flex items-center gap-2">
                <Settings className="h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-destructive">
              <LogOut className="h-4 w-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
