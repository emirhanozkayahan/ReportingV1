-- ============================================
-- AdReport — full initial schema for a fresh Supabase project
-- Supersedes database/schema.sql (which lacked integrations and brand_users).
-- ============================================

-- 1. Brands
CREATE TABLE IF NOT EXISTS brands (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name            TEXT NOT NULL UNIQUE,
  slug            TEXT NOT NULL UNIQUE,
  client_email    TEXT,
  client_password TEXT,
  logo_url        TEXT,
  ga4_property_id TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 2. Brand users (client dashboard logins)
CREATE TABLE IF NOT EXISTS brand_users (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id   UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  email      TEXT NOT NULL UNIQUE,
  password   TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_brand_users_brand ON brand_users(brand_id);

-- 3. Platform integrations (meta, google, ikas, tsoft, shopify, ...)
CREATE TABLE IF NOT EXISTS integrations (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id    UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  platform    TEXT NOT NULL,
  credentials JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (brand_id, platform)
);

-- 4. Agency-wide settings (OAuth refresh/access tokens)
CREATE TABLE IF NOT EXISTS agency_settings (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key        TEXT NOT NULL UNIQUE,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Daily e-commerce sales
CREATE TABLE IF NOT EXISTS daily_sales (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id    UUID REFERENCES brands(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  order_count INTEGER,
  revenue     NUMERIC,
  platform    TEXT,
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (brand_id, date, platform)
);
CREATE INDEX IF NOT EXISTS idx_daily_sales_date  ON daily_sales(date);
CREATE INDEX IF NOT EXISTS idx_daily_sales_brand ON daily_sales(brand_id);

-- 6. Daily ad stats (Meta / Google)
-- conversions is NUMERIC: Google Ads and Meta report fractional conversions.
CREATE TABLE IF NOT EXISTS daily_ad_stats (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id    UUID REFERENCES brands(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  platform    TEXT NOT NULL,
  spend       NUMERIC,
  impressions BIGINT,
  clicks      BIGINT,
  conversions NUMERIC,
  revenue     NUMERIC,
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (brand_id, date, platform)
);
CREATE INDEX IF NOT EXISTS idx_daily_ad_stats_date  ON daily_ad_stats(date);
CREATE INDEX IF NOT EXISTS idx_daily_ad_stats_brand ON daily_ad_stats(brand_id);

-- 7. Daily site stats (GA4)
CREATE TABLE IF NOT EXISTS daily_site_stats (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id           UUID REFERENCES brands(id) ON DELETE CASCADE,
  date               DATE NOT NULL,
  sessions           INTEGER,
  conversion_rate    NUMERIC,
  new_visitors       INTEGER,
  returning_visitors INTEGER,
  updated_at         TIMESTAMPTZ DEFAULT now(),
  UNIQUE (brand_id, date)
);
CREATE INDEX IF NOT EXISTS idx_daily_site_stats_date ON daily_site_stats(date);

-- 8. Daily top-selling products (max 10 rows per brand/platform/day)
CREATE TABLE IF NOT EXISTS daily_product_sales (
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
  UNIQUE (brand_id, date, platform, rank)
);
CREATE INDEX IF NOT EXISTS idx_daily_product_sales_brand_date ON daily_product_sales(brand_id, date);

-- Row Level Security: ON for every table, no policies.
-- All app access goes through server-side routes using the service_role key,
-- which bypasses RLS. The public anon key can read nothing (credentials and
-- passwords live in these tables).
ALTER TABLE brands              ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_settings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sales         ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_ad_stats      ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_site_stats    ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_product_sales ENABLE ROW LEVEL SECURITY;
