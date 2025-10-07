import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface ResumeGenerationRequest {
  jobDescription: string;
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
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
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

Return only the JSON object, no additional text or formatting.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response text to extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON from Gemini response');
    }
    
    const resumeData = JSON.parse(jsonMatch[0]);
    return resumeData;
  } catch (error) {
    console.error('Error generating resume:', error);
    throw new Error('Failed to generate resume. Please try again.');
  }
}
