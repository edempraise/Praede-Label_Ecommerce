CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO categories (name) VALUES
  ('Clothing'),
  ('Accessories'),
  ('Footwear'),
  ('Electronics')
ON CONFLICT (name) DO NOTHING;
