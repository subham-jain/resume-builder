'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PRICING_PLANS, SubscriptionTier } from '@/lib/subscription';
import { useRouter } from 'next/navigation';
import { trackSubscriptionUpgrade } from '@/lib/analytics';

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');
  const router = useRouter();

  const handleSelectPlan = (tier: SubscriptionTier) => {
    if (tier === 'free') {
      router.push('/generate');
    } else {
      // Track subscription upgrade attempt
      trackSubscriptionUpgrade(tier);
      // Redirect to Paddle checkout
      router.push(`/checkout?plan=${tier}&period=${billingPeriod}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Start free, upgrade when you need more. All plans include AI-powered resume generation.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setBillingPeriod('month')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                billingPeriod === 'month'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('year')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                billingPeriod === 'year'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {Object.entries(PRICING_PLANS).map(([tier, plan], index) => {
            const isPopular = tier === 'pro';
            const yearlyPrice = billingPeriod === 'year' ? plan.price * 12 * 0.8 : plan.price;
            const displayPrice = billingPeriod === 'year' ? yearlyPrice : plan.price;

            return (
              <div
                key={tier}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 transform hover:scale-105 ${
                  isPopular ? 'ring-4 ring-blue-500 ring-opacity-50 shadow-2xl' : ''
                } animate-slide-up`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {isPopular && (
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2 text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">${displayPrice.toFixed(2)}</span>
                    {plan.price > 0 && (
                      <span className="text-gray-600 ml-2">
                        /{billingPeriod === 'year' ? 'year' : plan.period}
                      </span>
                    )}
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectPlan(tier as SubscriptionTier)}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                      isPopular
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                        : tier === 'free'
                        ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {tier === 'free' ? 'Get Started Free' : `Choose ${plan.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I change plans later?</h3>
              <p className="text-gray-600 text-sm">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What happens if I exceed my limit?</h3>
              <p className="text-gray-600 text-sm">
                You&apos;ll be notified when you&apos;re close to your limit. Upgrade to continue creating resumes.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600 text-sm">
                Yes, we offer a 30-day money-back guarantee. Contact support for assistance.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is my data secure?</h3>
              <p className="text-gray-600 text-sm">
                Absolutely. We use industry-standard encryption and never share your data with third parties.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <Link
            href="/contact"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Contact Support →
          </Link>
        </div>
      </div>
    </div>
  );
}

