#!/usr/bin/env node

// Load environment variables
require('dotenv').config();

console.log('🔍 Supabase Setup Helper');
console.log('========================');
console.log('');

// Check if anon key is set
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!anonKey || anonKey === 'your_anon_key_here') {
  console.log('❌ VITE_SUPABASE_ANON_KEY is not set in .env file');
  console.log('');
  console.log('📋 To get your Supabase anon key:');
  console.log('1. Go to: https://supabase.com/dashboard/project/ihxuuualanshcprgiwpy/settings/api');
  console.log('2. Copy the "anon public" key');
  console.log('3. Update your .env file:');
  console.log('   VITE_SUPABASE_ANON_KEY=your_copied_key_here');
  console.log('');
  process.exit(1);
}

console.log('✅ Anon key found in environment');
console.log('');

// Check if schema.sql needs to be run
console.log('📝 Next steps:');
console.log('1. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/ihxuuualanshcprgiwpy/sql');
console.log('2. Copy and paste the contents of src/lib/schema.sql');
console.log('3. Run the SQL script to create tables');
console.log('4. Restart the dev server: npm run dev');
console.log('');
console.log('🚀 Then test the application at http://localhost:8080');
console.log('');