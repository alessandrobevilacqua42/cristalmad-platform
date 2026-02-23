/**
 * Cristalmad — Edge Function: send-contact-email
 * 
 * Trasmette in relay le richieste provenienti dal modulo Contatti 
 * dell'app frontend (contatti.js) tramite le API di Resend.
 * 
 * POST /functions/v1/send-contact-email
 * Body: { 
 *   nome: string,
 *   email: string,
 *   tipoRequest: 'b2b' | 'b2c',
 *   messaggio: string
 * }
 */

import { corsHeaders } from '../_shared/cors.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
// L'admin email deve ricevere questi form (es. info@cristalmad.com)
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'info@cristalmad.com';

async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 8000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal  
  });
  clearTimeout(id);
  return response;
}

Deno.serve(async (req) => {
    // Gestione Preflight CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        if (!RESEND_API_KEY) {
            throw new Error("Manca la variabile d'ambiente RESEND_API_KEY.");
        }

        const { nome, email, tipoRequest, messaggio } = await req.json();

        if (!nome || !email || !messaggio) {
            return new Response(
                JSON.stringify({ error: 'Tutti i campi obbligatori (nome, email, messaggio) devono essere forniti.' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Il pacchetto Email di Resend
        const emailLabel = tipoRequest === 'b2b' ? '[B2B] Rivenditore/Azienda' : '[B2C] Privato';

        const htmlBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h2 style="color: #C9A84C; border-bottom: 1px solid #eee; padding-bottom: 15px;">Nuova Richiesta Contatto</h2>
                <p><strong>Da:</strong> ${nome} (${email})</p>
                <p><strong>Tipo di profilo:</strong> ${emailLabel}</p>
                
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-top: 20px; white-space: pre-wrap;">
                    ${messaggio}
                </div>
                <br>
                <hr style="border: none; border-top: 1px solid #eee;">
                <p style="font-size: 12px; color: #888;">Questo messaggio è stato generato automaticamente dal sito Cristalmad.</p>
            </div>
        `;

        // Invio request HTTP all'API Resend
        const res = await fetchWithTimeout('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            timeout: 8000,
            body: JSON.stringify({
                from: 'Cristalmad Mailer <onboarding@resend.dev>', // L'email certificata o sandbox su Resend
                to: [ADMIN_EMAIL],
                reply_to: email, // per replicare direttamente al mittente
                subject: `Nuova richiesta da ${nome} — SITO CRISTALMAD`,
                html: htmlBody,
            }),
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(`Resend Error: ${JSON.stringify(data)}`);
        }

        const data = await res.json();

        console.log(`[CONTACT FORM] Email inviata con successo dall'utente ${email} all'admin ${ADMIN_EMAIL}. Resend ID: ${data.id}`);

        return new Response(
            JSON.stringify({ success: true, message: 'Richiesta inoltrata correttamente.', id: data.id }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('[CONTACT FORM] Errore critico:', error);
        if (error.name === 'AbortError') {
            return new Response(
                JSON.stringify({ error: 'Timeout di rete: Servizio di mailing non raggiungibile. Riprova più tardi.' }),
                { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }
        return new Response(
            JSON.stringify({ error: error.message || 'Errore interno del server durante invio email.' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
