import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  try {
    if (code) {
      const supabase = await createClient();
      
      // Check if supabase is properly configured
      if (supabase.auth && typeof supabase.auth.exchangeCodeForSession === 'function') {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (!error) {
          return NextResponse.redirect(`${origin}${next}`);
        }
      } else {
        // If supabase is not configured, redirect to sign-in with a message
        return NextResponse.redirect(`${origin}/auth/signin?error=supabase_not_configured`);
      }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(`${origin}/auth/signin?error=callback_error`);
  }
}
