-- ============================================
-- Cristalmad — Migration 004: Row Level Security
-- ============================================
-- Politiche di sicurezza per TUTTE le tabelle.
-- Principio: ogni utente vede solo i propri dati.
-- Gli admin possono vedere e modificare tutto.
-- =====================
-- BUSINESS PROFILES
-- =====================
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
-- Ogni utente può vedere il proprio profilo
CREATE POLICY "bp_select_own" ON public.business_profiles FOR
SELECT USING (auth.uid() = id);
-- Ogni utente può aggiornare il proprio profilo (tranne is_approved)
CREATE POLICY "bp_update_own" ON public.business_profiles FOR
UPDATE USING (auth.uid() = id) WITH CHECK (
        auth.uid() = id
        AND is_approved = (
            SELECT is_approved
            FROM public.business_profiles
            WHERE id = auth.uid()
        )
    );
-- Admin può vedere tutti i profili
CREATE POLICY "bp_select_admin" ON public.business_profiles FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM auth.users
            WHERE auth.users.id = auth.uid()
                AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );
-- Admin può aggiornare qualsiasi profilo (inclusa approvazione)
CREATE POLICY "bp_update_admin" ON public.business_profiles FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM auth.users
            WHERE auth.users.id = auth.uid()
                AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );
-- Insert gestito dal trigger (SECURITY DEFINER), non serve policy INSERT pubblica
-- =====================
-- PRODUCTS
-- =====================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
-- Tutti possono vedere i prodotti attivi (anche utenti non autenticati)
CREATE POLICY "products_select_active" ON public.products FOR
SELECT USING (is_active = TRUE);
-- Admin può vedere tutti i prodotti (anche inattivi)
CREATE POLICY "products_select_admin" ON public.products FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM auth.users
            WHERE auth.users.id = auth.uid()
                AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );
-- Solo admin può inserire/modificare/eliminare prodotti
CREATE POLICY "products_insert_admin" ON public.products FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM auth.users
            WHERE auth.users.id = auth.uid()
                AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );
CREATE POLICY "products_update_admin" ON public.products FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM auth.users
            WHERE auth.users.id = auth.uid()
                AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );
CREATE POLICY "products_delete_admin" ON public.products FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM auth.users
        WHERE auth.users.id = auth.uid()
            AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
);
-- =====================
-- ORDERS
-- =====================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
-- Ogni utente vede solo i propri ordini
CREATE POLICY "orders_select_own" ON public.orders FOR
SELECT USING (auth.uid() = user_id);
-- Utenti approvati possono creare ordini
CREATE POLICY "orders_insert_approved" ON public.orders FOR
INSERT WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1
            FROM public.business_profiles
            WHERE id = auth.uid()
                AND is_approved = TRUE
        )
    );
-- Admin può vedere tutti gli ordini
CREATE POLICY "orders_select_admin" ON public.orders FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM auth.users
            WHERE auth.users.id = auth.uid()
                AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );
-- Admin può aggiornare qualsiasi ordine
CREATE POLICY "orders_update_admin" ON public.orders FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM auth.users
            WHERE auth.users.id = auth.uid()
                AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );