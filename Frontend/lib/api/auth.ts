// lib/api/auth.ts
import apiClient from "./client";

export type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
  notificationPrefs?: any;
  confidenceThreshold?: number;
  createdAt?: string | null;
};

export async function login(payload: { email: string; password: string }) {
  const res = await apiClient.post("/auth/login", payload);
  return res.data; // { token, user }
}

export async function signup(payload: { name: string; email: string; password: string }) {
  const res = await apiClient.post("/auth/signup", payload);
  return res.data; // { success, user }
}

export async function me() {
  const res = await apiClient.get("/auth/me");
  return res.data; // user
}

export async function updateProfile(payload: { name?: string; preferences?: any; confidenceThreshold?: number }) {
  const res = await apiClient.patch("/auth/me", payload);
  return res.data; // updated user
}

export function logoutClientSide() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}
