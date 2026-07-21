"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { Shield } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: isLoading } = useAuth();
  const isAuthenticated = !!user;
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Safely handle redirection on the client side
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/app/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-16 items-center border-b border-border px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground">Business AI Workflow Orchestrator</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex flex-1 items-center justify-center p-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="flex h-12 items-center justify-center border-t border-border px-6">
        <p className="text-xs text-muted-foreground">Business AI Workflow Orchestrator &copy; 2026</p>
      </footer>
    </div>
  );
}
