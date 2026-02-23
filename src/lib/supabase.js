/* ════════════════════════════════════════════════════════════════
   SUPABASE CLIENT — Cristalmad
   Null-safe: returns a dummy client if env vars are missing
   ════════════════════════════════════════════════════════════════ */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn(
    "[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — using offline mode",
  );
  // Dummy client that always returns empty results (fallback data will be used)
  supabase = {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () =>
            Promise.resolve({ data: null, error: { message: "Offline mode" } }),
        }),
        order: () =>
          Promise.resolve({ data: null, error: { message: "Offline mode" } }),
        data: null,
        error: { message: "Offline mode" },
      }),
      upsert: () => ({
        select: () =>
          Promise.resolve({ data: null, error: { message: "Offline mode" } }),
      }),
    }),
  };
}

export { supabase };
