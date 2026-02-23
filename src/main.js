/* ════════════════════════════════════════════════════════════════
   CRISTALMAD — Dynamic Glass Effects & Interactions + Router
   ════════════════════════════════════════════════════════════════ */

import "./style.css";
import { initRouter, setAfterRenderHook } from "./router.js";
import { processPayment } from "./lib/stripe.js";
import { searchProducts } from "./lib/algolia.js";

// ─── Dynamic product registry for modal (populated by views) ───
// Maps product id/slug → product data
const productRegistry = new Map();

/**
 * Register products fetched from Supabase (or fallback) for the modal.
 * Called by homeView() and catalogoView() after data fetch.
 * @param {Array} products — array of product objects from Supabase
 */
export function registerProducts(products) {
  for (const p of products) {
    const entry = {
      name: p.nome,
      category: p.categorie?.nome || "",
      desc: p.descrizione || "",
      img: p.immagine_url || "",
      pack: p.confezione || "1 pezzo",
      price: p.prezzo_b2c ? `€${Number(p.prezzo_b2c).toFixed(2)}` : "",
    };
    // Register by both id and slug for flexible lookup
    if (p.id) productRegistry.set(String(p.id), entry);
    if (p.slug) productRegistry.set(p.slug, entry);
  }
}

// ═══════════════════════════════════════════════════════════════
// 1. SCROLL ANIMATIONS (IntersectionObserver)
// ═══════════════════════════════════════════════════════════════
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay || "0", 10);
          setTimeout(() => {
            entry.target.classList.add("visible");
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
  );

  document.querySelectorAll(".animate-on-scroll").forEach((el) => {
    observer.observe(el);
  });
}

// ═══════════════════════════════════════════════════════════════
// 2. UNIFIED SCROLL EFFECTS (Nav + Parallax)
// ═══════════════════════════════════════════════════════════════
function initScrollEffects() {
  const nav = document.getElementById("main-nav");
  let ticking = false;

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const windowH = window.innerHeight;

        // Nav scroll
        if (nav) {
          if (scrollY > 80) nav.classList.add("nav--scrolled");
          else nav.classList.remove("nav--scrolled");
        }

        // Hero parallax
        const heroImg = document.querySelector(".hero__img");
        if (heroImg && scrollY < windowH) {
          heroImg.style.transform = `scale(1.1) translateY(${scrollY * 0.4}px)`;
        }

        // Craftsmanship parallax
        const craftsmanshipParallax = document.getElementById(
          "craftsmanship-parallax",
        );
        if (craftsmanshipParallax) {
          const section = craftsmanshipParallax.closest(".craftsmanship");
          if (section) {
            const rect = section.getBoundingClientRect();
            if (rect.top < windowH && rect.bottom > 0) {
              const progress = (windowH - rect.top) / (windowH + rect.height);
              craftsmanshipParallax.style.transform = `translateY(${(progress - 0.5) * 80}px)`;
            }
          }
        }
        ticking = false;
      });
      ticking = true;
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// 3. CURSOR GLOW EFFECT ON PRODUCT CARDS (Event Delegation)
// ═══════════════════════════════════════════════════════════════
function initCursorGlow() {
  document.addEventListener("mousemove", (e) => {
    const card = e.target.closest(".product-card");
    if (!card) return;
    const glow = card.querySelector(".product-card__glow");
    if (!glow) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    glow.style.background = `radial-gradient(
      350px circle at ${x}px ${y}px,
      rgba(201, 168, 76, 0.12),
      rgba(168, 197, 226, 0.06) 40%,
      transparent 70%
    )`;
  });

  document.addEventListener(
    "mouseleave",
    (e) => {
      const card = e.target.closest && e.target.closest(".product-card");
      if (card) {
        const glow = card.querySelector(".product-card__glow");
        if (glow) glow.style.background = "none";
      }
    },
    true,
  );
}

// ═══════════════════════════════════════════════════════════════
// 5. MOBILE HAMBURGER MENU
// ═══════════════════════════════════════════════════════════════
function initMobileMenu() {
  const hamburger = document.getElementById("hamburger-btn");
  const navLinks = document.getElementById("nav-links");
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("open");
    document.body.style.overflow = navLinks.classList.contains("open")
      ? "hidden"
      : "";
  });

  // Close on link click
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navLinks.classList.remove("open");
      document.body.style.overflow = "";
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// 6. SMOOTH SCROLL + SECTION LINKS
// ═══════════════════════════════════════════════════════════════
function initSmoothScroll() {
  document.addEventListener("click", (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const href = anchor.getAttribute("href");
    // Skip router links (hash routes starting with #/)
    if (!href || href === "#" || href.startsWith("#/")) return;

    e.preventDefault();

    // If we're on a section link and NOT on the home page, navigate home first
    const currentRoute = window.location.hash.slice(1) || "/";
    if (currentRoute !== "/") {
      // Navigate to home, then scroll after render
      window.location.hash = "#/";
      // Wait for the async view to render, then scroll
      setTimeout(() => {
        scrollToElement(href);
      }, 400);
    } else {
      scrollToElement(href);
    }
  });
}

function scrollToElement(selector) {
  const target = document.querySelector(selector);
  if (target) {
    const offset =
      parseInt(
        getComputedStyle(document.documentElement).getPropertyValue("--nav-h"),
        10,
      ) || 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

// ═══════════════════════════════════════════════════════════════
// 7. PRODUCT MODAL
// ═══════════════════════════════════════════════════════════════
function initModal() {
  const modal = document.getElementById("product-modal");
  const modalBackdrop = document.getElementById("modal-backdrop");
  const modalCloseBtn = document.getElementById("modal-close");
  if (!modal || !modalBackdrop || !modalCloseBtn) return;

  const modalImg = document.getElementById("modal-img");
  const modalName = document.getElementById("modal-name");
  const modalCategory = document.getElementById("modal-category");
  const modalDesc = document.getElementById("modal-desc");
  const modalPack = document.getElementById("modal-pack");

  // Use event delegation for dynamically rendered quick-view buttons
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".product-card__quick-view");
    if (!btn) return;

    e.stopPropagation();
    // Look up by UUID (data-product-id) or slug (data-product-slug)
    const productId = btn.dataset.productId;
    const productSlug = btn.dataset.productSlug;
    const data =
      productRegistry.get(productId) || productRegistry.get(productSlug);
    if (!data) return;

    modalImg.src = data.img;
    modalImg.alt = data.name;
    modalName.textContent = data.name;
    modalCategory.textContent = data.category;
    modalDesc.textContent = data.desc;
    modalPack.textContent = data.pack;

    // Show price if available, hide CTA; otherwise show CTA
    const priceRow = document.getElementById("modal-price-row");
    const modalPrice = document.getElementById("modal-price");
    const modalPriceUnit = document.getElementById("modal-price-unit");
    const modalCta = document.getElementById("modal-cta");
    const modalBuyBtn = document.getElementById("modal-buy-btn");

    if (data.price && priceRow && modalPrice) {
      modalPrice.textContent = data.price;
      modalPriceUnit.textContent = `/ ${data.pack}`;
      priceRow.style.display = "flex";
      if (modalCta) modalCta.style.display = "none";

      // Attach stripe payment to modal buy button
      if (modalBuyBtn) {
        // Clear previous event listeners by cloning
        const newBtn = modalBuyBtn.cloneNode(true);
        modalBuyBtn.parentNode.replaceChild(newBtn, modalBuyBtn);
        newBtn.addEventListener("click", () => {
          const originalText = newBtn.textContent;
          newBtn.textContent = "Caricamento...";
          newBtn.disabled = true;
          // We use productId or slug depending on what we have in the registry
          processPayment(productId || productSlug, 1).finally(() => {
            newBtn.textContent = originalText;
            newBtn.disabled = false;
          });
        });
      }
    } else {
      if (priceRow) priceRow.style.display = "none";
      if (modalCta) modalCta.style.display = "";
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  });

  // Close
  const closeModal = () => {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  };

  modalCloseBtn.addEventListener("click", closeModal);
  modalBackdrop.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// 8. B2B FORM HANDLER (uses event delegation for dynamic forms)
// ═══════════════════════════════════════════════════════════════
function initForm() {
  document.addEventListener("submit", (e) => {
    if (!e.target.matches("#b2b-form")) return;
    e.preventDefault();

    const form = e.target;
    // Collect form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Show success feedback
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = "✓ Richiesta Inviata!";
    btn.style.background = "linear-gradient(135deg, #2ecc71, #27ae60)";
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = "";
      btn.disabled = false;
      form.reset();
    }, 3000);
  });
}

// ═══════════════════════════════════════════════════════════════
// 9. CATEGORY CARD TILT EFFECT (event delegation)
// ═══════════════════════════════════════════════════════════════
function initCardTilt() {
  document.addEventListener("mousemove", (e) => {
    const card = e.target.closest(".category-card");
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const rotateX = (y - 0.5) * -8;
    const rotateY = (x - 0.5) * 8;

    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
  });

  document.addEventListener(
    "mouseleave",
    (e) => {
      if (e.target.closest && e.target.closest(".category-card")) {
        e.target.closest(".category-card").style.transform = "";
      }
    },
    true,
  );
}

// ═══════════════════════════════════════════════════════════════
// 10. ALGOLIA INSTANT SEARCH
// ═══════════════════════════════════════════════════════════════
function initSearch() {
  const searchInput = document.getElementById("global-search");
  const searchDropdown = document.getElementById("search-results-dropdown");
  if (!searchInput || !searchDropdown) return;

  let debounceTimer;

  searchInput.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    const query = e.target.value.trim();

    if (query.length < 2) {
      searchDropdown.style.display = "none";
      return;
    }

    debounceTimer = setTimeout(async () => {
      const results = await searchProducts(query);

      if (results.length === 0) {
        searchDropdown.innerHTML =
          '<div class="nav__search-empty">Nessun prodotto trovato.</div>';
      } else {
        searchDropdown.innerHTML = results
          .map(
            (hit) => `
          <a href="#/prodotto/${hit.slug}" class="nav__search-item" data-link>
            <img src="${hit.immagine_url || hit.images?.[0]?.url || "/placeholder.png"}" alt="${hit.name || hit.nome || ""}">
            <div class="nav__search-item-info">
              <strong>${hit.name || hit.nome}</strong>
              <small>${hit.category || hit.categorie?.nome || "Prodotto"}</small>
            </div>
          </a>
        `,
          )
          .join("");
      }
      searchDropdown.style.display = "flex";
    }, 300);
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav__search")) {
      searchDropdown.style.display = "none";
    }
  });

  searchInput.addEventListener("focus", () => {
    if (searchInput.value.trim().length >= 2) {
      searchDropdown.style.display = "flex";
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// VIEW-SPECIFIC EFFECTS (re-init after each view render)
// ═══════════════════════════════════════════════════════════════
function initViewEffects() {
  initScrollAnimations();
}

// ═══════════════════════════════════════════════════════════════
// 10. COOKIE CONSENT BANNER
// ═══════════════════════════════════════════════════════════════
function initCookieBanner() {
  const consent = localStorage.getItem("cookie-consent");
  if (consent) return; // Already set

  const banner = document.getElementById("cookie-banner");
  if (!banner) return;

  // Show after a short delay
  setTimeout(() => {
    banner.style.display = "block";
  }, 1500);

  document.getElementById("cookie-accept")?.addEventListener("click", () => {
    localStorage.setItem("cookie-consent", "accepted");
    banner.style.display = "none";
  });

  document.getElementById("cookie-reject")?.addEventListener("click", () => {
    localStorage.setItem("cookie-consent", "rejected");
    banner.style.display = "none";
  });
}

// ═══════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  // Global effects (run once, use event delegation)
  initScrollEffects();
  initCursorGlow();
  initMobileMenu();
  initSmoothScroll();
  initModal();
  initForm();
  initCardTilt();
  initCookieBanner();
  initSearch();

  // Set the after-render hook for the router
  setAfterRenderHook(initViewEffects);

  // Start the router
  initRouter();
});
