/**
 * Cristalmad — Edge Function: create-checkout
 * 
 * Crea una sessione Stripe Checkout per un utente B2B approvato.
 * Applica automaticamente lo sconto basato sul tier dell'utente.
 * 
 * POST /functions/v1/create-checkout
 * Body: { 
 *   items: [{product_id: string, quantity: number, customization?: object}],
 *   success_url?: string,
 *   cancel_url?: string
 * }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';
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
        const { items, success_url, cancel_url } = await req.json();

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

        // --- Crea line items per Stripe ---
        const lineItems = items.map((item) => {
            const product = products.find((p) => p.id === item.product_id);
            if (!product) {
                throw new Error(`Prodotto ${item.product_id} non trovato`);
            }

            // Verifica stock
            if (product.track_inventory && product.stock_quantity < item.quantity) {
                throw new Error(`Stock insufficiente per ${product.name}: disponibili ${product.stock_quantity}`);
            }

            // Applica sconto
            const discountedPrice = Math.round(
                product.base_price_cents * (1 - discountPercent / 100)
            );

            return {
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: 'Fornitura Cristalmad B2B',
                        metadata: {
                            product_id: product.id,
                            sku: product.sku || '',
                        },
                    },
                    unit_amount: discountedPrice,
                },
                quantity: item.quantity,
            };
        });

        // --- Calcola totali per l'ordine ---
        let subtotalCents = 0;
        const orderItems = items.map((item) => {
            const product = products.find((p) => p.id === item.product_id);
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
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .insert({
                user_id: user.id,
                status: 'pending',
                items: orderItems,
                subtotal_cents: subtotalCents,
                discount_percent: discountPercent,
                discount_cents: discountCents,
                tax_cents: taxCents,
                total_cents: totalCents,
                currency: 'EUR',
                shipping_address: profile.shipping_address || {},
                billing_address: profile.billing_address || {},
            })
            .select()
            .single();

        if (orderError) {
            console.error('Errore creazione ordine:', orderError);
            return new Response(
                JSON.stringify({ error: 'Errore nella creazione dell\'ordine' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // --- Crea sessione Stripe Checkout ---
        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
            apiVersion: '2023-10-16',
        });

        const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: lineItems,
            customer_email: profile.contact_email,
            client_reference_id: order.id,
            metadata: {
                order_id: order.id,
                user_id: user.id,
                discount_tier: profile.discount_tier,
            },
            success_url: success_url || `${appUrl}/ordine-confermato?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancel_url || `${appUrl}/carrello`,
            locale: 'it',
            // Fatturazione automatica
            invoice_creation: {
                enabled: true,
                invoice_data: {
                    metadata: { order_id: order.id },
                },
            },
        });

        // Aggiorna ordine con session ID
        await supabaseAdmin
            .from('orders')
            .update({ stripe_checkout_session_id: session.id })
            .eq('id', order.id);

        console.log(`[CHECKOUT] Ordine ${order.id} — Sessione ${session.id} creata per ${profile.company_name}`);

        return new Response(
            JSON.stringify({
                sessionId: session.id,
                url: session.url,
                order_id: order.id,
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Errore create-checkout:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Errore interno del server' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
