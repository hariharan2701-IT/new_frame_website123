/*
  # Create products table for Snapzone Frames

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text, frame name)
      - `description` (text, frame description)
      - `price` (numeric, price in rupees)
      - `image_url` (text, frame image URL)
      - `category` (text, available colors)
      - `material` (text, matt or glassy finish)
      - `size` (text, frame size)
      - `dimensions` (text, frame dimensions)
      - `stock_quantity` (integer, available stock)
      - `featured` (boolean, featured product)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `products` table
    - Add policy for public read access
    - Add policy for admin insert/update/delete
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL CHECK (price > 0),
  image_url text NOT NULL,
  category text NOT NULL,
  material text NOT NULL CHECK (material IN ('matt', 'glassy')),
  size text NOT NULL,
  dimensions text NOT NULL,
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
CREATE POLICY "Anyone can view products"
  ON products
  FOR SELECT
  TO public
  USING (true);

-- Allow admin to manage products
CREATE POLICY "Admin can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = '7708554879@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = '7708554879@gmail.com');

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'update_products_updated_at'
  ) THEN
    CREATE TRIGGER update_products_updated_at
      BEFORE UPDATE ON products
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;