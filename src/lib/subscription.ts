export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface SubscriptionLimits {
  resumesPerMonth: number;
  templatesAvailable: string[];
  canUploadFiles: boolean;
  canEditResumes: boolean;
  atsAnalysis: boolean;
  prioritySupport: boolean;
  customBranding: boolean;
  apiAccess: boolean;
  bulkGeneration: boolean;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    resumesPerMonth: 3,
    templatesAvailable: ['classic'],
    canUploadFiles: true,
    canEditResumes: true,
    atsAnalysis: true,
    prioritySupport: false,
    customBranding: false,
    apiAccess: false,
    bulkGeneration: false,
  },
  pro: {
    resumesPerMonth: 50,
    templatesAvailable: ['classic', 'modern', 'creative', 'tech'],
    canUploadFiles: true,
    canEditResumes: true,
    atsAnalysis: true,
    prioritySupport: true,
    customBranding: false,
    apiAccess: false,
    bulkGeneration: true,
  },
  enterprise: {
    resumesPerMonth: -1, // Unlimited
    templatesAvailable: ['classic', 'modern', 'creative', 'tech'],
    canUploadFiles: true,
    canEditResumes: true,
    atsAnalysis: true,
    prioritySupport: true,
    customBranding: true,
    apiAccess: true,
    bulkGeneration: true,
  },
};

export const PRICING_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    period: 'forever',
    features: [
      '3 resumes per month',
      '1 template',
      'Basic ATS analysis',
      'PDF download',
      'Resume upload',
    ],
  },
  pro: {
    name: 'Pro',
    price: 9.99,
    period: 'month',
    features: [
      '50 resumes per month',
      '4 professional templates',
      'Advanced ATS analysis',
      'Unlimited PDF downloads',
      'Resume upload & editing',
      'Bulk generation',
      'Priority support',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 29.99,
    period: 'month',
    features: [
      'Unlimited resumes',
      'All templates',
      'Advanced ATS analysis',
      'Custom branding',
      'API access',
      'Bulk generation',
      'Dedicated support',
      'Team collaboration',
    ],
  },
};

// Client-side version - accepts Supabase client as parameter
export async function getUserTierClient(
  supabase: ReturnType<typeof import('@/lib/supabase-client').createClient>,
  userId: string
): Promise<SubscriptionTier> {
  try {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
    
    if (subscription) {
      return subscription.tier as SubscriptionTier;
    }
  } catch (error) {
    console.error('Error fetching user tier:', error);
  }
  
  return 'free';
}

// Server-side version is in subscription-server.ts  
// Import it directly in API routes: import { getUserTier } from '@/lib/subscription-server';

export function checkUsageLimit(
  tier: SubscriptionTier,
  currentUsage: number,
  _period: 'month' | 'year' = 'month',
  userEmail?: string
): { allowed: boolean; remaining: number; limit: number } {
  // Special unlimited access for specific email
  const UNLIMITED_EMAILS = ['jainsubham3111@gmail.com'];
  
  if (userEmail && UNLIMITED_EMAILS.includes(userEmail.toLowerCase())) {
    return { allowed: true, remaining: -1, limit: -1 }; // Unlimited
  }
  
  const limits = SUBSCRIPTION_PLANS[tier];
  const limit = limits.resumesPerMonth;
  
  if (limit === -1) {
    return { allowed: true, remaining: -1, limit: -1 }; // Unlimited
  }
  
  const remaining = Math.max(0, limit - currentUsage);
  return {
    allowed: remaining > 0,
    remaining,
    limit,
  };
}

export function canAccessFeature(tier: SubscriptionTier, feature: keyof SubscriptionLimits): boolean {
  return SUBSCRIPTION_PLANS[tier][feature] === true;
}

