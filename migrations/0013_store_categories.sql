CREATE TABLE IF NOT EXISTS store_categories (
  id TEXT PRIMARY KEY,
  name_mk TEXT NOT NULL,
  name_en TEXT,
  name_sq TEXT,
  slug TEXT NOT NULL UNIQUE,
  parent_id TEXT,
  hidden INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

ALTER TABLE custom_products ADD COLUMN category_id TEXT;
