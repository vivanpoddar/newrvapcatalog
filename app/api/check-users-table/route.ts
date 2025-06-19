import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Check users table structure
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(3);

    if (usersError) {
      return Response.json({ 
        error: 'Failed to query users table',
        details: usersError.message 
      }, { status: 500 });
    }

    // Get table columns info by examining the first row
    const columns = users && users.length > 0 ? Object.keys(users[0]) : [];

    return Response.json({
      message: 'Users table structure',
      columns,
      sampleData: users,
      totalRows: users?.length || 0
    });

  } catch (error: any) {
    return Response.json({
      error: 'Test failed',
      details: error.message
    }, { status: 500 });
  }
}
