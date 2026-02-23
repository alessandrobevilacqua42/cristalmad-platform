import { supabase } from '../lib/supabase.js';

export function conciergeView() {
    return `
  <section class="concierge-page animate-on-scroll">
    <div class="container concierge-container">
      <div class="concierge-header">
        <p class="section-eyebrow" style="color: var(--c-gold)">Personal Shopper B2B</p>
        <h1 class="page-title">Il Tuo Concierge: Maestro</h1>
        <p class="page-subtitle">Descrivi il tuo ristorante o hotel, e il nostro assistente IA ti consiglierà la cristalleria perfetta.</p>
      </div>

      <div class="concierge-chat glass-panel">
        <div id="ai-response-area" class="ai-response-wrapper" style="display: none;">
          <h3 id="ai-welcome-msg" class="ai-welcome"></h3>
          <ul id="ai-categories-list" class="ai-categories"></ul>
        </div>
        
        <form id="ai-concierge-form" class="concierge-form">
          <div class="input-group">
            <label for="ai-prompt">Descrivi la tua attività (es. "Ristorante stellato a Milano con menu di mare, budget 5.000€")</label>
            <textarea id="ai-prompt" rows="4" placeholder="Parlami del tuo locale..." required></textarea>
          </div>
          <button type="submit" class="btn btn--primary" id="ai-submit-btn">Chiedi a Maestro</button>
        </form>
      </div>
    </div>
  </section>

  <style>
    .concierge-page { padding: var(--s-4xl) 0; min-height: 70vh; }
    .concierge-container { max-width: 800px; margin: 0 auto; }
    .concierge-header { text-align: center; margin-bottom: var(--s-3xl); }
    .page-title { font-family: var(--f-heading); font-size: 3rem; margin-bottom: var(--s-sm); color: var(--c-text-primary); }
    .page-subtitle { color: var(--c-text-secondary); font-size: 1.1rem; }
    
    .concierge-chat { padding: var(--s-3xl); background: rgba(20,20,24,0.8); border: 1px solid var(--c-glass-border); border-radius: 12px; }
    
    .input-group label { display: block; margin-bottom: var(--s-xs); color: var(--c-gold-light); font-size: 0.95rem; }
    .input-group textarea { width: 100%; padding: var(--s-md); background: rgba(0,0,0,0.5); border: 1px solid var(--c-glass-border); border-radius: 6px; color: var(--c-text-primary); font-family: var(--f-body); resize: vertical; margin-bottom: var(--s-xl); }
    .input-group textarea:focus { outline: none; border-color: var(--c-gold); box-shadow: 0 0 10px rgba(201,168,76,0.1); }
    
    .ai-response-wrapper { margin-bottom: var(--s-2xl); padding: var(--s-xl); border-left: 3px solid var(--c-gold); background: rgba(201,168,76,0.05); }
    .ai-welcome { font-family: var(--f-heading); color: var(--c-gold); margin-bottom: var(--s-md); font-size: 1.4rem; font-weight: 300; line-height: 1.4; }
    .ai-categories { list-style: none; padding: 0; }
    .ai-categories li { padding: var(--s-xs) 0; padding-left: var(--s-lg); position: relative; color: var(--c-text-secondary); }
    .ai-categories li::before { content: '✦'; position: absolute; left: 0; color: var(--c-gold); font-size: 0.8rem; top: 12px; }
  </style>
  `;
}

export function initConcierge() {
    const form = document.getElementById("ai-concierge-form");
    const promptInput = document.getElementById("ai-prompt");
    const submitBtn = document.getElementById("ai-submit-btn");
    const responseArea = document.getElementById("ai-response-area");
    const welcomeMsg = document.getElementById("ai-welcome-msg");
    const categoriesList = document.getElementById("ai-categories-list");

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const userInput = promptInput.value.trim();
            if (!userInput) return;

            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = "Maestro sta analizzando la tua richiesta...";
            responseArea.style.display = "none";

            try {
                const { data, error } = await supabase.functions.invoke('ai-concierge', {
                    body: { prompt: userInput }
                });

                if (error) throw error;

                // Populate response
                welcomeMsg.textContent = data.messaggio_benvenuto || "Ecco la mia selezione per te.";

                categoriesList.innerHTML = "";
                const categories = data.categorie_consigliate || [];
                categories.forEach(cat => {
                    const li = document.createElement("li");
                    li.textContent = cat;
                    categoriesList.appendChild(li);
                });

                responseArea.style.display = "block";
                form.reset();

            } catch (err) {
                console.error("Errore Concierge AI:", err);
                welcomeMsg.textContent = "Mi dispiace, si è verificato un errore di connessione col mio cervello. Riprova più tardi.";
                categoriesList.innerHTML = "";
                responseArea.style.display = "block";
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
}
