-- ============================================
-- Cristalmad — Migration 001: Business Profiles
-- ============================================
-- Tabella profili B2B (estende auth.users di Supabase)
-- Ogni cliente business ha un profilo con dati aziendali,
-- livello di sconto, e stato di approvazione.
CREATE TABLE IF NOT EXISTS public.business_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    -- Dati aziendali
    company_name TEXT NOT NULL,
    vat_number TEXT UNIQUE NOT NULL,
    business_type TEXT NOT NULL CHECK (
        business_type IN (
            'retailer',
            'showroom',
            'wholesaler',
            'hotel',
            'restaurant',
            'other'
        )
    ),
    -- Contatti
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    website TEXT,
    -- Indirizzi (JSONB per flessibilità internazionale)
    shipping_address JSONB DEFAULT '{}',
    billing_address JSONB DEFAULT '{}',
    -- Commerciale
    discount_tier TEXT DEFAULT 'standard' CHECK (
        discount_tier IN ('standard', 'silver', 'gold', 'platinum')
    ),
    -- Approvazione
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_business_profiles_vat ON public.business_profiles(vat_number);
CREATE INDEX IF NOT EXISTS idx_business_profiles_approved ON public.business_profiles(is_approved);
CREATE INDEX IF NOT EXISTS idx_business_profiles_type ON public.business_profiles(business_type);
-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER set_updated_at_business_profiles BEFORE
UPDATE ON public.business_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
-- Trigger per creare profilo automaticamente alla registrazione
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO public.business_profiles (
        id,
        company_name,
        vat_number,
        business_type,
        contact_email
    )
VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'vat_number', ''),
        COALESCE(
            NEW.raw_user_meta_data->>'business_type',
            'other'
        ),
        NEW.email
    );
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();