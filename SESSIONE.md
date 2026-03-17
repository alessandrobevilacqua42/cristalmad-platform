# Cristalmad — Storico Sessioni Claude

> Questo file serve come memoria tra sessioni di lavoro con Claude.
> Quando inizi una nuova sessione, fai leggere questo file a Claude per riprendere subito dal punto giusto.

---

## STATO ATTUALE DEL PROGETTO

**Sito live:** https://cristalmad.vercel.app
**Repo:** alessandrobevilacqua42/cristalmad-platform
**Stack:** Vite + JS vanilla | Supabase (DB + Auth + Edge Functions) | Stripe | Vercel

---

## SESSIONE — 17 Marzo 2026 (da mobile, fuori casa)

### Contesto
Alessandro era fuori casa con l'app mobile. Il computer di casa era acceso con VS Code + Claude Code aperto sul progetto. Non è possibile recuperare la cronologia di sessioni precedenti tra dispositivi diversi.

### Cosa è stato fatto oggi

#### ✅ Creazione pagina Outlet
- **Problema:** Il menu di navigazione aveva già il link "Outlet" ma la rotta `/outlet` non esisteva. Cliccandoci si veniva reindirizzati alla home.
- **Soluzione:**
  - Creato `src/views/outlet.js` — pagina completa con hero, stato vuoto elegante (coming soon luxury), CTA al catalogo, 3 card informative
  - Aggiornato `src/router.js` — aggiunto import e rotta `/outlet`
- **Branch:** `claude/clarify-project-context-ZMZoF`
- **Stato:** Committato e pushato. Da mergiare su `master` per vedere su Vercel.

---

## PROBLEMI NOTI / TODO APERTI

### Urgenti
- [ ] **Mergiare branch su master** — il branch `claude/clarify-project-context-ZMZoF` contiene la pagina Outlet ma non è ancora su `master`. Fare PR o merge diretto.
- [ ] **Home page — prodotti non visibili** — Le categorie nella home non caricano prodotti. La home mostra la sezione ma le card prodotto sono vuote.

### Architettura decisa
- **I prodotti verranno gestiti da WordPress** come CMS esterno. La popolazione del catalogo avverrà da WP in futuro (non da Supabase direttamente o da codice).
- **La pagina Outlet** è stata creata vuota appositamente: quando WP sarà collegato, i prodotti outlet compariranno lì.

### Feature da fare (priorità da decidere)
- [ ] Pagina Outlet — prodotti reali (quando arriva integrazione WP)
- [ ] Wishlist (cuoricino sui prodotti) — salva preferiti
- [ ] Recensioni / testimonial — sistema stelle
- [ ] Newsletter — raccolta email clienti
- [ ] AR Try-On — visualizzazione 3D in realtà aumentata (già pianificato in `directives/ultra_luxury_superpowers.md`)
- [ ] Voice Concierge — AI concierge con voce ElevenLabs (già pianificato in `directives/ultra_luxury_superpowers.md`)
- [ ] Admin dashboard — gestione prodotti/ordini senza Supabase
- [ ] Multi-valuta EUR/CHF/GBP

---

## NOTE ARCHITETTURALI IMPORTANTI

### File di strategia nel repo
Tutti i documenti di pianificazione sono in `directives/`:
- `directives/backend_stripe_plan.md` — schema DB, auth, pagamenti
- `directives/free_api_superpowers.md` — integrazioni gratuite disponibili (Mapbox, Algolia, Cloudinary)
- `directives/ultra_luxury_superpowers.md` — feature avanzate (AR, Voice AI, animazioni GSAP)
- `directives/roadmap_superpowers.md` — fasi di implementazione

### Struttura pagine (13 view esistenti)
| Rotta | File | Stato |
|-------|------|-------|
| `/` | home.js | ⚠️ categorie vuote |
| `/catalogo` | catalogo.js | ✅ |
| `/outlet` | outlet.js | ✅ (vuoto, coming soon) |
| `/prodotto/:slug` | prodotto.js | ✅ |
| `/login` | login.js | ✅ |
| `/area-riservata` | area-riservata.js | ✅ |
| `/chi-siamo` | chi-siamo.js | ✅ |
| `/atelier` | atelier.js | ✅ (WebGL) |
| `/contatti` | contatti.js | ✅ (Mapbox) |
| `/concierge` | concierge.js | ✅ (OpenAI) |
| `/faq` | faq.js | ✅ |
| `/spedizioni` | spedizioni.js | ✅ |
| `/privacy` | privacy.js | ✅ |
| `/termini` | termini.js | ✅ |

### Backend Supabase Edge Functions
- `create-checkout` — Sessione pagamento Stripe
- `stripe-webhook` — Gestione eventi pagamento
- `get-order` / `get-orders` — Storico ordini
- `create-quote` — Preventivo PDF
- `validate-vat` — Validazione P.IVA EU (VIES)
- `approve-user` — Approvazione utenti B2B (admin)
- `ai-concierge` — Concierge AI (OpenAI gpt-4o-mini)
- `send-contact-email` — Email da form contatti (Resend)

### Branch attivi
- `master` — branch principale, deploy Vercel automatico
- `claude/clarify-project-context-ZMZoF` — branch corrente (sessione 17/03/2026)

---

## COME USARE QUESTO FILE

Quando inizi una nuova sessione con Claude, scrivi:

> "Leggi il file SESSIONE.md nel repo e dimmi da dove partiamo"

Claude leggerà questo file e saprà esattamente lo stato del progetto, i problemi aperti e cosa è stato fatto.

**Aggiorna sempre questo file** alla fine di ogni sessione di lavoro.
