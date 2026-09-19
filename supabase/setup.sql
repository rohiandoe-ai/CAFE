-- ============================================
-- CAFE QR REVIEW SYSTEM - Complete SQL Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DROP EXISTING TABLES (Clean slate)
-- ============================================
DROP TABLE IF EXISTS public.message_logs CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.templates CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.menu_items CASCADE;
DROP TABLE IF EXISTS public.instagram_settings CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.businesses CASCADE;

-- ============================================
-- TABLE 1: businesses
-- ============================================
CREATE TABLE public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT 'House of Paloma',
    location TEXT NOT NULL DEFAULT 'Bandra West, Mumbai',
    google_review_url TEXT NOT NULL DEFAULT 'https://search.google.com/local/writereview?placeid=ChIJ4TflFcvJ5zsRWP5VIdUk9Qg',
    logo_url TEXT,
    admin_email TEXT NOT NULL DEFAULT 'admin@houseofpaloma.com',
    admin_password TEXT NOT NULL DEFAULT 'admin123',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 2: customers
-- ============================================
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    visit_count INTEGER DEFAULT 1,
    last_visit TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(cafe_id, phone)
);

CREATE INDEX customers_cafe_id_idx ON public.customers(cafe_id);
CREATE INDEX customers_phone_idx ON public.customers(phone);
CREATE INDEX customers_last_visit_idx ON public.customers(last_visit DESC);

-- ============================================
-- TABLE 3: reviews
-- ============================================
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    food_rating INTEGER CHECK (food_rating >= 1 AND food_rating <= 5),
    service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
    atmosphere_rating INTEGER CHECK (atmosphere_rating >= 1 AND atmosphere_rating <= 5),
    review_text TEXT,
    review_copied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX reviews_cafe_id_idx ON public.reviews(cafe_id);
CREATE INDEX reviews_created_at_idx ON public.reviews(created_at DESC);
CREATE INDEX reviews_rating_idx ON public.reviews(rating);

-- ============================================
-- TABLE 4: instagram_settings
-- ============================================
CREATE TABLE public.instagram_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE UNIQUE,
    instagram_url TEXT DEFAULT '',
    username TEXT DEFAULT '',
    follower_count TEXT DEFAULT '0',
    preview_images TEXT[] DEFAULT '{}',
    total_clicks INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 5: menu_items
-- ============================================
CREATE TABLE public.menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    category TEXT NOT NULL DEFAULT 'All',
    image_url TEXT DEFAULT '',
    is_available BOOLEAN DEFAULT TRUE,
    is_must_try BOOLEAN DEFAULT FALSE,
    veg_nonveg TEXT DEFAULT 'veg' CHECK (veg_nonveg IN ('veg', 'nonveg')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX menu_cafe_id_idx ON public.menu_items(cafe_id);
CREATE INDEX menu_category_idx ON public.menu_items(category);
CREATE INDEX menu_sort_idx ON public.menu_items(sort_order);

-- ============================================
-- TABLE 6: templates (WhatsApp)
-- ============================================
CREATE TABLE public.templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Custom' 
        CHECK (category IN ('We Miss You', 'Special Offer', 'Birthday', 'New Menu Item', 'Custom')),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX templates_cafe_id_idx ON public.templates(cafe_id);

-- ============================================
-- TABLE 7: campaigns
-- ============================================
CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
    template_name TEXT,
    segment TEXT NOT NULL DEFAULT 'All Customers',
    total_sent INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'completed', 'failed', 'scheduled')),
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX campaigns_cafe_id_idx ON public.campaigns(cafe_id);
CREATE INDEX campaigns_status_idx ON public.campaigns(status);

-- ============================================
-- TABLE 8: message_logs
-- ============================================
CREATE TABLE public.message_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    phone TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
    error TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX logs_campaign_id_idx ON public.message_logs(campaign_id);
CREATE INDEX logs_status_idx ON public.message_logs(status);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES (Public access for MVP)
-- ============================================
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'businesses','customers','reviews','instagram_settings',
        'menu_items','templates','campaigns','message_logs'
    ]
    LOOP
        EXECUTE format('CREATE POLICY "public_select_%s" ON public.%I FOR SELECT USING (true)', tbl, tbl);
        EXECUTE format('CREATE POLICY "public_insert_%s" ON public.%I FOR INSERT WITH CHECK (true)', tbl, tbl);
        EXECUTE format('CREATE POLICY "public_update_%s" ON public.%I FOR UPDATE USING (true)', tbl, tbl);
        EXECUTE format('CREATE POLICY "public_delete_%s" ON public.%I FOR DELETE USING (true)', tbl, tbl);
    END LOOP;
END $$;

-- ============================================
-- INSERT SEED DATA
-- ============================================

-- Business
INSERT INTO public.businesses (id, name, location, google_review_url, admin_email, admin_password)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'House of Paloma',
    'Bandra West, Mumbai',
    'https://search.google.com/local/writereview?placeid=ChIJu6ZBnxTJ5zsRvHMC18xfZnQ',
    'admin@houseofpaloma.com',
    'admin123'
);

-- Instagram settings
INSERT INTO public.instagram_settings (cafe_id, instagram_url, username, follower_count)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'https://www.instagram.com/houseofpaloma',
    '@houseofpaloma',
    '2.4K'
);

-- Sample menu items
INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_must_try, veg_nonveg, sort_order) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Espresso', 'Rich and bold single shot', 120, 'Coffee', true, 'veg', 1),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Cappuccino', 'Espresso with steamed milk foam', 180, 'Coffee', false, 'veg', 2),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Cold Brew', 'Slow brewed for 12 hours', 220, 'Coffee', true, 'veg', 3),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Avocado Toast', 'Sourdough with fresh avocado', 320, 'Food', true, 'veg', 4),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Chicken Sandwich', 'Grilled chicken with aioli', 380, 'Food', false, 'nonveg', 5),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Tiramisu', 'Classic Italian dessert', 280, 'Desserts', true, 'veg', 6),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mango Smoothie', 'Fresh Alphonso mango blend', 240, 'Drinks', false, 'veg', 7),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Virgin Mojito', 'Mint lime refresher', 200, 'Drinks', false, 'veg', 8);

-- Sample WhatsApp templates
INSERT INTO public.templates (cafe_id, name, category, message) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'We Miss You', 'We Miss You',
 'Hi {name}! 👋 We miss you at {cafe_name}. It''s been a while since your last visit. Come back and enjoy 10% off your next order! Valid this week only. 🙏'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Special Weekend Offer', 'Special Offer',
 'Hey {name}! 🎉 Special weekend offer at {cafe_name}! Buy 1 Get 1 Free on all beverages this Saturday & Sunday. Don''t miss it! ☕'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'New Menu Launch', 'New Menu Item',
 'Hi {name}! 🍽️ Exciting news from {cafe_name}! We''ve launched our new seasonal menu. Come try our exclusive new items. First 50 customers get a free dessert! 🎂');

-- ============================================
-- ENABLE REALTIME
-- ============================================
DO $$
BEGIN
    BEGIN ALTER PUBLICATION supabase_realtime DROP TABLE public.reviews; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER PUBLICATION supabase_realtime DROP TABLE public.menu_items; EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN ALTER PUBLICATION supabase_realtime DROP TABLE public.customers; EXCEPTION WHEN OTHERS THEN NULL; END;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
    RAISE NOTICE '✅ Realtime enabled';
END $$;

-- ============================================
-- VERIFY
-- ============================================
SELECT 'businesses' as table_name, COUNT(*) as rows FROM public.businesses
UNION ALL SELECT 'menu_items', COUNT(*) FROM public.menu_items
UNION ALL SELECT 'templates', COUNT(*) FROM public.templates
UNION ALL SELECT 'instagram_settings', COUNT(*) FROM public.instagram_settings;
