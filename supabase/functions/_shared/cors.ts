/**
 * Cristalmad — Shared CORS Headers
 * 
 * Headers condivisi per tutte le Edge Functions.
 * Configurare i domini autorizzati in produzione.
 */

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // TODO: restringere in produzione
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};
