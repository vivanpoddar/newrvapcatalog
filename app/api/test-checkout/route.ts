import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return Response.json({ 
        error: 'User not authenticated',
        details: userError?.message 
      }, { status: 401 });
    }

    // Test checkout table structure
    const { data: checkouts, error: checkoutError } = await supabase
      .from('checkouts')
      .select('*')
      .limit(5);

    if (checkoutError) {
      return Response.json({ 
        error: 'Failed to query checkouts table',
        details: checkoutError.message 
      }, { status: 500 });
    }

    // Test catalog data with checkout status
    const { data: catalog, error: catalogError } = await supabase
      .from('catalog')
      .select('number, title')
      .limit(3);

    if (catalogError) {
      return Response.json({ 
        error: 'Failed to query catalog table',
        details: catalogError.message 
      }, { status: 500 });
    }

    // Create a test checkout if there are no checkouts and we have catalog items
    let testCheckoutCreated = false;
    if (checkouts.length === 0 && catalog.length > 0) {
      const { error: insertError } = await supabase
        .from('checkouts')
        .insert({
          book_id: catalog[0].number,
          user_id: user.id,
          checked_out_at: new Date().toISOString()
        });
      
      if (!insertError) {
        testCheckoutCreated = true;
      }
    }

    return Response.json({
      user: {
        id: user.id,
        email: user.email
      },
      checkouts: checkouts || [],
      catalog: catalog || [],
      testCheckoutCreated,
      message: 'Checkout system test successful - check the main page to see checkout details!'
    });

  } catch (error: any) {
    return Response.json({
      error: 'Test failed',
      details: error.message
    }, { status: 500 });
  }
}
