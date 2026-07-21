"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { AppSidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: isLoading } = useAuth();
  const isAuthenticated = !!user;
  const router = useRouter();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Safely handle redirection on the client side
  useEffect(() => {
    if (isMounted && !isLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isMounted, isLoading, isAuthenticated, router]);

  if (!isAuthenticated) {
    return null; 
  }

  // Prevent hydration mismatch by rendering a safe fallback until mounted
  if (!isMounted) {
    return null; 
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AppSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

      {/* Mobile Drawer */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-60 p-0">
          <AppSidebar collapsed={false} onToggle={() => setMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-60"
        )}
      >
        <Topbar onMobileMenuToggle={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-auto p-4 lg:p-6" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}
