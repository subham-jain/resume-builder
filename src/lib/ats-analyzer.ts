import { GeneratedResume } from './gemini';

export interface ATSMetrics {
  overallScore: number;
  categories: {
    keywordOptimization: {
      score: number;
      maxScore: number;
      details: string[];
      suggestions: string[];
    };
    formatting: {
      score: number;
      maxScore: number;
      details: string[];
      suggestions: string[];
    };
    structure: {
      score: number;
      maxScore: number;
      details: string[];
      suggestions: string[];
    };
    contentQuality: {
      score: number;
      maxScore: number;
      details: string[];
      suggestions: string[];
    };
    contactInfo: {
      score: number;
      maxScore: number;
      details: string[];
      suggestions: string[];
    };
  };
}

export interface ATSCategoryInfo {
  id: string;
  name: string;
  description: string;
  importance: 'High' | 'Medium' | 'Low';
  tips: string[];
}

export const ATS_CATEGORIES: ATSCategoryInfo[] = [
  {
    id: 'keywordOptimization',
    name: 'Keyword Optimization',
    description: 'Matches between your resume and job description keywords. ATS systems scan for specific terms related to skills, technologies, and qualifications.',
    importance: 'High',
    tips: [
      'Include exact keywords from the job description',
      'Use industry-standard terminology',
      'Include both acronyms and full forms (e.g., "API" and "Application Programming Interface")',
      'Match the language used in the job posting',
    ],
  },
  {
    id: 'formatting',
    name: 'Formatting & Parsing',
    description: 'How well the ATS can parse and extract information from your resume. Complex formatting, tables, images, or unusual fonts can cause parsing errors.',
    importance: 'High',
    tips: [
      'Use simple, clean formatting',
      'Avoid tables, images, and graphics',
      'Use standard fonts (Arial, Calibri, Times New Roman)',
      'Save as PDF or Word document',
      'Avoid headers and footers',
    ],
  },
  {
    id: 'structure',
    name: 'Structure & Organization',
    description: 'Logical organization of sections and information. ATS systems expect standard resume sections in a predictable order.',
    importance: 'High',
    tips: [
      'Use clear section headings (Experience, Education, Skills)',
      'Maintain consistent formatting throughout',
      'Use reverse chronological order for experience',
      'Include dates in a consistent format',
      'Keep sections well-organized and easy to scan',
    ],
  },
  {
    id: 'contentQuality',
    name: 'Content Quality',
    description: 'Relevance and quality of content. Includes proper use of action verbs, quantifiable achievements, and relevant experience.',
    importance: 'Medium',
    tips: [
      'Use action verbs (led, developed, implemented)',
      'Quantify achievements with numbers and percentages',
      'Keep descriptions concise and impactful',
      'Focus on relevant experience',
      'Highlight transferable skills',
    ],
  },
  {
    id: 'contactInfo',
    name: 'Contact Information',
    description: 'Completeness and accuracy of contact details. Missing or incorrect information can prevent employers from reaching you.',
    importance: 'Medium',
    tips: [
      'Include full name, email, and phone number',
      'Add LinkedIn profile URL',
      'Include location (city, state)',
      'Ensure all contact information is current',
      'Use a professional email address',
    ],
  },
];

export function analyzeATS(resume: GeneratedResume, jobDescription?: string): ATSMetrics {
  const categories = {
    keywordOptimization: analyzeKeywords(resume, jobDescription),
    formatting: analyzeFormatting(resume),
    structure: analyzeStructure(resume),
    contentQuality: analyzeContentQuality(resume),
    contactInfo: analyzeContactInfo(resume),
  };

  const totalScore = Object.values(categories).reduce((sum, cat) => sum + cat.score, 0);
  const maxTotalScore = Object.values(categories).reduce((sum, cat) => sum + cat.maxScore, 0);
  const overallScore = Math.round((totalScore / maxTotalScore) * 100);

  return {
    overallScore,
    categories,
  };
}

function analyzeKeywords(resume: GeneratedResume, jobDescription?: string): ATSMetrics['categories']['keywordOptimization'] {
  const details: string[] = [];
  const suggestions: string[] = [];
  let score = 0;
  const maxScore = 25;

  // Extract keywords from resume
  const resumeText = JSON.stringify(resume).toLowerCase();
  const skills = resume.skills || [];
  const skillCount = skills.length;
  
  if (skillCount >= 10) {
    score += 10;
    details.push(`✓ Strong skill set with ${skillCount} skills listed`);
  } else if (skillCount >= 5) {
    score += 6;
    details.push(`✓ Good skill set with ${skillCount} skills listed`);
    suggestions.push('Consider adding more relevant technical skills');
  } else {
    score += 3;
    details.push(`⚠ Limited skills listed (${skillCount})`);
    suggestions.push('Add more relevant skills to improve keyword matching');
  }

  // Check for common technical keywords
  const commonKeywords = ['python', 'javascript', 'sql', 'api', 'database', 'cloud', 'agile', 'git'];
  const foundKeywords = commonKeywords.filter(kw => resumeText.includes(kw));
  if (foundKeywords.length >= 5) {
    score += 8;
    details.push(`✓ Contains ${foundKeywords.length} common technical keywords`);
  } else if (foundKeywords.length >= 3) {
    score += 5;
    details.push(`✓ Contains ${foundKeywords.length} common technical keywords`);
    suggestions.push('Include more industry-standard technical terms');
  } else {
    score += 2;
    suggestions.push('Add more technical keywords relevant to your field');
  }

  // Job description matching
  if (jobDescription) {
    const jobKeywords = extractKeywords(jobDescription);
    const matchedKeywords = jobKeywords.filter(kw => resumeText.includes(kw.toLowerCase()));
    const matchRatio = matchedKeywords.length / Math.max(jobKeywords.length, 1);
    
    if (matchRatio >= 0.6) {
      score += 7;
      details.push(`✓ Strong keyword match (${Math.round(matchRatio * 100)}% of job keywords found)`);
    } else if (matchRatio >= 0.4) {
      score += 4;
      details.push(`⚠ Moderate keyword match (${Math.round(matchRatio * 100)}% of job keywords found)`);
      suggestions.push('Add more keywords from the job description');
    } else {
      score += 1;
      details.push(`⚠ Low keyword match (${Math.round(matchRatio * 100)}% of job keywords found)`);
      suggestions.push('Significantly improve keyword matching with job description');
    }
  } else {
    score += 5; // Neutral score if no job description
    details.push('ℹ No job description provided for keyword matching');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    details,
    suggestions,
  };
}

function analyzeFormatting(resume: GeneratedResume): ATSMetrics['categories']['formatting'] {
  const details: string[] = [];
  const suggestions: string[] = [];
  let score = 20;
  const maxScore = 20;

  // Check for proper structure
  if (resume.personalInfo) {
    details.push('✓ Personal information properly structured');
  } else {
    score -= 5;
    suggestions.push('Ensure personal information is complete');
  }

  if (resume.summary && resume.summary.length > 50) {
    details.push('✓ Professional summary present');
  } else {
    score -= 3;
    suggestions.push('Add a professional summary (2-3 sentences)');
  }

  if (resume.workExperience && resume.workExperience.length > 0) {
    details.push(`✓ Work experience section with ${resume.workExperience.length} entries`);
  } else {
    score -= 5;
    suggestions.push('Add work experience section');
  }

  if (resume.education && resume.education.length > 0) {
    details.push(`✓ Education section with ${resume.education.length} entries`);
  } else {
    score -= 3;
    suggestions.push('Add education section');
  }

  if (resume.skills && resume.skills.length > 0) {
    details.push(`✓ Skills section with ${resume.skills.length} skills`);
  } else {
    score -= 4;
    suggestions.push('Add skills section');
  }

  return {
    score: Math.max(score, 0),
    maxScore,
    details,
    suggestions,
  };
}

function analyzeStructure(resume: GeneratedResume): ATSMetrics['categories']['structure'] {
  const details: string[] = [];
  const suggestions: string[] = [];
  let score = 0;
  const maxScore = 20;

  // Check section order and completeness
  const sections = [
    { name: 'Personal Info', present: !!resume.personalInfo, weight: 3 },
    { name: 'Summary', present: !!resume.summary, weight: 3 },
    { name: 'Work Experience', present: !!(resume.workExperience && resume.workExperience.length > 0), weight: 5 },
    { name: 'Education', present: !!(resume.education && resume.education.length > 0), weight: 3 },
    { name: 'Skills', present: !!(resume.skills && resume.skills.length > 0), weight: 3 },
    { name: 'Projects', present: !!(resume.projects && resume.projects.length > 0), weight: 3 },
  ];

  sections.forEach(section => {
    if (section.present) {
      score += section.weight;
      details.push(`✓ ${section.name} section present`);
    } else {
      suggestions.push(`Add ${section.name} section`);
    }
  });

  // Check experience formatting
  if (resume.workExperience && resume.workExperience.length > 0) {
    const hasDates = resume.workExperience.every(exp => exp.duration);
    if (hasDates) {
      score += 2;
      details.push('✓ All work experiences include dates');
    } else {
      suggestions.push('Ensure all work experiences include dates');
    }
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    details,
    suggestions,
  };
}

function analyzeContentQuality(resume: GeneratedResume): ATSMetrics['categories']['contentQuality'] {
  const details: string[] = [];
  const suggestions: string[] = [];
  let score = 0;
  const maxScore = 20;

  // Check summary quality
  if (resume.summary) {
    const summaryLength = resume.summary.length;
    if (summaryLength >= 100 && summaryLength <= 300) {
      score += 5;
      details.push('✓ Professional summary has appropriate length');
    } else {
      score += 2;
      suggestions.push('Optimize summary length (100-300 characters recommended)');
    }

    // Check for action verbs
    const actionVerbs = ['led', 'developed', 'implemented', 'managed', 'created', 'designed', 'improved', 'achieved'];
    const hasActionVerbs = actionVerbs.some(verb => resume.summary.toLowerCase().includes(verb));
    if (hasActionVerbs) {
      score += 2;
      details.push('✓ Summary uses action verbs');
    } else {
      suggestions.push('Use action verbs in summary (led, developed, implemented)');
    }
  }

  // Check work experience quality
  if (resume.workExperience && resume.workExperience.length > 0) {
    const hasAchievements = resume.workExperience.some(exp => 
      exp.achievements && exp.achievements.length > 0
    );
    if (hasAchievements) {
      score += 5;
      details.push('✓ Work experience includes achievements');
    } else {
      score += 2;
      suggestions.push('Add quantifiable achievements to work experience');
    }

    const hasDescriptions = resume.workExperience.every(exp => exp.description && exp.description.length > 20);
    if (hasDescriptions) {
      score += 3;
      details.push('✓ Work experiences have detailed descriptions');
    } else {
      suggestions.push('Add more detailed descriptions to work experiences');
    }
  }

  // Check for quantifiable metrics
  const resumeText = JSON.stringify(resume);
  const hasNumbers = /\d+/.test(resumeText);
  if (hasNumbers) {
    score += 5;
    details.push('✓ Resume includes quantifiable metrics');
  } else {
    suggestions.push('Add numbers and percentages to quantify achievements');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    details,
    suggestions,
  };
}

function analyzeContactInfo(resume: GeneratedResume): ATSMetrics['categories']['contactInfo'] {
  const details: string[] = [];
  const suggestions: string[] = [];
  let score = 0;
  const maxScore = 15;

  if (resume.personalInfo) {
    const { name, email, phone, location, linkedin, github } = resume.personalInfo;

    if (name && name.trim().length > 0) {
      score += 3;
      details.push('✓ Name provided');
    } else {
      suggestions.push('Add your full name');
    }

    if (email && email.includes('@')) {
      score += 3;
      details.push('✓ Valid email address provided');
    } else {
      suggestions.push('Add a valid email address');
    }

    if (phone && phone.length >= 10) {
      score += 3;
      details.push('✓ Phone number provided');
    } else {
      suggestions.push('Add phone number');
    }

    if (location && location.trim().length > 0) {
      score += 2;
      details.push('✓ Location provided');
    } else {
      suggestions.push('Add location (city, state)');
    }

    if (linkedin) {
      score += 2;
      details.push('✓ LinkedIn profile included');
    } else {
      suggestions.push('Add LinkedIn profile URL');
    }

    if (github) {
      score += 2;
      details.push('✓ GitHub profile included');
    }
  } else {
    suggestions.push('Add complete contact information');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    details,
    suggestions,
  };
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction - in production, use a more sophisticated approach
  const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const commonWords = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use']);
  
  const keywords = words
    .filter(word => !commonWords.has(word))
    .filter(word => word.length >= 4);
  
  // Return unique keywords, prioritizing longer words
  return Array.from(new Set(keywords)).sort((a, b) => b.length - a.length).slice(0, 30);
}

