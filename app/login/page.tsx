'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Check environment variables first
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        setError('Supabase configuration is missing. Please check environment variables.');
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Check if it's an email not confirmed error
        if (error.message.includes('Email not confirmed')) {
          setError('Please check your email and click the verification link before signing in.');
        } else {
          setError(error.message);
        }
      } else if (data.user) {
        // Check if email is verified
        if (!data.user.email_confirmed_at) {
          // User exists but email not verified - redirect to verify-email page
          router.push('/verify-email');
        } else {
          // Successful login with verified email
          router.push('/');
          router.refresh();
        }
      } else {
        setError('Login failed - no user data returned');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`An unexpected error occurred: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <img src="logo.svg" height={1000} width={1000} className='-left-100 fixed -z-10'></img>
      <div className="max-w-md w-full space-y-8">
        <h1 className="text-3xl font-bold text-center mb-6">Ramakrishna Vedanta Ashrama of Pittsburgh Library</h1>
        
        <Card className="w-full z-100">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Sign in</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
                  {error}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </CardFooter>
          </form>
          
          <div className="px-6 pb-6">
            <div className="text-center text-sm text-gray-600">
              <Link href="/signup" className="text-primary hover:underline font-medium">
                Sign up here if you don't have an account
              </Link>
            </div>
          </div>
        </Card>
        
      </div>
    </div>
  );
}
