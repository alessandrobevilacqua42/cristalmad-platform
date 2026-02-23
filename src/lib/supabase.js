/**
 * Cristalmad — Supabase Client
 * 
 * Client per l'interazione con Supabase (database, auth, storage).
 * Questo file espone due client:
 * - supabase: client pubblico (usa anon key, rispetta RLS)
 * - supabaseAdmin: client admin (usa service role key, bypassa RLS) — SOLO BACKEND
 */

import { createClient } from '@supabase/supabase-js';

// --- Variabili d'ambiente ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validazione: le variabili DEVONO essere presenti
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        '[Cristalmad] Variabili Supabase mancanti! ' +
        'Assicurati che VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY siano configurate nel file .env'
    );
}

/**
 * Client Supabase pubblico.
 * Usa la anon key e rispetta le Row Level Security policies.
 * Sicuro per l'uso lato client (frontend).
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});

/**
 * Helper: restituisce la sessione utente corrente.
 * @returns {Promise<import('@supabase/supabase-js').Session | null>}
 */
export async function getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
        console.error('[Cristalmad] Errore nel recupero sessione:', error.message);
        return null;
    }
    return session;
}

/**
 * Helper: restituisce l'utente corrente.
 * @returns {Promise<import('@supabase/supabase-js').User | null>}
 */
export async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
        console.error('[Cristalmad] Errore nel recupero utente:', error.message);
        return null;
    }
    return user;
}

/**
 * Helper: registra un listener per i cambiamenti di stato auth.
 * @param {Function} callback - Funzione chiamata ad ogni cambio di stato
 * @returns {import('@supabase/supabase-js').Subscription}
 */
export function onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
            callback(event, session);
        }
    );
    return subscription;
}

export default supabase;
