/**
 * Cristalmad — Edge Function: validate-vat
 * 
 * Verifica la validità di una Partita IVA europea tramite il servizio VIES.
 * Utilizzata durante la registrazione B2B per validare i dati aziendali.
 * 
 * POST /functions/v1/validate-vat
 * Body: { country_code: string, vat_number: string }
 */

import { corsHeaders } from '../_shared/cors.ts';

const VIES_URL = 'https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number';

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
    // CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { country_code, vat_number } = await req.json();

        // Validazione input
        if (!country_code || !vat_number) {
            return new Response(
                JSON.stringify({ error: 'country_code e vat_number sono obbligatori' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Sanifica il numero (rimuovi spazi e trattini)
        const cleanVat = vat_number.replace(/[\s\-\.]/g, '').toUpperCase();
        const cleanCountry = country_code.toUpperCase().trim();

        // Valida formato codice paese (2 lettere ISO)
        if (!/^[A-Z]{2}$/.test(cleanCountry)) {
            return new Response(
                JSON.stringify({ error: 'country_code deve essere un codice ISO a 2 lettere (es: IT, DE, FR)' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Chiamata API VIES
        const viesResponse = await fetchWithTimeout(VIES_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            timeout: 8000,
            body: JSON.stringify({
                countryCode: cleanCountry,
                vatNumber: cleanVat,
            }),
        });

        if (!viesResponse.ok) {
            console.error('VIES API error:', viesResponse.status);
            return new Response(
                JSON.stringify({
                    error: 'Servizio VIES non disponibile. Riprova più tardi.',
                    vies_status: viesResponse.status,
                }),
                { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const viesData = await viesResponse.json();

        return new Response(
            JSON.stringify({
                valid: viesData.valid ?? false,
                country_code: cleanCountry,
                vat_number: cleanVat,
                company_name: viesData.name || null,
                company_address: viesData.address || null,
                request_date: viesData.requestDate || new Date().toISOString(),
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Errore validazione VAT:', error);
        if (error.name === 'AbortError') {
            return new Response(
                JSON.stringify({ error: 'Timeout di rete: Il portale Europeo VIES non risponde. Riprova più tardi.' }),
                { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }
        return new Response(
            JSON.stringify({ error: 'Errore interno del server' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
