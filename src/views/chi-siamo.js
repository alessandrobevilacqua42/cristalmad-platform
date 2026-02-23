/* ════════════════════════════════════════════════════════════════
   CHI SIAMO VIEW — Brand story, timeline, values, process
   ════════════════════════════════════════════════════════════════ */

export function chiSiamoView() {
  return `
  <!-- HERO -->
  <section class="page-hero">
    <div class="container">
      <p class="section-eyebrow animate-on-scroll">La Nostra Storia</p>
      <h1 class="section-title animate-on-scroll" style="font-size: clamp(2rem, 5vw, 3.5rem);">Chi Siamo</h1>
      <p class="page-hero__subtitle animate-on-scroll">Dal 1980, trasformiamo il cristallo in opere d'arte.<br>Una storia di passione, tradizione e innovazione italiana.</p>
    </div>
  </section>

  <!-- TIMELINE -->
  <section class="about-timeline">
    <div class="container">
      <div class="section-header animate-on-scroll">
        <p class="section-eyebrow">Il Nostro Percorso</p>
        <h2 class="section-title">40+ Anni di Eccellenza</h2>
      </div>
      <div class="timeline">
        <div class="timeline__item animate-on-scroll" data-delay="0">
          <div class="timeline__year">1980</div>
          <div class="timeline__content glass-panel">
            <h3>La Fondazione</h3>
            <p>Nasce Cristalmad nella tradizione della cristalleria italiana. Un piccolo laboratorio artigianale dove la passione per il vetro diventa mestiere.</p>
          </div>
        </div>
        <div class="timeline__item animate-on-scroll" data-delay="100">
          <div class="timeline__year">1995</div>
          <div class="timeline__content glass-panel">
            <h3>Espansione B2B</h3>
            <p>Inizia la collaborazione con ristoranti e hotel di lusso. I nostri calici entrano nei migliori locali d'Italia e d'Europa.</p>
          </div>
        </div>
        <div class="timeline__item animate-on-scroll" data-delay="200">
          <div class="timeline__year">2010</div>
          <div class="timeline__content glass-panel">
            <h3>Innovazione nel Design</h3>
            <p>Introduciamo nuove linee che fondono tradizione e design contemporaneo. Ogni pezzo racconta una storia unica.</p>
          </div>
        </div>
        <div class="timeline__item animate-on-scroll" data-delay="300">
          <div class="timeline__year">Oggi</div>
          <div class="timeline__content glass-panel">
            <h3>Il Futuro del Cristallo</h3>
            <p>200+ modelli, clienti in tutto il mondo, e lo stesso amore per la lavorazione a mano che ci ha guidato dal primo giorno.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- VALUES -->
  <section class="about-values">
    <div class="container">
      <div class="section-header animate-on-scroll">
        <p class="section-eyebrow">I Nostri Valori</p>
        <h2 class="section-title">Cosa Ci Guida</h2>
      </div>
      <div class="values__grid">
        <div class="value-card glass-panel animate-on-scroll" data-delay="0">
          <div class="value-card__icon">◇</div>
          <h3>Tradizione</h3>
          <p>Ogni pezzo nasce da tecniche tramandate di generazione in generazione. Il saper fare dei nostri maestri è il nostro tesoro più grande.</p>
        </div>
        <div class="value-card glass-panel animate-on-scroll" data-delay="100">
          <div class="value-card__icon">✦</div>
          <h3>Qualità</h3>
          <p>Solo cristallo di prima scelta, lavorato a bocca con standard rigorosi. Ogni imperfezione racconta la mano dell'artista.</p>
        </div>
        <div class="value-card glass-panel animate-on-scroll" data-delay="200">
          <div class="value-card__icon">◈</div>
          <h3>Innovazione</h3>
          <p>Design contemporaneo che dialoga con la tradizione. Forme nuove che rispettano l'essenza del cristallo artigianale.</p>
        </div>
        <div class="value-card glass-panel animate-on-scroll" data-delay="300">
          <div class="value-card__icon">♦</div>
          <h3>Sostenibilità</h3>
          <p>Processi a basso impatto, materiali riciclabili e un modello produttivo che rispetta l'ambiente e le persone.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- PROCESS -->
  <section class="about-process">
    <div class="container">
      <div class="section-header animate-on-scroll">
        <p class="section-eyebrow">L'Arte del Vetro</p>
        <h2 class="section-title">Il Nostro Processo</h2>
      </div>
      <div class="process__steps">
        <div class="process__step animate-on-scroll" data-delay="0">
          <div class="process__number">01</div>
          <h3>Fusione</h3>
          <p>Il cristallo viene fuso a 1400°C in forni tradizionali, creando una massa incandescente pronta per la lavorazione.</p>
        </div>
        <div class="process__step animate-on-scroll" data-delay="100">
          <div class="process__number">02</div>
          <h3>Soffiatura</h3>
          <p>Il maestro vetraio soffia e modella il cristallo con l'ausilio di canne e pinze, dando forma al pezzo unico.</p>
        </div>
        <div class="process__step animate-on-scroll" data-delay="200">
          <div class="process__number">03</div>
          <h3>Lavorazione</h3>
          <p>Incisioni, molature e decorazioni a mano conferiscono la personalità distintiva di ogni creazione Cristalmad.</p>
        </div>
        <div class="process__step animate-on-scroll" data-delay="300">
          <div class="process__number">04</div>
          <h3>Controllo Qualità</h3>
          <p>Ogni pezzo viene ispezionato individualmente per garantire trasparenza, brillantezza e perfezione strutturale.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="about-cta">
    <div class="container" style="text-align: center;">
      <div class="animate-on-scroll">
        <p class="section-eyebrow">Scopri le Nostre Creazioni</p>
        <h2 class="section-title">Pronto a Scoprire il Cristallo?</h2>
        <div style="display: flex; gap: var(--s-md); justify-content: center; flex-wrap: wrap; margin-top: var(--s-xl);">
          <a href="#/catalogo" class="btn btn--primary" data-link>Vai al Catalogo</a>
          <a href="#/contatti" class="btn btn--glass" data-link>Contattaci</a>
        </div>
      </div>
    </div>
  </section>
  `;
}
