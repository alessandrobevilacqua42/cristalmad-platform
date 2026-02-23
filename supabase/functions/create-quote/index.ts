/**
 * Cristalmad — Edge Function: create-quote
 * 
 * Genera un preventivo (Quotes) nel database per un utente B2B.
 * Applica automaticamente lo sconto basato sul tier dell'utente per massima sicurezza,
 * in modo analogo alla create-checkout, ma senza creare una sessione Stripe.
 *
 * Ritorna l'ID di ordine generato (e i totali sicuri) in modo che il frontend 
 * possa stampare il PDF intestato con l'ID ufficiale.
 * 
 * POST /functions/v1/create-quote
 * Body: { 
 *   items: [{product_id: string, quantity: number, customization?: object}],
 *   notes?: string
 * }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Sconti per tier B2B
const DISCOUNT_MAP = {
    standard: 0,
    silver: 10,
    gold: 15,
    platinum: 25,
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // --- Auth ---
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: 'Token di autenticazione mancante' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        );

        const supabaseUser = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
        if (authError || !user) {
            return new Response(
                JSON.stringify({ error: 'Utente non autenticato' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // --- Verifica utente approvato ---
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('business_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return new Response(
                JSON.stringify({ error: 'Profilo business non trovato' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        if (!profile.is_approved) {
            return new Response(
                JSON.stringify({ error: 'Account non ancora approvato. Contatta l\'amministratore.' }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // --- Body ---
        const { items, notes } = await req.json();

        if (!items || !Array.isArray(items) || items.length === 0) {
            return new Response(
                JSON.stringify({ error: 'Almeno un prodotto è richiesto' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // --- Recupera prodotti dal DB ---
        const productIds = items.map((item) => item.product_id);
        const { data: products, error: productsError } = await supabaseAdmin
            .from('products')
            .select('*')
            .in('id', productIds)
            .eq('is_active', true);

        if (productsError || !products || products.length === 0) {
            return new Response(
                JSON.stringify({ error: 'Prodotti non trovati o non disponibili' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // --- Calcola sconto B2B ---
        const discountPercent = DISCOUNT_MAP[profile.discount_tier] ?? 0;

        // --- Calcola totali per l'ordine ---
        let subtotalCents = 0;
        const orderItems = items.map((item) => {
            const product = products.find((p) => p.id === item.product_id);
            if (!product) {
                throw new Error(`Prodotto ${item.product_id} non trovato`);
            }
            const unitPrice = product.base_price_cents;
            const discountedPrice = Math.round(unitPrice * (1 - discountPercent / 100));
            subtotalCents += discountedPrice * item.quantity;

            return {
                product_id: product.id,
                name: product.name,
                sku: product.sku,
                quantity: item.quantity,
                unit_price_cents: unitPrice,
                discounted_price_cents: discountedPrice,
                customization: item.customization || null,
            };
        });

        const discountCents = Math.round(subtotalCents * discountPercent / (100 - discountPercent));
        const taxCents = Math.round(subtotalCents * 0.22); // IVA 22% Italia
        const totalCents = subtotalCents + taxCents;

        // --- Crea ordine in DB (status: pending) ---
        // Generiamo noi un progressivo per il preventivo
        const quotePrefix = 'Q-' + new Date().getFullYear().toString() + '-';
        const randomHash = Math.random().toString(36).substring(2, 8).toUpperCase();
        const quoteNumber = quotePrefix + randomHash;

        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .insert({
                user_id: user.id,
                status: 'pending', // Considerato in pending (può essere marcato come preventivo con flag in futuro)
                invoice_number: quoteNumber, // Utilizziamo momentaneamente l'invoice_number_field come identificativo preventivo
                items: orderItems,
                subtotal_cents: subtotalCents,
                discount_percent: discountPercent,
                discount_cents: discountCents,
                tax_cents: taxCents,
                total_cents: totalCents,
                currency: 'EUR',
                customer_notes: notes || '',
                shipping_address: profile.shipping_address || {},
                billing_address: profile.billing_address || {},
            })
            .select()
            .single();

        if (orderError) {
            console.error('Errore creazione preventivo:', orderError);
            return new Response(
                JSON.stringify({ error: 'Errore nel salvataggio del preventivo' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        console.log(`[QUOTE] Preventivo ${order.id} creato per ${profile.company_name} (Total: ${totalCents} EUR cents)`);

        return new Response(
            JSON.stringify({
                quote_id: order.id,
                quote_number: quoteNumber,
                subtotal_cents: subtotalCents,
                discount_cents: discountCents,
                tax_cents: taxCents,
                total_cents: totalCents,
                discount_percent: discountPercent
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Errore create-quote:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Errore interno del server' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
