import { checkUserAdmin } from '@/lib/auth-utils';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminTestPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const isAdmin = await checkUserAdmin();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Admin Status Test</h1>
          
          <div className="space-y-4">
            <div className="border rounded p-4">
              <h2 className="font-semibold mb-2">User Information</h2>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Created:</strong> {new Date(user.created_at || '').toLocaleString()}</p>
            </div>

            <div className="border rounded p-4">
              <h2 className="font-semibold mb-2">Metadata</h2>
              <div className="space-y-2">
                <div>
                  <strong>User Metadata:</strong>
                  <pre className="text-sm bg-gray-100 p-2 rounded mt-1">
                    {JSON.stringify(user.user_metadata, null, 2)}
                  </pre>
                </div>
                <div>
                  <strong>App Metadata:</strong>
                  <pre className="text-sm bg-gray-100 p-2 rounded mt-1">
                    {JSON.stringify(user.app_metadata, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <div className={`border rounded p-4 ${isAdmin ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <h2 className="font-semibold mb-2">Admin Status</h2>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  isAdmin 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {isAdmin ? '👑 ADMIN' : '👤 USER'}
                </span>
                <span className="text-sm text-gray-600">
                  Result: {isAdmin ? 'TRUE' : 'FALSE'}
                </span>
              </div>
            </div>

            <div className="border rounded p-4">
              <h2 className="font-semibold mb-2">Admin Checks Performed</h2>
              <ul className="text-sm space-y-1">
                <li>✓ App metadata check (user.app_metadata?.admin)</li>
                <li>✓ User metadata check (user.user_metadata?.admin)</li>
                <li>✓ Database users table check (by ID)</li>
                <li>✓ Database users table check (by email)</li>
                <li>✓ Database profiles table check</li>
              </ul>
              <p className="text-xs text-gray-500 mt-2">
                Admin status is determined by database records or auth metadata only.
              </p>
            </div>

            <div className="flex gap-2">
              <a 
                href="/" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Go to Dashboard
              </a>
              <a 
                href="/api/debug-admin" 
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                View Debug API
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
