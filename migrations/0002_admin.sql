CREATE TABLE IF NOT EXISTS product_overrides (
  source TEXT NOT NULL,
  product_id INTEGER NOT NULL,
  name TEXT,
  price INTEGER,
  regular_price INTEGER,
  in_stock INTEGER,
  hidden INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (source, product_id)
);
