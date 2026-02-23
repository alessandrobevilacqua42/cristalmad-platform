/* ════════════════════════════════════════════════════════════════
   HOME VIEW — Hero + Categories + Products + Craftsmanship + B2B + Footer
   Fetches products and categories from Supabase with hardcoded fallback
   ════════════════════════════════════════════════════════════════ */

import { supabase } from "../lib/supabase.js";
import { registerProducts } from "../main.js";

// ─── Fallback data (used when Supabase is unreachable) ───
const FALLBACK_CATEGORIES = [
  {
    nome: "Calici",
    slug: "calici",
    descrizione: "Vino · Champagne · Liquori",
    immagine_url: "/images/product_calice_1.png",
  },
  {
    nome: "Coppe",
    slug: "coppe",
    descrizione: "Cocktail · Martini · Dessert",
    immagine_url: "/images/product_coppa.png",
  },
  {
    nome: "Bicchieri",
    slug: "bicchieri",
    descrizione: "Acqua · Long Drink",
    immagine_url: "/images/product_bicchiere.png",
  },
  {
    nome: "Caraffe",
    slug: "caraffe",
    descrizione: "Acqua · Vino · Cocktail",
    immagine_url: "/images/product_caraffa.png",
  },
  {
    nome: "Vasi",
    slug: "vasi",
    descrizione: "Decorazioni in Cristallo",
    immagine_url: "/images/product_vaso.png",
  },
];

const FALLBACK_PRODUCTS = [
  {
    id: "oriente",
    nome: "Calice Oriente",
    slug: "calice-oriente-liquore",
    descrizione:
      "Eleganza orientale per liquori e distillati pregiati. Confezione: 6 pezzi.",
    immagine_url: "/images/product_calice_1.png",
    prezzo_b2c: 48.0,
    confezione: "6 pezzi",
    categorie: { nome: "Calici", slug: "calici" },
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
    categorie: { nome: "Calici", slug: "calici" },
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
    categorie: { nome: "Coppe", slug: "coppe" },
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
    categorie: { nome: "Caraffe", slug: "caraffe" },
  },
  {
    id: "bicchiere",
    nome: "Bicchiere Murnera",
    slug: "bicchiere-murnera",
    descrizione: "Design iconico per ogni tavola. Confezione: 6 pezzi.",
    immagine_url: "/images/product_bicchiere.png",
    prezzo_b2c: 38.0,
    confezione: "6 pezzi",
    categorie: { nome: "Bicchieri", slug: "bicchieri" },
  },
  {
    id: "vaso",
    nome: "Vaso Scultura",
    slug: "vaso-scultura",
    descrizione: "Arte decorativa in cristallo soffiato a mano. Pezzo unico.",
    immagine_url: "/images/product_vaso.png",
    prezzo_b2c: 120.0,
    confezione: "1 pezzo",
    categorie: { nome: "Vasi", slug: "vasi" },
  },
];

// ─── Fetch helpers ───
async function fetchCategories() {
  try {
    const { data, error } = await supabase
      .from("categorie")
      .select("*")
      .order("ordine", { ascending: true });
    if (error) throw error;
    return data && data.length > 0 ? data : FALLBACK_CATEGORIES;
  } catch {
    console.warn("[Home] Supabase categories fetch failed, using fallback");
    return FALLBACK_CATEGORIES;
  }
}

async function fetchFeaturedProducts() {
  try {
    const { data, error } = await supabase
      .from("prodotti")
      .select("*, categorie(nome, slug)")
      .eq("in_evidenza", true)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data && data.length > 0 ? data : FALLBACK_PRODUCTS;
  } catch {
    console.warn("[Home] Supabase products fetch failed, using fallback");
    return FALLBACK_PRODUCTS;
  }
}

// ─── Renderers ───
function renderCategoryCard(cat, delay) {
  return `
    <a href="#/catalogo" class="category-card animate-on-scroll" data-delay="${delay}" data-link>
      <div class="category-card__img-wrap">
        <img src="${cat.immagine_url}" alt="${cat.nome}" loading="lazy" />
      </div>
      <div class="category-card__info">
        <h3>${cat.nome}</h3>
        <p>${cat.descrizione}</p>
      </div>
    </a>`;
}

function renderProductCard(product, delay) {
  const catName = product.categorie?.nome || "";
  const price = product.prezzo_b2c
    ? `€${Number(product.prezzo_b2c).toFixed(2)}`
    : "";

  return `
    <article class="product-card animate-on-scroll" data-delay="${delay}">
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
          ${price
      ? `<span class="product-card__price">${price}</span>
               <span class="product-card__price-unit">/ ${product.confezione}</span>`
      : `<a href="#/login" class="btn btn--sm btn--glass" data-link>Accedi per i Prezzi</a>`
    }
        </div>
      </div>
    </article>`;
}

// ═══════════════════════════════════════════════════════════════
// HOME VIEW (async)
// ═══════════════════════════════════════════════════════════════
export async function homeView() {
  // Fetch data in parallel
  const [categories, products] = await Promise.all([
    fetchCategories(),
    fetchFeaturedProducts(),
  ]);

  // Register products for the modal system
  registerProducts(products);

  // Render category cards
  const categoryCards = categories
    .map((cat, i) => renderCategoryCard(cat, i * 100))
    .join("");

  // Render product cards
  const productCards = products
    .map((p, i) => renderProductCard(p, (i % 3) * 100))
    .join("");

  return `
  <!-- ═══════════ HERO ═══════════ -->
  <section class="hero" id="hero">
    <div class="hero__bg">
      <img src="/images/hero_glassware.png" alt="Cristalleria artigianale italiana" class="hero__img" />
      <div class="hero__overlay"></div>
      <div class="hero__caustics"></div>
    </div>
    <div class="hero__content">
      <p class="hero__eyebrow animate-on-scroll">Dal 1980 — Cristalleria Artigianale</p>
      <h1 class="hero__title animate-on-scroll">
        L'Eccellenza del<br />
        <span class="hero__title-accent">Cristallo Artigianale</span>
      </h1>
      <p class="hero__subtitle animate-on-scroll">Ogni pezzo racconta una storia di passione, maestria e tradizione
        italiana. Soffiato a mano, unico per natura.</p>
      <div class="hero__actions animate-on-scroll">
        <a href="#/catalogo" class="btn btn--primary" data-link>Scopri la Collezione</a>
        <a href="#b2b-section" class="btn btn--glass">Diventa Partner B2B</a>
      </div>
    </div>
    <div class="hero__scroll-indicator" id="scroll-indicator">
      <span>Scorri</span>
      <div class="hero__scroll-line"></div>
    </div>
  </section>

  <!-- ═══════════ DARK LUXURY MANIFESTO ═══════════ -->
  <section class="manifesto" id="manifesto">
    <div class="container">
      <div class="manifesto__grid">
        <div class="manifesto__text animate-on-scroll">
          <p class="section-eyebrow">Il Nostro Manifesto</p>
          <h2 class="manifesto__title">
            Materia Cruda,<br />
            <span class="manifesto__title-accent">Pura Luce.</span>
          </h2>
          <p class="manifesto__desc">
            Nel buio della nostra fornace, a 1400°C di calore, la fragilità incontra la massima resistenza. 
            Non produciamo bicchieri industriali. Diamo forma a visioni liquide.
          </p>
          <p class="manifesto__desc">
            Ogni singola goccia di cristallo incandescente è domata a mano dai nostri maestri. 
            Nessun calice è identico all'altro. Questa non è imperfezione, è il sigillo autentico 
            dell'alta manifattura italiana.
          </p>
        </div>
        <div class="manifesto__visual animate-on-scroll" data-delay="150">
          <img src="https://images.unsplash.com/photo-1542289196-ad4b98c36f01?q=80&w=1200&auto=format&fit=crop" alt="Fornace e cristallo fuso" class="manifesto__img" loading="lazy" />
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════ CATEGORIES ═══════════ -->
  <section class="categories" id="collezioni">
    <div class="container">
      <div class="section-header animate-on-scroll">
        <p class="section-eyebrow">Le Nostre Collezioni</p>
        <h2 class="section-title">Maestria in Ogni Forma</h2>
      </div>
      <div class="categories__grid">
        ${categoryCards}
      </div>
    </div>
  </section>

  <!-- ═══════════ FEATURED PRODUCTS ═══════════ -->
  <section class="products" id="prodotti">
    <div class="container">
      <div class="section-header animate-on-scroll">
        <p class="section-eyebrow">Selezione Esclusiva</p>
        <h2 class="section-title">I Nostri Capolavori</h2>
      </div>
      <div class="products__grid">
        ${productCards}
      </div>
    </div>
  </section>

  <!-- ═══════════ CRAFTSMANSHIP / L'ARTE ═══════════ -->
  <section class="craftsmanship" id="artigianato">
    <div class="craftsmanship__bg-parallax" id="craftsmanship-parallax">
      <img src="/images/about_craftsman.png" alt="Maestro vetraio al lavoro" loading="lazy" />
    </div>
    <div class="craftsmanship__overlay"></div>
    <div class="container craftsmanship__content">
      <div class="craftsmanship__text animate-on-scroll">
        <p class="section-eyebrow section-eyebrow--light">Tradizione dal 1980</p>
        <h2 class="section-title section-title--light">L'Arte del Vetro</h2>
        <p class="craftsmanship__desc">
          Ogni calice Cristalmad nasce dalle mani esperte dei nostri maestri vetrai.
          Una tradizione che si tramanda da generazioni, dove il fuoco incontra la creatività
          e il cristallo prende forma in opere uniche e irripetibili.
        </p>
        <p class="craftsmanship__desc">
          Utilizziamo solo cristallo di altissima qualità, lavorato a bocca con tecniche
          antiche e innovazione costante. Il risultato è una trasparenza pura, una brillantezza
          senza pari e una resistenza che sfida il tempo.
        </p>
        <div class="craftsmanship__stats">
          <div class="stat">
            <span class="stat__number">40+</span>
            <span class="stat__label">Anni di Esperienza</span>
          </div>
          <div class="stat">
            <span class="stat__number">200+</span>
            <span class="stat__label">Modelli Unici</span>
          </div>
          <div class="stat">
            <span class="stat__number">100%</span>
            <span class="stat__label">Fatto a Mano</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════ B2B SECTION ═══════════ -->
  <section class="b2b" id="b2b-section">
    <div class="container">
      <div class="b2b__inner">
        <div class="b2b__text animate-on-scroll">
          <p class="section-eyebrow">Per Professionisti</p>
          <h2 class="section-title">Partnership B2B</h2>
          <p class="b2b__desc">
            Sei un ristorante, hotel, bar o rivenditore? Accedi alla nostra area riservata
            per visualizzare i listini prezzi dedicati, scaricare i cataloghi e gestire i
            tuoi ordini all'ingrosso. Condizioni speciali per volumi importanti.
          </p>
          <ul class="b2b__benefits">
            <li><span class="b2b__icon">◆</span> Listini prezzi riservati e personalizzati</li>
            <li><span class="b2b__icon">◆</span> Catalogo completo scaricabile in PDF</li>
            <li><span class="b2b__icon">◆</span> Spedizioni dedicate e packaging premium</li>
            <li><span class="b2b__icon">◆</span> Consulenza personalizzata per il tuo locale</li>
          </ul>
        </div>
        <div class="b2b__form-wrap animate-on-scroll" data-delay="200">
          <div class="glass-panel">
            <h3 class="b2b__form-title">Richiedi Accesso B2B</h3>
            <form class="b2b__form" id="b2b-form">
              <div class="form-group">
                <label for="b2b-company">Azienda</label>
                <input type="text" id="b2b-company" placeholder="Nome azienda" required />
              </div>
              <div class="form-group">
                <label for="b2b-name">Referente</label>
                <input type="text" id="b2b-name" placeholder="Nome e cognome" required />
              </div>
              <div class="form-group">
                <label for="b2b-email">Email</label>
                <input type="email" id="b2b-email" placeholder="email@azienda.com" required />
              </div>
              <div class="form-group">
                <label for="b2b-phone">Telefono</label>
                <input type="tel" id="b2b-phone" placeholder="+39 ..." />
              </div>
              <div class="form-group">
                <label for="b2b-message">Messaggio</label>
                <textarea id="b2b-message" rows="3" placeholder="Descrivi le tue esigenze..."></textarea>
              </div>
              <button type="submit" class="btn btn--primary btn--full">Invia Richiesta</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════ FOOTER ═══════════ -->
  <footer class="footer" id="contatti">
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          <span class="nav__logo-text">CRISTALMAD</span>
          <span class="nav__logo-sub">italian design</span>
          <p class="footer__brand-desc" style="line-height: 1.6;">
            Cristalmad S.r.l. – Fondamenta dei Vetrai 42, 30141 Murano (VE), Italia.<br>
            P.IVA: 04328900271 | Capitale Sociale: € 100.000 i.v. | REA: VE-428911.<br>
            Eccellenza Artigiana dal 1980.
          </p>
        </div>
        <div class="footer__col">
          <h4>Navigazione</h4>
          <ul>
            <li><a href="#/" data-link>Home</a></li>
            <li><a href="#/catalogo" data-link>Collezioni</a></li>
            <li><a href="#/chi-siamo" data-link>Chi Siamo</a></li>
            <li><a href="#/atelier" data-link>L'Atelier</a></li>
            <li><a href="#/login" data-link>Area B2B</a></li>
          </ul>
        </div>
        <div class="footer__col">
          <h4>Supporto</h4>
          <ul>
            <li><a href="#/contatti" data-link>Contattaci</a></li>
            <li><a href="#/spedizioni" data-link>Spedizioni e Resi</a></li>
            <li><a href="#/faq" data-link>FAQ</a></li>
          </ul>
        </div>
        <div class="footer__col">
          <h4>Legale</h4>
          <ul>
            <li><a href="#/privacy" data-link>Privacy Policy</a></li>
            <li><a href="#/privacy" data-link>Cookie Policy</a></li>
            <li><a href="#/termini" data-link>Termini e Condizioni</a></li>
          </ul>
        </div>
      </div>
      <div class="footer__bottom">
        <p>&copy; 2026 Cristalmad S.r.l. — Tutti i diritti riservati.</p>
        <p>Eccellenza Artigiana dal 1980 — Made with ♥ in Italy</p>
      </div>
    </div>
  </footer>
  `;
}
