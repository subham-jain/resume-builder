'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  jobDescription: z.string().min(100, 'Job description must be at least 100 characters'),
  userExperience: z.string().optional(),
  skills: z.string().optional(),
  education: z.string().optional(),
  targetRole: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function GeneratePage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState(null);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const jobDescriptionLength = watch('jobDescription')?.length || 0;

  const onSubmit = async (data: FormData) => {
    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription: data.jobDescription,
          userExperience: data.userExperience,
          skills: data.skills ? data.skills.split(',').map(s => s.trim()) : undefined,
          education: data.education,
          targetRole: data.targetRole,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate resume');
      }

      const resume = await response.json();
      setGeneratedResume(resume);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = async () => {
    if (!generatedResume) return;

    try {
      const response = await fetch('/api/download-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generatedResume),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download PDF');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            AI Resume Generator
          </h1>
          <p className="text-gray-600 mb-8">
            Paste a job description below and our AI will generate a tailored resume for you.
          </p>

          {!generatedResume ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  {...register('jobDescription')}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Paste the complete job description here..."
                />
                <div className="flex justify-between items-center mt-1">
                  <div className="text-sm text-gray-500">
                    {jobDescriptionLength} characters
                  </div>
                  {errors.jobDescription && (
                    <div className="text-sm text-red-600">
                      {errors.jobDescription.message}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="userExperience" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Experience (Optional)
                </label>
                <textarea
                  {...register('userExperience')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your relevant work experience, achievements, and career highlights..."
                />
              </div>

              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Skills (Optional)
                </label>
                <input
                  {...register('skills')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="List your skills separated by commas (e.g., JavaScript, React, Python, SQL)"
                />
              </div>

              <div>
                <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-2">
                  Education (Optional)
                </label>
                <input
                  {...register('education')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your educational background (e.g., Bachelor's in Computer Science, University Name)"
                />
              </div>

              <div>
                <label htmlFor="targetRole" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Role (Optional)
                </label>
                <input
                  {...register('targetRole')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Specific role you're targeting (e.g., Senior Frontend Developer)"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="text-red-800">{error}</div>
                </div>
              )}

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating Resume...
                  </div>
                ) : (
                  'Generate Resume'
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Generated Resume</h2>
                <div className="space-x-4">
                  <button
                    onClick={() => setGeneratedResume(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Generate New
                  </button>
                  <button
                    onClick={downloadPDF}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Download PDF
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-800">
                  {JSON.stringify(generatedResume, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
