CREATE TABLE IF NOT EXISTS customer_category_discounts (
  customer_id TEXT NOT NULL,
  source TEXT NOT NULL,
  category_id TEXT NOT NULL,
  discount_percent INTEGER NOT NULL,
  PRIMARY KEY (customer_id, source, category_id),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);
