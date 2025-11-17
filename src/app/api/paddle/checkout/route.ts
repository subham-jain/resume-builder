import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createPaddleCheckout, PADDLE_PRODUCTS } from '@/lib/paddle';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { plan, period } = body;

    if (!plan || !period) {
      return NextResponse.json(
        { error: 'Plan and period are required' },
        { status: 400 }
      );
    }

    if (plan === 'free') {
      return NextResponse.json(
        { error: 'Free plan does not require checkout' },
        { status: 400 }
      );
    }

    // Get price ID for the selected plan
    const priceId = PADDLE_PRODUCTS[plan as keyof typeof PADDLE_PRODUCTS]?.[period as 'monthly' | 'yearly'];
    
    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan or period' },
        { status: 400 }
      );
    }

    // Create checkout session
    const successUrl = `${request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    
    const checkout = await createPaddleCheckout(
      priceId,
      user.id,
      user.email || '',
      successUrl,
      {
        plan,
        period,
      }
    );

    return NextResponse.json({
      checkoutId: checkout.id,
      checkoutUrl: checkout.checkout_url || checkout.url,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout' },
      { status: 500 }
    );
  }
}

