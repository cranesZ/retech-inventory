-- Supabase already has gen_random_uuid() available via pgcrypto

-- ============================================
-- DEVICES TABLE (Main Inventory)
-- ============================================
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer TEXT NOT NULL,
  model TEXT NOT NULL,
  variant TEXT,
  network TEXT, -- Carrier
  capacity TEXT, -- Storage size
  color TEXT,
  imei TEXT UNIQUE, -- Combined ESN/IMEI field
  quantity INTEGER DEFAULT 1,
  grade TEXT, -- Condition grade
  damages TEXT,
  notes TEXT,
  price_paid DECIMAL(10, 2),
  expected_sale_price DECIMAL(10, 2),
  status TEXT DEFAULT 'Warranty Expired', -- Warranty Active, Warranty Expired, etc.
  location TEXT,
  battery TEXT,

  -- Image and document URLs (stored in Supabase Storage)
  image_url TEXT,
  pdf_url TEXT,

  -- Relations
  order_id UUID,
  invoice_id UUID,
  supplier_id UUID,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  company_name TEXT,
  billing_address TEXT,
  shipping_address TEXT,
  tax_id TEXT,
  payment_terms TEXT,
  credit_limit DECIMAL(10, 2),
  type TEXT DEFAULT 'INDIVIDUAL', -- INDIVIDUAL, WHOLESALE, RETAIL
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SUPPLIERS TABLE
-- ============================================
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  website TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- PURCHASE, SALE
  customer_id UUID REFERENCES customers(id),
  supplier_id UUID REFERENCES suppliers(id),
  status TEXT DEFAULT 'DRAFT', -- DRAFT, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
  date DATE NOT NULL,
  expected_delivery_date DATE,
  subtotal DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  device_id UUID REFERENCES devices(id),
  product_description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INVOICES TABLE
-- ============================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  order_id UUID REFERENCES orders(id),
  customer_id UUID REFERENCES customers(id),
  status TEXT DEFAULT 'DRAFT', -- DRAFT, SENT, PAID, OVERDUE, CANCELLED
  issue_date DATE NOT NULL,
  due_date DATE,
  subtotal DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) DEFAULT 0,
  paid_amount DECIMAL(10, 2) DEFAULT 0,

  -- PDF stored in Supabase Storage
  pdf_url TEXT,

  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SUPPLIER OFFERS TABLE (for Offer Analysis)
-- ============================================
CREATE TABLE supplier_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id),
  product_description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_cost DECIMAL(10, 2) NOT NULL,
  estimated_market_price DECIMAL(10, 2),
  profit_margin DECIMAL(5, 2), -- Percentage
  notes TEXT,
  status TEXT DEFAULT 'PENDING', -- PENDING, ACCEPTED, REJECTED
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX idx_devices_imei ON devices(imei);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_devices_manufacturer ON devices(manufacturer);
CREATE INDEX idx_devices_created_at ON devices(created_at DESC);

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);

CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- ============================================
-- UPDATED_AT TRIGGER (Auto-update timestamps)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) - Basic setup
-- ============================================
-- Enable RLS on all tables
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_offers ENABLE ROW LEVEL SECURITY;

-- Allow service_role to bypass RLS (for backend API)
CREATE POLICY "Allow service_role full access to devices" ON devices
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service_role full access to customers" ON customers
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service_role full access to suppliers" ON suppliers
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service_role full access to orders" ON orders
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service_role full access to order_items" ON order_items
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service_role full access to invoices" ON invoices
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service_role full access to supplier_offers" ON supplier_offers
  FOR ALL USING (true) WITH CHECK (true);
