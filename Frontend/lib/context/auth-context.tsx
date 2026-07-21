// lib/context/auth-context.tsx
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../api/auth";

type NotificationPrefs = {
  email?: boolean;
  inApp?: boolean;
  approvalAlerts?: boolean;
  processingAlerts?: boolean;
  [k: string]: any;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
  notificationPrefs?: NotificationPrefs;
  confidenceThreshold?: number;
  createdAt?: string | null;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  updateUser: (u: Partial<User> | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => (typeof window !== "undefined" ? localStorage.getItem("token") : null));
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (token && !user) {
      refresh().catch(() => {});
    }
  }, []);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      const t = data.token;
      const u = data.user;
      setToken(t);
      setUser(u);
      if (typeof window !== "undefined") {
        localStorage.setItem("token", t);
        localStorage.setItem("user", JSON.stringify(u));
      }
    } finally {
      setLoading(false);
    }
  }

  async function signup(name: string, email: string, password: string) {
    setLoading(true);
    try {
      await authApi.signup({ name, email, password });
      // Optionally auto login after signup
      await login(email, password);
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    if (!token) return;
    setLoading(true);
    try {
      const u = await authApi.me();
      setUser(u);
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(u));
      }
    } catch (err) {
      console.warn("refresh failed", err);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setToken(null);
    setUser(null);

    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }

  function updateUser(u: Partial<User> | null) {
    const next = u && user ? { ...user, ...u } as User : null;
    setUser(next);
    if (typeof window !== "undefined") {
      if (next) localStorage.setItem("user", JSON.stringify(next));
      else localStorage.removeItem("user");
    }
  }

  return <AuthContext.Provider value={{ user, token, loading, login, signup, logout, refresh, updateUser }}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
