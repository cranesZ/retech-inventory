import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials. Check your .env file.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false
  }
});

// Storage bucket names
export const STORAGE_BUCKETS = {
  DEVICE_IMAGES: 'device-images',
  DOCUMENTS: 'documents',
  INVOICES: 'invoices'
};

// Initialize storage buckets (call this on server startup)
export async function initializeStorage() {
  try {
    // List existing buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('⚠️  Cannot list storage buckets (this is normal with anon key)');
      console.log('📝 Please create these buckets manually in Supabase Dashboard:');
      Object.values(STORAGE_BUCKETS).forEach(name => {
        console.log(`   - ${name}`);
      });
      return;
    }

    const existingBuckets = buckets.map(b => b.name);
    const missingBuckets = Object.values(STORAGE_BUCKETS).filter(
      name => !existingBuckets.includes(name)
    );

    if (missingBuckets.length > 0) {
      console.log('⚠️  Missing storage buckets. Please create them in Supabase Dashboard:');
      missingBuckets.forEach(name => {
        console.log(`   - ${name} (public: ${name === STORAGE_BUCKETS.DEVICE_IMAGES})`);
      });
    } else {
      console.log('✅ All storage buckets are configured');
      existingBuckets.forEach(name => {
        if (Object.values(STORAGE_BUCKETS).includes(name)) {
          console.log(`   ✓ ${name}`);
        }
      });
    }
  } catch (error) {
    console.error('⚠️  Error checking storage:', error.message);
    console.log('📝 This is expected if using anon key. Buckets should be created manually.');
  }
}

export default supabase;
