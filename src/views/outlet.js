/* ════════════════════════════════════════════════════════════════
   OUTLET VIEW — Fine Serie & Selezioni Speciali
   Pagina pronta per ricevere prodotti outlet da CMS esterno
   ════════════════════════════════════════════════════════════════ */

export function outletView() {
  return `
  <!-- ── OUTLET HERO ── -->
  <section class="page-hero animate-on-scroll" style="
    padding: calc(var(--nav-h) + var(--s-4xl)) var(--s-md) var(--s-3xl);
    text-align: center;
    position: relative;
    overflow: hidden;
  ">
    <!-- Sfumatura di sfondo -->
    <div style="
      position: absolute; inset: 0;
      background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(179,145,80,0.08) 0%, transparent 70%);
      pointer-events: none;
    "></div>

    <p class="section-eyebrow" style="margin-bottom: var(--s-sm);">Prezzi Esclusivi</p>
    <h1 class="section-title" style="
      font-size: clamp(2rem, 5vw, 3.5rem);
      margin-bottom: var(--s-lg);
    ">Outlet — Fine Serie<br>& Selezioni Speciali</h1>
    <p style="
      max-width: 600px;
      margin: 0 auto var(--s-2xl);
      color: var(--c-text-secondary);
      font-size: 1.05rem;
      line-height: 1.8;
    ">
      Pezzi di fine serie, campionari unici e selezioni speciali della nostra manifattura.<br>
      Cristalli artigianali autentici a condizioni irripetibili — disponibili fino ad esaurimento.
    </p>

    <!-- Pillole caratteristiche -->
    <div style="
      display: flex;
      gap: var(--s-sm);
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: var(--s-3xl);
    ">
      ${['Fine Serie', 'Campionari', 'Pezzi Unici', 'Stock Limitato'].map(tag => `
        <span style="
          padding: var(--s-xs) var(--s-md);
          border: 1px solid var(--c-glass-border);
          border-radius: 999px;
          font-size: 0.75rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--c-text-muted);
          background: var(--c-glass-bg);
        ">${tag}</span>
      `).join('')}
    </div>
  </section>

  <!-- ── GRIGLIA OUTLET ── -->
  <section style="padding: 0 var(--s-md) var(--s-5xl);">
    <div class="container" style="max-width: 1200px;">

      <!-- Stato vuoto — coming soon luxury -->
      <div class="glass-panel animate-on-scroll" style="
        text-align: center;
        padding: var(--s-5xl) var(--s-2xl);
        border: 1px solid var(--c-glass-border);
        position: relative;
        overflow: hidden;
      ">
        <!-- Icona decorativa -->
        <div style="
          width: 80px; height: 80px;
          border: 1px solid var(--c-glass-border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--s-xl);
          position: relative;
        ">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--c-gold)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
        </div>

        <p class="section-eyebrow" style="margin-bottom: var(--s-sm);">Prossimamente</p>
        <h2 class="section-title" style="
          font-size: clamp(1.4rem, 3vw, 2rem);
          margin-bottom: var(--s-md);
        ">La selezione è in aggiornamento</h2>
        <p style="
          color: var(--c-text-secondary);
          max-width: 480px;
          margin: 0 auto var(--s-2xl);
          line-height: 1.8;
        ">
          I nostri maestri stanno selezionando i pezzi migliori per questa sezione.<br>
          Torna presto — le disponibilità outlet si esauriscono rapidamente.
        </p>

        <!-- Linea decorativa dorata -->
        <div style="
          width: 60px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--c-gold), transparent);
          margin: 0 auto var(--s-2xl);
        "></div>

        <!-- CTA al catalogo -->
        <a href="#/catalogo" class="btn-primary" style="
          display: inline-block;
          text-decoration: none;
        ">
          Esplora il Catalogo Completo
        </a>
      </div>

    </div>
  </section>

  <!-- ── INFO OUTLET ── -->
  <section class="animate-on-scroll" style="
    padding: 0 var(--s-md) var(--s-5xl);
  ">
    <div class="container" style="max-width: 900px;">
      <div style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: var(--s-lg);
      ">
        ${[
          {
            icon: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
            titolo: 'Autenticità Garantita',
            testo: 'Ogni pezzo outlet è certificato e proviene direttamente dalla nostra manifattura artigianale.'
          },
          {
            icon: `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
            titolo: 'Disponibilità Limitata',
            testo: 'I pezzi outlet sono esauribili. La selezione cambia frequentemente.'
          },
          {
            icon: `<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>`,
            titolo: 'Prezzi Speciali',
            testo: 'Condizioni irripetibili su pezzi selezionati. Stessa qualità Cristalmad, costo ridotto.'
          }
        ].map(item => `
          <div class="glass-panel" style="padding: var(--s-xl); text-align: center;">
            <div style="
              width: 48px; height: 48px;
              border: 1px solid var(--c-glass-border);
              border-radius: 50%;
              display: flex; align-items: center; justify-content: center;
              margin: 0 auto var(--s-md);
            ">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--c-gold)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                ${item.icon}
              </svg>
            </div>
            <h3 style="
              font-family: var(--f-heading);
              font-size: 1.05rem;
              color: var(--c-text-primary);
              margin-bottom: var(--s-sm);
            ">${item.titolo}</h3>
            <p style="
              font-size: 0.88rem;
              color: var(--c-text-muted);
              line-height: 1.7;
            ">${item.testo}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  `;
}
