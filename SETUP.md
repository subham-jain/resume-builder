# Resume Builder Setup Guide

This guide will help you set up the AI-powered resume builder application with Supabase authentication, Gemini AI integration, and PDF generation.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account
- Google Cloud account (for Gemini AI)
- Google OAuth credentials

## 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Paddle (Optional - for payments)
PADDLE_VENDOR_ID=your_paddle_vendor_id_here
PADDLE_API_KEY=your_paddle_api_key_here
PADDLE_CLIENT_SIDE_TOKEN=your_paddle_client_side_token_here

# App Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

## 2. Supabase Setup

### Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Copy your project URL and anon key from the project settings
3. Go to Authentication > Providers and enable Google OAuth
4. Add your Google OAuth credentials

### Database Schema

Run the following SQL in your Supabase SQL editor:

```sql
-- Create resumes table
CREATE TABLE resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_description TEXT NOT NULL,
  generated_resume JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user profiles table
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own resumes" ON resumes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resumes" ON resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes" ON resumes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes" ON resumes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

## 3. Google OAuth Setup

### Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Set authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)

### Configure Supabase Google Provider

1. In Supabase dashboard, go to Authentication > Providers
2. Enable Google provider
3. Add your Google Client ID and Client Secret
4. Set redirect URL to: `https://your-project.supabase.co/auth/v1/callback`

## 4. Gemini AI Setup

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create an API key
3. Add the API key to your environment variables

## 5. Installation and Running

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## 6. Features Overview

### Authentication
- Email/password signup and signin
- Google OAuth integration
- Protected routes with middleware
- User session management

### AI Resume Generation
- Paste job description
- Optional user experience/skills input
- Gemini AI generates tailored resume
- ATS-optimized formatting

### PDF Generation
- Download resume as PDF
- Professional formatting
- Customizable templates

### Dashboard
- View generated resumes
- Download PDFs
- Resume management
- User statistics

## 7. API Endpoints

- `POST /api/generate-resume` - Generate resume using AI
- `POST /api/download-resume` - Download resume as PDF
- `GET /auth/callback` - OAuth callback handler

## 8. Next Steps

### Payment Integration (Paddle)
1. Set up Paddle account
2. Add Paddle credentials to environment variables
3. Implement subscription/payment logic
4. Add usage limits for free users

### Additional Features
- Resume templates selection
- Resume customization interface
- Bulk resume generation
- Resume analytics
- Export to multiple formats

## 9. Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

### Environment Variables for Production
Make sure to update your environment variables for production:
- Update Supabase URLs
- Update OAuth redirect URIs
- Update NEXTAUTH_URL to your production domain

## Troubleshooting

### Common Issues

1. **Authentication not working**: Check Supabase configuration and OAuth settings
2. **AI generation failing**: Verify Gemini API key and quota
3. **PDF generation issues**: Check jsPDF installation and browser compatibility
4. **Database errors**: Verify Supabase connection and RLS policies

### Support

For issues and questions, please check the documentation or create an issue in the repository.
