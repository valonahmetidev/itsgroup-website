CREATE TABLE IF NOT EXISTS proforma_daily_counters (
  day TEXT NOT NULL PRIMARY KEY,
  last_number INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS proformas (
  id TEXT PRIMARY KEY,
  document_no TEXT NOT NULL UNIQUE,
  customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  locale TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'MKD',
  customer_json TEXT NOT NULL,
  items_json TEXT NOT NULL,
  options_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_proformas_customer_id ON proformas(customer_id);
CREATE INDEX IF NOT EXISTS idx_proformas_created_at ON proformas(created_at DESC);
