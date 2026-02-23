/* ════════════════════════════════════════════════════════════════
   PRODOTTO VIEW — Immersive product detail with 3D gallery,
   craftsmanship steps, set configurator, social proof, and quote
   ════════════════════════════════════════════════════════════════ */

import { supabase } from "../lib/supabase.js";
import { processPayment } from "../lib/stripe.js";

// ─── Mock product data for offline ───
const MOCK_PRODUCT = {
  nome: "Calice Oriente",
  slug: "calice-oriente-liquore",
  descrizione:
    "Eleganza orientale per liquori e distillati pregiati. Ogni pezzo è soffiato a mano con cristallo di altissima purezza, creando rifrazioni di luce uniche.",
  immagine_url: "/images/product_calice_1.png",
  prezzo_b2c: 48.0,
  prezzo_b2b: 33.6,
  confezione: "6 pezzi",
  disponibilita: "Disponibile",
  categoria_id: 1,
  categorie: { nome: "Calici", slug: "calici" },
  model_3d_url: "https://modelviewer.dev/shared-assets/models/reflective-sphere.gltf", // Test 3D model
};

const CONFIGURATOR_PRODUCTS = [
  { tipo: "Calice", prezzo: 48.0, img: "/images/product_calice_1.png" },
  { tipo: "Coppa", prezzo: 42.0, img: "/images/product_coppa.png" },
  { tipo: "Bicchiere", prezzo: 38.0, img: "/images/product_bicchiere.png" },
  { tipo: "Caraffa", prezzo: 65.0, img: "/images/product_caraffa.png" },
  { tipo: "Vaso", prezzo: 120.0, img: "/images/product_vaso.png" },
];

// ─── Fetch single product by slug ───
async function fetchProduct(slug) {
  try {
    const { data, error } = await supabase
      .from("prodotti")
      .select("*, categorie(nome, slug)")
      .eq("slug", slug)
      .single();
    if (error) throw error;
    return data;
  } catch {
    console.warn("[Prodotto] Fetch failed, using mock for slug:", slug);
    return { ...MOCK_PRODUCT, slug };
  }
}

// ─── Fetch related products (same category) ───
async function fetchRelated(categoriaId, excludeSlug) {
  try {
    const { data, error } = await supabase
      .from("prodotti")
      .select("*, categorie(nome, slug)")
      .eq("categoria_id", categoriaId)
      .neq("slug", excludeSlug)
      .limit(3);
    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

function renderRelatedCard(product) {
  const price = product.prezzo_b2c
    ? `€${Number(product.prezzo_b2c).toFixed(2)}`
    : "";
  return `
    <a href="#/prodotto/${product.slug}" class="related-card glass-panel animate-on-scroll" data-link>
      <div class="related-card__img">
        <img src="${product.immagine_url}" alt="${product.nome}" loading="lazy" />
      </div>
      <div class="related-card__info">
        <h4>${product.nome}</h4>
        ${price ? `<span class="product-card__price">${price}</span>` : ""}
      </div>
    </a>`;
}

function renderConfigOption(item, i) {
  return `<option value="${i}" data-price="${item.prezzo}" data-img="${item.img}">${item.tipo} — €${item.prezzo.toFixed(2)}/conf.</option>`;
}

// ════════════════════════════════════════════════════════════════
// VIEW (async, receives slug from router)
// ════════════════════════════════════════════════════════════════
export async function prodottoView(slug) {
  if (!slug) {
    return `<section class="page-hero"><div class="container"><h1 class="section-title">Prodotto non trovato</h1><a href="#/catalogo" class="btn btn--glass" data-link>← Torna al Catalogo</a></div></section>`;
  }

  const product = await fetchProduct(slug);

  if (!product) {
    return `
    <section class="page-hero">
      <div class="container">
        <h1 class="section-title animate-on-scroll">Prodotto non trovato</h1>
        <p class="page-hero__subtitle animate-on-scroll">Il prodotto richiesto non è disponibile.</p>
        <a href="#/catalogo" class="btn btn--glass" data-link style="margin-top: var(--s-xl); display: inline-block;">← Torna al Catalogo</a>
      </div>
    </section>`;
  }

  const price = product.prezzo_b2c
    ? `€${Number(product.prezzo_b2c).toFixed(2)}`
    : null;
  const catName = product.categorie?.nome || "";
  const stockLeft = Math.floor(Math.random() * 10) + 3;

  // Fetch related products
  const related = product.categoria_id
    ? await fetchRelated(product.categoria_id, product.slug)
    : [];

  const relatedHTML =
    related.length > 0
      ? `
    <section class="product-related">
      <div class="container">
        <div class="section-header animate-on-scroll">
          <p class="section-eyebrow">Dalla Stessa Collezione</p>
          <h2 class="section-title">Prodotti Correlati</h2>
        </div>
        <div class="related__grid">
          ${related.map((p) => renderRelatedCard(p)).join("")}
        </div>
      </div>
    </section>`
      : "";

  const configOptions = CONFIGURATOR_PRODUCTS.map((p, i) =>
    renderConfigOption(p, i),
  ).join("");

  const visualMediaHTML = product.model_3d_url
    ? `
            <div class="gallery-3d__scene" style="display: flex; justify-content: center; align-items: center; height: 100%;">
              <model-viewer
                src="${product.model_3d_url}"
                ios-src=""
                alt="Modello 3D di ${product.nome}"
                camera-controls
                auto-rotate
                rotation-per-second="30deg"
                ar
                ar-modes="webxr scene-viewer quick-look"
                environment-image="neutral"
                shadow-intensity="1"
                shadow-softness="0.5"
                style="width: 100%; height: 100%; background: transparent; --poster-color: transparent;"
              >
              </model-viewer>
              <div class="gallery-3d__glow" id="gallery-3d-glow"></div>
              <div class="gallery-3d__reflection"></div>
            </div>
            <div class="gallery-3d__hint" id="gallery-3d-hint">
              <span>↔</span> Trascina per esplorare
            </div>`
    : `
            <div class="gallery-3d__scene" style="display: flex; justify-content: center; align-items: center; height: 100%;">
              <div class="gallery-3d__product" id="gallery-3d-product" style="height: 100%; display: flex; align-items: center;">
                <img src="${product.immagine_url}" alt="${product.nome}" draggable="false" style="max-height: 100%; max-width: 100%; object-fit: contain;" />
              </div>
              <div class="gallery-3d__glow" id="gallery-3d-glow"></div>
              <div class="gallery-3d__reflection"></div>
            </div>`;

  return `
  <!-- PRODUCT HERO with IMMERSIVE GALLERY -->
  <section class="product-detail">
    <div class="container">
      <a href="#/catalogo" class="catalog-back-link animate-on-scroll" data-link>← Torna al Catalogo</a>
      <div class="product-detail__grid">
        <div class="product-detail__image animate-on-scroll">

          <!-- 3D IMMERSIVE GALLERY OR FALLBACK IMAGE -->
          <div class="gallery-3d" id="gallery-3d">
            ${visualMediaHTML}
          </div>

          <!-- URGENCY BADGE -->
          <div class="urgency-badge animate-on-scroll" data-delay="200">
            <span class="urgency-badge__icon">✦</span>
            <div class="urgency-badge__text">
              <strong>Fatto a Mano — Pezzi Limitati</strong>
              <span>Solo <em class="urgency-badge__count">${stockLeft}</em> disponibili</span>
            </div>
          </div>
        </div>
        <div class="product-detail__info animate-on-scroll" data-delay="100">
          <span class="product-card__category">${catName}</span>
          <h1 style="font-family: var(--f-heading); font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 300; margin: var(--s-sm) 0 var(--s-lg);">${product.nome}</h1>
          <p style="color: var(--c-text-secondary); line-height: 1.8; margin-bottom: var(--s-xl);">${product.descrizione}</p>

          ${price
      ? `
          <div class="product-detail__price">
            <span class="product-card__price" style="font-size: 1.8rem;">${price}</span>
            <span class="product-card__price-unit" style="font-size: 0.85rem;">/ ${product.confezione}</span>
          </div>
          <button id="product-buy-b2b" class="btn btn--primary" data-product-id="${product.id || product.slug}" style="margin-top: var(--s-md); margin-bottom: var(--s-md);">Acquista Subito</button>
          `
      : `
          <a href="#/login" class="btn btn--sm btn--glass" data-link>Accedi per i prezzi B2B</a>`
    }

          <div class="product-detail__specs">
            <div class="product-detail__spec">
              <strong>Materiale</strong>
              <span>Cristallo soffiato a mano</span>
            </div>
            <div class="product-detail__spec">
              <strong>Confezione</strong>
              <span>${product.confezione}</span>
            </div>
            <div class="product-detail__spec">
              <strong>Disponibilità</strong>
              <span>${product.disponibilita || "Su ordinazione"}</span>
            </div>
            <div class="product-detail__spec">
              <strong>Collezione</strong>
              <span>${catName}</span>
            </div>
          </div>

          <div style="display: flex; gap: var(--s-md); flex-wrap: wrap; margin-top: var(--s-xl);">
            <a href="#/contatti" class="btn btn--primary" data-link>Richiedi Informazioni</a>
            <a href="#/catalogo" class="btn btn--glass" data-link>Continua a Esplorare</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CRAFTSMANSHIP DETAILS -->
  <section class="craft-steps">
    <div class="container">
      <div class="section-header animate-on-scroll">
        <p class="section-eyebrow">L'Arte Dietro Ogni Pezzo</p>
        <h2 class="section-title">Dettagli Artigianali</h2>
      </div>
      <div class="craft-steps__grid">
        <div class="craft-step glass-panel animate-on-scroll" data-delay="0">
          <div class="craft-step__number">01</div>
          <div class="craft-step__icon">🔥</div>
          <h3 class="craft-step__title">Fusione</h3>
          <p class="craft-step__desc">Il cristallo viene fuso a 1400°C in forni tradizionali. La miscela di silice, piombo e minerali crea la trasparenza perfetta.</p>
        </div>
        <div class="craft-step glass-panel animate-on-scroll" data-delay="100">
          <div class="craft-step__number">02</div>
          <div class="craft-step__icon">💨</div>
          <h3 class="craft-step__title">Soffiatura</h3>
          <p class="craft-step__desc">Il maestro vetraio soffia attraverso la canna, modellando il cristallo incandescente con movimenti precisi e millenari.</p>
        </div>
        <div class="craft-step glass-panel animate-on-scroll" data-delay="200">
          <div class="craft-step__number">03</div>
          <div class="craft-step__icon">✂️</div>
          <h3 class="craft-step__title">Rifinitura</h3>
          <p class="craft-step__desc">Taglio, molatura e lucidatura a mano. Ogni bordo viene rifinito con precisione millimetrica per un comfort perfetto.</p>
        </div>
        <div class="craft-step glass-panel animate-on-scroll" data-delay="300">
          <div class="craft-step__number">04</div>
          <div class="craft-step__icon">✨</div>
          <h3 class="craft-step__title">Controllo Qualità</h3>
          <p class="craft-step__desc">Ogni pezzo viene ispezionato alla luce per verificare trasparenza, simmetria e assenza di imperfezioni. Solo i migliori superano il test.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- SET CONFIGURATOR -->
  <section class="configurator-section">
    <div class="container">
      <div class="configurator glass-panel animate-on-scroll">
        <div class="configurator__header">
          <p class="section-eyebrow">Crea il Tuo Set</p>
          <h2 class="configurator__title">Configuratore Personalizzato</h2>
          <p class="configurator__subtitle">Scegli il tipo, la quantità e l'incisione. Il prezzo si aggiorna in tempo reale.</p>
        </div>
        <div class="configurator__body">
          <div class="configurator__preview" id="config-preview">
            <img src="${CONFIGURATOR_PRODUCTS[0].img}" alt="Anteprima" id="config-preview-img" />
            <div class="configurator__preview-glow"></div>
          </div>
          <div class="configurator__form">
            <div class="configurator__field">
              <label for="config-tipo">Tipo di Prodotto</label>
              <select id="config-tipo">
                ${configOptions}
              </select>
            </div>
            <div class="configurator__field">
              <label for="config-qty">Quantità (confezioni)</label>
              <div class="configurator__qty-control">
                <button class="configurator__qty-btn" id="config-qty-minus" type="button">−</button>
                <input type="number" id="config-qty" value="1" min="1" max="99" />
                <button class="configurator__qty-btn" id="config-qty-plus" type="button">+</button>
              </div>
            </div>
            <div class="configurator__field">
              <label for="config-incisione">Incisione Personalizzata <span style="color: var(--c-text-muted);">(opzionale)</span></label>
              <input type="text" id="config-incisione" placeholder="es. Ristorante Da Mario" maxlength="30" />
              <span class="configurator__char-count"><span id="config-chars">0</span>/30</span>
            </div>
            <div class="configurator__summary" id="config-summary">
              <div class="configurator__summary-row">
                <span>Prodotto</span>
                <strong id="config-summary-tipo">Calice</strong>
              </div>
              <div class="configurator__summary-row">
                <span>Quantità</span>
                <strong id="config-summary-qty">1 conf.</strong>
              </div>
              <div class="configurator__summary-row" id="config-incisione-row" style="display: none;">
                <span>Incisione</span>
                <strong id="config-summary-incisione">—</strong>
              </div>
              <div class="configurator__summary-row configurator__summary-total">
                <span>Totale stimato</span>
                <strong id="config-summary-total">€48.00</strong>
              </div>
            </div>
            <button class="btn btn--primary btn--full" id="config-submit-btn">Richiedi Questo Set</button>
          </div>
        </div>
        <div id="config-success" class="quote-form__success" style="display: none;">
          <span class="quote-form__success-icon">✓</span>
          <h3>Configurazione Inviata!</h3>
          <p>Il nostro team ti contatterà entro 24 ore con un preventivo dettagliato.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- SOCIAL PROOF -->
  <section class="social-proof animate-on-scroll">
    <div class="container">
      <p class="social-proof__eyebrow">Scelto da oltre 50 strutture ricettive in Italia</p>
      <div class="social-proof__logos">
        <div class="social-proof__logo glass-panel">
          <span class="social-proof__logo-icon">★</span>
          <span>Grand Hotel<br><small>Milano</small></span>
        </div>
        <div class="social-proof__logo glass-panel">
          <span class="social-proof__logo-icon">★</span>
          <span>Ristorante<br><small>La Pergola</small></span>
        </div>
        <div class="social-proof__logo glass-panel">
          <span class="social-proof__logo-icon">★</span>
          <span>Villa Crespi<br><small>Orta San Giulio</small></span>
        </div>
        <div class="social-proof__logo glass-panel">
          <span class="social-proof__logo-icon">★</span>
          <span>Wine Bar<br><small>Firenze</small></span>
        </div>
        <div class="social-proof__logo glass-panel">
          <span class="social-proof__logo-icon">★</span>
          <span>Boutique Hotel<br><small>Venezia</small></span>
        </div>
      </div>
    </div>
  </section>

  <!-- QUOTE REQUEST FORM -->
  <section class="quote-form-section animate-on-scroll">
    <div class="container">
      <div class="quote-form glass-panel">
        <div class="quote-form__header">
          <p class="section-eyebrow">Preventivo Rapido</p>
          <h2 class="quote-form__title">Richiedi un Preventivo per ${product.nome}</h2>
          <p class="quote-form__subtitle">Compila il modulo e riceverai un preventivo personalizzato entro 24 ore.</p>
        </div>
        <form id="quick-quote-form" class="quote-form__body">
          <div class="quote-form__row">
            <div class="quote-form__field">
              <label for="quote-qty">Quantità</label>
              <select id="quote-qty" required>
                <option value="">Seleziona...</option>
                <option value="6">6 pezzi</option>
                <option value="12">12 pezzi</option>
                <option value="24">24 pezzi</option>
                <option value="48">48 pezzi</option>
                <option value="100+">100+ pezzi</option>
              </select>
            </div>
            <div class="quote-form__field">
              <label for="quote-email">Email</label>
              <input type="email" id="quote-email" placeholder="la-tua@email.com" required />
            </div>
          </div>
          <div class="quote-form__field">
            <label for="quote-notes">Note (opzionale)</label>
            <textarea id="quote-notes" rows="3" placeholder="Incisioni personalizzate, tempi di consegna, ecc."></textarea>
          </div>
          <button type="submit" class="btn btn--primary btn--full">Invia Richiesta Preventivo</button>
        </form>
        <div id="quote-success" class="quote-form__success" style="display: none;">
          <span class="quote-form__success-icon">✓</span>
          <h3>Richiesta Inviata!</h3>
          <p>Ti risponderemo entro 24 ore con un preventivo personalizzato.</p>
        </div>
      </div>
    </div>
  </section>

  ${relatedHTML}
  `;
}

// ════════════════════════════════════════════════════════════════
// INIT — All interactive features
// ════════════════════════════════════════════════════════════════
export function initProdotto() {
  // ─── 3D Gallery — Interaction Hint & Glow ───
  const gallery = document.getElementById("gallery-3d");
  const glowEl = document.getElementById("gallery-3d-glow");
  const hintEl = document.getElementById("gallery-3d-hint");

  if (gallery) {
    if (glowEl) {
      window.addEventListener("mousemove", (e) => {
        const rect = gallery.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          glowEl.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(201, 168, 76, 0.15) 0%, rgba(168, 197, 226, 0.08) 30%, transparent 60%)`;
        }
      });
    }

    const hideHint = () => {
      if (hintEl) hintEl.style.opacity = "0";
    };
    gallery.addEventListener("mousedown", hideHint);
    gallery.addEventListener("touchstart", hideHint, { passive: true });
  }

  // ─── Set Configurator ───
  const tipoSelect = document.getElementById("config-tipo");
  const qtyInput = document.getElementById("config-qty");
  const qtyMinus = document.getElementById("config-qty-minus");
  const qtyPlus = document.getElementById("config-qty-plus");
  const incisioneInput = document.getElementById("config-incisione");
  const charsDisplay = document.getElementById("config-chars");
  const previewImg = document.getElementById("config-preview-img");
  const summaryTipo = document.getElementById("config-summary-tipo");
  const summaryQty = document.getElementById("config-summary-qty");
  const summaryIncisione = document.getElementById("config-summary-incisione");
  const incisioneRow = document.getElementById("config-incisione-row");
  const summaryTotal = document.getElementById("config-summary-total");
  const configSubmitBtn = document.getElementById("config-submit-btn");

  function updateConfigurator() {
    if (!tipoSelect) return;
    const idx = parseInt(tipoSelect.value);
    const item = CONFIGURATOR_PRODUCTS[idx];
    const qty = parseInt(qtyInput?.value) || 1;
    const incisione = incisioneInput?.value || "";
    const incisioneCost = incisione.length > 0 ? 5.0 : 0;
    const total = item.prezzo * qty + incisioneCost * qty;

    if (previewImg) previewImg.src = item.img;
    if (summaryTipo) summaryTipo.textContent = item.tipo;
    if (summaryQty) summaryQty.textContent = `${qty} conf.`;
    if (charsDisplay) charsDisplay.textContent = incisione.length;

    if (incisioneRow) {
      incisioneRow.style.display = incisione.length > 0 ? "flex" : "none";
      if (summaryIncisione)
        summaryIncisione.textContent = `"${incisione}" (+€5/conf.)`;
    }

    if (summaryTotal) summaryTotal.textContent = `€${total.toFixed(2)}`;
  }

  if (tipoSelect) tipoSelect.addEventListener("change", updateConfigurator);
  if (qtyInput) qtyInput.addEventListener("input", updateConfigurator);
  if (incisioneInput)
    incisioneInput.addEventListener("input", updateConfigurator);

  if (qtyMinus) {
    qtyMinus.addEventListener("click", () => {
      const v = parseInt(qtyInput.value) || 1;
      if (v > 1) {
        qtyInput.value = v - 1;
        updateConfigurator();
      }
    });
  }
  if (qtyPlus) {
    qtyPlus.addEventListener("click", () => {
      const v = parseInt(qtyInput.value) || 1;
      if (v < 99) {
        qtyInput.value = v + 1;
        updateConfigurator();
      }
    });
  }

  if (configSubmitBtn) {
    configSubmitBtn.addEventListener("click", async () => {
      const configBody = document.querySelector(".configurator__body");
      const configHeader = document.querySelector(".configurator__header");
      const configSuccess = document.getElementById("config-success");

      const idx = parseInt(tipoSelect?.value) || 0;
      const item = CONFIGURATOR_PRODUCTS[idx];
      const qty = parseInt(qtyInput?.value) || 1;
      const incisione = incisioneInput?.value || "";

      const originalText = configSubmitBtn.textContent;
      configSubmitBtn.disabled = true;
      configSubmitBtn.textContent = "Invio in corso...";

      try {
        const { data: { user } } = await supabase.auth.getUser();
        const userEmail = user?.email || "anonymous (no email in config)";

        const payload = {
          type: 'configurator',
          email: userEmail,
          product_name: item ? item.tipo : 'Custom Set',
          quantity: String(qty),
          notes: incisione ? `Incisione: ${incisione}` : ''
        };

        const { error } = await supabase.from('leads').insert([payload]);
        if (error) throw error;

        if (configBody) configBody.style.display = "none";
        if (configHeader) configHeader.style.display = "none";
        if (configSuccess) {
          configSuccess.style.color = "var(--c-gold)";
          configSuccess.innerHTML = '<span class="quote-form__success-icon">✓</span><h3>Richiesta ricevuta dal nostro Atelier.</h3><p>Il nostro team ti contatterà entro 24 ore con un preventivo dettagliato.</p>';
          configSuccess.style.display = "flex";
        }
      } catch (err) {
        console.error('[Configurator] Errore:', err);
        if (configSuccess) {
          configSuccess.style.color = "#e74c3c";
          configSuccess.innerHTML = '<h3>Impossibile inviare la richiesta. Riprovare.</h3>';
          configSuccess.style.display = "flex";
          if (configBody) configBody.style.display = "none";
          if (configHeader) configHeader.style.display = "none";
        }
      } finally {
        configSubmitBtn.disabled = false;
        configSubmitBtn.textContent = originalText;
      }
    });
  }

  // ─── Quote form ───
  const form = document.getElementById("quick-quote-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Invio in corso...";

      try {
        const qty = form.querySelector('#quote-qty')?.value;
        const email = form.querySelector('#quote-email')?.value;
        const notes = form.querySelector('#quote-notes')?.value;
        // Estrarre il nome prodotto dal titolo del form
        const titleEl = document.querySelector('.quote-form__title');
        const productName = titleEl ? titleEl.textContent.replace('Richiedi un Preventivo per ', '') : 'Sconosciuto';

        const payload = {
          type: 'quick_quote',
          email: email,
          product_name: productName,
          quantity: qty,
          notes: notes
        };

        const { error } = await supabase.from('leads').insert([payload]);
        if (error) throw error;

        form.style.display = "none";
        const success = document.getElementById("quote-success");
        if (success) {
          success.style.color = "var(--c-gold)";
          success.innerHTML = '<span class="quote-form__success-icon">✓</span><h3>Richiesta ricevuta dal nostro Atelier.</h3><p>Ti risponderemo entro 24 ore con un preventivo personalizzato.</p>';
          success.style.display = "flex";
        }
      } catch (err) {
        console.error('[Quick Quote] Errore:', err);
        form.style.display = "none";
        const success = document.getElementById("quote-success");
        if (success) {
          success.style.color = "#e74c3c";
          success.innerHTML = '<h3>Impossibile inviare la richiesta. Riprovare.</h3>';
          success.style.display = "flex";
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  // ─── Stripe Buy Button ───
  const buyBtn = document.getElementById("product-buy-b2b");
  if (buyBtn) {
    buyBtn.addEventListener("click", () => {
      const pid = buyBtn.dataset.productId;
      if (pid) {
        const originalText = buyBtn.textContent;
        buyBtn.textContent = "Caricamento...";
        buyBtn.disabled = true;
        processPayment(pid, 1).finally(() => {
          buyBtn.textContent = originalText;
          buyBtn.disabled = false;
        });
      }
    });
  }
}
