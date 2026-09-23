ALTER TABLE product_overrides ADD COLUMN name_mk TEXT;
ALTER TABLE product_overrides ADD COLUMN name_en TEXT;
ALTER TABLE product_overrides ADD COLUMN name_sq TEXT;
ALTER TABLE product_overrides ADD COLUMN image_url TEXT;

ALTER TABLE custom_products ADD COLUMN name_mk TEXT;
ALTER TABLE custom_products ADD COLUMN name_en TEXT;
ALTER TABLE custom_products ADD COLUMN name_sq TEXT;
ALTER TABLE custom_products ADD COLUMN regular_price INTEGER;
ALTER TABLE custom_products ADD COLUMN image_url TEXT;
ALTER TABLE custom_products ADD COLUMN in_stock INTEGER NOT NULL DEFAULT 1;
ALTER TABLE custom_products ADD COLUMN hidden INTEGER NOT NULL DEFAULT 0;
ALTER TABLE custom_products ADD COLUMN updated_at TEXT;
