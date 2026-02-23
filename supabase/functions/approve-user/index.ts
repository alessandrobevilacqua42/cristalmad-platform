/**
 * Cristalmad — Edge Function: approve-user
 * 
 * Permette a un admin di approvare (o rifiutare) un utente B2B.
 * Solo gli utenti con ruolo 'admin' possono chiamare questa funzione.
 * 
 * POST /functions/v1/approve-user
 * Body: { user_id: string, approved: boolean, rejection_reason?: string }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
    // CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // --- Auth: verifica JWT ---
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: 'Token di autenticazione mancante' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Client con service role per operazioni admin
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        );

        // Client con JWT utente per verificare il ruolo
        const supabaseUser = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        );

        // Verifica che l'utente sia autenticato
        const { data: { user: caller }, error: authError } = await supabaseUser.auth.getUser();
        if (authError || !caller) {
            return new Response(
                JSON.stringify({ error: 'Utente non autenticato' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Verifica ruolo admin
        const isAdmin = caller.app_metadata?.role === 'admin';
        if (!isAdmin) {
            return new Response(
                JSON.stringify({ error: 'Accesso negato. Solo gli admin possono approvare utenti.' }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // --- Body ---
        const { user_id, approved, rejection_reason } = await req.json();

        if (!user_id || typeof approved !== 'boolean') {
            return new Response(
                JSON.stringify({ error: 'Parametri mancanti: user_id (string) e approved (boolean) sono obbligatori' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // --- Aggiorna profilo ---
        const updateData = {
            is_approved: approved,
            approved_by: approved ? caller.id : null,
            approved_at: approved ? new Date().toISOString() : null,
            rejection_reason: approved ? null : (rejection_reason || 'Nessun motivo specificato'),
        };

        const { data: profile, error: updateError } = await supabaseAdmin
            .from('business_profiles')
            .update(updateData)
            .eq('id', user_id)
            .select()
            .single();

        if (updateError) {
            console.error('Errore aggiornamento profilo:', updateError);
            return new Response(
                JSON.stringify({ error: 'Errore durante l\'aggiornamento del profilo' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // --- Log azione admin ---
        console.log(
            `[ADMIN] ${caller.email} ha ${approved ? 'APPROVATO' : 'RIFIUTATO'} l'utente ${user_id}` +
            (rejection_reason ? ` — Motivo: ${rejection_reason}` : '')
        );

        return new Response(
            JSON.stringify({
                success: true,
                message: approved
                    ? `Utente ${profile.company_name} approvato con successo`
                    : `Utente ${profile.company_name} rifiutato`,
                profile,
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Errore imprevisto:', error);
        return new Response(
            JSON.stringify({ error: 'Errore interno del server' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
