# Test Accounts - Authentication Information

## Overview
Three test accounts have been created with comprehensive seed data to demonstrate all features of the Retech Inventory Management System.

---

## Test Account 1: Orders & Inventory Focus

**Login Credentials:**
- **Email:** `test1@retech.com`
- **Password:** `Test123456!`

**Associated Data:**
- **5 Customers** (Tech Solutions Inc, Mobile Express, Global Gadgets, Jane Doe, Phone Repair Center)
- **10 Devices** in inventory (iPhones, Samsung, Google Pixel)
  - Various conditions: A+, A, B+, B, C
  - Price range: $499 - $1,599
  - Multiple warehouses: A, B
- **4 Orders** with different statuses:
  - ORD-2025-0001: DELIVERED ($2,805.84)
  - ORD-2025-0002: SHIPPED ($1,186.92)
  - ORD-2025-0003: CONFIRMED ($4,262.76)
  - ORD-2025-0004: DRAFT ($538.92)
- **Order Items** including devices and accessories

**Best For Testing:**
- Inventory management
- Device tracking by IMEI
- Customer orders
- Order fulfillment workflow
- Device status changes

---

## Test Account 2: Suppliers & Invoices Focus

**Login Credentials:**
- **Email:** `test2@retech.com`
- **Password:** `Test123456!`

**Associated Data:**
- **5 Suppliers** (Global Tech Wholesale, Premier Mobile, TechSource USA, Asian Electronics Hub, Refurb Masters)
- **10 Devices** with supplier relationships
  - Various refurbished and new devices
  - Supplier pricing information
  - Purchase history
- **5 Customers** for invoicing
- **5 Invoices** with different statuses:
  - INV-2025-0001: PAID ($9,169.20)
  - INV-2025-0002: PAID ($2,750.76)
  - INV-2025-0003: SENT ($5,932.44)
  - INV-2025-0004: PAID ($1,941.84)
  - INV-2025-0005: DRAFT ($1,186.92)
- **5 Supplier Offers** for analysis:
  - Pricing comparison
  - Profit margin calculations
  - Accept/Reject workflow

**Best For Testing:**
- Supplier management
- Invoice generation
- Payment tracking
- Financial reports
- Supplier offer analysis
- Revenue dashboard
- Profit margin calculations

---

## Admin Account

**Login Credentials:**
- **Email:** `admin@retech.com`
- **Password:** `Admin123456!`

**Permissions:**
- Full administrative access
- User management
- All CRUD operations
- System settings
- All features accessible

**Best For Testing:**
- Admin panel features
- User role management
- System-wide settings
- Complete feature set

---

## Database Content Summary

### Total Seed Data:
- **10 Customers** (5 per account context)
- **20 Devices** total in inventory
- **4 Orders** with multiple line items
- **5 Invoices** with various payment statuses
- **5 Suppliers** with ratings and contact info
- **5 Supplier Offers** for pricing analysis

### Revenue Data:
- **Total Order Value:** ~$8,794.44
- **Total Invoice Value:** ~$20,980.96
- **Paid Invoices:** $13,862.00
- **Outstanding:** $7,118.96

---

## How to Use

### Desktop App:
1. Launch the Retech Inventory desktop application
2. Click "Sign In"
3. Enter one of the email/password combinations above
4. Explore the features with pre-populated data

### Testing Workflows:

**Inventory Management (test1@retech.com):**
1. View all devices in the Inventory page
2. Click on a device to see details
3. Try the IMEI lookup feature
4. Create a new device entry
5. Check Orders page for order history

**Financial Management (test2@retech.com):**
1. View Suppliers page
2. Check Invoices with different statuses
3. View Reports/Dashboard for revenue data
4. Analyze supplier offers in Offer Analysis
5. Generate invoice PDFs

**Admin Features (admin@retech.com):**
1. Access Admin Panel
2. View all users
3. Manage user roles
4. Access all modules

---

## Notes

- All test data is shared across all users currently (no user-specific data isolation yet)
- Passwords follow security requirements (8+ characters, uppercase, lowercase, number, special char)
- Email confirmation may be required depending on Supabase settings
- Data can be reset by re-running the seed migration

---

## Troubleshooting

**Can't log in?**
- Verify email confirmation is disabled in Supabase dashboard
- Check that the backend server is running (`npm run dev` in backend/)
- Ensure .env file has correct SUPABASE_URL and SUPABASE_ANON_KEY

**No data showing?**
- Verify the seed migration was applied: `supabase db push`
- Check database connection in Supabase dashboard
- Ensure RLS policies allow data access

**Need to reset data?**
- Re-run the seed migration script
- Or manually delete and re-insert via Supabase dashboard

---

**Last Updated:** November 21, 2025
**Version:** 1.0.0
