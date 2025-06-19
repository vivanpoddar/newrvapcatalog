import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Test complete flow: checkouts joined with users
    const { data: checkoutWithUsers, error: joinError } = await supabase
      .from('checkouts')
      .select(`
        book_id,
        user_id,
        checked_out_at,
        returned_at,
        users!inner (
          id,
          name,
          email,
          phone
        )
      `)
      .is('returned_at', null)
      .limit(5);

    if (joinError) {
      return Response.json({ 
        error: 'Failed to join checkouts with users',
        details: joinError.message,
        suggestion: 'Make sure users table has name, email, and phone columns'
      }, { status: 500 });
    }

    // Test the full data structure
    const processedCheckouts = checkoutWithUsers?.map(checkout => ({
      bookId: checkout.book_id,
      userDisplay: checkout.users?.name || 'Unknown User',
      userEmail: checkout.users?.email || '',
      userPhone: checkout.users?.phone || '',
      checkedOutDate: new Date(checkout.checked_out_at).toLocaleDateString(),
      tooltipContent: {
        name: checkout.users?.name,
        email: checkout.users?.email,
        phone: checkout.users?.phone,
        date: new Date(checkout.checked_out_at).toLocaleDateString()
      }
    })) || [];

    return Response.json({
      message: 'Users table integration test successful',
      totalActiveCheckouts: checkoutWithUsers?.length || 0,
      processedCheckouts,
      dataStructureValid: processedCheckouts.length > 0 ? 
        processedCheckouts[0].userDisplay !== 'Unknown User' : false,
      integration: 'users_table_direct_join'
    });

  } catch (error: any) {
    return Response.json({
      error: 'Integration test failed',
      details: error.message
    }, { status: 500 });
  }
}
