/* ════════════════════════════════════════════════════════════════
   FAQ VIEW — Domande Comuni B2B e Lavorazione Artigianale
   ════════════════════════════════════════════════════════════════ */

export function faqView() {
    return `
  <section class="legal-page">
    <div class="container animate-on-scroll" style="max-width: 800px; padding: var(--s-5xl) var(--s-md);">
      <p class="section-eyebrow">Domande Frequenti</p>
      <h1 class="section-title" style="margin-bottom: var(--s-2xl);">FAQ B2B e Artigianalità</h1>
      
      <div class="legal-content glass-panel" style="padding: var(--s-2xl); font-size: 0.95rem; line-height: 1.8; color: var(--c-text-secondary);">
        <p style="margin-bottom: var(--s-xl); color: var(--c-text-muted);">
          Abbiamo raccolto le domande più comuni dei nostri partner B2B sulle tempistiche di soffiatura e spedizione.
        </p>

        <!-- FAQ Item 1 -->
        <h3 style="font-family: var(--f-heading); color: var(--c-text-primary); margin-bottom: var(--s-xs); font-size: 1.3rem;">1. Quali sono i tempi di produzione e soffiatura?</h3>
        <p style="margin-bottom: var(--s-lg); padding-left: var(--s-sm); border-left: 2px solid var(--c-glass-border);">
          Dipende dalla mole dell'ordine: essendo tutti i cristalli soffiati meticolosamente a mano nella nostra fornace, 
          un ordine B2B standard necessita mediamente dai 15 ai 30 giorni lavorativi (lead time). 
          Per set composti da oltre 100 pezzi o pezzi finemente incisi, le tempistiche verranno stimate esattamente in fase di preventivo.
        </p>

        <!-- FAQ Item 2 -->
        <h3 style="font-family: var(--f-heading); color: var(--c-text-primary); margin-bottom: var(--s-xs); font-size: 1.3rem;">2. Quali sono i volumi previsti per accedere ai listini B2B?</h3>
        <p style="margin-bottom: var(--s-lg); padding-left: var(--s-sm); border-left: 2px solid var(--c-glass-border);">
          L'accesso alle condizioni B2B (Riservate a Retailer, Hotel, Ristoranti) avviene solo previa approvazione manuale dell'account. 
          Il minimo per il primo ordine è fissato solitamente all'equivalente di 10 confezioni miste, al fine di garantire l'accessibilità a cantine esclusive e boutique hotel.
        </p>

        <!-- FAQ Item 3 -->
        <h3 style="font-family: var(--f-heading); color: var(--c-text-primary); margin-bottom: var(--s-xs); font-size: 1.3rem;">3. È possibile personalizzare i calici con logo aziendale?</h3>
        <p style="margin-bottom: var(--s-lg); padding-left: var(--s-sm); border-left: 2px solid var(--c-glass-border);">
          Assolutamente sì. Tramite il configuratore in pagina prodotto è possibile richiedere l'incisione testuale, ma 
          previo invio di file vettoriale del logo, allochiamo un mastro per le incisioni sartoriali ad acido o punta di diamante del vostro emblema.
        </p>

        <!-- FAQ Item 4 -->
        <h3 style="font-family: var(--f-heading); color: var(--c-text-primary); margin-bottom: var(--s-xs); font-size: 1.3rem;">4. I prodotti sono garantiti contro le imperfezioni?</h3>
        <p style="margin-bottom: var(--s-lg); padding-left: var(--s-sm); border-left: 2px solid var(--c-glass-border);">
          Il cristallo autentico molato a mano può presentare millimetriche irregolarità (variazioni diametrali < 1mm o minuscole bolle all'interno del corpo del materiale). 
          Ciò non costituisce difetto di fabbrica, ma rappresenta al contrario un <strong style="color: var(--c-gold-light);">marchio tangibile della lavorazione orgogliosamente e puramente artigianale</strong>, non serializzata in serie.
        </p>

        <!-- FAQ Item 5 -->
        <h3 style="font-family: var(--f-heading); color: var(--c-text-primary); margin-bottom: var(--s-xs); font-size: 1.3rem;">5. Se un pezzo arriva danneggiato, cosa succede?</h3>
        <p style="margin-left: var(--s-sm); padding-left: var(--s-sm); border-left: 2px solid var(--c-glass-border);">
          Gestendo prodotti fragili ed esosi, tutte le nostre merci sono asssicurate. Consigliamo fortemente di accettare i carichi B2B 
          con "Riserva Certa di Controllo". Leggere accuratamente la sezione <a href="#/spedizioni" style="color: var(--c-gold); text-decoration: underline;">Spedizioni Premium</a> per le direttive da seguire.
        </p>
      </div>

      <div style="text-align: center; margin-top: var(--s-2xl);">
        <p style="color: var(--c-text-muted); font-size: 0.9rem; margin-bottom: var(--s-md);">Hai altre domande?</p>
        <a href="#/contatti" class="btn btn--primary" data-link>Contatta l'Assistenza B2B</a>
      </div>
    </div>
  </section>
  `;
}
