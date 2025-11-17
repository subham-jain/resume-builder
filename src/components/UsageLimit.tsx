'use client';

import { SubscriptionTier, checkUsageLimit, SUBSCRIPTION_PLANS } from '@/lib/subscription';

interface UsageLimitProps {
  tier: SubscriptionTier;
  currentUsage: number;
  feature?: string;
  userEmail?: string;
}

export default function UsageLimit({ tier, currentUsage, feature, userEmail }: UsageLimitProps) {
  const usage = checkUsageLimit(tier, currentUsage, 'month', userEmail);
  const limit = SUBSCRIPTION_PLANS[tier].resumesPerMonth;
  const effectiveLimit = usage.limit === -1 ? -1 : limit;
  const percentage = effectiveLimit === -1 ? 0 : (currentUsage / effectiveLimit) * 100;

  if (effectiveLimit === -1 || usage.limit === -1) {
    return null; // Unlimited, no need to show
  }

  const isNearLimit = percentage >= 80;
  const isAtLimit = !usage.allowed;

  return (
    <div className={`rounded-lg p-4 border-2 ${
      isAtLimit
        ? 'bg-red-50 border-red-200'
        : isNearLimit
        ? 'bg-yellow-50 border-yellow-200'
        : 'bg-blue-50 border-blue-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <svg
            className={`w-5 h-5 ${
              isAtLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-blue-600'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                isAtLimit
                  ? 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z'
                  : 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              }
            />
          </svg>
          <span
            className={`font-semibold ${
              isAtLimit ? 'text-red-800' : isNearLimit ? 'text-yellow-800' : 'text-blue-800'
            }`}
          >
            {feature || 'Monthly Usage'}
          </span>
        </div>
        <span
          className={`text-sm font-medium ${
            isAtLimit ? 'text-red-700' : isNearLimit ? 'text-yellow-700' : 'text-blue-700'
          }`}
        >
          {currentUsage} / {effectiveLimit}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            isAtLimit
              ? 'bg-red-500'
              : isNearLimit
              ? 'bg-yellow-500'
              : 'bg-blue-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {isAtLimit ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-red-700">
            You&apos;ve reached your monthly limit. Upgrade to continue creating resumes.
          </p>
          <a
            href="/pricing"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap ml-4"
          >
            Upgrade Now
          </a>
        </div>
      ) : isNearLimit ? (
        <p className="text-sm text-yellow-700">
          You&apos;re running low on resumes this month ({usage.remaining} remaining).{' '}
          <a href="/pricing" className="font-semibold underline">
            Upgrade for more
          </a>
        </p>
      ) : (
        <p className="text-sm text-blue-700">
          {usage.remaining} resumes remaining this month
        </p>
      )}
    </div>
  );
}

