/* ════════════════════════════════════════════════════════════════
   AUTH — Supabase Authentication helpers for Cristalmad
   ════════════════════════════════════════════════════════════════ */

import { supabase } from "./supabase.js";

// ─── Get current session ───
export async function getSession() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  } catch {
    return null;
  }
}

// ─── Get current user ───
export async function getUser() {
  const session = await getSession();
  return session?.user || null;
}

// ─── Sign in with Google ───
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/#/area-riservata",
    },
  });
  if (error) console.error("[Auth] Google sign-in error:", error.message);
  return { data, error };
}

// ─── Sign in with email/password ───
export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

// ─── Sign up with email/password ───
export async function signUpWithEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

// ─── Sign out ───
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("[Auth] Sign-out error:", error.message);
  window.location.hash = "#/";
}

// ─── Auth state listener ───
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

// ─── Update nav to show auth state ───
export async function updateNavAuth() {
  const user = await getUser();
  const ctaLink = document.querySelector(".nav__cta");
  if (!ctaLink) return;

  if (user) {
    ctaLink.textContent =
      user.user_metadata?.full_name || user.email?.split("@")[0] || "Dashboard";
    ctaLink.setAttribute("href", "#/area-riservata");
  } else {
    ctaLink.textContent = "Area Riservata";
    ctaLink.setAttribute("href", "#/login");
  }
}
