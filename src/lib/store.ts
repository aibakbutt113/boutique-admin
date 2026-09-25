"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, bindToken } from "./api";
import type { User } from "./types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (s: { user: User; accessToken: string; refreshToken: string }) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setSession: (s) => set(s),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: "mfb-admin-auth" },
  ),
);

bindToken(() => useAuth.getState().accessToken);

/** Trade the refresh token for a new access token; log out if that fails. */
export async function refreshSession() {
  const { refreshToken, setSession, logout } = useAuth.getState();
  if (!refreshToken) return false;
  try {
    const r = await api<{ user: User; accessToken: string; refreshToken: string }>("/auth/refresh", {
      method: "POST",
      json: { refreshToken },
    });
    setSession(r);
    return true;
  } catch {
    logout();
    return false;
  }
}

/** Like api(), but retries once after refreshing an expired access token. */
export async function authedApi<T>(path: string, init: Parameters<typeof api>[1] = {}): Promise<T> {
  try {
    return await api<T>(path, { ...init });
  } catch (e) {
    if ((e as { status?: number }).status === 401 && (await refreshSession())) return api<T>(path, { ...init });
    throw e;
  }
}

interface Toast {
  id: number;
  text: string;
}
interface ToastState {
  toasts: Toast[];
  push: (text: string) => void;
}
export const useToast = create<ToastState>((set) => ({
  toasts: [],
  push: (text) => {
    const id = Date.now() + Math.random();
    set((s) => ({ toasts: [...s.toasts, { id, text }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3000);
  },
}));
