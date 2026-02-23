-- ============================================
-- Cristalmad — Migration 002: Products
-- ============================================
-- Catalogo prodotti luxury.
-- I prezzi sono in centesimi (EUR) per evitare errori di arrotondamento.
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Identificazione
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    sku TEXT UNIQUE,
    -- Descrizione
    description TEXT,
    short_description TEXT,
    -- Categorizzazione
    category TEXT NOT NULL CHECK (
        category IN (
            'crystal',
            'glass',
            'set',
            'custom',
            'accessory',
            'limited_edition'
        )
    ),
    tags TEXT [] DEFAULT '{}',
    -- Prezzo (in centesimi EUR)
    base_price_cents INTEGER NOT NULL CHECK (base_price_cents >= 0),
    compare_at_price_cents INTEGER CHECK (compare_at_price_cents >= 0),
    -- Personalizzazione
    is_customizable BOOLEAN DEFAULT FALSE,
    customization_options JSONB DEFAULT '[]',
    -- Esempio: [{"type": "engraving", "max_chars": 20, "price_cents": 1500}]
    -- Inventario
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    low_stock_threshold INTEGER DEFAULT 5,
    track_inventory BOOLEAN DEFAULT TRUE,
    -- Media
    images JSONB DEFAULT '[]',
    -- Esempio: [{"url": "...", "alt": "...", "is_primary": true}]
    -- Specifiche fisiche
    weight_grams INTEGER,
    dimensions JSONB,
    -- Esempio: {"width_cm": 10, "height_cm": 15, "depth_cm": 10}
    -- SEO & metadata
    meta_title TEXT,
    meta_description TEXT,
    metadata JSONB DEFAULT '{}',
    -- Stato
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Indici
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured)
WHERE is_featured = TRUE;
-- Trigger updated_at
CREATE TRIGGER set_updated_at_products BEFORE
UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();