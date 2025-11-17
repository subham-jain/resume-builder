'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'next/navigation';
import TemplateRenderer from '@/components/resume-templates/TemplateRenderer';
import ResumeEditor from '@/components/ResumeEditor';
import ATSMetrics from '@/components/ATSMetrics';
import Stepper from '@/components/Stepper';
import TextEditor from '@/components/TextEditor';
import UsageLimit from '@/components/UsageLimit';
import { ToastContainer } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { GeneratedResume } from '@/lib/gemini';
import { analyzeATS, ATSMetrics as ATSMetricsType } from '@/lib/ats-analyzer';
import { getUserTierClient } from '@/lib/subscription';
import { getUserUsageClient } from '@/lib/usage-tracker';
import { createClient } from '@/lib/supabase-client';
import { trackResumeGeneration } from '@/lib/analytics';

const formSchema = z.object({
  inputType: z.enum(['jobDescription', 'resumeText', 'upload']),
  jobDescription: z.string().optional(),
  resumeText: z.string().optional(),
  userExperience: z.string().optional(),
  skills: z.string().optional(),
  education: z.string().optional(),
  targetRole: z.string().optional(),
  templateId: z.string().default('classic'),
}).refine((data) => {
  if (data.inputType === 'jobDescription') {
    return data.jobDescription && data.jobDescription.length >= 100;
  } else if (data.inputType === 'resumeText') {
    return data.resumeText && data.resumeText.length >= 50;
  }
  return true; // Upload handled separately
}, {
  message: 'Please provide sufficient content',
  path: ['jobDescription'],
});

type FormData = z.infer<typeof formSchema>;

const STEPS = [
  { id: 'input', label: 'Input', description: 'Provide resume data' },
  { id: 'generate', label: 'Generate', description: 'AI processing' },
  { id: 'review', label: 'Review', description: 'Edit & optimize' },
  { id: 'ats', label: 'ATS Score', description: 'Check compatibility' },
  { id: 'download', label: 'Download', description: 'Get your PDF' },
];

export default function GeneratePage() {
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<GeneratedResume | null>(null);
  const [atsMetrics, setAtsMetrics] = useState<ATSMetricsType | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [error, setError] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [showTextPreview, setShowTextPreview] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [usageStats, setUsageStats] = useState<{ current: number; tier: string } | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { toasts, removeToast, success, error: showError, info } = useToast();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inputType: 'jobDescription',
      templateId: searchParams.get('template') || 'classic',
    },
  });

  const inputType = watch('inputType');
  const jobDescriptionLength = watch('jobDescription')?.length || 0;
  const resumeTextLength = watch('resumeText')?.length || 0;

  useEffect(() => {
    const templateParam = searchParams.get('template');
    if (templateParam && ['classic', 'modern', 'creative', 'tech'].includes(templateParam)) {
      setSelectedTemplate(templateParam);
      setValue('templateId', templateParam);
    }
  }, [searchParams, setValue]);

  // Load usage stats
  useEffect(() => {
    const loadUsage = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const usage = await getUserUsageClient(supabase, user.id);
          const tier = await getUserTierClient(supabase, user.id);
          setUsageStats({ current: usage.resumesThisMonth, tier });
          setUserEmail(user.email || null);
        }
      } catch (error) {
        console.error('Error loading usage:', error);
      }
    };
    loadUsage();
  }, [supabase]);

  // Recalculate ATS metrics when resume changes (fallback for edge cases)
  useEffect(() => {
    if (generatedResume && !atsMetrics) {
      try {
        const metrics = analyzeATS(generatedResume, jobDescription);
        setAtsMetrics(metrics);
        if (currentStep < 3) {
          setCurrentStep(3);
        }
      } catch (error) {
        console.error('Error calculating ATS metrics in useEffect:', error);
      }
    }
  }, [generatedResume]); // Only trigger when resume changes

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError('');
    setExtractedText(null);
    setShowTextPreview(false);
    info('Uploading file...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to upload file';
        showError(errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (data.textContent) {
        setExtractedText(data.textContent);
        setUploadedFileName(data.fileName);
        setShowTextPreview(true);
        success(`Successfully extracted ${data.characterCount} characters from ${data.fileName}`);
      } else {
        throw new Error('No text content extracted from file');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUseExtractedText = () => {
    if (extractedText) {
      setValue('resumeText', extractedText);
      setValue('inputType', 'resumeText');
      setShowTextPreview(false);
      success('Text loaded into form. You can now edit or generate resume.');
    }
  };

  const handleEditExtractedText = (editedText: string) => {
    setExtractedText(editedText);
    setShowTextEditor(false);
    success('Text updated successfully');
  };

  const onSubmit = async (data: FormData) => {
    setIsGenerating(true);
    setError('');
    setCurrentStep(1); // Move to generate step
    setJobDescription(data.jobDescription || '');

    try {
      const response = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription: data.inputType === 'jobDescription' ? data.jobDescription : undefined,
          resumeText: data.inputType === 'resumeText' ? data.resumeText : undefined,
          userExperience: data.userExperience,
          skills: data.skills ? data.skills.split(',').map(s => s.trim()) : undefined,
          education: data.education,
          targetRole: data.targetRole,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.upgradeRequired) {
          showError(`Monthly limit reached (${errorData.current}/${errorData.limit}). Upgrade to continue.`);
          // Reload usage stats
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const usage = await getUserUsageClient(supabase, user.id);
            const tier = await getUserTierClient(supabase, user.id);
            setUsageStats({ current: usage.resumesThisMonth, tier });
          }
        }
        throw new Error(errorData.error || 'Failed to generate resume');
      }

      const resume = await response.json();
      setGeneratedResume(resume);
      setSelectedTemplate(data.templateId || 'classic');
      setJobDescription(data.jobDescription || '');
      
      // Start at review step, then calculate ATS metrics
      setCurrentStep(2); // Move to review step first
      
      // Calculate ATS metrics immediately in background
      try {
        const metrics = analyzeATS(resume, data.jobDescription || '');
        setAtsMetrics(metrics);
        // Auto-advance to ATS step after a brief moment
        setTimeout(() => {
          setCurrentStep(3); // Move to ATS step after showing review
        }, 1500);
      } catch (error) {
        console.error('Error calculating ATS metrics:', error);
        // Stay on review step if ATS calculation fails
      }
      
      success('Resume generated successfully!');
      
      // Track analytics and monitoring
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const tier = await getUserTierClient(supabase, user.id);
          trackResumeGeneration(tier, data.templateId || 'classic');
          trackUserAction('resume_generated', user.id, {
            tier,
            template: data.templateId || 'classic',
            hasJobDescription: !!data.jobDescription,
            hasResumeText: !!data.resumeText,
          });
        }
      } catch (error) {
        console.error('Error tracking analytics:', error);
        if (error instanceof Error) {
          monitorError(error, { context: 'analytics_tracking' });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      showError(errorMessage);
      setCurrentStep(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResumeUpdate = (updatedResume: GeneratedResume) => {
    setGeneratedResume(updatedResume);
    setShowEditor(false);
    // Recalculate ATS metrics for updated resume
    try {
      const metrics = analyzeATS(updatedResume, jobDescription);
      setAtsMetrics(metrics);
    } catch (error) {
      console.error('Error recalculating ATS metrics:', error);
    }
    success('Resume updated successfully!');
  };

  const downloadPDF = async (templateId: string = selectedTemplate) => {
    if (!generatedResume) return;

    try {
      const response = await fetch('/api/download-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume: generatedResume,
          templateId: templateId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `resume-${templateId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      setCurrentStep(4); // Move to download step
      success(`Resume downloaded successfully as resume-${templateId}.pdf`);
      
      // Track download analytics and monitoring
      trackResumeDownload(templateId);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          trackUserAction('resume_downloaded', user.id, {
            template: templateId,
          });
        }
      } catch (error) {
        console.error('Error tracking download:', error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download PDF';
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  const templates = [
    { id: 'classic', name: 'Classic Professional', color: 'bg-gray-600' },
    { id: 'modern', name: 'Modern Minimalist', color: 'bg-blue-600' },
    { id: 'creative', name: 'Creative Portfolio', color: 'bg-purple-600' },
    { id: 'tech', name: 'Tech Specialist', color: 'bg-green-600' },
  ];

  const completedSteps = currentStep > 0 ? Array.from({ length: currentStep }, (_, i) => i) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      {/* Text Editor Modal */}
      {showTextEditor && extractedText && (
        <TextEditor
          text={extractedText}
          onSave={handleEditExtractedText}
          onCancel={() => setShowTextEditor(false)}
          title={`Edit Extracted Text - ${uploadedFileName}`}
        />
      )}
      
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Resume Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            Create professional, ATS-optimized resumes in minutes with AI-powered assistance.
          </p>
          
          {/* Usage Limit Display */}
          {usageStats && (
            <div className="max-w-md mx-auto">
              <UsageLimit
                tier={usageStats.tier as any}
                currentUsage={usageStats.current}
                feature="Resumes this month"
                userEmail={userEmail || undefined}
              />
            </div>
          )}
        </div>

        {/* Stepper */}
        {generatedResume && (
          <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
            <Stepper 
              steps={STEPS} 
              currentStep={currentStep} 
              completedSteps={completedSteps}
              clickable={true}
              onStepClick={(stepIndex) => {
                // Allow navigation to completed steps or current step
                if (stepIndex <= currentStep || completedSteps.includes(stepIndex)) {
                  setCurrentStep(stepIndex);
                }
              }}
            />
          </div>
        )}

          {!generatedResume ? (
          <div className="bg-white rounded-xl shadow-2xl p-8 md:p-10 animate-slide-up">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Input Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Choose Input Method
                </label>
                <div className="grid md:grid-cols-3 gap-4">
                  <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                    inputType === 'jobDescription' 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      value="jobDescription"
                      {...register('inputType')}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">Job Description</div>
                      <div className="text-sm text-gray-600">Generate from job posting</div>
                    </div>
                    {inputType === 'jobDescription' && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </label>
                  
                  <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                    inputType === 'resumeText' 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      value="resumeText"
                      {...register('inputType')}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">Resume Text</div>
                      <div className="text-sm text-gray-600">Paste existing resume</div>
                    </div>
                    {inputType === 'resumeText' && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </label>

                  <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                    inputType === 'upload' 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      value="upload"
                      {...register('inputType')}
                      onClick={() => fileInputRef.current?.click()}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">Upload File</div>
                      <div className="text-sm text-gray-600">Upload resume file</div>
                    </div>
                    {inputType === 'upload' && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </label>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Job Description Input */}
              {inputType === 'jobDescription' && (
                <div className="animate-fade-in">
                  <label htmlFor="jobDescription" className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  {...register('jobDescription')}
                    rows={10}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Paste the complete job description here..."
                />
                  <div className="flex justify-between items-center mt-2">
                  <div className="text-sm text-gray-500">
                    {jobDescriptionLength} characters
                      {jobDescriptionLength < 100 && (
                        <span className="text-orange-600 ml-2">({100 - jobDescriptionLength} more needed)</span>
                      )}
                    </div>
                    {errors.jobDescription && (
                      <div className="text-sm text-red-600">{errors.jobDescription.message}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Resume Text Input */}
              {inputType === 'resumeText' && (
                <div className="animate-fade-in">
                  <label htmlFor="resumeText" className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Resume Text *
                  </label>
                  <textarea
                    {...register('resumeText')}
                    rows={15}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-mono text-sm"
                    placeholder="Paste your existing resume text here..."
                  />
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-sm text-gray-500">
                      {resumeTextLength} characters
                      {resumeTextLength < 50 && (
                        <span className="text-orange-600 ml-2">({50 - resumeTextLength} more needed)</span>
                      )}
                    </div>
                    {errors.resumeText && (
                      <div className="text-sm text-red-600">{errors.resumeText.message}</div>
                  )}
                </div>
              </div>
              )}

              {/* File Upload Status */}
              {inputType === 'upload' && (
                <div className="animate-fade-in space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    {isUploading ? (
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                        <p className="text-gray-600">Uploading and processing file...</p>
                        <p className="text-sm text-gray-500 mt-2">Extracting text from file...</p>
                      </div>
                    ) : (
                      <div>
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-gray-600 mb-2">Click to upload resume file</p>
                        <p className="text-sm text-gray-500 mb-4">Supports: PDF, DOCX, DOC, and TXT files</p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Choose File
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Text Preview Modal */}
                  {showTextPreview && extractedText && (
                    <div className="bg-white border-2 border-blue-200 rounded-lg p-6 shadow-lg animate-fade-in">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Extracted Text Preview</h3>
                          <p className="text-sm text-gray-600">From: {uploadedFileName}</p>
                          <p className="text-xs text-gray-500 mt-1">{extractedText.length} characters extracted</p>
                        </div>
                        <button
                          onClick={() => {
                            setShowTextPreview(false);
                            setExtractedText(null);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
              </div>

                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-64 overflow-y-auto mb-4">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                          {extractedText.substring(0, 2000)}
                          {extractedText.length > 2000 && (
                            <span className="text-gray-500">... (showing first 2000 characters)</span>
                          )}
                        </pre>
              </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleUseExtractedText}
                          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                        >
                          Use This Text
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowTextEditor(true)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                        >
                          Edit Text
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowTextPreview(false);
                            setExtractedText(null);
                            setUploadedFileName(null);
                          }}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Optional Fields */}
              <div className="grid md:grid-cols-2 gap-4">
              <div>
                  <label htmlFor="userExperience" className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Experience (Optional)
                </label>
                <textarea
                  {...register('userExperience')}
                  rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your relevant work experience..."
                />
              </div>
              <div>
                  <label htmlFor="skills" className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Skills (Optional)
                </label>
                <input
                  {...register('skills')}
                  type="text"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="JavaScript, React, Python, SQL..."
                />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
              <div>
                  <label htmlFor="education" className="block text-sm font-semibold text-gray-700 mb-2">
                  Education (Optional)
                </label>
                <input
                  {...register('education')}
                  type="text"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Bachelor's in Computer Science..."
                />
              </div>
              <div>
                  <label htmlFor="targetRole" className="block text-sm font-semibold text-gray-700 mb-2">
                  Target Role (Optional)
                </label>
                <input
                  {...register('targetRole')}
                  type="text"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Senior Frontend Developer"
                  />
                </div>
              </div>

              {/* Template Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Choose Template (Optional)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {templates.map((template) => (
                    <label
                      key={template.id}
                      className={`relative flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                        selectedTemplate === template.id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        value={template.id}
                        {...register('templateId')}
                        onChange={(e) => {
                          setValue('templateId', e.target.value);
                          setSelectedTemplate(e.target.value);
                        }}
                        className="sr-only"
                      />
                      <div className={`w-12 h-12 ${template.color} rounded-lg mb-2`}></div>
                      <div className="text-xs font-medium text-gray-700 text-center">
                        {template.name}
                      </div>
                      {selectedTemplate === template.id && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 animate-shake">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-red-800 font-medium">{error}</div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isGenerating || isUploading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    <span>Generating Resume with AI...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Resume
                  </span>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Step-based Content Display */}
            
            {/* Step 2: Review - Show Resume Preview */}
            {currentStep === 2 && (
              <div className="mb-6 animate-fade-in">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900">Step 2: Review Your Resume</h3>
                      <p className="text-sm text-blue-700 mt-1">Review and edit your generated resume before checking ATS score.</p>
                    </div>
                    {atsMetrics && (
                      <button
                        onClick={() => setCurrentStep(3)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        View ATS Score →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: ATS Metrics - Show ATS Analysis */}
            {currentStep === 3 && (
              <div className="mb-6 animate-fade-in">
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-green-900">Step 3: ATS Score Analysis</h3>
                      <p className="text-sm text-green-700 mt-1">Check your resume's compatibility with Applicant Tracking Systems.</p>
                    </div>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      ← Back to Review
                    </button>
                  </div>
                </div>
                
                {atsMetrics ? (
                  <ATSMetrics metrics={atsMetrics} />
                ) : (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">ATS Score Analysis</h2>
                      <button
                        onClick={() => {
                          if (generatedResume) {
                            try {
                              const metrics = analyzeATS(generatedResume, jobDescription);
                              setAtsMetrics(metrics);
                              success('ATS metrics calculated successfully');
                            } catch (error) {
                              showError('Failed to calculate ATS metrics');
                              console.error('ATS calculation error:', error);
                            }
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Calculate ATS Score
                      </button>
                    </div>
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Calculating ATS metrics...</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Download - Show download options */}
            {currentStep === 4 && (
              <div className="mb-6 animate-fade-in">
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-purple-900">Step 4: Download Your Resume</h3>
                      <p className="text-sm text-purple-700 mt-1">Download your resume as a professional PDF.</p>
                    </div>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      ← Back to ATS
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick ATS Preview in Review Step */}
            {currentStep === 2 && atsMetrics && (
              <div className="mb-6 animate-fade-in">
                <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Quick ATS Preview</h3>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Full Analysis →
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-blue-600">
                      {Math.round(atsMetrics.overallScore)}%
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${atsMetrics.overallScore}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Overall ATS Score</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Resume Editor */}
            {showEditor ? (
              <ResumeEditor
                resume={generatedResume}
                onUpdate={handleResumeUpdate}
                onCancel={() => setShowEditor(false)}
              />
            ) : (
              <>
                {/* Preview Controls */}
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4 z-10">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold text-gray-900">Resume Preview</h2>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setShowEditor(true)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200"
                      >
                        Edit Resume
                      </button>
                  <button
                        onClick={() => {
                          setGeneratedResume(null);
                          setAtsMetrics(null);
                          setCurrentStep(0);
                        }}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200"
                  >
                    Generate New
                  </button>
                      <div className="flex gap-2">
                        {templates.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => setSelectedTemplate(template.id)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              selectedTemplate === template.id
                                ? `${template.color} text-white shadow-md`
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {template.name}
                          </button>
                        ))}
                      </div>
                  <button
                        onClick={() => downloadPDF(selectedTemplate)}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
                  >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    Download PDF
                  </button>
                </div>
              </div>
              </div>

                {/* Resume Preview */}
                <div className="bg-white rounded-xl shadow-2xl p-8 overflow-x-auto">
                  <TemplateRenderer resume={generatedResume} templateId={selectedTemplate} />
            </div>
              </>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
