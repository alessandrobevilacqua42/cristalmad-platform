# Direttiva per Sviluppo: Le Novità "Ultra-Luxury"

Dato il via libera sulle integrazioni "wow" discusse (`directives/ultra_luxury_superpowers.md`), ci organizzeremo per implementare tutte e tre le funzionalità, perché insieme creano l'esperienza Cristalmad definitiva.

---

## Fasi di Implementazione Consigliate

Sei libero di scegliere quale farmi sviluppare per prima. Le ho messe in ordine di impatto e fattibilità.

### Fase 1: Fluidità e "Tocco del Vetro" (GSAP Animations)

Per prima cosa, renderemo le pagine scivolose come seta. L'obiettivo è integrare GSAP nel file principale CSS/JS.

* **Cosa faremo:** Creeremo effetti di paralasse sui banner, faremo apparire dolcemente i prodotti durante lo scroll e creeremo micro-interazioni sui pulsanti che faranno sembrare il sito reattivo come uno specchio d'acqua.
* **Prossimo step tecnico:** Installazione di `gsap` tramite npm/CDN e creazione di un file `animations.js`.

### Fase 2: Il Maestro (L'AI Concierge)

Trasformeremo la semplice chat in un "Personal Shopper" guidato da Google Gemini.

* **Cosa faremo:** Creeremo un'interfaccia elegante a scomparsa in basso a destra. Useremo la chiave `GOOGLE_AI_STUDIO_KEY` (che abbiamo già) per far rispondere al bot. Lo istruiremo tecnicamente a rispondere *solo* su argomenti legati a Cristalmad, al vetro di Murano e ai prodotti.
* **Il tocco in più (ElevenLabs):** Successivamente, creeremo un account su ElevenLabs per dare una profonda voce narrante a queste risposte.

### Fase 3: La "Prova in Stanza" in AR (Realtà Aumentata)

Questa è la ciliegina sulla torta per un e-commerce.

* **Cosa faremo:** Integreremo la libreria `<model-viewer>` di Google.
* **Requisito necessario da parte tua:** Per far funzionare questa magia, avremo bisogno che i tuoi prodotti di punta vengano scansionati o modellati in 3D (formati `.glb` o `.usdz`). Una volta che avrai anche solo il primo modello, il sito permetterà al cliente di piazzare virtualmente il calice sul tavolo di casa sua attraverso la fotocamera dello smartphone.

---

### Mettiamoci al lavoro

La preparazione "Innovation & API" è completa. Il sito ha l'infrastruttura necessaria (Supabase per database e utenti, Stripe pre-configurato per i checkout sicuri, Mapbox e Algolia pronti) e ora ha anche una roadmap definita per le esperienze ultra-lusso (GSAP, AI, 3D AR).

*Dimmi da quale pagina o da quale di queste funzioni vuoi che il team tecnico (io, cambiando veste in Frontend/Backend Developer) cominci a scrivere il codice!*
