/**
 * Cristalmad — Edge Function: get-order
 * 
 * Restituisce il dettaglio di un singolo ordine.
 * Verifica che l'ordine appartenga all'utente autenticato.
 * 
 * GET /functions/v1/get-order?id=<order_uuid>
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: 'Token di autenticazione mancante' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return new Response(
                JSON.stringify({ error: 'Utente non autenticato' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Parametro ID
        const url = new URL(req.url);
        const orderId = url.searchParams.get('id');

        if (!orderId) {
            return new Response(
                JSON.stringify({ error: 'Parametro id obbligatorio' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // RLS filtra automaticamente per user_id
        const { data: order, error: queryError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (queryError || !order) {
            return new Response(
                JSON.stringify({ error: 'Ordine non trovato' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({ order }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Errore get-order:', error);
        return new Response(
            JSON.stringify({ error: 'Errore interno del server' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
