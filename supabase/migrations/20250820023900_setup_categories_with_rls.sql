-- Helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
DECLARE
  is_admin_flag boolean;
BEGIN
  SELECT raw_user_meta_data->>'is_admin' INTO is_admin_flag
  FROM auth.users
  WHERE id = auth.uid();

  RETURN COALESCE(is_admin_flag, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, to prevent errors on re-run
DROP POLICY IF EXISTS "Allow all access for admins" ON categories;
DROP POLICY IF EXISTS "Allow read access for everyone" ON categories;

-- RLS Policies
-- 1. Admins can do everything
CREATE POLICY "Allow all access for admins"
ON categories
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- 2. Everyone (including logged-out users) can read categories
CREATE POLICY "Allow read access for everyone"
ON categories
FOR SELECT
USING (true);

-- Optional: Insert some initial data if the table is empty
INSERT INTO categories (name, slug, description) VALUES
  ('Clothing', 'clothing', 'Apparel and garments'),
  ('Accessories', 'accessories', 'Items to complement your outfit'),
  ('Footwear', 'footwear', 'Shoes, sandals, and boots'),
  ('Electronics', 'electronics', 'Gadgets and electronic devices')
ON CONFLICT (name) DO NOTHING;
