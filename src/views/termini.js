/* ════════════════════════════════════════════════════════════════
   TERMINI E CONDIZIONI VIEW — Condizioni Generali B2B
   ════════════════════════════════════════════════════════════════ */

export function terminiView() {
  return `
  <section class="legal-page">
    <div class="container animate-on-scroll legal-page__container">
      <p class="section-eyebrow">Rapporti Commerciali</p>
      <h1 class="section-title legal-page__title">Termini e Condizioni B2B</h1>
      
      <div class="legal-content glass-panel legal-page__content">
        <p class="legal-page__intro">
          Le presenti condizioni regolano le vendite all'ingrosso e le commesse B2B tra CRISTALMAD S.r.l. e l'acquirente di natura professionale.
        </p>

        <h2 class="legal-page__heading">1. Accettazione degli Ordini</h2>
        <p class="legal-page__paragraph">
          Ogni ordine effettuato tramite il portale B2B, preventivo o contatto diretto è subordinato alla convalida di CRISTALMAD. 
          I tempi di consegna stimati (lead time) per la soffiatura e la molatura dei cristalli verranno confermati al momento della presa in carico formale della commessa.
        </p>

        <h2 class="legal-page__heading">2. Pagamenti e Fatturazione</h2>
        <p class="legal-page__paragraph">
          Per ordini sotto i €2.000 è richiesto il saldo anticipato tramite circuito Stripe. 
          Per commesse superiori o produzioni su specifica del cliente, è richiesto un acconto non rimborsabile del 50% alla conferma dell'ordine, 
          con il saldo dovuto avviso di merce pronta. La fattura commerciale viene emessa contestualmente all'evasione.
        </p>

        <h2 class="legal-page__heading">3. Resi e Diritto di Recesso</h2>
        <p class="legal-page__paragraph">
          Operando in regime B2B (Business to Business), non si applica il diritto di recesso previsto per i consumatori privati (B2C).
          <strong class="legal-page__strong">Prodotti Custom e Incisi:</strong> 
          Non è ammesso in nessun caso il reso o il rimborso per prodotti realizzati su misura, incisi, o recanti loghi personalizzati della committenza.
        </p>

        <h2 class="legal-page__heading">4. Difformità Artigianali</h2>
        <p class="legal-page__paragraph">
          Essendo ogni cristallo soffiato, manipolato e molato interamente a mano, lievi variazioni di calibro, peso o l'impercettibile presenza di micro-bolle 
          sono intrinseche della lavorazione maestrale e **non costituiscono difetto**, bensì certificano l'autenticità e l'unicità di ogni singolo pezzo.
        </p>

        <h2 class="legal-page__heading">5. Foro Competente</h2>
        <p class="legal-page__paragraph">
          Per qualsiasi controversia derivante dall'interpretazione o dall'esecuzione del presente contratto B2B, è stabilita la giurisdizione esclusiva del 
          <strong class="legal-page__highlight">Foro di Venezia (Italia)</strong>.
        </p>
      </div>
    </div>
  </section>
  `;
}
