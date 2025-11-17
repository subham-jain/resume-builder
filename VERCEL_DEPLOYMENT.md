# 🚀 Vercel Deployment Guide

Complete guide for deploying the Resume Builder application to Vercel.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Supabase Project**: Production Supabase project set up
4. **Environment Variables**: All required keys ready

## 🔧 Step 1: Prepare Your Repository

### 1.1 Push to GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 1.2 Verify Build Locally

```bash
npm run build
```

Ensure the build completes without errors.

## 🌐 Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Sign in with GitHub

2. **Import Project**
   - Click "Import Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add all variables from the list below

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live!

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Follow Prompts**
   - Link to existing project or create new
   - Confirm settings
   - Deploy

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## 🔐 Step 3: Environment Variables

Add these environment variables in Vercel Dashboard → Settings → Environment Variables:

### Required Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash

# Paddle (if using payments)
PADDLE_API_KEY=your-paddle-api-key
PADDLE_ENVIRONMENT=sandbox
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your-paddle-client-token
PADDLE_WEBHOOK_SECRET=your-webhook-secret
```

### Optional Variables

```env
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Dynatrace (Monitoring)
NEXT_PUBLIC_DYNATRACE_ENVIRONMENT_ID=your-env-id
NEXT_PUBLIC_DYNATRACE_API_TOKEN=your-api-token
DYNATRACE_ENVIRONMENT_ID=your-env-id
DYNATRACE_API_TOKEN=your-api-token

# Elasticsearch/Kibana (Monitoring)
ELASTICSEARCH_URL=https://your-cluster.es.cloud.es.io:9243
ELASTICSEARCH_API_KEY=your-api-key
ELASTICSEARCH_INDEX=resume-builder-logs
```

### Environment-Specific Variables

Set variables for different environments:
- **Production**: All variables
- **Preview**: Same as production (or test values)
- **Development**: Local `.env.local` file

## 🗄️ Step 4: Database Setup

### 4.1 Supabase Production Database

1. **Create Production Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note down URL and keys

2. **Run Migrations**
   - Use Supabase SQL Editor or migrations
   - Ensure all tables are created:
     - `resumes`
     - `subscriptions`
     - `usage_tracking`

3. **Update RLS Policies**
   - Configure Row Level Security
   - Test policies in production

### 4.2 Database Schema

Ensure these tables exist:

```sql
-- Resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  job_description TEXT,
  generated_resume JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  tier TEXT DEFAULT 'free',
  paddle_subscription_id TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Usage tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  month INTEGER,
  year INTEGER,
  resume_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);
```

## 🔄 Step 5: Configure Domains

### 5.1 Custom Domain

1. **Add Domain in Vercel**
   - Go to Project Settings → Domains
   - Add your domain
   - Follow DNS configuration instructions

2. **Update Supabase Auth URLs**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your production URL to:
     - Site URL
     - Redirect URLs

### 5.2 Update Environment Variables

Update Supabase redirect URLs:
- Production: `https://yourdomain.com/auth/callback`
- Development: `http://localhost:3000/auth/callback`

## 🧪 Step 6: Test Deployment

### 6.1 Verify Build

1. Check build logs in Vercel dashboard
2. Ensure no build errors
3. Verify all environment variables are set

### 6.2 Test Functionality

1. **Authentication**
   - Sign up
   - Sign in
   - Sign out

2. **Resume Generation**
   - Generate resume
   - Download PDF
   - Upload resume file

3. **API Endpoints**
   - Test `/api/generate-resume`
   - Test `/api/download-resume`
   - Test `/api/upload-resume`

### 6.3 Check Logs

- Vercel Dashboard → Logs
- Monitor for errors
- Check function execution times

## ⚙️ Step 7: Optimize Performance

### 7.1 Build Optimizations

The `next.config.ts` is already optimized, but verify:

```typescript
// Ensure these are set
reactStrictMode: true
swcMinify: true
```

### 7.2 Function Timeouts

API routes have 30s timeout (configured in `vercel.json`):
- Resume generation: May take 10-20s
- PDF generation: Usually < 5s
- File upload: Usually < 5s

### 7.3 Edge Functions (Optional)

For faster response times, consider Edge Functions:
- Move static API routes to Edge
- Use Edge Runtime for simple endpoints

## 🔍 Step 8: Monitoring

### 8.1 Vercel Analytics

1. Enable Vercel Analytics in dashboard
2. Monitor:
   - Page views
   - Performance metrics
   - Error rates

### 8.2 External Monitoring

- **Google Analytics**: Already configured
- **Dynatrace**: Add keys to see monitoring
- **Kibana**: Add Elasticsearch URL for logs

## 🚨 Step 9: Troubleshooting

### Common Issues

#### Build Fails

**Error**: Module not found
- **Solution**: Check `package.json` dependencies
- Ensure all packages are listed

**Error**: Environment variable missing
- **Solution**: Add all required variables in Vercel

#### Runtime Errors

**Error**: Supabase connection failed
- **Solution**: Check `NEXT_PUBLIC_SUPABASE_URL` and keys
- Verify Supabase project is active

**Error**: API timeout
- **Solution**: Increase timeout in `vercel.json`
- Optimize API route code

#### Authentication Issues

**Error**: Redirect URL mismatch
- **Solution**: Update Supabase redirect URLs
- Match exact production URL

### Debug Steps

1. **Check Logs**
   ```bash
   vercel logs [deployment-url]
   ```

2. **Test Locally**
   ```bash
   vercel dev
   ```

3. **Inspect Build**
   - Check build logs in Vercel dashboard
   - Look for warnings/errors

## 📊 Step 10: Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database tables created
- [ ] RLS policies set up
- [ ] Custom domain configured (if applicable)
- [ ] Supabase redirect URLs updated
- [ ] Authentication tested
- [ ] Resume generation tested
- [ ] PDF download tested
- [ ] File upload tested
- [ ] Monitoring configured
- [ ] Error tracking set up
- [ ] Performance optimized

## 🔄 Continuous Deployment

### Automatic Deployments

Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

### Manual Deployments

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## 📝 Environment Variables Reference

### Production Only

These should only be set in production:

```env
NODE_ENV=production
```

### All Environments

Set these in all environments:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GEMINI_API_KEY=...
```

## 🎯 Best Practices

1. **Never commit `.env.local`**
   - Already in `.gitignore`
   - Use Vercel environment variables

2. **Use Preview Deployments**
   - Test changes before production
   - Share preview URLs with team

3. **Monitor Performance**
   - Check Vercel Analytics
   - Monitor API response times
   - Set up alerts

4. **Regular Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Update Next.js regularly

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Production Guide](https://supabase.com/docs/guides/platform/going-to-prod)

---

**Need Help?**
- Check Vercel logs
- Review build output
- Test locally with `vercel dev`
- Contact support if needed

