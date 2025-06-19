// Debug admin checking functionality
import { createClient } from '@/utils/supabase/server';

export async function debugUserInfo() {
  const supabase = await createClient();
  
  try {
    // Get the current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error:', authError);
      return { error: 'Authentication error' };
    }
    
    if (!user) {
      console.log('No authenticated user');
      return { error: 'No user authenticated' };
    }
    
    console.log('\n=== USER DEBUG INFO ===');
    console.log('User ID:', user.id);
    console.log('User Email:', user.email);
    console.log('User Metadata:', JSON.stringify(user.user_metadata, null, 2));
    console.log('App Metadata:', JSON.stringify(user.app_metadata, null, 2));
    
    // Try to query users table (if it exists)
    console.log('\n=== CHECKING USERS TABLE ===');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (userError) {
      console.log('Users table error:', userError.message);
      
      // Try to see what tables are available
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
        
      if (!tablesError && tables) {
        console.log('Available tables:', tables.map(t => t.table_name));
      }
    } else {
      console.log('Users table data:', JSON.stringify(userData, null, 2));
    }
    
    // Also check if there's an admin field in any auth-related metadata
    console.log('\n=== ADMIN STATUS CHECK ===');
    console.log('user_metadata.admin:', user.user_metadata?.admin);
    console.log('app_metadata.admin:', user.app_metadata?.admin);
    console.log('userData?.admin:', userData?.admin);
    
    return {
      user,
      userData,
      isAdmin: userData?.admin || user.user_metadata?.admin || user.app_metadata?.admin || false
    };
    
  } catch (error) {
    console.error('Debug error:', error);
    return { error: error.message };
  }
}
