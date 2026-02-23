/**
 * Cristalmad — Edge Function: stripe-webhook
 * 
 * Riceve e processa gli eventi webhook da Stripe.
 * Gestisce: pagamenti completati, falliti, rimborsi.
 * 
 * POST /functions/v1/stripe-webhook
 * Headers: stripe-signature (verificato)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';

Deno.serve(async (req) => {
    try {
        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
            apiVersion: '2023-10-16',
        });

        // --- Verifica firma webhook ---
        const signature = req.headers.get('stripe-signature');
        if (!signature) {
            console.error('[WEBHOOK] Firma Stripe mancante');
            return new Response('Firma mancante', { status: 400 });
        }

        const body = await req.text();
        const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';

        let event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err) {
            console.error('[WEBHOOK] Firma non valida:', err.message);
            return new Response(`Firma non valida: ${err.message}`, { status: 400 });
        }

        // --- Client Supabase (service role per bypassare RLS) ---
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        );

        console.log(`[WEBHOOK] Evento ricevuto: ${event.type} — ID: ${event.id}`);

        // --- Gestione eventi ---
        switch (event.type) {

            // ✅ Pagamento completato
            case 'checkout.session.completed': {
                const session = event.data.object;
                const orderId = session.metadata?.order_id || session.client_reference_id;

                if (!orderId) {
                    console.error('[WEBHOOK] order_id mancante nella sessione:', session.id);
                    break;
                }

                // Aggiorna ordine
                const { error: updateError } = await supabaseAdmin
                    .from('orders')
                    .update({
                        status: 'paid',
                        stripe_payment_intent_id: session.payment_intent,
                        stripe_customer_id: session.customer,
                        paid_at: new Date().toISOString(),
                    })
                    .eq('id', orderId);

                if (updateError) {
                    console.error('[WEBHOOK] Errore aggiornamento ordine:', updateError);
                } else {
                    console.log(`[WEBHOOK] ✅ Ordine ${orderId} → PAID`);
                }

                // Aggiorna stock dei prodotti
                const { data: order } = await supabaseAdmin
                    .from('orders')
                    .select('items')
                    .eq('id', orderId)
                    .single();

                if (order?.items) {
                    for (const item of order.items) {
                        await supabaseAdmin.rpc('decrement_stock', {
                            p_product_id: item.product_id,
                            p_quantity: item.quantity,
                        });
                    }
                }

                break;
            }

            // ❌ Pagamento fallito
            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object;

                const { error } = await supabaseAdmin
                    .from('orders')
                    .update({
                        status: 'cancelled',
                        cancelled_at: new Date().toISOString(),
                        internal_notes: `Pagamento fallito: ${paymentIntent.last_payment_error?.message || 'Errore sconosciuto'}`,
                    })
                    .eq('stripe_payment_intent_id', paymentIntent.id);

                if (error) {
                    console.error('[WEBHOOK] Errore aggiornamento ordine fallito:', error);
                } else {
                    console.log(`[WEBHOOK] ❌ Pagamento fallito per PI: ${paymentIntent.id}`);
                }

                break;
            }

            // 💸 Rimborso
            case 'charge.refunded': {
                const charge = event.data.object;

                const { error } = await supabaseAdmin
                    .from('orders')
                    .update({
                        status: 'refunded',
                        internal_notes: `Rimborso processato. Amount: ${charge.amount_refunded / 100}€`,
                    })
                    .eq('stripe_payment_intent_id', charge.payment_intent);

                if (error) {
                    console.error('[WEBHOOK] Errore aggiornamento rimborso:', error);
                } else {
                    console.log(`[WEBHOOK] 💸 Rimborso per PI: ${charge.payment_intent}`);
                }

                break;
            }

            default:
                console.log(`[WEBHOOK] Evento non gestito: ${event.type}`);
        }

        // Stripe si aspetta un 200 per confermare la ricezione
        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('[WEBHOOK] Errore imprevisto:', error);
        return new Response(
            JSON.stringify({ error: 'Errore interno' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});
