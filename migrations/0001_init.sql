CREATE TABLE IF NOT EXISTS custom_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER,
  note TEXT,
  created_at TEXT NOT NULL
);
