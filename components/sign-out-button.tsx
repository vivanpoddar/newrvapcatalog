'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <button 
      type="button" 
      onClick={handleSignOut}
      className="w-full text-left"
    >
      Sign Out
    </button>
  );
}
