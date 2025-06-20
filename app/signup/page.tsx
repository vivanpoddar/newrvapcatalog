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

export default function SignUpPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phoneNumber: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const router = useRouter();

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Name validation
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        // Phone number validation (optional but if provided, should be valid)
        if (formData.phoneNumber && formData.phoneNumber.trim()) {
            const phoneRegex = /^[\+]?[(]?[\d\s\-\(\)]{10,15}$/;
            const cleanPhone = formData.phoneNumber.replace(/[\s\-\(\)]/g, '');
            if (cleanPhone.length < 10 || !phoneRegex.test(formData.phoneNumber)) {
                newErrors.phoneNumber = 'Please enter a valid phone number (at least 10 digits)';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const supabase = createClient();

            // Sign up the user with email confirmation enabled
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    emailRedirectTo: `${window.location.origin}/verify-email`,
                    data: {
                        first_name: formData.firstName.trim(),
                        last_name: formData.lastName.trim(),
                        phone_number: formData.phoneNumber.trim(),
                        full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`
                    }
                }
            });

            if (error) {
                setErrors({ general: error.message });
            } else if (data.user && !data.user.email_confirmed_at) {
                // User created but needs email verification
                router.push('/verify-email?message=check-email');
            } else if (data.user && data.user.email_confirmed_at) {
                // User already verified (shouldn't happen in normal flow)
                router.push('/');
                router.refresh();
            } else {
                setErrors({ general: 'Sign-up failed - no user data returned' });
            }
        } catch (err) {
            console.error('Sign-up error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setErrors({ general: `An unexpected error occurred: ${errorMessage}` });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <img src="logo.svg" height={1000} width={1000} className='-left-100 fixed -z-10'></img>

            <div className="max-w-md w-full space-y-8">

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Sign Up</CardTitle>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="grid gap-4">
                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label htmlFor="firstName" className="text-sm font-medium">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        placeholder="Enter your first name"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                        className={errors.firstName ? 'border-red-500' : ''}
                                    />
                                    {errors.firstName && (
                                        <p className="text-xs text-red-600">{errors.firstName}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="lastName" className="text-sm font-medium">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        placeholder="Enter your last name"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                        className={errors.lastName ? 'border-red-500' : ''}
                                    />
                                    {errors.lastName && (
                                        <p className="text-xs text-red-600">{errors.lastName}</p>
                                    )}
                                </div>
                            </div>

                            {/* Email Field */}
                            <div className="grid gap-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className={errors.email ? 'border-red-500' : ''}
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-600">{errors.email}</p>
                                )}
                            </div>

                            {/* Phone Number Field */}
                            <div className="grid gap-2">
                                <label htmlFor="phoneNumber" className="text-sm font-medium">
                                    Phone Number<span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    type="tel"
                                    placeholder="Enter your phone number"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className={errors.phoneNumber ? 'border-red-500' : ''}
                                />
                                {errors.phoneNumber && (
                                    <p className="text-xs text-red-600">{errors.phoneNumber}</p>
                                )}
                            </div>

                            {/* Password Fields */}
                            <div className="grid gap-2">
                                <label htmlFor="password" className="text-sm font-medium">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Create a password (min. 6 characters)"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className={errors.password ? 'border-red-500' : ''}
                                />
                                {errors.password && (
                                    <p className="text-xs text-red-600">{errors.password}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="confirmPassword" className="text-sm font-medium">
                                    Confirm Password <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className={errors.confirmPassword ? 'border-red-500' : ''}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-xs text-red-600">{errors.confirmPassword}</p>
                                )}
                            </div>

                            {/* General Error */}
                            {errors.general && (
                                <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
                                    {errors.general}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                            </Button>

                            <div className="text-center text-sm text-gray-600">
                                <Link href="/login" className="text-primary hover:underline font-medium">
                                    Back to sign in menu
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}