import { NextRequest, NextResponse } from 'next/server';
import { generateResumeFromJobDescription } from '@/lib/gemini';
import { createClient } from '@/lib/supabase-server';
import { getUserUsage } from '@/lib/usage-tracker-server';
import { getUserTier } from '@/lib/subscription-server';
import { checkUsageLimit } from '@/lib/subscription';
import { logInfo, logError, logPerformance, trackAPICall } from '@/lib/monitoring';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    logInfo('Resume generation request', {
      userId: user?.id,
      email: user?.email,
    }, user?.id);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check usage limits
    try {
      const usage = await getUserUsage(user.id);
      const tier = await getUserTier(user.id);
      const limitCheck = checkUsageLimit(tier, usage.resumesThisMonth, 'month', user.email || undefined);
      
      if (!limitCheck.allowed) {
        return NextResponse.json(
          { 
            error: 'Monthly limit reached',
            limit: limitCheck.limit,
            current: usage.resumesThisMonth,
            upgradeRequired: true
          },
          { status: 403 }
        );
      }
    } catch (usageError) {
      console.error('Error checking usage:', usageError);
      // Continue with generation if usage check fails (don't block user)
    }

    const body = await request.json();
    let { jobDescription, resumeText, userExperience, skills, education, targetRole } = body;

    // Clean up empty strings - convert to undefined
    jobDescription = jobDescription?.trim() || undefined;
    resumeText = resumeText?.trim() || undefined;
    userExperience = userExperience?.trim() || undefined;
    education = education?.trim() || undefined;
    targetRole = targetRole?.trim() || undefined;

    // Validate input
    if (!jobDescription && !resumeText) {
      return NextResponse.json(
        { error: 'Either job description or resume text must be provided' },
        { status: 400 }
      );
    }

    if (jobDescription && jobDescription.length < 100) {
      return NextResponse.json(
        { error: 'Job description must be at least 100 characters' },
        { status: 400 }
      );
    }

    if (resumeText && resumeText.length < 50) {
      return NextResponse.json(
        { error: 'Resume text must be at least 50 characters' },
        { status: 400 }
      );
    }

    // Generate resume using Gemini AI
    let generatedResume;
    try {
      generatedResume = await generateResumeFromJobDescription({
        jobDescription,
        resumeText,
        userExperience: userExperience || undefined,
        skills: skills ? (Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(',').map((s: string) => s.trim()) : [])) : undefined,
        education: education || undefined,
        targetRole: targetRole || undefined,
      });
    } catch (aiError: any) {
      console.error('AI generation error:', aiError);
      return NextResponse.json(
        { 
          error: aiError.message || 'Failed to generate resume with AI',
          details: process.env.NODE_ENV === 'development' ? aiError?.stack : undefined
        },
        { status: 500 }
      );
    }

    // Save the generated resume to database
    try {
      const { error: dbError } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          job_description: jobDescription || resumeText || '',
          generated_resume: generatedResume,
          created_at: new Date().toISOString(),
        });

      if (dbError) {
        console.error('Database error:', dbError);
        // Continue even if database save fails - resume generation succeeded
      }
    } catch (dbError) {
      console.error('Database save error:', dbError);
      // Continue even if database save fails - resume generation succeeded
    }

        const duration = Date.now() - startTime;
        logPerformance('resume_generation', duration, {
          userId: user?.id,
          hasJobDescription: !!jobDescription,
          hasResumeText: !!resumeText,
        });
        
        trackAPICall('/api/generate-resume', 'POST', duration, 200);
        
        return NextResponse.json(generatedResume);
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('Error generating resume:', error);
    
    logError('Resume generation failed', error, {
      duration,
    });
    
    trackAPICall('/api/generate-resume', 'POST', duration, 500);
    
    // Return more detailed error messages
    const errorMessage = error?.message || 'Failed to generate resume';
    const statusCode = error?.message?.includes('Unauthorized') ? 401 : 
                      error?.message?.includes('must be') ? 400 : 500;
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: statusCode }
    );
  }
}
