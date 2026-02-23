import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "./supabase.js";

let stripePromise;

// Initialize Stripe lazy loading
const getStripe = () => {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error("[Stripe] Missing VITE_STRIPE_PUBLISHABLE_KEY in .env");
      return null;
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

/**
 * Invokes the Supabase Edge Function to create a Stripe Checkout Session,
 * and then redirects the user to the Stripe hosted checkout page.
 *
 * @param {string} productId - The ID of the product
 * @param {number} quantity - Quantity desired
 * @returns {Promise<void>}
 */
export async function processPayment(productId, quantity = 1) {
  try {
    const stripe = await getStripe();
    if (!stripe) throw new Error("Stripe failed to initialize.");

    // 1. Get the current user session (if any, to pass it to the function for B2B pricing logic)
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // 2. Call the Supabase Edge Function
    // Fallback: If edge functions are not deployed, we gracefully fail on the client.
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: {
        items: [
          {
            product_id: productId,
            quantity: quantity,
          },
        ],
      },
    });

    if (error) {
      console.error("[Stripe] Edge function error:", error);
      throw new Error(
        "Errore durante la creazione della sessione di pagamento.",
      );
    }

    if (!data || !data.sessionId) {
      throw new Error(
        "La funzione non ha restituito un ID di sessione valido.",
      );
    }

    // 3. Redirect to Stripe Checkout
    try {
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (stripeError) {
        console.error("[Stripe] Redirect error:", stripeError);
        throw stripeError;
      }
    } catch (redirectErr) {
      console.error("[Stripe] Checkout API Error:", redirectErr);
      throw new Error("Il gateway Stripe non risponde. Controlla la tua connessione e riprova.");
    }
  } catch (err) {
    console.error("Payment flow failed:", err);
    alert(err.message || "Connessione al gateway bancario interrotta. Riprovare.");
  }
}
