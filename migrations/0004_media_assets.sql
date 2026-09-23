CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  content_type TEXT NOT NULL,
  data TEXT NOT NULL,
  size INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
