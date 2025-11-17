# ✅ Vercel Deployment Checklist

Quick checklist for deploying to Vercel.

## Pre-Deployment

- [ ] Code pushed to GitHub
- [ ] Local build succeeds (`npm run build`)
- [ ] All tests pass (if any)
- [ ] Environment variables documented

## Vercel Setup

- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Project imported in Vercel
- [ ] Framework auto-detected (Next.js)

## Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

### Required
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `GEMINI_API_KEY`
- [ ] `GEMINI_MODEL` (optional, defaults to gemini-2.0-flash)

### Payments (if using)
- [ ] `PADDLE_API_KEY`
- [ ] `PADDLE_ENVIRONMENT`
- [ ] `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`
- [ ] `PADDLE_WEBHOOK_SECRET`

### Monitoring (optional)
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- [ ] `NEXT_PUBLIC_DYNATRACE_ENVIRONMENT_ID`
- [ ] `ELASTICSEARCH_URL`

## Database Setup

- [ ] Supabase production project created
- [ ] Database tables created:
  - [ ] `resumes`
  - [ ] `subscriptions`
  - [ ] `usage_tracking`
- [ ] RLS policies configured
- [ ] Supabase redirect URLs updated:
  - [ ] Production URL added
  - [ ] Callback URL configured

## Deployment

- [ ] Initial deployment triggered
- [ ] Build completed successfully
- [ ] No build errors in logs
- [ ] Deployment URL accessible

## Post-Deployment Testing

### Authentication
- [ ] Sign up works
- [ ] Sign in works
- [ ] Sign out works
- [ ] Email verification works (if enabled)

### Core Features
- [ ] Resume generation works
- [ ] PDF download works
- [ ] File upload works
- [ ] Template switching works
- [ ] Resume editing works

### API Endpoints
- [ ] `/api/generate-resume` responds
- [ ] `/api/download-resume` responds
- [ ] `/api/upload-resume` responds

### Admin Features
- [ ] Admin dashboard accessible (`/admin`)
- [ ] Analytics page accessible (`/admin/analytics`)
- [ ] Only admin email can access

## Domain Configuration (if applicable)

- [ ] Custom domain added in Vercel
- [ ] DNS records configured
- [ ] SSL certificate active
- [ ] Domain verified

## Monitoring

- [ ] Vercel Analytics enabled
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Logs accessible

## Final Checks

- [ ] All pages load correctly
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Performance acceptable
- [ ] SEO meta tags present

## Quick Deploy Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Troubleshooting

If deployment fails:
1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Test build locally: `npm run build`
4. Check for TypeScript errors
5. Verify all dependencies are in `package.json`

---

**Ready to deploy?** Follow the steps in `VERCEL_DEPLOYMENT.md` for detailed instructions.

