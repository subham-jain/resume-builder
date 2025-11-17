'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { getUserUsageClient } from '@/lib/usage-tracker';
import { getUserTierClient, PRICING_PLANS } from '@/lib/subscription';
import UsageLimit from '@/components/UsageLimit';
import { useRouter } from 'next/navigation';

interface ResumeRecord {
  id: string;
  job_description: string;
  generated_resume: any;
  created_at: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [tier, setTier] = useState<string>('free');
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Fetch user's resumes
        const { data: resumesData } = await supabase
          .from('resumes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (resumesData) {
          setResumes(resumesData);
        }

        // Load usage stats
        try {
          const usage = await getUserUsageClient(supabase, user.id);
          const userTier = await getUserTierClient(supabase, user.id);
          setUsageStats(usage);
          setTier(userTier);
        } catch (error) {
          console.error('Error loading usage:', error);
        }
      }
      
      setLoading(false);
    };

    loadData();
  }, [supabase]);

  const handleDownload = async (resume: ResumeRecord) => {
    try {
      const response = await fetch('/api/download-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: resume.generated_resume,
          templateId: 'classic',
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume-${resume.id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleView = (resume: ResumeRecord) => {
    router.push(`/generate?resumeId=${resume.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please sign in to access your dashboard.</p>
          <Link
            href="/auth/signin"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600">
            Manage your resumes and create new ones with AI.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href="/generate"
                  className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-center py-3 px-4 rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                >
                  ✨ Generate New Resume
                </Link>
                <Link
                  href="/templates"
                  className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-center py-3 px-4 rounded-lg transition-colors font-medium"
                >
                  🎨 Browse Templates
                </Link>
                {tier === 'free' && (
                  <Link
                    href="/pricing"
                    className="block w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-center py-3 px-4 rounded-lg transition-colors font-medium"
                  >
                    ⭐ Upgrade to Pro
                  </Link>
                )}
              </div>
            </div>

            {/* Usage Stats */}
            {usageStats && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Stats</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Total Resumes</span>
                      <span className="font-bold text-gray-900">{usageStats.resumesGenerated}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">This Month</span>
                      <span className="font-bold text-blue-600">{usageStats.resumesThisMonth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan</span>
                      <span className="font-semibold capitalize text-purple-600">{tier}</span>
                    </div>
                  </div>
                  
                  {tier === 'free' && (
                    <UsageLimit
                      tier={tier as any}
                      currentUsage={usageStats.resumesThisMonth}
                      userEmail={user?.email || undefined}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Plan Info */}
            {tier !== 'free' && (
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">✨ {PRICING_PLANS[tier as keyof typeof PRICING_PLANS]?.name} Plan</h3>
                <p className="text-sm opacity-90 mb-4">
                  You're enjoying premium features!
                </p>
                <Link
                  href="/pricing"
                  className="text-sm underline opacity-90 hover:opacity-100"
                >
                  Manage subscription →
                </Link>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Your Resumes</h2>
                <span className="text-sm text-gray-500">
                  {resumes.length} {resumes.length === 1 ? 'resume' : 'resumes'}
                </span>
              </div>
              
              {resumes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📄</div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No resumes yet</h3>
                  <p className="text-gray-600 mb-6">Create your first AI-generated resume!</p>
                  <Link
                    href="/generate"
                    className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                  >
                    Generate Resume
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {resumes.map((resume) => (
                    <div
                      key={resume.id}
                      className="border-2 border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-2">
                            {resume.generated_resume?.personalInfo?.name || 'Untitled Resume'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {resume.job_description?.substring(0, 150) || 'No description'}...
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>
                              📅 {new Date(resume.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                            <span>
                              🕐 {new Date(resume.created_at).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleView(resume)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDownload(resume)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
