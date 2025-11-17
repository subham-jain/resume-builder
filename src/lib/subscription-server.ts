// Server-side only - DO NOT IMPORT IN CLIENT COMPONENTS
import { createClient } from './supabase-server';

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

// Server-side version - uses server client
export async function getUserTier(userId: string): Promise<SubscriptionTier> {
  try {
    const supabase = await createClient();
    
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

