# 🚀 Paddle Integration Setup Guide

This guide will help you set up Paddle payment processing for the Resume Builder application.

## 📋 Prerequisites

1. Paddle account (sign up at [paddle.com](https://www.paddle.com))
2. Supabase database with subscription tables
3. Environment variables configured

## 🔧 Step 1: Create Paddle Account

1. Go to [paddle.com](https://www.paddle.com) and sign up
2. Complete your business verification
3. Set up your business details and tax information

## 🔑 Step 2: Get Paddle Credentials

### API Keys
1. Go to **Developer Tools > Authentication** in Paddle dashboard
2. Generate an **API Key** (server-side)
3. Copy the **Client-side Token** (public)

### Product Setup
1. Go to **Catalog > Products** in Paddle dashboard
2. Create products for each plan:
   - **Pro Monthly**: Create product with monthly subscription
   - **Pro Yearly**: Create product with yearly subscription
   - **Enterprise Monthly**: Create product with monthly subscription
   - **Enterprise Yearly**: Create product with yearly subscription
3. Copy the **Price IDs** for each product

## 🗄️ Step 3: Database Setup

Run this SQL in your Supabase SQL editor:

```sql
-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  paddle_subscription_id VARCHAR(255),
  tier VARCHAR(20) NOT NULL DEFAULT 'free',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) NOT NULL,
  payment_provider VARCHAR(50) DEFAULT 'paddle',
  provider_transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_subscription_id ON payments(subscription_id);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);
```

## 🔐 Step 4: Environment Variables

Add these to your `.env.local`:

```env
# Paddle Configuration
PADDLE_API_KEY=your_paddle_api_key_here
PADDLE_WEBHOOK_SECRET=your_webhook_secret_here
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your_client_token_here

# Paddle Product/Price IDs
NEXT_PUBLIC_PADDLE_PRO_MONTHLY_PRICE_ID=pri_xxxxx
NEXT_PUBLIC_PADDLE_PRO_YEARLY_PRICE_ID=pri_xxxxx
NEXT_PUBLIC_PADDLE_ENTERPRISE_MONTHLY_PRICE_ID=pri_xxxxx
NEXT_PUBLIC_PADDLE_ENTERPRISE_YEARLY_PRICE_ID=pri_xxxxx

# App URL (for webhooks)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🔗 Step 5: Configure Webhooks

1. Go to **Developer Tools > Webhooks** in Paddle dashboard
2. Add webhook endpoint: `https://yourdomain.com/api/paddle/webhook`
3. Select events to listen for:
   - `transaction.completed`
   - `subscription.created`
   - `subscription.updated`
   - `subscription.canceled`
   - `subscription.past_due`
   - `transaction.payment_succeeded`
4. Copy the webhook secret and add to `.env.local`

## 🧪 Step 6: Test Integration

### Test Mode
1. Use Paddle's sandbox/test mode
2. Use test API keys and client tokens
3. Test checkout flow end-to-end
4. Verify webhook events are received

### Test Cards
Paddle provides test card numbers:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

## 🚀 Step 7: Go Live

1. Switch to live mode in Paddle dashboard
2. Update environment variables with live credentials
3. Update webhook URL to production domain
4. Test with real payment (small amount)
5. Monitor webhook events

## 📝 API Routes Created

1. **POST /api/paddle/checkout** - Creates checkout session
2. **POST /api/paddle/webhook** - Handles Paddle webhooks

## 🎨 Pages Created

1. **/checkout** - Checkout page (redirects to Paddle)
2. **/checkout/success** - Success page after payment
3. **/subscription** - Subscription management page

## 🔍 Verification Checklist

- [ ] Paddle account created and verified
- [ ] API keys generated
- [ ] Products created in Paddle
- [ ] Price IDs copied to env vars
- [ ] Database tables created
- [ ] RLS policies set up
- [ ] Webhook endpoint configured
- [ ] Webhook secret added to env
- [ ] Test checkout successful
- [ ] Webhook events received
- [ ] Subscription saved to database
- [ ] Payment recorded

## 🐛 Troubleshooting

### Checkout Not Working
- Verify `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` is set
- Check browser console for errors
- Ensure user is authenticated

### Webhooks Not Received
- Check webhook URL is correct
- Verify webhook secret matches
- Check server logs for errors
- Ensure endpoint is publicly accessible

### Subscription Not Updating
- Check webhook events are being received
- Verify database connection
- Check RLS policies allow updates
- Review webhook handler logs

## 📚 Resources

- [Paddle Documentation](https://developer.paddle.com/)
- [Paddle API Reference](https://developer.paddle.com/api-reference/overview)
- [Paddle Webhooks Guide](https://developer.paddle.com/concepts/webhooks)
- [Paddle Checkout Integration](https://developer.paddle.com/concepts/sell/self-serve-checkout)

---

**Note**: Keep your API keys and webhook secrets secure. Never commit them to version control.

