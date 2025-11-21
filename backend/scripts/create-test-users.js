import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUsers() {
  console.log('Creating test user accounts...\n');

  const testUsers = [
    {
      email: 'test1@retech.com',
      password: 'Test123456!',
      name: 'Test User 1 - Orders & Inventory',
      role: 'staff',
      description: 'Account with orders, inventory, and customers data'
    },
    {
      email: 'test2@retech.com',
      password: 'Test123456!',
      name: 'Test User 2 - Suppliers & Invoices',
      role: 'staff',
      description: 'Account with suppliers, invoices, and reports data'
    },
    {
      email: 'admin@retech.com',
      password: 'Admin123456!',
      name: 'Admin User',
      role: 'admin',
      description: 'Admin account with full access'
    }
  ];

  for (const user of testUsers) {
    try {
      console.log(`Creating user: ${user.email}`);

      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            full_name: user.name
          }
        }
      });

      if (error) {
        console.error(`  ❌ Error creating ${user.email}:`, error.message);
      } else {
        console.log(`  ✅ Created ${user.email}`);
        console.log(`     Name: ${user.name}`);
        console.log(`     Password: ${user.password}`);
        console.log(`     Role: ${user.role}`);
        console.log(`     Description: ${user.description}`);

        // Update role if needed (for admin)
        if (user.role === 'admin' && data.user) {
          console.log(`     Updating role to admin...`);
          // Note: Role update would need to be done via SQL or Supabase dashboard
          // since we need to update the user_profiles table
        }
      }
      console.log('');
    } catch (err) {
      console.error(`  ❌ Exception creating ${user.email}:`, err.message);
      console.log('');
    }
  }

  console.log('\n===========================================');
  console.log('TEST ACCOUNTS SUMMARY');
  console.log('===========================================\n');

  testUsers.forEach(user => {
    console.log(`Email:    ${user.email}`);
    console.log(`Password: ${user.password}`);
    console.log(`Purpose:  ${user.description}`);
    console.log('-------------------------------------------');
  });

  console.log('\nNOTE: If email confirmation is required, you may need to:');
  console.log('1. Disable email confirmation in Supabase dashboard');
  console.log('2. Or manually confirm users in the auth.users table');
  console.log('3. Or check email for confirmation links\n');
}

createTestUsers().catch(console.error);
