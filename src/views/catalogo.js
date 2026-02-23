/* ════════════════════════════════════════════════════════════════
   CATALOGO VIEW — Full product catalog with category filtering
   Fetches all products from Supabase with hardcoded fallback
   ════════════════════════════════════════════════════════════════ */

import { supabase } from "../lib/supabase.js";
import { registerProducts } from "../main.js";

// ─── Fallback data ───
const FALLBACK_PRODUCTS = [
  {
    id: "oriente",
    nome: "Calice Oriente Liquore",
    slug: "calice-oriente-liquore",
    descrizione:
      "Eleganza orientale per liquori e distillati pregiati. Confezione: 6 pezzi.",
    immagine_url: "/images/product_calice_1.png",
    prezzo_b2c: 48.0,
    confezione: "6 pezzi",
    categorie: { nome: "Calici" },
  },
  {
    id: "onda",
    nome: "Calice Onda Mille Righe",
    slug: "calice-onda-mille-righe",
    descrizione:
      "Linee sinuose per cocktail e long drink. Confezione: 6 pezzi.",
    immagine_url: "/images/product_calice_2.png",
    prezzo_b2c: 52.0,
    confezione: "6 pezzi",
    categorie: { nome: "Calici" },
  },
  {
    id: "coppa",
    nome: "Coppa Martini Classica",
    slug: "coppa-martini-classica",
    descrizione:
      "La perfezione per i cocktail più raffinati. Confezione: 6 pezzi.",
    immagine_url: "/images/product_coppa.png",
    prezzo_b2c: 42.0,
    confezione: "6 pezzi",
    categorie: { nome: "Coppe" },
  },
  {
    id: "caraffa",
    nome: "Caraffa Arlecchino",
    slug: "caraffa-arlecchino",
    descrizione:
      "Colori e forme per acqua, vino e cocktail. Confezione: 1 pezzo.",
    immagine_url: "/images/product_caraffa.png",
    prezzo_b2c: 65.0,
    confezione: "1 pezzo",
    categorie: { nome: "Caraffe" },
  },
  {
    id: "bicchiere",
    nome: "Bicchiere Murnera",
    slug: "bicchiere-murnera",
    descrizione: "Design iconico per ogni tavola. Confezione: 6 pezzi.",
    immagine_url: "/images/product_bicchiere.png",
    prezzo_b2c: 38.0,
    confezione: "6 pezzi",
    categorie: { nome: "Bicchieri" },
  },
  {
    id: "vaso",
    nome: "Vaso Scultura",
    slug: "vaso-scultura",
    descrizione: "Arte decorativa in cristallo soffiato a mano. Pezzo unico.",
    immagine_url: "/images/product_vaso.png",
    prezzo_b2c: 120.0,
    confezione: "1 pezzo",
    categorie: { nome: "Vasi" },
  },
];

// ─── Fetch ───
async function fetchAllProducts() {
  try {
    const { data, error } = await supabase
      .from("prodotti")
      .select("*, categorie(nome, slug)")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data && data.length > 0 ? data : FALLBACK_PRODUCTS;
  } catch {
    console.warn("[Catalogo] Supabase fetch failed, using fallback");
    return FALLBACK_PRODUCTS;
  }
}

// ─── Renderers ───
function renderProductCard(product, delay = 0) {
  const catName = product.categorie?.nome || "";
  const price = product.prezzo_b2c
    ? `€${Number(product.prezzo_b2c).toFixed(2)}`
    : "";

  return `
    <article class="product-card animate-on-scroll" data-delay="${delay}" data-category="${catName}">
      <div class="product-card__image-wrap">
        <img src="${product.immagine_url}" alt="${product.nome}" loading="lazy" />
        <div class="product-card__shimmer"></div>
        <div class="product-card__glow"></div>
        <button class="product-card__quick-view" data-product-id="${product.id}" data-product-slug="${product.slug}">Quick View</button>
      </div>
      <div class="product-card__info">
        <span class="product-card__category">${catName}</span>
        <h3 class="product-card__name">${product.nome}</h3>
        <p class="product-card__desc">${product.descrizione}</p>
        <div class="product-card__price-gate">
          ${
            price
              ? `<span class="product-card__price">${price}</span>
               <span class="product-card__price-unit">/ ${product.confezione}</span>`
              : `<a href="#/login" class="btn btn--sm btn--glass" data-link>Accedi per i Prezzi</a>`
          }
        </div>
      </div>
    </article>
  `;
}

// ═══════════════════════════════════════════════════════════════
// CATALOGO VIEW (async)
// ═══════════════════════════════════════════════════════════════
export async function catalogoView() {
  const products = await fetchAllProducts();

  // Register products for the modal system
  registerProducts(products);

  // Extract unique categories from products for filter buttons
  const uniqueCategories = [
    "Tutti",
    ...new Set(products.map((p) => p.categorie?.nome).filter(Boolean)),
  ];

  const filterButtons = uniqueCategories
    .map(
      (cat) =>
        `<button class="catalog-filter__btn${cat === "Tutti" ? " active" : ""}" data-filter="${cat}">${cat}</button>`,
    )
    .join("");

  const productCards = products
    .map((p, i) => renderProductCard(p, (i % 3) * 100))
    .join("");

  return `
  <section class="catalog-page">
    <div class="container">
      <div class="section-header animate-on-scroll">
        <p class="section-eyebrow">Catalogo Completo</p>
        <h2 class="section-title">Le Nostre Creazioni</h2>
      </div>

      <div class="catalog-filter animate-on-scroll">
        ${filterButtons}
      </div>

      <div class="products__grid" id="catalog-grid">
        ${productCards}
      </div>

      <div class="catalog-back animate-on-scroll">
        <a href="#/" class="btn btn--glass" data-link>← Torna alla Home</a>
      </div>
    </div>
  </section>
  `;
}

/**
 * Initialize catalog-specific interactivity (category filtering)
 */
export function initCatalogFilters() {
  const buttons = document.querySelectorAll(".catalog-filter__btn");
  const cards = document.querySelectorAll("#catalog-grid .product-card");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Update active state
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;

      cards.forEach((card) => {
        const category = card.dataset.category || "";
        if (filter === "Tutti" || category === filter) {
          card.style.display = "";
          card.classList.remove("visible");
          // Re-trigger animation
          requestAnimationFrame(() => {
            card.classList.add("visible");
          });
        } else {
          card.style.display = "none";
        }
      });
    });
  });
}
