# 🔒 Cristalmad — Backend & Payments Strategy

## Login B2B con Supabase + Pagamenti con Stripe

> **Autore:** Backend & Security Architect  
> **Data:** 2026-02-22  
> **Stato:** BOZZA — In attesa di approvazione

---

## 1. Panoramica del Progetto

Cristalmad è un brand luxury. Il backend deve gestire:

- **Autenticazione B2B** (clienti business, rivenditori, showroom)
- **Pagamenti sicuri** tramite Stripe (ordini, fatturazione, abbonamenti)
- **Separazione netta** dal frontend (che è gestito da un altro team)

### Vincoli operativi

- ❌ **Divieto assoluto** di toccare file HTML, CSS, o viste in `src/views/`
- ✅ Il mio perimetro: database, API, autenticazione, pagamenti, sicurezza

---

## 2. Stack Tecnologico Previsto

| Layer | Tecnologia | Note |
|-------|-----------|------|
| **Database & Auth** | Supabase (PostgreSQL) | Auth nativa, RLS, Realtime |
| **Pagamenti** | Stripe API | Checkout Session, Webhooks |
| **Backend Logic** | Supabase Edge Functions (Deno) | Serverless, sicuro |
| **Ambiente** | Node.js + Vite (dev) | Per il tooling locale |

---

## 3. Strategia di Autenticazione B2B

### 3.1 Modello Utenti

```sql
-- Tabella profili B2B (estende auth.users di Supabase)
CREATE TABLE public.business_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  vat_number TEXT UNIQUE NOT NULL,        -- Partita IVA
  business_type TEXT CHECK (business_type IN ('retailer', 'showroom', 'wholesaler', 'hotel')),
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  shipping_address JSONB,
  billing_address JSONB,
  discount_tier TEXT DEFAULT 'standard' CHECK (discount_tier IN ('standard', 'silver', 'gold', 'platinum')),
  is_approved BOOLEAN DEFAULT FALSE,      -- Approvazione manuale admin
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

-- Ogni utente vede solo il proprio profilo
CREATE POLICY "Users can view own profile"
  ON public.business_profiles FOR SELECT
  USING (auth.uid() = id);

-- Solo admin può approvare
CREATE POLICY "Admins can update all profiles"
  ON public.business_profiles FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');
```

### 3.2 Flusso di Registrazione B2B

```
1. Cliente business compila form di registrazione
2. Supabase Auth crea l'utente (email + password)
3. Trigger DB crea il record in business_profiles (is_approved = false)
4. Email automatica all'admin per approvazione
5. Admin approva → is_approved = true
6. Cliente riceve email di conferma → può ordinare
```

### 3.3 Sicurezza

- **RLS (Row Level Security)** su tutte le tabelle
- **JWT custom claims** per ruoli (`admin`, `buyer`, `viewer`)
- **Rate limiting** sulle Edge Functions
- **Validazione Partita IVA** tramite API VIES (EU)
- **2FA opzionale** per account admin

---

## 4. Strategia Pagamenti Stripe

### 4.1 Architettura

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Frontend    │────▶│  Edge Function   │────▶│  Stripe API │
│  (no touch)  │     │  /create-checkout│     │             │
└─────────────┘     └──────────────────┘     └──────┬──────┘
                                                     │
                    ┌──────────────────┐              │
                    │  Edge Function   │◀─────────────┘
                    │  /stripe-webhook │   (webhook events)
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Supabase DB     │
                    │  orders table    │
                    └──────────────────┘
```

### 4.2 Modello Ordini

```sql
-- Tabella ordini
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
  )),
  items JSONB NOT NULL,                   -- Dettaglio prodotti
  subtotal_cents INTEGER NOT NULL,        -- Prezzo in centesimi
  discount_percent INTEGER DEFAULT 0,     -- Sconto B2B
  tax_cents INTEGER DEFAULT 0,
  total_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'EUR',
  shipping_address JSONB,
  billing_address JSONB,
  invoice_number TEXT UNIQUE,             -- Numerazione fatture
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: ogni utente vede solo i propri ordini
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 4.3 Tabella Prodotti (Backend)

```sql
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('crystal', 'glass', 'set', 'custom', 'accessory')),
  base_price_cents INTEGER NOT NULL,      -- Prezzo base in centesimi
  is_customizable BOOLEAN DEFAULT FALSE,
  customization_options JSONB,            -- Opzioni incisione, colori, etc.
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  images JSONB,                           -- Array URL immagini
  metadata JSONB,                         -- SEO, dimensioni, peso
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.4 Flusso di Pagamento

```
1. Utente B2B (approvato) aggiunge prodotti al carrello
2. Frontend chiama Edge Function POST /create-checkout
3. Edge Function:
   a. Verifica autenticazione JWT
   b. Verifica che l'utente sia approvato (is_approved = true)
   c. Calcola prezzo con sconto B2B (discount_tier)
   d. Crea Stripe Checkout Session con i line_items
   e. Salva ordine in DB con status 'pending'
   f. Ritorna URL checkout Stripe
4. Frontend redirige a Stripe Checkout
5. Stripe processa il pagamento
6. Webhook POST /stripe-webhook riceve evento 'checkout.session.completed'
7. Edge Function aggiorna ordine → status = 'paid'
8. Email di conferma al cliente
9. Notifica admin per elaborazione ordine
```

### 4.5 Webhook Stripe — Eventi Gestiti

| Evento Stripe | Azione Backend |
|---------------|---------------|
| `checkout.session.completed` | Ordine → `paid`, email conferma |
| `payment_intent.payment_failed` | Ordine → `cancelled`, notifica utente |
| `charge.refunded` | Ordine → `refunded`, aggiorna stock |
| `invoice.paid` | Per abbonamenti futuri |

---

## 5. Edge Functions Previste

| Funzione | Metodo | Descrizione |
|----------|--------|-------------|
| `/create-checkout` | POST | Crea sessione Stripe Checkout |
| `/stripe-webhook` | POST | Riceve eventi da Stripe |
| `/approve-user` | POST | Admin approva utente B2B |
| `/get-orders` | GET | Lista ordini utente (con paginazione) |
| `/get-order/:id` | GET | Dettaglio singolo ordine |
| `/validate-vat` | POST | Verifica Partita IVA via VIES |

---

## 6. Variabili d'Ambiente Necessarie (.env)

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Solo backend, MAI esposto

# Stripe
STRIPE_SECRET_KEY=sk_live_...      # Solo backend
STRIPE_WEBHOOK_SECRET=whsec_...    # Per verificare webhook
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...  # Può andare al frontend

# App
APP_URL=https://cristalmad.com
ADMIN_EMAIL=admin@cristalmad.com
```

---

## 7. Sicurezza — Checklist

- [ ] RLS attivo su TUTTE le tabelle
- [ ] Service Role Key MAI esposta al client
- [ ] Webhook Stripe verificato con signature
- [ ] Input sanitization su tutte le Edge Functions
- [ ] Rate limiting su endpoint sensibili
- [ ] CORS configurato solo per domini autorizzati
- [ ] Logging degli accessi admin
- [ ] Backup automatici del database
- [ ] Audit trail per modifiche ordini

---

## 8. Prossimi Passi (in ordine)

1. **Setup progetto** — Inizializzare `package.json`, configurare `.env`, creare `src/lib/supabase.js`
2. **Schema DB** — Creare le tabelle su Supabase (migrazioni SQL)
3. **Auth flow** — Implementare registrazione/login B2B
4. **Edge Functions** — Scrivere le funzioni serverless
5. **Stripe integration** — Collegare pagamenti e webhook
6. **Testing** — Test end-to-end del flusso completo
7. **Deploy** — Configurazione produzione

---

> ⚠️ **NOTA:** Questo documento è la strategia iniziale. Ogni modifica verrà discussa con il team prima dell'implementazione.
