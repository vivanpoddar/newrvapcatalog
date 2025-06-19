import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Test profiles table existence
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone')
      .limit(3);

    // Test checkouts table
    const { data: checkouts, error: checkoutsError } = await supabase
      .from('checkouts')
      .select('*')
      .limit(3);

    // Test catalog table
    const { data: catalog, error: catalogError } = await supabase
      .from('catalog')
      .select('number, title')
      .limit(3);

    return Response.json({
      tables: {
        profiles: {
          exists: !profilesError,
          error: profilesError?.message,
          data: profiles || [],
          count: profiles?.length || 0
        },
        checkouts: {
          exists: !checkoutsError,
          error: checkoutsError?.message,
          data: checkouts || [],
          count: checkouts?.length || 0
        },
        catalog: {
          exists: !catalogError,
          error: catalogError?.message,
          data: catalog || [],
          count: catalog?.length || 0
        }
      },
      message: 'Database structure test complete'
    });

  } catch (error: any) {
    return Response.json({
      error: 'Database test failed',
      details: error.message
    }, { status: 500 });
  }
}
