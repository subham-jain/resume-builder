import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { verifyWebhookSignature } from '@/lib/paddle';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('paddle-signature');
    const timestamp = request.headers.get('paddle-timestamp') || '';
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    const body = await request.text();
    
    // Verify webhook signature
    if (!verifyWebhookSignature(signature, body, timestamp)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);
    const supabase = await createClient();

    // Handle different Paddle webhook events
    switch (event.event_type) {
      case 'transaction.completed':
      case 'subscription.created':
      case 'subscription.updated': {
        const customerId = event.data?.customer_id || event.data?.custom_data?.user_id;
        const subscriptionId = event.data?.id;
        const status = event.data?.status;
        const plan = event.data?.custom_data?.plan || 'pro';
        const period = event.data?.custom_data?.period || 'monthly';

        if (!customerId) {
          console.error('No customer ID in webhook event');
          break;
        }

        // Update subscription in database
        const { error: dbError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: customerId,
            paddle_subscription_id: subscriptionId,
            tier: plan,
            status: status === 'active' ? 'active' : 'inactive',
            current_period_start: event.data?.billing_period?.starts_at || new Date().toISOString(),
            current_period_end: event.data?.billing_period?.ends_at || new Date().toISOString(),
            cancel_at_period_end: event.data?.cancel_at_period_end || false,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          });

        if (dbError) {
          console.error('Database error:', dbError);
        }
        break;
      }

      case 'subscription.canceled':
      case 'subscription.past_due': {
        const customerId = event.data?.customer_id || event.data?.custom_data?.user_id;
        
        if (customerId) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', customerId);
        }
        break;
      }

      case 'transaction.payment_succeeded': {
        const customerId = event.data?.customer_id || event.data?.custom_data?.user_id;
        const amount = event.data?.totals?.total;
        const currency = event.data?.currency_code || 'USD';

        if (customerId) {
          // Record payment
          await supabase
            .from('payments')
            .insert({
              user_id: customerId,
              amount: amount / 100, // Convert from cents
              currency,
              status: 'completed',
              payment_provider: 'paddle',
              provider_transaction_id: event.data?.id,
              created_at: new Date().toISOString(),
            });
        }
        break;
      }

      default:
        console.log('Unhandled webhook event:', event.event_type);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

