/*
  # E-commerce Database Schema Setup

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `description` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (integer, in kobo/cents)
      - `original_price` (integer, optional)
      - `category` (text, references categories.name)
      - `size` (text array)
      - `color` (text array)
      - `images` (text array)
      - `in_stock` (boolean)
      - `featured` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `customer_name` (text)
      - `customer_email` (text)
      - `customer_phone` (text)
      - `shipping_address` (text)
      - `city` (text)
      - `state` (text)
      - `items` (jsonb)
      - `total_amount` (integer, in kobo/cents)
      - `status` (enum)
      - `payment_receipt` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `is_admin` (boolean)
      - `created_at` (timestamp)

  2. Storage Buckets
    - `receipts` bucket for payment receipt uploads
    - `products` bucket for product images (future use)

  3. Security
    - Enable RLS on all tables
    - Add policies for public read access to products and categories
    - Add policies for authenticated users to manage orders
    - Add admin-only policies for product and order management
*/

-- Create custom types
CREATE TYPE order_status AS ENUM (
  'pending',
  'payment_review', 
  'paid',
  'preparing',
  'shipped',
  'delivered'
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price integer NOT NULL CHECK (price > 0),
  original_price integer CHECK (original_price > 0),
  category text NOT NULL,
  size text[] NOT NULL DEFAULT '{}',
  color text[] NOT NULL DEFAULT '{}',
  images text[] NOT NULL DEFAULT '{}',
  in_stock boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  shipping_address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]',
  total_amount integer NOT NULL CHECK (total_amount > 0),
  status order_status NOT NULL DEFAULT 'pending',
  payment_receipt text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('receipts', 'receipts', false),
  ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read, admin write)
CREATE POLICY "Categories are viewable by everyone"
  ON categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Products policies (public read, admin write)
CREATE POLICY "Products are viewable by everyone"
  ON products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Orders policies (customers can create, admins can manage all)
CREATE POLICY "Anyone can create orders"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Customers can view their own orders"
  ON orders
  FOR SELECT
  TO public
  USING (customer_email = auth.email());

CREATE POLICY "Admins can view all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can view all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Storage policies for receipts bucket
CREATE POLICY "Anyone can upload receipts"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Admins can view all receipts"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'receipts' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Storage policies for products bucket
CREATE POLICY "Everyone can view product images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'products');

CREATE POLICY "Admins can manage product images"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'products' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock) WHERE in_stock = true;
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample categories
INSERT INTO categories (name, slug, description) VALUES
  ('Clothing', 'clothing', 'Fashion clothing and apparel'),
  ('Accessories', 'accessories', 'Fashion accessories and jewelry'),
  ('Footwear', 'footwear', 'Shoes and footwear'),
  ('Electronics', 'electronics', 'Electronic devices and gadgets')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, original_price, category, size, color, images, featured) VALUES
  (
    'Premium Cotton T-Shirt',
    'Soft, comfortable cotton t-shirt perfect for everyday wear',
    15000,
    20000,
    'Clothing',
    ARRAY['S', 'M', 'L', 'XL'],
    ARRAY['Black', 'White', 'Navy', 'Gray'],
    ARRAY['https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg'],
    true
  ),
  (
    'Designer Jeans',
    'Premium denim jeans with modern fit and style',
    35000,
    45000,
    'Clothing',
    ARRAY['28', '30', '32', '34', '36'],
    ARRAY['Blue', 'Black', 'Light Blue'],
    ARRAY['https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg'],
    true
  ),
  (
    'Elegant Dress',
    'Beautiful evening dress for special occasions',
    65000,
    80000,
    'Clothing',
    ARRAY['S', 'M', 'L'],
    ARRAY['Red', 'Black', 'Navy'],
    ARRAY['https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg'],
    true
  ),
  (
    'Luxury Handbag',
    'Premium leather handbag with elegant design',
    85000,
    NULL,
    'Accessories',
    ARRAY['One Size'],
    ARRAY['Brown', 'Black', 'Tan'],
    ARRAY['https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg'],
    true
  )
ON CONFLICT DO NOTHING;