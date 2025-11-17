# 📊 Google Analytics Setup Guide

This guide will help you set up Google Analytics for the Resume Builder application.

## 🔧 Step 1: Create Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Click "Start measuring" or "Admin" → "Create Account"
4. Fill in account details:
   - Account name: Resume Builder
   - Property name: Resume Builder Production
   - Time zone: Your timezone
   - Currency: USD (or your preferred)

## 🔑 Step 2: Get Measurement ID

1. After creating the property, go to **Admin** → **Data Streams**
2. Click **Add stream** → **Web**
3. Enter your website URL (e.g., `https://yourdomain.com`)
4. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

## 🔐 Step 3: Add Environment Variable

Add the Measurement ID to your `.env.local` file:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Important**: 
- The `NEXT_PUBLIC_` prefix is required for client-side access
- Restart your dev server after adding the variable

## ✅ Step 4: Verify Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to your site
3. Open Google Analytics → **Reports** → **Realtime**
4. You should see your visit appear within a few seconds

## 📈 What's Being Tracked

### Automatic Tracking
- **Page Views**: All page navigations
- **User Sessions**: Automatic session tracking

### Custom Events
- **Resume Generation**: Tracked when a resume is generated
  - Category: Resume
  - Action: resume_generated
  - Label: `{tier}_{template}` (e.g., `free_classic`)

- **Resume Download**: Tracked when PDF is downloaded
  - Category: Resume
  - Action: resume_downloaded
  - Label: `{template}` (e.g., `classic`)

- **Subscription Upgrade**: Tracked when user upgrades
  - Category: Subscription
  - Action: subscription_upgraded
  - Label: `{tier}` (e.g., `pro`)

- **User Signup**: Tracked when user signs up
  - Category: User
  - Action: sign_up
  - Label: `{method}` (e.g., `email`)

- **User Login**: Tracked when user logs in
  - Category: User
  - Action: login
  - Label: `{method}` (e.g., `email`)

## 🎯 Admin Dashboard

The admin dashboard (`/admin`) provides:
- Total users count
- Total resumes generated
- Active users (last 7 days)
- Resumes generated today/week/month
- Usage by subscription tier
- Most used templates

**Access**: Only `jainsubham3111@gmail.com` can access the admin dashboard.

## 🔍 Viewing Analytics

### Google Analytics Dashboard
1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property
3. View reports:
   - **Realtime**: See current activity
   - **Engagement**: Page views, events
   - **Monetization**: Subscription events
   - **User**: User demographics and behavior

### Admin Dashboard
1. Sign in as admin (`jainsubham3111@gmail.com`)
2. Navigate to `/admin`
3. View platform analytics:
   - User statistics
   - Resume generation metrics
   - Subscription tier distribution
   - Template usage

## 🛠️ Custom Events

You can add custom event tracking anywhere in your code:

```typescript
import { trackEvent } from '@/lib/analytics';

// Track a custom event
trackEvent('button_clicked', 'UI', 'header_cta', 1);
```

## 📊 Key Metrics to Monitor

1. **User Acquisition**
   - New users vs returning users
   - Signup conversion rate
   - Traffic sources

2. **Engagement**
   - Resumes generated per user
   - Average session duration
   - Pages per session

3. **Conversion**
   - Free to paid conversion rate
   - Subscription upgrades
   - Download completion rate

4. **Retention**
   - Daily/weekly/monthly active users
   - User retention rate
   - Churn rate

## 🔒 Privacy & Compliance

- Google Analytics respects user privacy settings
- No personally identifiable information (PII) is tracked
- Complies with GDPR and CCPA requirements
- Users can opt-out via browser settings

## 🐛 Troubleshooting

### Analytics Not Working?

1. **Check Environment Variable**:
   ```bash
   echo $NEXT_PUBLIC_GA_MEASUREMENT_ID
   ```
   Should output your Measurement ID

2. **Check Browser Console**:
   - Open DevTools → Console
   - Look for Google Analytics errors
   - Check Network tab for GA requests

3. **Verify Measurement ID**:
   - Ensure it starts with `G-`
   - Check it's correct in `.env.local`
   - Restart dev server after changes

4. **Check Ad Blockers**:
   - Disable ad blockers temporarily
   - Test in incognito mode

### Events Not Showing?

1. **Check Event Names**:
   - Use consistent naming
   - Check spelling and case sensitivity

2. **Wait for Processing**:
   - Events may take 24-48 hours in standard reports
   - Use Realtime reports for immediate verification

3. **Check Filters**:
   - Ensure no filters are excluding your events
   - Check view settings in GA

## 📚 Resources

- [Google Analytics Documentation](https://developers.google.com/analytics)
- [Next.js Analytics Guide](https://nextjs.org/docs/app/building-your-application/optimizing/third-party-libraries#google-analytics)
- [GA4 Event Tracking](https://developers.google.com/analytics/devguides/collection/ga4/events)

---

**Note**: Analytics data is processed by Google and may take 24-48 hours to appear in standard reports. Use Realtime reports for immediate verification.

