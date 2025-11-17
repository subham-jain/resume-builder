import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface ResumeGenerationRequest {
  jobDescription?: string;
  resumeText?: string;
  userExperience?: string;
  skills?: string[];
  education?: string;
  targetRole?: string;
}

export interface GeneratedResume {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
  };
  summary: string;
  workExperience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
    achievements: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    graduationDate: string;
  }>;
  skills: string[];
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
}

export async function generateResumeFromJobDescription(
  request: ResumeGenerationRequest
): Promise<GeneratedResume> {
  // Use a valid Gemini model name - try gemini-2.0-flash first, then fallback to gemini-pro
  // Available models: gemini-2.0-flash, gemini-1.5-pro, gemini-pro
  const preferredModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const fallbackModels = ['gemini-pro', 'gemini-1.5-pro'];
  const modelsToTry = [preferredModel, ...fallbackModels];
  
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  // Determine the input type and create appropriate prompt
  const hasResumeText = request.resumeText && request.resumeText.trim().length > 0;
  const hasJobDescription = request.jobDescription && request.jobDescription.trim().length > 0;

  let prompt = '';
  
  if (hasResumeText) {
    // If user provided resume text, enhance and structure it
    prompt = `
You are a professional resume writer and career coach. The user has provided their existing resume text in unstructured format. Your task is to:
1. Carefully parse and extract ALL information from the provided resume text
2. Identify personal information (name, email, phone, location, LinkedIn, GitHub)
3. Extract work experience (company names, positions, durations, descriptions, achievements)
4. Extract education details (institutions, degrees, fields of study, graduation dates)
5. Extract skills (both technical and soft skills)
6. Extract projects (names, descriptions, technologies used)
7. Create a professional summary based on the extracted information
8. Structure everything into a well-organized, ATS-optimized JSON format
9. Preserve ALL original information - do not invent or add fake details
10. If dates are unclear, use reasonable estimates based on context

Resume Text Provided:
${request.resumeText}

Additional Context (if provided):
${request.userExperience ? `User Experience: ${request.userExperience}` : ''}
${request.skills ? `Skills: ${request.skills.join(', ')}` : ''}
${request.education ? `Education: ${request.education}` : ''}
${request.targetRole ? `Target Role: ${request.targetRole}` : ''}
${request.jobDescription ? `Job Description (for optimization): ${request.jobDescription}` : ''}

IMPORTANT: Extract information directly from the resume text. Do not make up information. If information is missing, use empty strings or reasonable placeholders.

Please generate a complete, structured resume in the following JSON format:
`;
  } else if (hasJobDescription) {
    // Original job description based generation
    prompt = `
You are a professional resume writer and career coach. Based on the provided job description and user information, create a compelling, ATS-optimized resume.

Job Description:
${request.jobDescription}

User Experience (if provided):
${request.userExperience || 'Not provided'}

User Skills (if provided):
${request.skills?.join(', ') || 'Not provided'}

User Education (if provided):
${request.education || 'Not provided'}

Target Role (if specified):
${request.targetRole || 'Infer from job description'}

Please generate a complete resume in the following JSON format:
`;
  } else {
    throw new Error('Either job description or resume text must be provided');
  }

  prompt += `

{
  "personalInfo": {
    "name": "John Doe",
    "email": "john.doe@email.com",
    "phone": "+1 (555) 123-4567",
    "location": "City, State",
    "linkedin": "linkedin.com/in/johndoe",
    "github": "github.com/johndoe"
  },
  "summary": "Professional summary highlighting relevant experience and skills (2-3 sentences)",
  "workExperience": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "duration": "Start Date - End Date",
      "description": "Brief description of role and responsibilities",
      "achievements": ["Achievement 1", "Achievement 2", "Achievement 3"]
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Degree Type",
      "fieldOfStudy": "Field of Study",
      "graduationDate": "Year"
    }
  ],
  "skills": ["Skill 1", "Skill 2", "Skill 3"],
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief project description",
      "technologies": ["Tech 1", "Tech 2"]
    }
  ]
}

Guidelines:
1. Make the resume highly relevant to the job description
2. Use keywords from the job posting
3. Quantify achievements where possible
4. Ensure ATS compatibility
5. Keep descriptions concise but impactful
6. If user information is not provided, create realistic placeholder information that matches the job requirements
7. Focus on transferable skills and relevant experience
8. Use action verbs and industry-specific terminology

CRITICAL: You must return ONLY valid JSON. Do not include any markdown formatting, code blocks, or explanatory text. Return the JSON object directly starting with { and ending with }.
`;

  // Try each model until one works
  let lastError: any = null;
  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      console.log(`Attempting to generate resume with model: ${modelName}`);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response text to extract JSON
      // Try to find JSON object, handling markdown code blocks
      let jsonMatch = text.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (!jsonMatch) {
        jsonMatch = text.match(/```\s*(\{[\s\S]*?\})\s*```/);
      }
      if (!jsonMatch) {
        jsonMatch = text.match(/\{[\s\S]*\}/);
      }
      
      if (!jsonMatch) {
        console.error('Failed to extract JSON. Response text:', text.substring(0, 500));
        throw new Error(`Failed to parse JSON from Gemini response. Response: ${text.substring(0, 200)}`);
      }
      
      const jsonText = jsonMatch[1] || jsonMatch[0];
      const resumeData = JSON.parse(jsonText);
      
      // Validate the structure
      if (!resumeData.personalInfo || !resumeData.summary) {
        throw new Error('Invalid resume structure returned from AI');
      }
      
      console.log(`Successfully generated resume using model: ${modelName}`);
      return resumeData;
    } catch (error: any) {
      console.warn(`Model ${modelName} failed:`, error.message);
      lastError = error;
      
      // If it's not a model error, don't try other models
      if (!error.message?.includes('model') && !error.message?.includes('404') && !error.message?.includes('not found')) {
        // This is a different error (API key, parsing, etc.), throw it immediately
        throw error;
      }
      
      // Continue to next model
      continue;
    }
  }
  
  // If we get here, all models failed
  console.error('All models failed. Last error:', lastError);
  
  // Provide more detailed error messages
  if (lastError?.message?.includes('API_KEY') || lastError?.message?.includes('401')) {
    throw new Error('Gemini API key is invalid or not configured');
  }
  if (lastError?.message?.includes('model') || lastError?.message?.includes('404')) {
    throw new Error(`Invalid Gemini model. Tried: ${modelsToTry.join(', ')}. Please check GEMINI_MODEL environment variable or use a valid model name.`);
  }
  if (lastError instanceof SyntaxError) {
    throw new Error(`Failed to parse JSON response: ${lastError.message}`);
  }
  
  throw new Error(lastError?.message || `Failed to generate resume with any model. Tried: ${modelsToTry.join(', ')}`);
}
