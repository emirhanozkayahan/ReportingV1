-- ============================================
-- AdReport Veritabanı Şeması (Supabase)
-- Son güncelleme: 2026-04-21
-- ============================================

-- 1. Markalar
CREATE TABLE brands (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  slug       TEXT UNIQUE,
  client_email TEXT,
  client_password TEXT,
  logo_url TEXT,
  ga4_property_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Agency Settings (For storing global refresh tokens)
CREATE TABLE agency_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Günlük Satış Verileri (İkas → Apps Script → Supabase)
CREATE TABLE daily_sales (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id    UUID REFERENCES brands(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  order_count INTEGER,
  revenue     NUMERIC,
  platform    TEXT,
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(brand_id, date, platform)
);

-- 3. Günlük Reklam Verileri (Meta / Google)
CREATE TABLE daily_ad_stats (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id    UUID REFERENCES brands(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  platform    TEXT NOT NULL,
  spend       NUMERIC,
  impressions INTEGER,
  clicks      INTEGER,
  conversions INTEGER,
  revenue     NUMERIC,
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(brand_id, date, platform)
);

-- 4. Günlük Site İstatistikleri (GA4 entegrasyonu için)
CREATE TABLE daily_site_stats (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id           UUID REFERENCES brands(id) ON DELETE CASCADE,
  date               DATE NOT NULL,
  sessions           INTEGER,
  conversion_rate    NUMERIC,
  new_visitors       INTEGER,
  returning_visitors INTEGER,
  updated_at         TIMESTAMPTZ DEFAULT now(),
  UNIQUE(brand_id, date)
);

-- Indexler
CREATE INDEX idx_daily_sales_date ON daily_sales(date);
CREATE INDEX idx_daily_sales_brand ON daily_sales(brand_id);

-- Günlük en çok satan ürünler (platform başına günde max 10 kayıt)
CREATE TABLE daily_product_sales (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id      UUID REFERENCES brands(id) ON DELETE CASCADE,
  date          DATE NOT NULL,
  platform      TEXT NOT NULL,
  rank          INTEGER NOT NULL,
  product_id    TEXT NOT NULL,
  product_name  TEXT NOT NULL,
  sku           TEXT,
  category_name TEXT,
  quantity      INTEGER,
  revenue       NUMERIC,
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(brand_id, date, platform, rank)
);

CREATE INDEX idx_daily_product_sales_brand_date ON daily_product_sales(brand_id, date);
CREATE INDEX idx_daily_ad_stats_date ON daily_ad_stats(date);
CREATE INDEX idx_daily_ad_stats_brand ON daily_ad_stats(brand_id);
CREATE INDEX idx_daily_site_stats_date ON daily_site_stats(date);

-- Başlangıç Verileri
INSERT INTO brands (name, slug) VALUES
  ('navira', 'navira'),
  ('banamio', 'banamio'),
  ('efotech', 'efotech'),
  ('marka3', 'marka3'),
  ('marka4', 'marka4'),
  ('marka5', 'marka5');
