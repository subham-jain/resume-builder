import { NextRequest, NextResponse } from 'next/server';
import { generateResumeFromJobDescription } from '@/lib/gemini';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { jobDescription, userExperience, skills, education, targetRole } = body;

    if (!jobDescription || jobDescription.length < 100) {
      return NextResponse.json(
        { error: 'Job description must be at least 100 characters' },
        { status: 400 }
      );
    }

    // Generate resume using Gemini AI
    const generatedResume = await generateResumeFromJobDescription({
      jobDescription,
      userExperience,
      skills,
      education,
      targetRole,
    });

    // Save the generated resume to database
    const { error: dbError } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        job_description: jobDescription,
        generated_resume: generatedResume,
        created_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue even if database save fails
    }

    return NextResponse.json(generatedResume);
  } catch (error) {
    console.error('Error generating resume:', error);
    return NextResponse.json(
      { error: 'Failed to generate resume' },
      { status: 500 }
    );
  }
}
