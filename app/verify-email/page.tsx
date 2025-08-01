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
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

function VerifyEmailPageInner() {
    const [isLoading, setIsLoading] = useState(true);
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const message = searchParams.get('message');

    useEffect(() => {
        const handleEmailVerification = async () => {
            const supabase = createClient();
            
            // Check if this is a verification callback
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');
            const type = hashParams.get('type');

            if (type === 'signup' && accessToken && refreshToken) {
                try {
                    // Set the session with the tokens from the email link
                    const { data, error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken
                    });

                    if (error) {
                        setError('Email verification failed. Please try again.');
                    } else if (data.user) {
                        setIsVerified(true);
                        // Redirect to dashboard after successful verification
                        setTimeout(() => {
                            router.push('/');
                            router.refresh();
                        }, 2000);
                    }
                } catch (err) {
                    setError('An error occurred during verification.');
                }
            } else if (message === 'check-email') {
                // User just signed up and needs to check their email
                setIsLoading(false);
            } else {
                // Check if user is already verified
                const { data: { user } } = await supabase.auth.getUser();
                if (user && user.email_confirmed_at) {
                    setIsVerified(true);
                    router.push('/');
                } else {
                    setIsLoading(false);
                }
            }
            
            setIsLoading(false);
        };

        handleEmailVerification();
    }, [router, message]);

    const handleResendEmail = async () => {
        setResendLoading(true);
        setResendSuccess(false);
        setError('');

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user && user.email) {
                const { error } = await supabase.auth.resend({
                    type: 'signup',
                    email: user.email,
                    options: {
                        emailRedirectTo: `${window.location.origin}/verify-email`
                    }
                });

                if (error) {
                    setError(error.message);
                } else {
                    setResendSuccess(true);
                }
            } else {
                setError('Unable to resend email. Please try signing up again.');
            }
        } catch (err) {
            setError('Failed to resend verification email.');
        } finally {
            setResendLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600">Verifying your email...</p>
                </div>
            </div>
        );
    }

    if (isVerified) {
        return (
            <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <p className="text-gray-600">Email verification successful!</p>
                    </div>
                    
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle className="text-2xl text-center text-green-600">✅ Verified</CardTitle>
                            <CardDescription className="text-center">
                                Your email has been successfully verified
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            <p className="text-sm text-gray-600">
                                You will be redirected to the dashboard shortly.
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full">
                                <Link href="/">Go to Dashboard</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <img src="logo.svg" height={1000} width={1000} className='-left-100 fixed -z-10'></img>
            <div className="max-w-md w-full space-y-8">
                
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Email Verification</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-sm text-gray-600">
                            Please check your email and click the verification link to activate your account. Check your junk folder. If you don't see any emails, sign up again.
                        </p>
                        <p>
                            You will be redirected to the dashboard once your email is verified.
                        </p>
                        
                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
                                {error}
                            </div>
                        )}
                        
                        {resendSuccess && (
                            <div className="text-sm text-green-600 bg-green-50 p-3 rounded border border-green-200">
                                Verification email has been resent!
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button asChild className="w-full" variant="outline">
                            <Link href="/login">Back to Sign In</Link>
                        </Button>
                    </CardFooter>
                </Card>
                
                <div className="text-center text-sm text-gray-500">
                    <p>Report any issues to vivanneil@outlook.com</p>
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense>
            <VerifyEmailPageInner />
        </Suspense>
    );
}