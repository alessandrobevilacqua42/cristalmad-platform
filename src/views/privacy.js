/* ════════════════════════════════════════════════════════════════
   PRIVACY POLICY VIEW — B2B Data Protection
   ════════════════════════════════════════════════════════════════ */

export function privacyView() {
    return `
  <section class="legal-page">
    <div class="container animate-on-scroll" style="max-width: 800px; padding: var(--s-5xl) var(--s-md);">
      <p class="section-eyebrow">Trasparenza Dati</p>
      <h1 class="section-title" style="margin-bottom: var(--s-2xl);">Privacy Policy B2B</h1>
      
      <div class="legal-content glass-panel" style="padding: var(--s-2xl); font-size: 0.95rem; line-height: 1.8; color: var(--c-text-secondary);">
        <h2 style="font-family: var(--f-heading); color: var(--c-text-primary); margin-bottom: var(--s-md); font-size: 1.5rem;">1. Trattamento dei Dati Professionali</h2>
        <p style="margin-bottom: var(--s-lg);">
          CRISTALMAD S.r.l. raccoglie e processa esclusivamente i dati necessari all'instaurazione e alla gestione di rapporti commerciali B2B (Business to Business). 
          I dati richiesti (Ragione Sociale, P.IVA, Email Aziendale, Referente) sono utilizzati al solo scopo di profilazione tariffaria, fatturazione ed evasione degli ordini.
        </p>

        <h2 style="font-family: var(--f-heading); color: var(--c-text-primary); margin-bottom: var(--s-md); font-size: 1.5rem;">2. Infrastruttura e Sicurezza</h2>
        <p style="margin-bottom: var(--s-lg);">
          Per garantire la massima sicurezza e affidabilità, l'infrastruttura di autenticazione e archiviazione dati si avvale dei servizi crittografati di Supabase. 
          Le transazioni finanziarie sono interamente demandate a Stripe, che opera come Gateway di Pagamento. CRISTALMAD non memorizza, in nessun momento, i dati sensibili delle carte di credito sui propri server.
        </p>

        <h2 style="font-family: var(--f-heading); color: var(--c-text-primary); margin-bottom: var(--s-md); font-size: 1.5rem;">3. Finalità del Trattamento</h2>
        <p style="margin-bottom: var(--s-lg);">
          I dati aziendali forniti nell'Area Riservata o tramite richieste di preventivo vengono trattati per:
          <ul style="list-style-type: decimal; margin-left: var(--s-lg); margin-top: var(--s-sm); color: var(--c-text-muted);">
            <li>Erogazione dei listini riservati.</li>
            <li>Elaborazione e spedizione degli ordini su misura.</li>
            <li>Comunicazioni strettamente inerenti al ciclo di vita dell'ordine.</li>
          </ul>
        </p>

        <h2 style="font-family: var(--f-heading); color: var(--c-text-primary); margin-bottom: var(--s-md); font-size: 1.5rem;">4. Diritti dell'Utente</h2>
        <p>
          Il referente aziendale può richiedere in ogni momento la cancellazione, la modifica o l'esportazione dei dati legati all'account B2B 
          inviando una comunicazione ufficiale a: <a href="mailto:privacy@cristalmad.com" style="color: var(--c-gold);">privacy@cristalmad.com</a>.
        </p>
      </div>
    </div>
  </section>
  `;
}
