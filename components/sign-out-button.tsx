'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <button 
      type="button" 
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
    >
      {isSigningOut ? 'Signing out...' : 'Sign Out'}
    </button>
  );
}
