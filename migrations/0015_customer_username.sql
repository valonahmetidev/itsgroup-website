ALTER TABLE customers ADD COLUMN username TEXT;

UPDATE customers
SET username = lower(trim(
  CASE
    WHEN instr(trim(email), '@') > 0 THEN substr(trim(email), 1, instr(trim(email), '@') - 1)
    ELSE trim(email)
  END
))
WHERE username IS NULL OR trim(username) = '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_username ON customers(lower(username));
