'use client';

import Link from 'next/link';
import SetupNotification from '@/components/SetupNotification';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <SetupNotification />
        <main className="text-center">
          {/* Hero Section */}
          <div className="mb-16 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Professional Resume Builder
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Create stunning, professional resumes in minutes with AI-powered assistance. Choose from our collection of templates and customize them to match your style.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link
                href="/generate"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-10 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Building Resume
              </Link>
              <Link
                href="/templates"
                className="bg-white hover:bg-gray-50 text-blue-600 font-semibold py-4 px-10 rounded-lg border-2 border-blue-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
              >
                View Templates
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-slide-up">
              <div className="text-5xl mb-4 animate-pulse-slow">📝</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Easy to Use</h3>
              <p className="text-gray-600 leading-relaxed">Intuitive interface that makes resume building simple and fast. Just paste your job description or resume text.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="text-5xl mb-4 animate-pulse-slow">🤖</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">AI-Powered</h3>
              <p className="text-gray-600 leading-relaxed">Powered by Google Gemini AI to generate and enhance your resume with industry best practices.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="text-5xl mb-4 animate-pulse-slow">🎨</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Professional Templates</h3>
              <p className="text-gray-600 leading-relaxed">Choose from a variety of professionally designed templates optimized for different industries.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-slide-up" style={{ animationDelay: '300ms' }}>
              <div className="text-5xl mb-4 animate-pulse-slow">💼</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">ATS Friendly</h3>
              <p className="text-gray-600 leading-relaxed">Optimized for Applicant Tracking Systems used by employers to maximize your chances.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-slide-up" style={{ animationDelay: '400ms' }}>
              <div className="text-5xl mb-4 animate-pulse-slow">📄</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">PDF Export</h3>
              <p className="text-gray-600 leading-relaxed">Download your resume as a professional PDF ready to share with employers.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-slide-up" style={{ animationDelay: '500ms' }}>
              <div className="text-5xl mb-4 animate-pulse-slow">⚡</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Fast & Efficient</h3>
              <p className="text-gray-600 leading-relaxed">Generate professional resumes in seconds, not hours. Save time and focus on your job search.</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 animate-fade-in">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Create Your Perfect Resume?</h2>
              <p className="text-xl mb-8 opacity-90">Join thousands of professionals who have already created their resumes with our AI-powered builder.</p>
              <Link
                href="/generate"
                className="inline-block bg-white text-blue-600 font-semibold py-4 px-10 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                Get Started Now
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
