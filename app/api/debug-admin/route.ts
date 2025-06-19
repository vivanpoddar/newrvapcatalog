import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();
  
  try {
    // Get the current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      return NextResponse.json({ error: 'Authentication error', details: authError.message });
    }
    
    if (!user) {
      return NextResponse.json({ error: 'No user authenticated' });
    }
    
    const debugInfo = {
      userId: user.id,
      email: user.email,
      userMetadata: user.user_metadata,
      appMetadata: user.app_metadata,
    };
    
    // Try to query users table (if it exists)
    let userData = null;
    let usersTableError = null;
    
    const { data: userTableData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (userError) {
      usersTableError = userError.message;
      
      // Try different user ID formats or columns
      const { data: userByEmail, error: emailError } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single();
        
      if (!emailError && userByEmail) {
        userData = userByEmail;
      } else {
        // Try to see what's in the users table
        const { data: allUsers, error: allUsersError } = await supabase
          .from('users')
          .select('*')
          .limit(5);
          
        debugInfo.allUsersError = allUsersError?.message;
        debugInfo.sampleUsers = allUsers;
      }
    } else {
      userData = userTableData;
    }
    
    // Check admin status from various sources
    const adminChecks = {
      userMetadataAdmin: user.user_metadata?.admin,
      appMetadataAdmin: user.app_metadata?.admin,
      userTableAdmin: userData?.admin,
      usersTableError
    };
    
    return NextResponse.json({
      success: true,
      debugInfo,
      userData,
      adminChecks,
      finalAdminStatus: userData?.admin || user.user_metadata?.admin || user.app_metadata?.admin || false
    });
    
  } catch (error) {
    return NextResponse.json({ error: 'Debug failed', details: error.message });
  }
}
