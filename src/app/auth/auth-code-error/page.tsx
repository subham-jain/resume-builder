import Link from 'next/link';

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-600">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            There was an error during the authentication process.
          </p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800 text-sm">
            <p className="font-medium mb-2">Possible causes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Supabase configuration is incomplete</li>
              <li>Google OAuth setup is not finished</li>
              <li>Invalid or expired authentication code</li>
              <li>Network connectivity issues</li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="text-blue-800 text-sm">
            <p className="font-medium mb-2">To fix this:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Complete the Supabase setup in your <code className="bg-blue-100 px-1 rounded">.env.local</code> file</li>
              <li>Run the database schema from <code className="bg-blue-100 px-1 rounded">QUICK_START.md</code></li>
              <li>Configure Google OAuth if using Google sign-in</li>
              <li>Restart your development server</li>
            </ol>
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <Link
            href="/auth/signin"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
