'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast';
import Link from 'next/link';
import { PRICING_PLANS } from '@/lib/subscription';

interface Subscription {
  id: string;
  tier: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();
  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/auth/signin');
          return;
        }

        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        setSubscription(subscriptionData);
      } catch (error) {
        console.error('Error loading subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, [supabase, router]);

  const handleCancelSubscription = async () => {
    if (!subscription || !confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      // In production, call Paddle API to cancel subscription
      // For now, update database
      const { error } = await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);

      if (error) throw error;

      setSubscription({
        ...subscription,
        cancel_at_period_end: true,
      });

      success('Subscription will be canceled at the end of the billing period');
    } catch (err: any) {
      showError(err.message || 'Failed to cancel subscription');
    }
  };

  const handleResumeSubscription = async () => {
    if (!subscription) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);

      if (error) throw error;

      setSubscription({
        ...subscription,
        cancel_at_period_end: false,
      });

      success('Subscription resumed successfully');
    } catch (err: any) {
      showError(err.message || 'Failed to resume subscription');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const plan = subscription?.tier || 'free';
  const planDetails = PRICING_PLANS[plan as keyof typeof PRICING_PLANS];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
          <p className="text-gray-600">Manage your subscription and billing</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 capitalize">{planDetails.name} Plan</h2>
              <p className="text-gray-600 mt-1">
                Status: <span className={`font-semibold ${
                  subscription?.status === 'active' ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {subscription?.status || 'Free'}
                </span>
              </p>
            </div>
            {plan !== 'free' && (
              <Link
                href="/pricing"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Change Plan
              </Link>
            )}
          </div>

          {subscription && subscription.status === 'active' && (
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Current Period</span>
                <span className="font-medium text-gray-900">
                  {new Date(subscription.current_period_start).toLocaleDateString()} - {' '}
                  {new Date(subscription.current_period_end).toLocaleDateString()}
                </span>
              </div>

              {subscription.cancel_at_period_end && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-yellow-800">Subscription Canceling</p>
                      <p className="text-sm text-yellow-700">
                        Your subscription will end on {new Date(subscription.current_period_end).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={handleResumeSubscription}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Resume Subscription
                    </button>
                  </div>
                </div>
              )}

              {!subscription.cancel_at_period_end && (
                <button
                  onClick={handleCancelSubscription}
                  className="w-full px-4 py-2 border-2 border-red-300 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          )}

          {plan === 'free' && (
            <div className="border-t border-gray-200 pt-6">
              <p className="text-gray-600 mb-4">
                You're currently on the free plan. Upgrade to unlock more features!
              </p>
              <Link
                href="/pricing"
                className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg"
              >
                View Plans
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Plan Features</h3>
          <ul className="space-y-2">
            {planDetails.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

