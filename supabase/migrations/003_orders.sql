-- ============================================
-- Cristalmad — Migration 003: Orders
-- ============================================
-- Ordini B2B con integrazione Stripe.
-- Supporta il ciclo completo: pending → paid → processing → shipped → delivered
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Utente
    user_id UUID NOT NULL REFERENCES auth.users(id),
    -- Stripe
    stripe_checkout_session_id TEXT UNIQUE,
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    -- Stato
    status TEXT DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'paid',
            'processing',
            'shipped',
            'delivered',
            'cancelled',
            'refunded'
        )
    ),
    -- Dettaglio prodotti
    items JSONB NOT NULL DEFAULT '[]',
    -- Esempio: [{"product_id": "...", "name": "...", "quantity": 2, "unit_price_cents": 5000, "customization": {...}}]
    -- Importi (in centesimi EUR)
    subtotal_cents INTEGER NOT NULL CHECK (subtotal_cents >= 0),
    discount_percent INTEGER DEFAULT 0 CHECK (
        discount_percent >= 0
        AND discount_percent <= 100
    ),
    discount_cents INTEGER DEFAULT 0 CHECK (discount_cents >= 0),
    shipping_cents INTEGER DEFAULT 0 CHECK (shipping_cents >= 0),
    tax_cents INTEGER DEFAULT 0 CHECK (tax_cents >= 0),
    total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
    currency TEXT DEFAULT 'EUR',
    -- Indirizzi (snapshot al momento dell'ordine)
    shipping_address JSONB NOT NULL DEFAULT '{}',
    billing_address JSONB NOT NULL DEFAULT '{}',
    -- Fatturazione
    invoice_number TEXT UNIQUE,
    invoice_url TEXT,
    -- Spedizione
    tracking_number TEXT,
    tracking_url TEXT,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    -- Note
    customer_notes TEXT,
    internal_notes TEXT,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ
);
-- Indici
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON public.orders(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_invoice ON public.orders(invoice_number);
-- Trigger updated_at
CREATE TRIGGER set_updated_at_orders BEFORE
UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
-- Funzione per generare numero fattura progressivo
CREATE OR REPLACE FUNCTION public.generate_invoice_number() RETURNS TRIGGER AS $$
DECLARE year_prefix TEXT;
next_number INTEGER;
BEGIN IF NEW.status = 'paid'
AND OLD.status = 'pending'
AND NEW.invoice_number IS NULL THEN year_prefix := TO_CHAR(NOW(), 'YYYY');
SELECT COALESCE(
        MAX(
            CAST(SPLIT_PART(invoice_number, '-', 3) AS INTEGER)
        ),
        0
    ) + 1 INTO next_number
FROM public.orders
WHERE invoice_number LIKE 'CM-' || year_prefix || '-%';
NEW.invoice_number := 'CM-' || year_prefix || '-' || LPAD(next_number::TEXT, 5, '0');
NEW.paid_at := NOW();
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER set_invoice_number BEFORE
UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.generate_invoice_number();