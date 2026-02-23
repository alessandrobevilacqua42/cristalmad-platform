import { algoliasearch } from "algoliasearch";

let client;

const getAlgoliaClient = () => {
  if (!client) {
    const appId = import.meta.env.VITE_ALGOLIA_APP_ID;
    const searchKey = import.meta.env.VITE_ALGOLIA_SEARCH_KEY;

    if (!appId || !searchKey) {
      console.error("[Algolia] Missing credentials in .env");
      return null;
    }

    client = algoliasearch(appId, searchKey);
  }
  return client;
};

/**
 * Searches the products index using Algolia.
 * @param {string} query - The search string
 * @returns {Promise<Array>} Array of hit objects
 */
export async function searchProducts(query) {
  if (!query) return [];

  try {
    const algolia = getAlgoliaClient();
    if (!algolia) return [];

    // Eseguiamo la ricerca sull'indice 'cristalmad_products'
    // Assumiamo che il DB Supabase abbia questo indice associato in Algolia
    const { results } = await algolia.search([
      {
        indexName: "cristalmad_products",
        query: query,
        params: {
          hitsPerPage: 5,
        },
      },
    ]);

    return results[0].hits || [];
  } catch (err) {
    console.error("[Algolia] Search error:", err);
    return [];
  }
}
