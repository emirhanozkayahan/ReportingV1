-- Günlük en çok satan ürünler (platform başına günde max 10 kayıt)
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
  UNIQUE(brand_id, date, platform, rank)
);

CREATE INDEX IF NOT EXISTS idx_daily_product_sales_brand_date ON daily_product_sales(brand_id, date);
