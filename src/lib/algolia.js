import { algoliasearch } from "algoliasearch";
import { supabase } from "./supabase.js";

let client;

const getAlgoliaClient = () => {
  if (!client) {
    const appId = import.meta.env.VITE_ALGOLIA_APP_ID;
    const searchKey = import.meta.env.VITE_ALGOLIA_SEARCH_KEY;

    if (!appId || !searchKey) {
      return null;
    }

    client = algoliasearch(appId, searchKey);
  }
  return client;
};

/**
 * Searches the products using Algolia, or falls back to Supabase directly
 * ensuring a case-insensitive, multi-field search.
 * @param {string} query - The search string
 * @returns {Promise<Array>} Array of hit objects
 */
export async function searchProducts(query) {
  if (!query) return [];
  const lowerQuery = query.toLowerCase();

  try {
    const algolia = getAlgoliaClient();
    if (algolia) {
      const { results } = await algolia.search([
        {
          indexName: "cristalmad_products",
          query: lowerQuery,
          params: {
            hitsPerPage: 5,
          },
        },
      ]);
      if (results[0] && results[0].hits && results[0].hits.length > 0) {
        return results[0].hits;
      }
    }
  } catch (err) {
    console.warn("[Algolia] Search failed, falling back to Supabase.", err);
  }

  // FALLBACK: Supabase ILIKE Search (Multi-field, Case-insensitive)
  try {
    // We search across nome and descrizione
    const { data: products, error } = await supabase
      .from("prodotti")
      .select("*, categorie(nome)")
      .or(`nome.ilike.%${lowerQuery}%,descrizione.ilike.%${lowerQuery}%`)
      .limit(5);

    if (error) throw error;

    // Format fallback data to match Algolia's expected structure
    return (products || []).map(p => ({
      ...p,
      name: p.nome,
      category: p.categorie?.nome || "Categoria",
    }));
  } catch (err) {
    console.error("[Supabase Fallback Search] Error:", err);
    return [];
  }
}
