# 🚀 Quick Start Guide

Your AI-powered resume builder is ready! Follow these steps to get it fully functional.

## ⚡ Current Status

✅ **Application Structure**: Complete  
✅ **UI Components**: Complete  
✅ **Authentication System**: Complete  
✅ **AI Integration**: Complete  
✅ **PDF Generation**: Complete  
⚠️ **Configuration**: Needs setup  

## 🔧 Step 1: Create Environment File

Create a `.env.local` file in your project root:

```bash
touch .env.local
```

Add these variables (you'll get the values in the next steps):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Google OAuth (Optional for now)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

## 🗄️ Step 2: Set Up Supabase (5 minutes)

### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `resume-builder`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 2.2 Get Your Credentials
1. Go to **Settings** → **API**
2. Copy these values to your `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### 2.3 Set Up Database Schema
1. Go to **SQL Editor** in Supabase
2. Click "New Query"
3. Paste and run this SQL:

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

## 🤖 Step 3: Set Up Gemini AI (2 minutes)

### 3.1 Get Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click "Get API Key"
3. Click "Create API Key"
4. Copy the API key to your `.env.local` as `GEMINI_API_KEY`

## 🔐 Step 4: Set Up Google OAuth (Optional - 10 minutes)

### 4.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "New Project"
3. Enter project name: `resume-builder-oauth`
4. Click "Create"

### 4.2 Enable Google+ API
1. Go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and press "Enable"

### 4.3 Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback`
   - `https://your-project.supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret to `.env.local`

### 4.4 Configure Supabase
1. Go back to Supabase → **Authentication** → **Providers**
2. Enable **Google** provider
3. Add your Google Client ID and Client Secret
4. Set redirect URL to: `https://your-project.supabase.co/auth/v1/callback`

## 🎯 Step 5: Test Your Setup

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Visit** `http://localhost:3000`

3. **Test the flow**:
   - Click "Get Started" → should redirect to sign-up
   - Create an account with email/password
   - Go to `/generate` page
   - Paste a job description and generate a resume
   - Download the PDF

## 🎉 You're Done!

Your AI resume builder is now fully functional! Users can:
- ✅ Sign up with email/password or Google
- ✅ Generate AI-powered resumes from job descriptions
- ✅ Download professional PDF resumes
- ✅ Manage their resumes in the dashboard

## 🚀 Next Steps (Optional)

- **Deploy to Vercel**: Connect your GitHub repo to Vercel
- **Add Paddle payments**: Implement subscription billing
- **Custom templates**: Add more resume design options
- **Advanced features**: Bulk generation, resume analytics

## 🆘 Troubleshooting

**"Supabase not configured" errors?**
- Check your `.env.local` file has all required variables
- Restart the development server after adding environment variables

**Authentication not working?**
- Verify Supabase URL and keys are correct
- Check Google OAuth redirect URIs match exactly

**AI generation failing?**
- Verify Gemini API key is valid
- Check you have API quota remaining

**Need help?** Check the detailed `SETUP.md` file for more information.
