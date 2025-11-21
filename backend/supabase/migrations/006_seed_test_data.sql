-- ============================================
-- SEED TEST DATA FOR TWO TEST ACCOUNTS
-- ============================================

-- Note: This migration seeds data for testing purposes
-- Test Account 1: Will have orders, inventory (devices), and customers
-- Test Account 2: Will have suppliers, invoices, and reports data

-- ============================================
-- TEST ACCOUNT 1: CUSTOMERS & DEVICES & ORDERS
-- ============================================

-- Insert test customers for Account 1
INSERT INTO customers (id, name, contact_person, email, phone, company_name, billing_address, shipping_address, type, notes) VALUES
('11111111-1111-1111-1111-111111111111', 'Tech Solutions Inc', 'John Smith', 'john@techsolutions.com', '+1-555-0101', 'Tech Solutions Inc', '123 Tech Street, San Francisco, CA 94105', '123 Tech Street, San Francisco, CA 94105', 'WHOLESALE', 'Long-term wholesale client'),
('11111111-1111-1111-1111-111111111112', 'Mobile Express', 'Sarah Johnson', 'sarah@mobileexpress.com', '+1-555-0102', 'Mobile Express', '456 Mobile Ave, Los Angeles, CA 90012', '456 Mobile Ave, Los Angeles, CA 90012', 'RETAIL', 'Retail partner with good payment history'),
('11111111-1111-1111-1111-111111111113', 'Global Gadgets', 'Michael Chen', 'mike@globalgadgets.com', '+1-555-0103', 'Global Gadgets', '789 Gadget Blvd, New York, NY 10001', '789 Gadget Blvd, New York, NY 10001', 'WHOLESALE', 'International distributor'),
('11111111-1111-1111-1111-111111111114', 'Jane Doe', null, 'jane.doe@email.com', '+1-555-0104', null, '321 Consumer St, Austin, TX 78701', '321 Consumer St, Austin, TX 78701', 'INDIVIDUAL', 'Regular individual customer'),
('11111111-1111-1111-1111-111111111115', 'Phone Repair Center', 'David Lee', 'david@phonerepair.com', '+1-555-0105', 'Phone Repair Center', '654 Repair Ln, Seattle, WA 98101', '654 Repair Ln, Seattle, WA 98101', 'RETAIL', 'Repair shop - bulk buyer');

-- Insert test devices for Account 1
INSERT INTO devices (id, manufacturer, model, variant, network, capacity, color, imei, quantity, grade, damages, notes, price_paid, expected_sale_price, status, location, battery) VALUES
('d1111111-1111-1111-1111-111111111111', 'Apple', 'iPhone 15 Pro', 'Pro', 'Unlocked', '256GB', 'Natural Titanium', '351234567890111', 1, 'A+', null, 'Brand new in box', 999.00, 1299.00, 'In Stock', 'Warehouse A', '100%'),
('d1111111-1111-1111-1111-111111111112', 'Apple', 'iPhone 15', 'Standard', 'Unlocked', '128GB', 'Blue', '351234567890112', 1, 'A', null, 'Excellent condition', 699.00, 899.00, 'In Stock', 'Warehouse A', '98%'),
('d1111111-1111-1111-1111-111111111113', 'Apple', 'iPhone 14 Pro Max', 'Pro Max', 'Unlocked', '512GB', 'Deep Purple', '351234567890113', 1, 'B+', 'Minor scratches on back', 'Good working condition', 849.00, 1099.00, 'In Stock', 'Warehouse A', '92%'),
('d1111111-1111-1111-1111-111111111114', 'Samsung', 'Galaxy S24 Ultra', 'Ultra', 'Unlocked', '512GB', 'Titanium Black', '351234567890114', 1, 'A+', null, 'Like new', 1049.00, 1349.00, 'In Stock', 'Warehouse B', '100%'),
('d1111111-1111-1111-1111-111111111115', 'Samsung', 'Galaxy S23', 'Standard', 'Unlocked', '256GB', 'Phantom Black', '351234567890115', 1, 'A', null, 'Very good condition', 549.00, 749.00, 'In Stock', 'Warehouse B', '95%'),
('d1111111-1111-1111-1111-111111111116', 'Apple', 'iPhone 13', 'Standard', 'AT&T', '128GB', 'Midnight', '351234567890116', 1, 'C', 'Cracked back glass', 'Fully functional', 349.00, 499.00, 'In Stock', 'Warehouse A', '87%'),
('d1111111-1111-1111-1111-111111111117', 'Google', 'Pixel 8 Pro', 'Pro', 'Unlocked', '256GB', 'Obsidian', '351234567890117', 1, 'A+', null, 'New, never used', 749.00, 999.00, 'In Stock', 'Warehouse B', '100%'),
('d1111111-1111-1111-1111-111111111118', 'Apple', 'iPhone 15 Pro Max', 'Pro Max', 'Unlocked', '1TB', 'Blue Titanium', '351234567890118', 1, 'A+', null, 'Brand new sealed', 1299.00, 1599.00, 'Reserved', 'Warehouse A', '100%'),
('d1111111-1111-1111-1111-111111111119', 'Samsung', 'Galaxy Z Fold 5', 'Fold', 'Unlocked', '512GB', 'Phantom Black', '351234567890119', 1, 'A', null, 'Excellent foldable', 1249.00, 1599.00, 'In Stock', 'Warehouse B', '96%'),
('d1111111-1111-1111-1111-111111111120', 'Apple', 'iPhone 14', 'Standard', 'Verizon', '256GB', 'Product Red', '351234567890120', 1, 'B', 'Small dent on frame', 'Works perfectly', 549.00, 699.00, 'In Stock', 'Warehouse A', '89%');

-- Insert test orders for Account 1
INSERT INTO orders (id, order_number, type, customer_id, status, date, expected_delivery_date, subtotal, tax, total, notes) VALUES
('01111111-1111-1111-1111-111111111111', 'ORD-2025-0001', 'SALE', '11111111-1111-1111-1111-111111111111', 'DELIVERED', '2025-01-15', '2025-01-20', 2598.00, 207.84, 2805.84, 'Wholesale order - delivered on time'),
('01111111-1111-1111-1111-111111111112', 'ORD-2025-0002', 'SALE', '11111111-1111-1111-1111-111111111112', 'SHIPPED', '2025-02-10', '2025-02-15', 1099.00, 87.92, 1186.92, 'Retail order - in transit'),
('01111111-1111-1111-1111-111111111113', 'ORD-2025-0003', 'SALE', '11111111-1111-1111-1111-111111111113', 'CONFIRMED', '2025-03-05', '2025-03-12', 3947.00, 315.76, 4262.76, 'Large international order'),
('01111111-1111-1111-1111-111111111114', 'ORD-2025-0004', 'SALE', '11111111-1111-1111-1111-111111111114', 'DRAFT', '2025-03-20', null, 499.00, 39.92, 538.92, 'Individual customer order - pending confirmation');

-- Insert order items for Account 1
INSERT INTO order_items (order_id, device_id, product_description, quantity, unit_price, total) VALUES
-- Order 1 items
('01111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111112', 'iPhone 15 128GB Blue - Unlocked', 1, 899.00, 899.00),
('01111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111115', 'Samsung Galaxy S23 256GB - Unlocked', 1, 749.00, 749.00),
('01111111-1111-1111-1111-111111111111', null, 'Phone Cases Bundle (10 units)', 10, 9.50, 95.00),
('01111111-1111-1111-1111-111111111111', null, 'Tempered Glass Screen Protectors (20 units)', 20, 4.50, 90.00),
('01111111-1111-1111-1111-111111111111', null, 'USB-C Charging Cables (15 units)', 15, 12.00, 180.00),
('01111111-1111-1111-1111-111111111111', null, 'Wireless Chargers (10 units)', 10, 25.00, 250.00),
('01111111-1111-1111-1111-111111111111', null, 'Phone Holders (10 units)', 10, 8.50, 85.00),
('01111111-1111-1111-1111-111111111111', null, 'Earbuds (15 units)', 15, 15.00, 225.00),
('01111111-1111-1111-1111-111111111111', null, 'Power Banks (8 units)', 8, 28.00, 224.00),

-- Order 2 items
('01111111-1111-1111-1111-111111111112', 'd1111111-1111-1111-1111-111111111113', 'iPhone 14 Pro Max 512GB Deep Purple - Unlocked', 1, 1099.00, 1099.00),

-- Order 3 items
('01111111-1111-1111-1111-111111111113', 'd1111111-1111-1111-1111-111111111111', 'iPhone 15 Pro 256GB Natural Titanium - Unlocked', 1, 1299.00, 1299.00),
('01111111-1111-1111-1111-111111111113', 'd1111111-1111-1111-1111-111111111114', 'Samsung Galaxy S24 Ultra 512GB - Unlocked', 1, 1349.00, 1349.00),
('01111111-1111-1111-1111-111111111113', 'd1111111-1111-1111-1111-111111111117', 'Google Pixel 8 Pro 256GB Obsidian - Unlocked', 1, 999.00, 999.00),
('01111111-1111-1111-1111-111111111113', null, 'Premium Phone Cases (5 units)', 5, 25.00, 125.00),
('01111111-1111-1111-1111-111111111113', null, 'Wireless Earbuds Pro (3 units)', 3, 75.00, 225.00),

-- Order 4 items
('01111111-1111-1111-1111-111111111114', 'd1111111-1111-1111-1111-111111111116', 'iPhone 13 128GB Midnight - AT&T', 1, 499.00, 499.00);

-- ============================================
-- TEST ACCOUNT 2: SUPPLIERS & INVOICES & REPORTS DATA
-- ============================================

-- Insert test suppliers for Account 2
INSERT INTO suppliers (id, name, contact_person, email, phone, address, website, rating, notes) VALUES
('22222222-2222-2222-2222-222222222221', 'Global Tech Wholesale', 'Robert Martinez', 'robert@globaltech.com', '+1-555-0201', '100 Supplier Plaza, Shenzhen, China', 'https://globaltechsupply.com', 5, 'Reliable supplier with competitive pricing'),
('22222222-2222-2222-2222-222222222222', 'Premier Mobile Distributors', 'Lisa Anderson', 'lisa@premiermobile.com', '+1-555-0202', '250 Distribution Center, Hong Kong', 'https://premiermobile.com', 4, 'Good quality, sometimes delays'),
('22222222-2222-2222-2222-222222222223', 'TechSource USA', 'James Wilson', 'james@techsource.com', '+1-555-0203', '500 Tech Avenue, Los Angeles, CA 90015', 'https://techsource.com', 5, 'Domestic supplier - fast shipping'),
('22222222-2222-2222-2222-222222222224', 'Asian Electronics Hub', 'Wei Zhang', 'wei@asianhub.com', '+1-555-0204', '800 Commerce Street, Taipei, Taiwan', 'https://asianhub.com', 4, 'Large inventory, good prices'),
('22222222-2222-2222-2222-222222222225', 'Refurb Masters Inc', 'Amanda Brown', 'amanda@refurbmasters.com', '+1-555-0205', '350 Refurb Lane, Austin, TX 78702', 'https://refurbmasters.com', 5, 'Excellent refurbished devices');

-- Insert test devices with suppliers for Account 2
INSERT INTO devices (id, manufacturer, model, variant, network, capacity, color, imei, quantity, grade, damages, notes, price_paid, expected_sale_price, status, location, battery, supplier_id) VALUES
('d2222222-2222-2222-2222-222222222221', 'Apple', 'iPhone 15 Plus', 'Plus', 'Unlocked', '256GB', 'Black', '352234567890221', 1, 'A+', null, 'From Global Tech', 849.00, 1099.00, 'In Stock', 'Warehouse C', '100%', '22222222-2222-2222-2222-222222222221'),
('d2222222-2222-2222-2222-222222222222', 'Apple', 'iPhone 14 Plus', 'Plus', 'Unlocked', '256GB', 'Purple', '352234567890222', 1, 'A', null, 'From Premier Mobile', 649.00, 849.00, 'In Stock', 'Warehouse C', '97%', '22222222-2222-2222-2222-222222222222'),
('d2222222-2222-2222-2222-222222222223', 'Samsung', 'Galaxy S24', 'Standard', 'Unlocked', '256GB', 'Violet', '352234567890223', 1, 'A+', null, 'From TechSource', 649.00, 849.00, 'In Stock', 'Warehouse D', '100%', '22222222-2222-2222-2222-222222222223'),
('d2222222-2222-2222-2222-222222222224', 'Samsung', 'Galaxy S23 FE', 'Fan Edition', 'Unlocked', '128GB', 'Graphite', '352234567890224', 1, 'A', null, 'From Asian Hub', 449.00, 599.00, 'In Stock', 'Warehouse D', '94%', '22222222-2222-2222-2222-222222222224'),
('d2222222-2222-2222-2222-222222222225', 'Google', 'Pixel 8', 'Standard', 'Unlocked', '128GB', 'Rose', '352234567890225', 1, 'A+', null, 'From TechSource', 549.00, 699.00, 'In Stock', 'Warehouse C', '100%', '22222222-2222-2222-2222-222222222223'),
('d2222222-2222-2222-2222-222222222226', 'Apple', 'iPhone 13 Pro', 'Pro', 'Unlocked', '256GB', 'Sierra Blue', '352234567890226', 1, 'B+', 'Minor wear', 'Refurbished by Refurb Masters', 599.00, 799.00, 'In Stock', 'Warehouse C', '91%', '22222222-2222-2222-2222-222222222225'),
('d2222222-2222-2222-2222-222222222227', 'Apple', 'iPhone 12 Pro Max', 'Pro Max', 'Unlocked', '512GB', 'Pacific Blue', '352234567890227', 1, 'B', 'Screen has micro scratches', 'Refurbished', 699.00, 899.00, 'In Stock', 'Warehouse C', '88%', '22222222-2222-2222-2222-222222222225'),
('d2222222-2222-2222-2222-222222222228', 'Samsung', 'Galaxy Z Flip 5', 'Flip', 'Unlocked', '256GB', 'Mint', '352234567890228', 1, 'A+', null, 'From Global Tech', 799.00, 999.00, 'In Stock', 'Warehouse D', '100%', '22222222-2222-2222-2222-222222222221'),
('d2222222-2222-2222-2222-222222222229', 'Google', 'Pixel 7 Pro', 'Pro', 'Unlocked', '256GB', 'Snow', '352234567890229', 1, 'A', null, 'From Asian Hub', 499.00, 649.00, 'In Stock', 'Warehouse C', '93%', '22222222-2222-2222-2222-222222222224'),
('d2222222-2222-2222-2222-222222222230', 'Apple', 'iPhone 14', 'Standard', 'T-Mobile', '512GB', 'Yellow', '352234567890230', 1, 'B+', null, 'From Refurb Masters', 649.00, 849.00, 'In Stock', 'Warehouse C', '90%', '22222222-2222-2222-2222-222222222225');

-- Insert customers for invoices (Account 2)
INSERT INTO customers (id, name, contact_person, email, phone, company_name, billing_address, type, notes) VALUES
('22222222-2222-2222-2222-222222222221', 'Smart Retail Chain', 'Patricia Garcia', 'patricia@smartretail.com', '+1-555-0301', 'Smart Retail Chain', '1000 Retail Blvd, Chicago, IL 60601', 'WHOLESALE', 'Chain of 50 retail stores'),
('22222222-2222-2222-2222-222222222222', 'Tech Boutique', 'Kevin White', 'kevin@techboutique.com', '+1-555-0302', 'Tech Boutique', '200 Boutique St, Miami, FL 33101', 'RETAIL', 'Premium phone retailer'),
('22222222-2222-2222-2222-222222222223', 'Online Gadgets Hub', 'Jennifer Miller', 'jen@onlinegadgets.com', '+1-555-0303', 'Online Gadgets Hub', '300 E-Commerce Way, Seattle, WA 98104', 'WHOLESALE', 'Large online marketplace seller'),
('22222222-2222-2222-2222-222222222224', 'Mobile World', 'Daniel Taylor', 'daniel@mobileworld.com', '+1-555-0304', 'Mobile World', '400 Mobile Plaza, Boston, MA 02101', 'RETAIL', 'Local chain of phone stores'),
('22222222-2222-2222-2222-222222222225', 'Emma Watson', null, 'emma.watson@email.com', '+1-555-0305', null, '500 Customer Ave, Portland, OR 97201', 'INDIVIDUAL', 'VIP customer');

-- Insert invoices for Account 2
INSERT INTO invoices (id, invoice_number, customer_id, status, issue_date, due_date, subtotal, tax, total, paid_amount, notes) VALUES
('02222222-2222-2222-2222-222222222221', 'INV-2025-0001', '22222222-2222-2222-2222-222222222221', 'PAID', '2025-01-10', '2025-02-10', 8490.00, 679.20, 9169.20, 9169.20, 'Bulk order - paid in full'),
('02222222-2222-2222-2222-222222222222', 'INV-2025-0002', '22222222-2222-2222-2222-222222222222', 'PAID', '2025-01-25', '2025-02-25', 2547.00, 203.76, 2750.76, 2750.76, 'Premium devices - paid on time'),
('02222222-2222-2222-2222-222222222223', 'INV-2025-0003', '22222222-2222-2222-2222-222222222223', 'SENT', '2025-02-15', '2025-03-15', 5493.00, 439.44, 5932.44, 0.00, 'Awaiting payment'),
('02222222-2222-2222-2222-222222222224', 'INV-2025-0004', '22222222-2222-2222-2222-222222222224', 'PAID', '2025-03-01', '2025-03-31', 1798.00, 143.84, 1941.84, 1941.84, 'Regular monthly order'),
('02222222-2222-2222-2222-222222222225', 'INV-2025-0005', '22222222-2222-2222-2222-222222222225', 'DRAFT', '2025-03-20', '2025-04-20', 1099.00, 87.92, 1186.92, 0.00, 'VIP customer order - pending finalization');

-- Insert supplier offers for Account 2
INSERT INTO supplier_offers (supplier_id, product_description, quantity, unit_price, total_cost, estimated_market_price, profit_margin, status, notes) VALUES
('22222222-2222-2222-2222-222222222221', 'iPhone 15 Pro Max 1TB (Bulk)', 50, 1199.00, 59950.00, 1599.00, 33.36, 'ACCEPTED', 'Excellent deal - accepted'),
('22222222-2222-2222-2222-222222222222', 'Samsung Galaxy S24 Ultra 512GB (Bulk)', 30, 999.00, 29970.00, 1349.00, 35.04, 'ACCEPTED', 'Good margin - accepted'),
('22222222-2222-2222-2222-222222222223', 'Google Pixel 8 Pro 256GB (Bulk)', 25, 699.00, 17475.00, 999.00, 42.92, 'PENDING', 'Reviewing offer'),
('22222222-2222-2222-2222-222222222224', 'iPhone 14 Plus 256GB (Bulk)', 40, 599.00, 23960.00, 849.00, 41.74, 'ACCEPTED', 'Great price - accepted'),
('22222222-2222-2222-2222-222222222225', 'iPhone 13 Pro 512GB Refurb (Bulk)', 60, 549.00, 32940.00, 799.00, 45.56, 'PENDING', 'Evaluating quality');

-- ============================================
-- SUMMARY FOR TEST ACCOUNTS
-- ============================================

-- Test Account 1 has:
-- - 5 Customers
-- - 10 Devices in inventory
-- - 4 Orders (various statuses)
-- - Multiple order items

-- Test Account 2 has:
-- - 5 Suppliers
-- - 10 Devices from suppliers
-- - 5 Customers
-- - 5 Invoices (various statuses)
-- - 5 Supplier offers for analysis

-- This provides comprehensive test data across all major features
-- Revenue data can be calculated from invoices and orders
-- Reports can be generated from this seed data
