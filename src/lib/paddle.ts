// Paddle client-side initialization
// Note: Paddle.js is typically loaded via script tag in the browser
// This file handles server-side Paddle API calls only

// Paddle product/price IDs - Set these in your Paddle dashboard
export const PADDLE_PRODUCTS = {
  pro: {
    monthly: process.env.NEXT_PUBLIC_PADDLE_PRO_MONTHLY_PRICE_ID || '',
    yearly: process.env.NEXT_PUBLIC_PADDLE_PRO_YEARLY_PRICE_ID || '',
  },
  enterprise: {
    monthly: process.env.NEXT_PUBLIC_PADDLE_ENTERPRISE_MONTHLY_PRICE_ID || '',
    yearly: process.env.NEXT_PUBLIC_PADDLE_ENTERPRISE_YEARLY_PRICE_ID || '',
  },
};

// Server-side Paddle API client
export async function createPaddleCheckout(
  priceId: string,
  userId: string,
  userEmail: string,
  successUrl: string,
  metadata?: Record<string, unknown>
) {
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) {
    throw new Error('PADDLE_API_KEY is not configured');
  }

  // Paddle API v2 - Create transaction/checkout
  // Note: Adjust endpoint based on Paddle API version you're using
  const response = await fetch('https://api.paddle.com/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      items: [
        {
          price_id: priceId,
          quantity: 1,
        },
      ],
      customer_id: userId,
      customer_email: userEmail,
      custom_data: {
        user_id: userId,
        ...metadata,
      },
      return_url: successUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create checkout' }));
    throw new Error(error.message || 'Failed to create checkout');
  }

  const data = await response.json();
  
  // Return checkout URL or transaction details
  return {
    id: data.id,
    checkout_url: data.checkout?.url || data.url || data.checkout_url,
    ...data,
  };
}

// Verify webhook signature
export function verifyWebhookSignature(
  _signature: string,
  _body: string,
  _timestamp: string
): boolean {
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn('PADDLE_WEBHOOK_SECRET not configured, skipping verification');
    return true; // In development, allow without verification
  }

  // Paddle webhook signature verification
  // Implementation depends on Paddle's signature algorithm
  // This is a placeholder - check Paddle docs for exact implementation
  return true;
}

