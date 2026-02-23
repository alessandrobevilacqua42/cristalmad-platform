/* ════════════════════════════════════════════════════════════════
   CONTATTI VIEW — Split-screen: Form + Mapbox Placeholder
   ════════════════════════════════════════════════════════════════ */

import mapboxgl from "mapbox-gl";
import { supabase } from "../lib/supabase.js";

export function contattiView() {
  // ...
  // (We keep contattiView untouched below)
  return `
  <section class="contatti-page" style="padding: var(--s-5xl) 0;">
    <div class="container">
      
      <div class="animate-on-scroll" style="margin-bottom: var(--s-4xl); text-align: left;">
        <p class="section-eyebrow" style="color: var(--c-gold);">Parliamo</p>
        <h1 style="font-family: var(--f-heading); font-size: clamp(2.5rem, 5vw, 4.5rem); font-weight: 300; color: var(--c-text-primary); margin-top: var(--s-sm);">
          Contattaci
        </h1>
        <p style="color: var(--c-text-secondary); max-width: 600px; margin-top: var(--s-md); font-size: 1.05rem; line-height: 1.6;">
          Hai domande sui nostri prodotti B2B, ordini su misura o vuoi prenotare una visita in fornace? Siamo a tua disposizione.
        </p>
      </div>

      <!-- Split Screen Layout -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: var(--s-4xl); align-items: start;">
        
        <!-- Sinistra: Form -->
        <div class="glass-panel animate-on-scroll" style="padding: var(--s-3xl);">
          <h2 style="font-family: var(--f-heading); font-size: 1.8rem; color: var(--c-gold-light); margin-bottom: var(--s-lg);">Inviaci una Richiesta</h2>
          
          <form id="contact-form" style="display: flex; flex-direction: column; gap: var(--s-lg);">
            
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label for="nome" style="font-size: 0.75rem; text-transform: uppercase; color: var(--c-text-muted); letter-spacing: 0.1em; font-weight: 500;">Nome</label>
              <input type="text" id="nome" required style="background: rgba(255,255,255,0.03); border: 1px solid var(--c-glass-border); padding: 1rem; border-radius: 6px; color: var(--c-text-primary); font-family: var(--f-body); outline: none; transition: border-color var(--t-fast);" onfocus="this.style.borderColor='var(--c-gold)'" onblur="this.style.borderColor='var(--c-glass-border)'" />
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label for="email" style="font-size: 0.75rem; text-transform: uppercase; color: var(--c-text-muted); letter-spacing: 0.1em; font-weight: 500;">Email</label>
              <input type="email" id="email" required style="background: rgba(255,255,255,0.03); border: 1px solid var(--c-glass-border); padding: 1rem; border-radius: 6px; color: var(--c-text-primary); font-family: var(--f-body); outline: none; transition: border-color var(--t-fast);" onfocus="this.style.borderColor='var(--c-gold)'" onblur="this.style.borderColor='var(--c-glass-border)'" />
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label for="tipo-richiesta" style="font-size: 0.75rem; text-transform: uppercase; color: var(--c-text-muted); letter-spacing: 0.1em; font-weight: 500;">Tipo di Richiesta</label>
              <select id="tipo-richiesta" style="background: rgba(255,255,255,0.03); border: 1px solid var(--c-glass-border); padding: 1rem; border-radius: 6px; color: var(--c-text-primary); font-family: var(--f-body); outline: none; transition: border-color var(--t-fast); appearance: none;" onfocus="this.style.borderColor='var(--c-gold)'" onblur="this.style.borderColor='var(--c-glass-border)'">
                <option value="b2c" style="background: var(--c-bg-dark); color: var(--c-text-primary);">Privato (B2C)</option>
                <option value="b2b" style="background: var(--c-bg-dark); color: var(--c-text-primary);">Azienda (B2B)</option>
              </select>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label for="messaggio" style="font-size: 0.75rem; text-transform: uppercase; color: var(--c-text-muted); letter-spacing: 0.1em; font-weight: 500;">Messaggio</label>
              <textarea id="messaggio" rows="5" required style="background: rgba(255,255,255,0.03); border: 1px solid var(--c-glass-border); padding: 1rem; border-radius: 6px; color: var(--c-text-primary); font-family: var(--f-body); outline: none; transition: border-color var(--t-fast); resize: vertical;" onfocus="this.style.borderColor='var(--c-gold)'" onblur="this.style.borderColor='var(--c-glass-border)'"></textarea>
            </div>

            <button type="submit" class="btn btn--primary" style="margin-top: var(--s-md); padding: 1.2rem;">Invia Messaggio</button>
          </form>
          
          <div id="contact-toast" class="glass-panel" style="display: none; margin-top: var(--s-lg); padding: 1rem; text-align: center; color: var(--c-gold); border-color: rgba(201,168,76,0.3);">
            Messaggio inviato con successo. Ti risponderemo a breve!
          </div>
        </div>

        <!-- Destra: Mapbox Placeholder (AS REQUESTED) -->
        <div class="animate-on-scroll" data-delay="150" style="position: sticky; top: 120px;">
          <div id="mapbox-container" class="glass-panel" style="width:100%; height:400px; border-radius:12px;"></div>
        </div>

      </div>
    </div>
  </section>
  `;
}

export function initContactForm() {
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const btn = form.querySelector('button[type="submit"]');
      const toast = document.getElementById("contact-toast");

      // Raccogliere i dati
      const nome = document.getElementById("nome").value;
      const email = document.getElementById("email").value;
      const tipoRequest = document.getElementById("tipo-richiesta").value;
      const messaggio = document.getElementById("messaggio").value;

      btn.disabled = true;
      btn.textContent = "Invio in corso...";

      try {
        const { data, error } = await supabase.functions.invoke(
          "send-contact-email",
          {
            body: { nome, email, tipoRequest, messaggio },
          },
        );

        if (error) {
          throw new Error(
            error.message || "Errore durante la chiamata serverless.",
          );
        }

        form.reset();

        if (toast) {
          toast.style.color = "var(--c-gold)";
          toast.style.borderColor = "rgba(201,168,76,0.3)";
          toast.textContent =
            "Messaggio inviato con successo. Ti risponderemo a breve!";
          toast.style.display = "block";
          setTimeout(() => (toast.style.display = "none"), 5000);
        }
      } catch (err) {
        console.error("[Contact Form] Errore Invio Email:", err);
        if (toast) {
          toast.style.color = "#e74c3c";
          toast.style.borderColor = "rgba(231, 76, 60, 0.3)";
          toast.textContent =
            "Ops! Si è verificato un errore durante l'invio. Riprova più tardi.";
          toast.style.display = "block";
          setTimeout(() => (toast.style.display = "none"), 5000);
        }
      } finally {
        btn.disabled = false;
        btn.textContent = "Invia Messaggio";
      }
    });
  }

  // Mapbox Initialization
  const mapContainer = document.getElementById("mapbox-container");
  if (mapContainer) {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token) {
      console.warn("[Mapbox] Token missing in .env");
      return;
    }

    mapboxgl.accessToken = token;

    // Coordinate Murano, Venezia
    const LngLat_Murano = [12.3551, 45.4578];

    const map = new mapboxgl.Map({
      container: "mapbox-container",
      style: "mapbox://styles/mapbox/dark-v11", // Dark style for luxury aesthetic
      center: LngLat_Murano,
      zoom: 14,
      scrollZoom: false, // Disable scroll zoom for better UX
    });

    // Add gold marker
    new mapboxgl.Marker({ color: "#c9a84c" })
      .setLngLat(LngLat_Murano)
      .addTo(map);

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), "top-right");
  }
}
