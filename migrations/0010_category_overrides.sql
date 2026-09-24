CREATE TABLE IF NOT EXISTS category_overrides (
  source TEXT NOT NULL,
  category_id INTEGER NOT NULL,
  name_mk TEXT,
  name_en TEXT,
  name_sq TEXT,
  slug TEXT,
  parent_id INTEGER,
  hidden INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (source, category_id)
);

CREATE TABLE IF NOT EXISTS product_category_overrides (
  source TEXT NOT NULL,
  product_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (source, product_id)
);
