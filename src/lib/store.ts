"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "./supabase";
import type { User } from "./types";

// ---------- auth (Supabase Auth; only profiles with role ADMIN get past the panel layout) ----------

interface AuthState {
  user: User | null;
  /** True once the stored session has been checked. */
  ready: boolean;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      ready: false,
      logout: async () => {
        set({ user: null });
        await supabase.auth.signOut();
      },
    }),
    { name: "mfb-admin-user", partialize: (s) => ({ user: s.user }) },
  ),
);

async function loadUser(id: string) {
  const { data, error } = await supabase.from("User").select("id, email, name, phone, role").eq("id", id).single();
  if (error) throw new Error(error.message);
  useAuth.setState({ user: data as User, ready: true });
  return data as User;
}

/** Sign in and confirm the account is an admin; non-admins are signed straight back out. */
export async function signInAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  if (error) throw new Error(error.message === "Invalid login credentials" ? "Invalid email or password" : error.message);
  const user = await loadUser(data.user.id);
  if (user.role !== "ADMIN") {
    await useAuth.getState().logout();
    throw new Error("This account is not an admin");
  }
  return user;
}

if (typeof window !== "undefined") {
  supabase.auth.onAuthStateChange((event, session) => {
    // Defer: supabase-js advises against awaiting other Supabase calls inside this callback.
    setTimeout(async () => {
      if (!session) return useAuth.setState({ user: null, ready: true });
      if (event === "TOKEN_REFRESHED" && useAuth.getState().user?.id === session.user.id) return;
      try {
        await loadUser(session.user.id);
      } catch {
        useAuth.setState({ ready: true });
      }
    }, 0);
  });
}

// ---------- toasts ----------

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
