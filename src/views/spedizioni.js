/* ════════════════════════════════════════════════════════════════
   SPEDIZIONI VIEW — Logistica B2B Assicurata per Fragili
   ════════════════════════════════════════════════════════════════ */

export function spedizioniView() {
    return `
  <section class="legal-page">
    <div class="container animate-on-scroll" style="max-width: 800px; padding: var(--s-5xl) var(--s-md);">
      <p class="section-eyebrow">Logistica D'Eccellenza</p>
      <h1 class="section-title" style="margin-bottom: var(--s-2xl);">Spedizioni Premium B2B</h1>
      
      <div class="legal-content glass-panel" style="padding: var(--s-2xl); font-size: 0.95rem; line-height: 1.8; color: var(--c-text-secondary);">
        <div style="text-align: center; margin-bottom: var(--s-xl);">
          <span style="font-size: 2.5rem; display: block; margin-bottom: var(--s-sm);">📦🛡️</span>
          <p style="color: var(--c-gold-light); font-style: italic; max-width: 600px; margin: 0 auto;">
            I nostri cristalli, nati dal fuoco, richiedono precisione e cura per attraversare il mondo. La logistica di Cristalmad è calibrata per opere ed elementi fragili.
          </p>
        </div>

        <h2 style="font-family: var(--f-heading); color: var(--c-text-primary); margin-bottom: var(--s-md); font-size: 1.5rem;">Cura Dell'Imballaggio</h2>
        <p style="margin-bottom: var(--s-lg);">
          Ogni calice, bottiglia o statuetta vien meticolosamente infasciato e stivato nei nostri imballaggi industriali a celle chiuse, creati su misura per assorbire anche gli impatti aerospaziali (drop test). 
          I colli esterni su bancale (per pallet B2B) sono reggiati ed incellofanati in pellicola nera antimanomissione.
        </p>

        <h2 style="font-family: var(--f-heading); color: var(--c-text-primary); margin-bottom: var(--s-md); font-size: 1.5rem;">Copertura Assicurativa Totale</h2>
        <p style="margin-bottom: var(--s-lg);">
          Tutti i colli in uscita, sia in territorio pan-europeo che logistica internazionale via aerea, sono <strong style="color: var(--c-text-primary);">coperti da Assicurazione All-Risk 100%</strong> senza franchigia al cliente per danni cagionati ed esibiti nel tratto di percorrenza.
        </p>

        <h2 style="font-family: var(--f-heading); color: var(--c-text-primary); margin-bottom: var(--s-md); font-size: 1.5rem; color: #ff6b6b">Requisiti Rigidi B2B allo Scarico:</h2>
        <div style="padding: var(--s-md); background: rgba(255, 107, 107, 0.05); border-left: 3px solid #ff6b6b; border-radius: 0 4px 4px 0; margin-bottom: var(--s-lg);">
          <p style="margin-bottom: var(--s-xs);">Per preservare l'ombrello assicurativo, il committente al momento del ricevimento merce dal corriere (DHL, FedEx, Spedizionieri Pallettari) <strong>È OBBLIGATO A</strong>:</p>
          <ul style="list-style: disc; margin-left: var(--s-xl); margin-top: var(--s-sm); color: var(--c-text-primary);">
            <li>Esaminare attentamente che l'incellofanatura esterna B2B sia priva di lacerazioni o impronte visibili non idonee.</li>
            <li>Firmare il manifest / palmare elettronico inserendo tassativamente, la dicitura testuale <strong style="color: var(--c-gold-light);">"ACCETTATO CON RISERVA PER CONTROLLO INTEGRITÀ MERCE"</strong> in fase di firma elettronica o cartacea.</li>
            <li>Inviare una segnalazione d'immediato sinistro fotografica (anche interna ai colli se i cristalli son sbeccati) a <a href="mailto:logistic@cristalmad.com" style="color: var(--c-gold); text-decoration: underline;">logistic@cristalmad.com</a> <strong>entro e non oltre le 48 ore</strong> dal delivery time registrato dal vettore.</li>
          </ul>
        </div>

        <h2 style="font-family: var(--f-heading); color: var(--c-text-primary); margin-bottom: var(--s-md); font-size: 1.5rem;">Tempistiche di Resa per Elementi a Magazzino</h2>
        <p>
          Per materiale disponibile, il drop logistico avviene nel 1° business day utile su territorio Italiano ed Europeo, in 2-4 business day per le rotte extra-EEA mediante vettori Courier/Freight forwarding aerei rapidi.
        </p>
      </div>
    </div>
  </section>
  `;
}
