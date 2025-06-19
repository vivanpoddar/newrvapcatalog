import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();
  
  try {
    // Test different ways to access table information
    const results: {
      method: string;
      availableTables: string[];
      errors: Record<string, string>;
      sampleData: Record<string, any>;
    } = {
      method: 'table_probe',
      availableTables: [],
      errors: {},
      sampleData: {}
    };
    
    // Try catalog table
    const { data: catalogData, error: catalogError } = await supabase
      .from('catalog')
      .select('id, title')
      .limit(3);
    
    if (!catalogError) {
      results.availableTables.push('catalog');
      results.sampleData.catalog = catalogData;
    } else {
      results.errors.catalog = catalogError.message;
    }
    
    // Try users table
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, email, admin')
      .limit(3);
    
    if (!usersError) {
      results.availableTables.push('users');
      results.sampleData.users = usersData;
    } else {
      results.errors.users = usersError.message;
    }
    
    // Try profiles table (common Supabase pattern)
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, admin')
      .limit(3);
    
    if (!profilesError) {
      results.availableTables.push('profiles');
      results.sampleData.profiles = profilesData;
    } else {
      results.errors.profiles = profilesError.message;
    }
    
    return Response.json(results);
    
  } catch (error: any) {
    return Response.json({
      error: 'Failed to check database structure',
      details: error.message
    });
  }
}
