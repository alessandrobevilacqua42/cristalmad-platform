/**
 * Cristalmad — Stripe Client
 * 
 * Client per l'interazione con Stripe lato frontend.
 * Carica Stripe.js in modo lazy (solo quando serve).
 * 
 * NOTA: La chiave segreta (sk_*) NON viene MAI usata qui.
 * Le operazioni sensibili (creazione checkout, webhook) avvengono
 * esclusivamente nelle Edge Functions di Supabase.
 */

import { loadStripe } from '@stripe/stripe-js';

// --- Variabili d'ambiente ---
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Validazione
if (!stripePublishableKey) {
    console.warn(
        '[Cristalmad] VITE_STRIPE_PUBLISHABLE_KEY non configurata. ' +
        'I pagamenti Stripe non funzioneranno finché non viene impostata nel file .env'
    );
}

/**
 * Istanza Stripe (lazy-loaded).
 * loadStripe() carica lo script Stripe.js solo al primo utilizzo.
 */
let stripePromise = null;

/**
 * Restituisce l'istanza Stripe.
 * Utilizza il pattern singleton per evitare caricamenti multipli.
 * @returns {Promise<import('@stripe/stripe-js').Stripe | null>}
 */
export function getStripe() {
    if (!stripePromise && stripePublishableKey) {
        stripePromise = loadStripe(stripePublishableKey);
    }
    return stripePromise;
}

/**
 * Redirige l'utente alla pagina di checkout Stripe.
 * 
 * @param {string} checkoutSessionId - ID della sessione di checkout
 *   creata dalla Edge Function /create-checkout
 * @returns {Promise<{error?: import('@stripe/stripe-js').StripeError}>}
 */
export async function redirectToCheckout(checkoutSessionId) {
    const stripe = await getStripe();

    if (!stripe) {
        throw new Error(
            '[Cristalmad] Stripe non inizializzato. Verifica VITE_STRIPE_PUBLISHABLE_KEY nel .env'
        );
    }

    const result = await stripe.redirectToCheckout({
        sessionId: checkoutSessionId,
    });

    if (result.error) {
        console.error('[Cristalmad] Errore redirect checkout:', result.error.message);
    }

    return result;
}

/**
 * Crea una sessione di checkout chiamando la Edge Function di Supabase.
 * 
 * @param {Object} params
 * @param {Array<{productId: string, quantity: number}>} params.items - Prodotti da acquistare
 * @param {string} params.accessToken - JWT token dell'utente autenticato
 * @param {string} [params.successUrl] - URL di redirect dopo pagamento riuscito
 * @param {string} [params.cancelUrl] - URL di redirect se l'utente annulla
 * @returns {Promise<{sessionId: string, url: string}>}
 */
export async function createCheckoutSession({
    items,
    accessToken,
    successUrl = `${window.location.origin}/ordine-confermato`,
    cancelUrl = `${window.location.origin}/carrello`,
}) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    const response = await fetch(
        `${supabaseUrl}/functions/v1/create-checkout`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                items,
                success_url: successUrl,
                cancel_url: cancelUrl,
            }),
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            errorData.error || `Errore creazione checkout: ${response.status}`
        );
    }

    return response.json();
}

export default getStripe;
