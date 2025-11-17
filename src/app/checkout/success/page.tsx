'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const { toasts, removeToast, success, error: showError } = useToast();
  const supabase = createClient();

  useEffect(() => {
    const verifySubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/auth/signin');
          return;
        }

        // Wait a moment for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check subscription status
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (subscriptionData) {
          setSubscription(subscriptionData);
          success('Subscription activated successfully!');
        } else {
          // Subscription might still be processing
          showError('Subscription is being processed. Please refresh in a moment.');
        }
      } catch (error: any) {
        console.error('Verification error:', error);
        showError('Failed to verify subscription');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      verifySubscription();
    } else {
      setLoading(false);
    }
  }, [sessionId, router, supabase, success, showError]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Subscription...</h1>
            <p className="text-gray-600">
              Please wait while we confirm your subscription.
            </p>
          </>
        ) : subscription ? (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to {subscription.tier}!</h1>
            <p className="text-gray-600 mb-6">
              Your subscription has been activated. You now have access to all premium features.
            </p>
            <div className="space-y-3">
              <Link
                href="/dashboard"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/generate"
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Create Your First Resume
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">⏳</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing...</h1>
            <p className="text-gray-600 mb-6">
              Your payment is being processed. This may take a few moments.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Check Dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

