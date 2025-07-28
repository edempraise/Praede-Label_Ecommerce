-- Drop existing policies for the products table
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

-- Create a new policy that allows public read access to all products
CREATE POLICY "Public can view all products"
  ON public.products
  FOR SELECT
  TO public
  USING (true);

-- Create a new policy that allows admins to manage all products
CREATE POLICY "Admins can manage all products"
  ON public.products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );
