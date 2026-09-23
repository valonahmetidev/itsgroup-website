CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  discount_percent INTEGER,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS customer_product_discounts (
  customer_id TEXT NOT NULL,
  source TEXT NOT NULL,
  product_id TEXT NOT NULL,
  discount_percent INTEGER NOT NULL,
  PRIMARY KEY (customer_id, source, product_id),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);
