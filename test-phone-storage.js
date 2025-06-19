// Test script to verify phone number storage in Supabase user metadata
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://egyrmnnmkqlykpwcjqfm.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVneXJtbm5ta3FseWtwd2NqcWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyNjYxNzAsImV4cCI6MjA1Njg0MjE3MH0.OcEHzyHBAMkM26jWkiag4z81zK9N9M4XUU486m3rkRg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPhoneStorage() {
  console.log('Testing phone number storage structure...');
  
  try {
    // Get current user (if any)
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log('No active user session found:', error.message);
      return;
    }
    
    if (user) {
      console.log('User found!');
      console.log('Email:', user.email);
      console.log('Email confirmed:', user.email_confirmed_at ? 'Yes' : 'No');
      console.log('User metadata:', JSON.stringify(user.user_metadata, null, 2));
      
      // Check for phone number in different possible keys
      const metadata = user.user_metadata;
      console.log('\nPhone number checks:');
      console.log('- Phone:', metadata.Phone);
      console.log('- phone_number:', metadata.phone_number);
      console.log('- phone:', metadata.phone);
      
      if (metadata.Phone) {
        console.log('✅ Phone number found in "Phone" field:', metadata.Phone);
      } else if (metadata.phone_number) {
        console.log('⚠️ Phone number found in "phone_number" field:', metadata.phone_number);
      } else if (metadata.phone) {
        console.log('⚠️ Phone number found in "phone" field:', metadata.phone);
      } else {
        console.log('❌ No phone number found in user metadata');
      }
    } else {
      console.log('No user currently signed in.');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

testPhoneStorage();
