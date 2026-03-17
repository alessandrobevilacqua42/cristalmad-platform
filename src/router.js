/* ════════════════════════════════════════════════════════════════
   ROUTER — Lightweight hash-based SPA router for Cristalmad
   Supports async view functions and dynamic route params
   ════════════════════════════════════════════════════════════════ */

import { homeView } from "./views/home.js";
import { catalogoView, initCatalogFilters } from "./views/catalogo.js";
import { loginView, initLoginForm } from "./views/login.js";
import { areaRiservataView, initDashboard } from "./views/area-riservata.js";
import { chiSiamoView } from "./views/chi-siamo.js";
import { atelierView } from "./views/atelier.js";
import { contattiView, initContactForm } from "./views/contatti.js";
import { prodottoView, initProdotto } from "./views/prodotto.js";
import { privacyView } from "./views/privacy.js";
import { terminiView } from "./views/termini.js";
import { faqView } from "./views/faq.js";
import { spedizioniView } from "./views/spedizioni.js";
import { conciergeView, initConcierge } from "./views/concierge.js";
import { outletView } from "./views/outlet.js";
import { updateNavAuth } from "./lib/auth.js";

// ─── Route definitions ───
const routes = [
  {
    path: "/",
    view: homeView,
    title: "Cristalmad — Cristalleria Artigianale Italiana",
  },
  {
    path: "/catalogo",
    view: catalogoView,
    title: "Catalogo — Cristalmad",
    afterRender: initCatalogFilters,
  },
  { path: "/outlet", view: outletView, title: "Outlet — Cristalmad" },
  { path: "/chi-siamo", view: chiSiamoView, title: "Chi Siamo — Cristalmad" },
  { path: "/atelier", view: atelierView, title: "L'Atelier — Cristalmad" },
  {
    path: "/contatti",
    view: contattiView,
    title: "Contatti — Cristalmad",
    afterRender: initContactForm,
  },
  {
    path: "/login",
    view: loginView,
    title: "Login B2B — Cristalmad",
    afterRender: initLoginForm,
  },
  {
    path: "/area-riservata",
    view: areaRiservataView,
    title: "Area Riservata — Cristalmad",
    afterRender: initDashboard,
  },
  { path: "/privacy", view: privacyView, title: "Privacy Policy — Cristalmad" },
  { path: "/termini", view: terminiView, title: "Termini e Condizioni — Cristalmad" },
  { path: "/faq", view: faqView, title: "FAQ — Cristalmad" },
  { path: "/spedizioni", view: spedizioniView, title: "Spedizioni e Resi — Cristalmad" },
  {
    path: "/concierge",
    view: conciergeView,
    title: "Concierge AI — Cristalmad",
    afterRender: initConcierge,
  },
  // Dynamic routes below (matched last)
  {
    path: "/prodotto/:slug",
    view: prodottoView,
    title: "Prodotto — Cristalmad",
    afterRender: initProdotto,
  },
];

// ─── Callback called after every view render ───
let onAfterRender = null;

export function setAfterRenderHook(callback) {
  onAfterRender = callback;
}

/**
 * Parse the current hash into a route path.
 */
function getRoutePath() {
  const hash = window.location.hash.slice(1) || "/";
  // Remove any OAuth search/fragment parts (e.g. #/login#access_token=...)
  // Supabase often appends parameters after the hash.
  return hash.split("#")[0].split("?")[0];
}

/**
 * Match a path against route definitions. Supports :param patterns.
 * Returns { route, params } or null.
 */
function matchRoute(path) {
  for (const route of routes) {
    // Check for dynamic segments
    if (route.path.includes(":")) {
      const routeParts = route.path.split("/");
      const pathParts = path.split("/");
      if (routeParts.length !== pathParts.length) continue;

      const params = {};
      let matched = true;
      for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(":")) {
          params[routeParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
        } else if (routeParts[i] !== pathParts[i]) {
          matched = false;
          break;
        }
      }
      if (matched) return { route, params };
    } else if (route.path === path) {
      return { route, params: {} };
    }
  }
  return null;
}

export function navigate(path) {
  window.location.hash = "#" + path;
}

function updateActiveNav(path) {
  document.querySelectorAll(".nav__links a[data-link]").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === "#" + path || (path === "/" && href === "#/")) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

// ─── Loading skeleton ───
const LOADING_SKELETON = `
  <div class="loading-skeleton" style="
    min-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: var(--nav-h);
  ">
    <div style="text-align: center;">
      <div class="loading-spinner" style="
        width: 40px; height: 40px;
        border: 2px solid var(--c-glass-border);
        border-top-color: var(--c-gold);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin: 0 auto var(--s-md);
      "></div>
      <p style="
        font-family: var(--f-body);
        font-size: 0.75rem;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: var(--c-text-muted);
      ">Caricamento...</p>
    </div>
  </div>
  <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
`;

/**
 * Render the current route into the #app container.
 */
async function renderRoute() {
  const path = getRoutePath();
  const match = matchRoute(path) || matchRoute("/");
  const appContainer = document.getElementById("app");

  if (!appContainer || !match) return;

  const { route, params } = match;

  // 1. Fade out current content
  appContainer.classList.add("page-transition");
  appContainer.classList.remove("page-transition-active");
  await new Promise((resolve) => setTimeout(resolve, 300));

  // 2. Update UI with Skeleton
  document.title = route.title;
  updateActiveNav(path);
  appContainer.innerHTML = LOADING_SKELETON;
  window.scrollTo({ top: 0, behavior: "instant" });

  // Fade in skeleton
  appContainer.classList.add("page-transition-active");

  try {
    // 3. Fetch view
    const hasParams = Object.keys(params).length > 0;
    const html = hasParams
      ? await route.view(params.slug || Object.values(params)[0])
      : await route.view();

    // 4. Fade out skeleton slightly
    appContainer.classList.remove("page-transition-active");
    await new Promise((resolve) => setTimeout(resolve, 200));

    // 5. Inject actual HTML and fade in
    appContainer.innerHTML = html;

    // Yield to the browser to paint before fading in
    requestAnimationFrame(() => {
      appContainer.classList.add("page-transition-active");
    });
  } catch (err) {
    console.error("[Router] View render error:", err);
    appContainer.innerHTML = `
      <div style="min-height: 80vh; display: flex; align-items: center; justify-content: center; padding-top: var(--nav-h);">
        <p style="color: var(--c-text-muted);">Errore nel caricamento della pagina.</p>
      </div>`;
    requestAnimationFrame(() => appContainer.classList.add("page-transition-active"));
  }

  // Run hooks
  if (onAfterRender) onAfterRender();
  if (route.afterRender) route.afterRender();

  // Update nav auth state
  updateNavAuth();
}

export function initRouter() {
  window.addEventListener("hashchange", renderRoute);

  if (!window.location.hash || window.location.hash === "#") {
    window.location.hash = "#/";
  } else {
    renderRoute();
  }
}
