-- RLS policies for "products" and "price_history" tables
-- Run this in Supabase: SQL Editor → New query → paste and run.
-- If you get "policy already exists", drop the existing policy first, e.g.:
--   DROP POLICY IF EXISTS "policy_name" ON products;

-- Ensure RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow users to SELECT only their own products
CREATE POLICY "Users can read own products"
ON products FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to INSERT products where they are the owner
CREATE POLICY "Users can insert own products"
ON products FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to UPDATE only their own products
CREATE POLICY "Users can update own products"
ON products FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to DELETE only their own products
CREATE POLICY "Users can delete own products"
ON products FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS for "price_history" (only for products owned by the user)
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own price history"
ON price_history FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = price_history.product_id
    AND products.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own price history"
ON price_history FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = price_history.product_id
    AND products.user_id = auth.uid()
  )
);
