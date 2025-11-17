'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast';
import Link from 'next/link';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams.get('plan') || 'pro';
  const period = searchParams.get('period') || 'month';
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const { toasts, removeToast, success, error: showError } = useToast();
  const supabase = createClient();

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push(`/auth/signin?redirect=/checkout?plan=${plan}&period=${period}`);
          return;
        }

        setLoading(true);
        
        const response = await fetch('/api/paddle/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ plan, period }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create checkout');
        }

        const data = await response.json();
        
        if (data.checkoutUrl) {
          // Redirect to Paddle checkout
          window.location.href = data.checkoutUrl;
        } else {
          throw new Error('No checkout URL received');
        }
      } catch (err: any) {
        showError(err.message || 'Failed to initialize checkout');
        setLoading(false);
      }
    };

    if (plan !== 'free') {
      initializeCheckout();
    }
  }, [plan, period, router, supabase, showError]);

  if (plan === 'free') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Free Plan Selected</h1>
          <p className="text-gray-600 mb-6">
            The free plan doesn&apos;t require payment. You can start using it right away!
          </p>
          <Link
            href="/generate"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Start Creating Resumes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Redirecting to Checkout...</h1>
            <p className="text-gray-600">
              Please wait while we prepare your secure checkout session.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Checkout</h1>
            <p className="text-gray-600 mb-6">
              If you weren&apos;t redirected automatically, please check your connection and try again.
            </p>
            <Link
              href="/pricing"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Pricing
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

