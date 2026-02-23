/* ════════════════════════════════════════════════════════════════
   AREA RISERVATA VIEW — B2B Dashboard with session-gated content
   ════════════════════════════════════════════════════════════════ */

import { supabase } from "../lib/supabase.js";
import { getUser, signOut } from "../lib/auth.js";
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";
import autoTable from "https://esm.sh/jspdf-autotable@3.8.2";

// ─── Mock B2B products for offline mode ───
const MOCK_PRODUCTS = [
  {
    nome: "Calice Elegance",
    categorie: { nome: "Calici" },
    confezione: "6 pezzi",
    prezzo_b2c: 89.0,
    prezzo_b2b: 62.3,
    immagine_url: "/images/product_calice_1.png",
  },
  {
    nome: "Calice Crystal",
    categorie: { nome: "Calici" },
    confezione: "6 pezzi",
    prezzo_b2c: 95.0,
    prezzo_b2b: 66.5,
    immagine_url: "/images/product_calice_2.png",
  },
  {
    nome: "Coppa Imperiale",
    categorie: { nome: "Coppe" },
    confezione: "6 pezzi",
    prezzo_b2c: 75.0,
    prezzo_b2b: 52.5,
    immagine_url: "/images/product_coppa.png",
  },
  {
    nome: "Caraffa Murano",
    categorie: { nome: "Caraffe" },
    confezione: "1 pezzo",
    prezzo_b2c: 120.0,
    prezzo_b2b: 84.0,
    immagine_url: "/images/product_caraffa.png",
  },
  {
    nome: "Bicchiere Classico",
    categorie: { nome: "Bicchieri" },
    confezione: "6 pezzi",
    prezzo_b2c: 55.0,
    prezzo_b2b: 38.5,
    immagine_url: "/images/product_bicchiere.png",
  },
  {
    nome: "Vaso Veneziano",
    categorie: { nome: "Vasi" },
    confezione: "1 pezzo",
    prezzo_b2c: 150.0,
    prezzo_b2b: 105.0,
    immagine_url: "/images/product_vaso.png",
  },
];

// ─── Fetch all products with B2B prices ───
async function fetchB2BProducts() {
  try {
    const { data, error } = await supabase
      .from("prodotti")
      .select("*, categorie(nome)")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data && data.length > 0 ? data : MOCK_PRODUCTS;
  } catch {
    return MOCK_PRODUCTS;
  }
}

function renderB2BProductRow(product) {
  const b2c = product.prezzo_b2c
    ? `€${Number(product.prezzo_b2c).toFixed(2)}`
    : "—";
  const b2b = product.prezzo_b2b
    ? `€${Number(product.prezzo_b2b).toFixed(2)}`
    : "—";
  const saving =
    product.prezzo_b2c && product.prezzo_b2b
      ? `-${Math.round((1 - product.prezzo_b2b / product.prezzo_b2c) * 100)}%`
      : "";

  return `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: var(--s-sm);">
          <div>
            <strong>${product.nome}</strong>
            <span style="display: block; font-size: 0.7rem; color: var(--c-text-muted);">${product.categorie?.nome || ""}</span>
          </div>
        </div>
      </td>
      <td>${product.confezione}</td>
      <td style="text-decoration: line-through; color: var(--c-text-muted);">${b2c}</td>
      <td style="color: var(--c-gold-light); font-weight: 500;">${b2b}</td>
      <td><span style="color: #2ecc71; font-size: 0.8rem; font-weight: 500;">${saving}</span></td>
    </tr>`;
}

function renderQuoteProductOption(product, index) {
  const b2b = product.prezzo_b2b
    ? Number(product.prezzo_b2b).toFixed(2)
    : "0.00";
  return `
    <div class="quote-item-row" data-index="${index}" data-price="${product.prezzo_b2b || 0}" data-name="${product.nome}" data-id="${product.id}">
      <div class="quote-item-row__info">
        <strong>${product.nome}</strong>
        <span>${product.categorie?.nome || ""} · €${b2b}/${product.confezione}</span>
      </div>
      <div class="quote-item-row__controls">
        <label>Qtà</label>
        <input type="number" class="quote-item-qty" min="0" max="999" value="0" data-index="${index}" />
      </div>
    </div>`;
}

// ════════════════════════════════════════════════════════════════
// VIEW (async)
// ════════════════════════════════════════════════════════════════
export async function areaRiservataView() {
  const user = await getUser();

  if (!user) {
    // Not logged in → redirect to login
    setTimeout(() => {
      window.location.hash = "#/login";
    }, 100);
    return `
    <section class="page-hero">
      <div class="container" style="text-align: center;">
        <p class="section-eyebrow">Accesso Richiesto</p>
        <h1 class="section-title">Area Riservata</h1>
        <p class="page-hero__subtitle">Effettua il login per accedere.</p>
        <a href="#/login" class="btn btn--primary" data-link style="margin-top: var(--s-xl); display: inline-block;">Vai al Login</a>
      </div>
    </section>`;
  }

  const displayName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "Partner";
  const products = await fetchB2BProducts();

  const tableRows = products.map((p) => renderB2BProductRow(p)).join("");
  const quoteItems = products
    .map((p, i) => renderQuoteProductOption(p, i))
    .join("");

  return `
  <section class="dashboard">
    <div class="container">
      <!-- HEADER -->
      <div class="dashboard__header animate-on-scroll">
        <div>
          <p class="section-eyebrow">Area Riservata B2B</p>
          <h1 style="font-family: var(--f-heading); font-size: clamp(1.6rem, 3vw, 2.4rem); font-weight: 300;">
            Benvenuto, <span style="color: var(--c-gold-light);">${displayName}</span>
          </h1>
          <p style="color: var(--c-text-muted); font-size: 0.85rem; margin-top: var(--s-xs);">${user.email}</p>
        </div>
        <button class="btn btn--glass btn--sm" id="logout-btn">Esci</button>
      </div>

      <!-- STATS -->
      <div class="dashboard__stats animate-on-scroll" data-delay="100">
        <div class="dash-stat glass-panel">
          <span class="dash-stat__number">${products.length}</span>
          <span class="dash-stat__label">Prodotti Disponibili</span>
        </div>
        <div class="dash-stat glass-panel">
          <span class="dash-stat__number">-30%</span>
          <span class="dash-stat__label">Sconto Medio B2B</span>
        </div>
        <div class="dash-stat glass-panel">
          <span class="dash-stat__number">24h</span>
          <span class="dash-stat__label">Tempo di Evasione</span>
        </div>
      </div>

      <!-- B2B PRICE LIST -->
      <div class="dashboard__prices glass-panel animate-on-scroll" data-delay="200">
        <div class="dashboard__prices-header">
          <h2 style="font-family: var(--f-heading); font-weight: 300;">Listino Prezzi B2B</h2>
          <button class="btn btn--primary btn--sm" id="download-pdf-btn">
            <span style="margin-right: 6px;">↓</span> Scarica Listino PDF
          </button>
        </div>
        <div style="overflow-x: auto;">
          <table class="b2b-table">
            <thead>
              <tr>
                <th>Prodotto</th>
                <th>Confezione</th>
                <th>Listino</th>
                <th>Prezzo B2B</th>
                <th>Risparmio</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      </div>

      <!-- CUSTOM QUOTE BUILDER -->
      <div class="custom-quote glass-panel animate-on-scroll" data-delay="300">
        <div class="custom-quote__header">
          <p class="section-eyebrow">Preventivo Personalizzato</p>
          <h2 style="font-family: var(--f-heading); font-weight: 300;">Componi il Tuo Ordine</h2>
          <p style="color: var(--c-text-secondary); font-size: 0.85rem; margin-top: var(--s-sm);">
            Seleziona i prodotti e le quantità desiderate. Il totale si aggiorna in tempo reale.
          </p>
        </div>
        <div class="custom-quote__items" id="quote-items">
          ${quoteItems}
        </div>
        <div class="custom-quote__footer">
          <div class="quote-summary" id="quote-summary">
            <div class="quote-summary__row">
              <span>Prodotti selezionati:</span>
              <strong id="quote-count">0</strong>
            </div>
            <div class="quote-summary__row quote-summary__total">
              <span>Totale stimato B2B:</span>
              <strong id="quote-total">€0.00</strong>
            </div>
          </div>
          <div class="custom-quote__notes">
            <label for="custom-quote-notes">Note aggiuntive</label>
            <textarea id="custom-quote-notes" rows="2" placeholder="Incisioni, personalizzazioni, tempi di consegna..."></textarea>
          </div>
          <button class="btn btn--glass btn--full" id="generate-quote-pdf-btn" disabled>
            Scarica Preventivo Ufficiale (PDF)
          </button>
        </div>
      </div>

      <!-- ACTIONS -->
      <div class="dashboard__actions animate-on-scroll" data-delay="400">
        <a href="#/catalogo" class="btn btn--primary" data-link>Sfoglia il Catalogo</a>
        <a href="#/contatti" class="btn btn--glass" data-link>Contatta il Tuo Account Manager</a>
      </div>
    </div>
  </section>
  `;
}

// ════════════════════════════════════════════════════════════════
// PDF Generation — Listino B2B
// ════════════════════════════════════════════════════════════════
function generateListinoPDF(products, userName) {
  const doc = new jsPDF();
  const now = new Date();
  const dateStr = now.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Header
  doc.setFillColor(10, 10, 15);
  doc.rect(0, 0, 210, 45, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(245, 240, 232);
  doc.text("CRISTALMAD", 20, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(201, 168, 76);
  doc.text("ITALIAN DESIGN — CRISTALLERIA ARTIGIANALE", 20, 30);

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Listino Prezzi B2B — ${dateStr}`, 20, 38);
  doc.text(`Cliente: ${userName}`, 130, 38);

  // Gold separator
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.5);
  doc.line(20, 46, 190, 46);

  // Table
  const tableData = products.map((p) => [
    p.nome,
    p.categorie?.nome || "",
    p.confezione,
    p.prezzo_b2c ? `€${Number(p.prezzo_b2c).toFixed(2)}` : "—",
    p.prezzo_b2b ? `€${Number(p.prezzo_b2b).toFixed(2)}` : "—",
    p.prezzo_b2c && p.prezzo_b2b
      ? `-${Math.round((1 - p.prezzo_b2b / p.prezzo_b2c) * 100)}%`
      : "",
  ]);

  autoTable(doc, {
    startY: 52,
    head: [
      [
        "Prodotto",
        "Categoria",
        "Confezione",
        "Listino",
        "Prezzo B2B",
        "Risparmio",
      ],
    ],
    body: tableData,
    theme: "plain",
    headStyles: {
      fillColor: [26, 26, 46],
      textColor: [201, 168, 76],
      fontSize: 7,
      fontStyle: "bold",
      cellPadding: 5,
    },
    bodyStyles: {
      textColor: [60, 60, 60],
      fontSize: 8,
      cellPadding: 4,
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
    columnStyles: {
      4: { fontStyle: "bold", textColor: [26, 26, 46] },
      5: { textColor: [46, 204, 113] },
    },
  });

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.3);
  doc.line(20, pageHeight - 25, 190, pageHeight - 25);

  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "CRISTALMAD S.r.l. — Cristalleria Artigianale Italiana",
    20,
    pageHeight - 18,
  );
  doc.text("info@cristalmad.com — www.cristalmad.com", 20, pageHeight - 13);
  doc.text(
    `Documento generato il ${dateStr} — Prezzi riservati, non divulgare.`,
    20,
    pageHeight - 8,
  );

  doc.save(`Cristalmad_Listino_B2B_${now.toISOString().slice(0, 10)}.pdf`);
}

// ════════════════════════════════════════════════════════════════
// PDF Generation — Preventivo Personalizzato
// ════════════════════════════════════════════════════════════════
function generateQuotePDF(
  selectedItems,
  totalAmount,
  notes,
  userName,
  quoteNumber,
) {
  const doc = new jsPDF();
  const now = new Date();
  const dateStr = now.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Header
  doc.setFillColor(10, 10, 15);
  doc.rect(0, 0, 210, 45, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(245, 240, 232);
  doc.text("CRISTALMAD", 20, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(201, 168, 76);
  doc.text("PREVENTIVO PERSONALIZZATO", 20, 30);

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Data: ${dateStr}`, 20, 38);
  doc.text(`Cliente: ${userName}`, 130, 38);
  if (quoteNumber) {
    doc.text(`Rif. Preventivo: ${quoteNumber}`, 20, 42);
  }

  // Gold separator
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.5);
  doc.line(20, 46, 190, 46);

  // Table
  const tableData = selectedItems.map((item) => [
    item.name,
    item.qty.toString(),
    `€${Number(item.unitPrice).toFixed(2)}`,
    `€${(item.qty * item.unitPrice).toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: 52,
    head: [["Articolo", "Quantità", "Prezzo Unitario", "Totale"]],
    body: tableData,
    theme: "plain",
    headStyles: {
      fillColor: [26, 26, 46],
      textColor: [201, 168, 76],
      fontSize: 8,
      fontStyle: "bold",
      cellPadding: 5,
    },
    bodyStyles: {
      textColor: [60, 60, 60],
      fontSize: 9,
      cellPadding: 5,
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
    columnStyles: {
      3: { fontStyle: "bold" },
    },
  });

  // Total
  const finalY = doc.lastAutoTable?.finalY || 120;
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.5);
  doc.line(120, finalY + 5, 190, finalY + 5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(26, 26, 46);
  doc.text(`Totale: €${totalAmount.toFixed(2)}`, 190, finalY + 15, {
    align: "right",
  });

  // Notes
  if (notes) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text("Note:", 20, finalY + 30);
    const splitNotes = doc.splitTextToSize(notes, 170);
    doc.text(splitNotes, 20, finalY + 36);
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.3);
  doc.line(20, pageHeight - 25, 190, pageHeight - 25);

  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "CRISTALMAD S.r.l. — Cristalleria Artigianale Italiana",
    20,
    pageHeight - 18,
  );
  doc.text(
    "Preventivo valido per 30 giorni. Trasporto assicurato escluso.",
    20,
    pageHeight - 13,
  );
  doc.text(`Documento generato il ${dateStr}`, 20, pageHeight - 8);

  doc.save(`Preventivo_Cristalmad_${now.toISOString().slice(0, 10)}.pdf`);
}

// ════════════════════════════════════════════════════════════════
// INIT — Event listeners for dashboard
// ════════════════════════════════════════════════════════════════
export function initDashboard() {
  // ─── Logout ───
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      logoutBtn.disabled = true;
      logoutBtn.textContent = "Uscita...";
      await signOut();
    });
  }

  // ─── Download Listino PDF ───
  const pdfBtn = document.getElementById("download-pdf-btn");
  if (pdfBtn) {
    pdfBtn.addEventListener("click", async () => {
      pdfBtn.disabled = true;
      pdfBtn.innerHTML =
        '<span style="margin-right: 6px;">⏳</span> Generazione...';
      const products = await fetchB2BProducts();
      const user = await getUser();
      const userName =
        user?.user_metadata?.full_name || user?.email || "Partner";
      generateListinoPDF(products, userName);
      setTimeout(() => {
        pdfBtn.disabled = false;
        pdfBtn.innerHTML =
          '<span style="margin-right: 6px;">↓</span> Scarica Listino PDF';
      }, 1500);
    });
  }

  // ─── Custom quote builder — real-time total ───
  const quoteItems = document.getElementById("quote-items");
  const quoteCount = document.getElementById("quote-count");
  const quoteTotal = document.getElementById("quote-total");
  const generateBtn = document.getElementById("generate-quote-pdf-btn");

  function updateQuoteSummary() {
    const inputs = document.querySelectorAll(".quote-item-qty");
    let total = 0;
    let count = 0;
    inputs.forEach((input) => {
      const qty = parseInt(input.value) || 0;
      if (qty > 0) {
        const row = input.closest(".quote-item-row");
        const price = parseFloat(row.dataset.price) || 0;
        total += qty * price;
        count++;
      }
    });
    if (quoteCount) quoteCount.textContent = count;
    if (quoteTotal) quoteTotal.textContent = `€${total.toFixed(2)}`;
    if (generateBtn) generateBtn.disabled = count === 0;
  }

  if (quoteItems) {
    quoteItems.addEventListener("input", (e) => {
      if (e.target.classList.contains("quote-item-qty")) {
        updateQuoteSummary();
      }
    });
  }

  // ─── Generate Quote PDF ───
  if (generateBtn) {
    generateBtn.addEventListener("click", async () => {
      const inputs = document.querySelectorAll(".quote-item-qty");
      const selectedItems = [];
      let total = 0;

      inputs.forEach((input) => {
        const qty = parseInt(input.value) || 0;
        if (qty > 0) {
          const row = input.closest(".quote-item-row");
          const price = parseFloat(row.dataset.price) || 0;
          selectedItems.push({
            name: row.dataset.name,
            product_id: row.dataset.id,
            qty,
            quantity: qty, // format expected by create-quote API
            unitPrice: price,
          });
          total += qty * price;
        }
      });

      const notes = document.getElementById("custom-quote-notes")?.value || "";
      const user = await getUser();
      const userName =
        user?.user_metadata?.full_name || user?.email || "Partner";

      generateBtn.disabled = true;
      generateBtn.textContent = "⏳ Generazione...";

      try {
        // Salva nel database (stato: pending)
        const { data, error } = await supabase.functions.invoke(
          "create-quote",
          {
            body: { items: selectedItems, notes },
          },
        );

        if (error) throw error;

        // Genera PDF con il numero ufficiale
        generateQuotePDF(
          selectedItems,
          total,
          notes,
          userName,
          data.quote_number,
        );

        // Reset the form
        document
          .querySelectorAll(".quote-item-qty")
          .forEach((i) => (i.value = 0));
        const quoteNotes = document.getElementById("custom-quote-notes");
        if (quoteNotes) quoteNotes.value = "";
        updateQuoteSummary();
      } catch (err) {
        console.error("[Quote] Failed to save quote on backend:", err);
        // Fallback al PDF offline
        generateQuotePDF(selectedItems, total, notes, userName, null);
      } finally {
        setTimeout(() => {
          generateBtn.disabled = false;
          generateBtn.textContent = "Scarica Preventivo Ufficiale (PDF)";
        }, 1500);
      }
    });
  }
}
