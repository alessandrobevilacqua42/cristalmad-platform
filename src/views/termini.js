/* ════════════════════════════════════════════════════════════════
   TERMINI E CONDIZIONI VIEW — Condizioni Generali B2B
   ════════════════════════════════════════════════════════════════ */

export function terminiView() {
    return `
  <section class="legal-page">
    <div class="container animate-on-scroll" style="max-width: 800px; padding: var(--s-5xl) var(--s-md);">
      <p class="section-eyebrow">Rapporti Commerciali</p>
      <h1 class="section-title" style="margin-bottom: var(--s-2xl);">Termini e Condizioni B2B</h1>
      
      <div class="legal-content glass-panel" style="padding: var(--s-2xl); font-size: 0.95rem; line-height: 1.8; color: var(--c-text-secondary);">
        <p style="margin-bottom: var(--s-lg); color: var(--c-gold-light); font-style: italic;">
          Le presenti condizioni regolano le vendite all'ingrosso e le commesse B2B tra CRISTALMAD S.r.l. e l'acquirente di natura professionale.
        </p>

        <h2 style="font-family: var(--f-heading); color: var(--c-text-primary); margin-bottom: var(--s-md); font-size: 1.5rem;">1. Accettazione degli Ordini</h2>
        <p style="margin-bottom: var(--s-lg);">
          Ogni ordine effettuato tramite il portale B2B, preventivo o contatto diretto è subordinato alla convalida di CRISTALMAD. 
          I tempi di consegna stimati (lead time) per la soffiatura e la molatura dei cristalli verranno confermati al momento della presa in carico formale della commessa.
        </p>

        <h2 style="font-family: var(--f-heading); color: var(--c-text-primary); margin-bottom: var(--s-md); font-size: 1.5rem;">2. Pagamenti e Fatturazione</h2>
        <p style="margin-bottom: var(--s-lg);">
          Per ordini sotto i €2.000 è richiesto il saldo anticipato tramite circuito Stripe. 
          Per commesse superiori o produzioni su specifica del cliente, è richiesto un acconto non rimborsabile del 50% alla conferma dell'ordine, 
          con il saldo dovuto avviso di merce pronta. La fattura commerciale viene emessa contestualmente all'evasione.
        </p>

        <h2 style="font-family: var(--f-heading); color: var(--c-text-primary); margin-bottom: var(--s-md); font-size: 1.5rem;">3. Resi e Diritto di Recesso</h2>
        <p style="margin-bottom: var(--s-lg);">
          Operando in regime B2B (Business to Business), non si applica il diritto di recesso previsto per i consumatori privati (B2C).
          <strong style="color: var(--c-gold); display: block; margin-top: var(--s-xs);">Prodotti Custom e Incisi:</strong> 
          Non è ammesso in nessun caso il reso o il rimborso per prodotti realizzati su misura, incisi, o recanti loghi personalizzati della committenza.
        </p>

        <h2 style="font-family: var(--f-heading); color: var(--c-text-primary); margin-bottom: var(--s-md); font-size: 1.5rem;">4. Difformità Artigianali</h2>
        <p style="margin-bottom: var(--s-lg);">
          Essendo ogni cristallo soffiato, manipolato e molato interamente a mano, lievi variazioni di calibro, peso o l'impercettibile presenza di micro-bolle 
          sono intrinseche della lavorazione maestrale e **non costituiscono difetto**, bensì certificano l'autenticità e l'unicità di ogni singolo pezzo.
        </p>

        <h2 style="font-family: var(--f-heading); color: var(--c-text-primary); margin-bottom: var(--s-md); font-size: 1.5rem;">5. Foro Competente</h2>
        <p>
          Per qualsiasi controversia derivante dall'interpretazione o dall'esecuzione del presente contratto B2B, è stabilita la giurisdizione esclusiva del 
          <strong style="color: var(--c-text-primary);">Foro di Venezia (Italia)</strong>.
        </p>
      </div>
    </div>
  </section>
  `;
}
