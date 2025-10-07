'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';

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
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Fetch user's resumes
        const { data: resumesData, error } = await supabase
          .from('resumes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (resumesData) {
          setResumes(resumesData);
        }
      }
      
      setLoading(false);
    };

    getUser();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please sign in to access your dashboard.</p>
          <Link
            href="/auth/signin"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.email}!
          </h1>
          <p className="text-gray-600">
            Manage your resumes and create new ones with AI.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-4">
                <Link
                  href="/generate"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-4 rounded-lg transition-colors"
                >
                  Generate New Resume
                </Link>
                <Link
                  href="/templates"
                  className="block w-full bg-gray-600 hover:bg-gray-700 text-white text-center py-3 px-4 rounded-lg transition-colors"
                >
                  Browse Templates
                </Link>
                <Link
                  href="/profile"
                  className="block w-full border border-gray-300 hover:bg-gray-50 text-gray-700 text-center py-3 px-4 rounded-lg transition-colors"
                >
                  Edit Profile
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Resumes Created</span>
                  <span className="font-semibold">{resumes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-semibold">
                    {resumes.filter(r => {
                      const created = new Date(r.created_at);
                      const now = new Date();
                      return created.getMonth() === now.getMonth() && 
                             created.getFullYear() === now.getFullYear();
                    }).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Resumes */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Resumes</h2>
              
              {resumes.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">📄</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes yet</h3>
                  <p className="text-gray-600 mb-4">Create your first AI-generated resume!</p>
                  <Link
                    href="/generate"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Generate Resume
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {resumes.slice(0, 5).map((resume) => (
                    <div key={resume.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {resume.generated_resume?.personalInfo?.name || 'Untitled Resume'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {resume.job_description.substring(0, 100)}...
                          </p>
                          <p className="text-xs text-gray-500">
                            Created {new Date(resume.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button className="text-blue-600 hover:text-blue-700 text-sm">
                            View
                          </button>
                          <button className="text-green-600 hover:text-green-700 text-sm">
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
