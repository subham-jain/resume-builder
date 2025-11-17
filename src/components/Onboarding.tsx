'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const steps = [
    {
      title: 'Welcome to Resume Builder',
      description: 'Create professional, ATS-optimized resumes in minutes with AI-powered assistance.',
      icon: '👋',
    },
    {
      title: 'How It Works',
      description: 'Upload your resume, paste a job description, or start from scratch. Our AI will help you create the perfect resume.',
      icon: '🚀',
      features: [
        'Upload existing resume or paste text',
        'AI generates optimized resume',
        'Edit and customize',
        'Download professional PDF',
      ],
    },
    {
      title: 'ATS Optimization',
      description: 'Every resume is optimized for Applicant Tracking Systems to maximize your chances.',
      icon: '✅',
      features: [
        'Keyword optimization',
        'Formatting compliance',
        'Structure analysis',
        'Real-time scoring',
      ],
    },
    {
      title: 'Ready to Start?',
      description: 'Let\'s create your first professional resume!',
      icon: '🎯',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
      router.push('/generate');
    }
  };

  const handleSkip = () => {
    onComplete();
    router.push('/generate');
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{steps[currentStep].icon}</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {steps[currentStep].title}
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            {steps[currentStep].description}
          </p>
        </div>

        {steps[currentStep].features && (
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {steps[currentStep].features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg"
              >
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        )}

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? 'bg-blue-600 w-8'
                  : index < currentStep
                  ? 'bg-blue-300 w-2'
                  : 'bg-gray-200 w-2'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleSkip}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Skip Tour
          </button>
          <button
            onClick={handleNext}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

