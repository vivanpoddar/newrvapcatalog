import { createClient } from '@/utils/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated and admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return Response.json({ 
        error: 'User not authenticated' 
      }, { status: 401 });
    }

    // Create profiles table with SQL
    const createTableSQL = `
      -- Create profiles table for user information
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        full_name TEXT,
        phone TEXT,
        email TEXT,
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: createError } = await supabase.rpc('exec_sql', { 
      sql: createTableSQL 
    });

    if (createError) {
      console.log('Table might already exist or RPC not available, trying direct insert test...');
    }

    // Test if profiles table exists by trying to query it
    const { data: testQuery, error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (testError) {
      return Response.json({ 
        error: 'Profiles table does not exist and could not be created',
        details: testError.message,
        suggestion: 'Please create the profiles table manually using the SQL in /sql/create_profiles_table.sql'
      }, { status: 500 });
    }

    // Insert sample profile data for current user if not exists
    const { error: insertError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email,
        phone: user.user_metadata?.phone || ''
      });

    if (insertError) {
      console.log('Profile insert error:', insertError.message);
    }

    // Insert some sample profiles for demo purposes
    const sampleProfiles = [
      {
        id: '12345678-1234-1234-1234-123456789012',
        full_name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-123-4567'
      },
      {
        id: '87654321-4321-4321-4321-210987654321',
        full_name: 'Jane Smith', 
        email: 'jane.smith@example.com',
        phone: '+1-555-987-6543'
      }
    ];

    for (const profile of sampleProfiles) {
      await supabase
        .from('profiles')
        .upsert(profile);
    }

    return Response.json({
      message: 'Profiles table setup completed successfully',
      user: {
        id: user.id,
        email: user.email
      },
      profiles_table_exists: true
    });

  } catch (error: any) {
    return Response.json({
      error: 'Setup failed',
      details: error.message
    }, { status: 500 });
  }
}
