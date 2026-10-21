import { createClient } from "@supabase/supabase-js";

// Both values are safe to expose in the browser: access is enforced by Row Level Security
// and the database functions in supabase/migrations.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
if (!url || !key) console.warn("Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local");

const browser = typeof window !== "undefined";

/**
 * One client for the whole app. In the browser it keeps the signed-in session in localStorage
 * and refreshes it; on the server (server components) it is anonymous and only reads public data.
 */
export const supabase = createClient(url || "http://localhost:54321", key || "missing-key", {
  // Always ask the database for current data. Without this, Next.js caches these requests and
  // pre-renders pages like the home page at build time, so admin changes (banners, products,
  // categories) would never show up until the next deploy.
  global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  auth: { persistSession: browser, autoRefreshToken: browser, detectSessionInUrl: browser, storageKey: "mfb-admin-auth" },
});
