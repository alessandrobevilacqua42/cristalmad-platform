/* ════════════════════════════════════════════════════════════════
   LOGIN VIEW — Google + Email authentication
   ════════════════════════════════════════════════════════════════ */

import { signInWithGoogle, signInWithEmail, getUser } from "../lib/auth.js";

export function loginView() {
  return `
  <section class="login-page">
    <div class="container">
      <div class="login__wrapper">
        <div class="glass-panel login__panel animate-on-scroll">
          <div class="login__header">
            <p class="section-eyebrow">Area Riservata</p>
            <h1 style="font-family: var(--f-heading); font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 300; margin: var(--s-sm) 0 var(--s-md);">Accedi al tuo Account</h1>
            <p style="color: var(--c-text-muted); font-size: 0.85rem;">Accedi per visualizzare i prezzi B2B riservati e gestire i tuoi ordini.</p>
          </div>

          <!-- GOOGLE LOGIN -->
          <button class="btn btn--google" id="google-login-btn" type="button">
            <svg width="18" height="18" viewBox="0 0 48 48" style="margin-right: 10px;">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Accedi con Google
          </button>

          <div class="login__divider">
            <span>oppure</span>
          </div>

          <!-- EMAIL LOGIN -->
          <form class="login__form" id="login-form">
            <div class="form-group">
              <label for="login-email">Email</label>
              <input type="email" id="login-email" placeholder="email@azienda.com" required />
            </div>
            <div class="form-group">
              <label for="login-password">Password</label>
              <input type="password" id="login-password" placeholder="••••••••" required />
            </div>
            <div id="login-error" class="login__error" style="display: none;"></div>
            <button type="submit" class="btn btn--primary btn--full">Accedi con Email</button>
          </form>

          <p class="login__footer-text">
            Non hai un account? <a href="#/contatti" data-link>Contattaci per l'accesso B2B</a>
          </p>
        </div>
      </div>
    </div>
  </section>
  `;
}

export function initLoginForm() {
  // Google login (Graceful Degradation)
  const googleBtn = document.getElementById("google-login-btn");
  if (googleBtn) {
    googleBtn.addEventListener("click", (e) => {
      e.preventDefault();

      // Create toast element
      const toast = document.createElement("div");
      toast.className = "glass-panel login-toast";
      toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: rgba(8, 8, 13, 0.85);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--c-gold);
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-family: var(--f-body);
        font-size: 0.9rem;
        z-index: 9999;
        opacity: 0;
        transition: all 0.3s ease;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        pointer-events: none;
      `;
      toast.textContent =
        "Autenticazione Google in configurazione. Procedi via Email.";

      document.body.appendChild(toast);

      // Animate in
      requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateX(-50%) translateY(0)";
      });

      // Auto-destroy after 3 seconds
      setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(-50%) translateY(20px)";
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    });
  }

  // Email login
  const form = document.getElementById("login-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById("login-email");
      const passwordInput = document.getElementById("login-password");
      const errorDiv = document.getElementById("login-error");
      const btn = form.querySelector('button[type="submit"]');

      btn.disabled = true;
      btn.textContent = "Accesso in corso...";
      errorDiv.style.display = "none";

      const { data, error } = await signInWithEmail(
        emailInput.value,
        passwordInput.value,
      );

      if (error) {
        errorDiv.textContent = "Email o password non validi.";
        errorDiv.style.display = "block";
        btn.disabled = false;
        btn.textContent = "Accedi con Email";
        return;
      }

      if (data?.session) {
        window.location.hash = "#/area-riservata";
      }
    });
  }
}
