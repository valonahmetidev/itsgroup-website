CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('contact', 'quote')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read')),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  company TEXT,
  message TEXT,
  payload_json TEXT,
  locale TEXT NOT NULL,
  customer_id TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
