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

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You need to be logged in to access this page</p>
        </div>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Unauthorized</CardTitle>
            <CardDescription className="text-center">
              Please sign in to access the RVAP Catalog management system
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              You don't have permission to view this page. Please sign in with your authorized account.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="w-full" variant="outline">
              <Link href="/signup">Create Account</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <div className="text-center text-sm text-gray-500">
          <p>Contact your administrator if you believe this is an error</p>
        </div>
      </div>
    </div>
  );
}