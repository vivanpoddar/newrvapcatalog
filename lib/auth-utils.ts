import { createClient } from '@/utils/supabase/server';

export async function checkUserAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return false;
  }

  // Check multiple sources for admin status
  
  // 1. Check app_metadata (most secure, set by service role)
  if (user.app_metadata?.admin === true) {
    return true;
  }

  // 2. Check user_metadata (can be set during signup or profile update)
  if (user.user_metadata?.admin === true) {
    return true;
  }

  // 3. Try to check users/profiles table in database
  try {
    // First try 'users' table
    const { data: userData, error: usersError } = await supabase
      .from('users')
      .select('admin')
      .eq('id', user.id)
      .single();

    if (!usersError && userData?.admin === true) {
      return true;
    }

    // If users table doesn't work, try by email
    if (usersError) {
      const { data: userByEmail, error: emailError } = await supabase
        .from('users')
        .select('admin')
        .eq('email', user.email)
        .single();

      if (!emailError && userByEmail?.admin === true) {
        return true;
      }
    }

    // Try 'profiles' table as alternative
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('admin')
      .eq('id', user.id)
      .single();

    if (!profileError && profileData?.admin === true) {
      return true;
    }

  } catch (error) {
    console.error('Error checking admin status in database:', error);
  }

  // No admin status found in any source
  return false;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
