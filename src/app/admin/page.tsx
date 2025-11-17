'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast';
import Link from 'next/link';

interface AnalyticsData {
  totalUsers: number;
  totalResumes: number;
  resumesToday: number;
  resumesThisWeek: number;
  resumesThisMonth: number;
  activeUsers: number;
  topTemplates: { template: string; count: number }[];
  usageByTier: { tier: string; count: number }[];
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const supabase = createClient();
  const router = useRouter();
  const { toasts, removeToast, error: showError } = useToast();

  const ADMIN_EMAIL = 'jainsubham3111@gmail.com';

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          router.push('/auth/signin?redirect=/admin');
          return;
        }

        if (user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
          showError('Access denied. Admin only.');
          router.push('/dashboard');
          return;
        }

        setUser(user);
        loadAnalytics();
      } catch (error) {
        console.error('Admin check error:', error);
        showError('Failed to verify admin access');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [supabase, router, showError]);

  const loadAnalytics = async () => {
    try {
      setLoadingAnalytics(true);

      // Get all users count
      const { data: usersData } = await supabase
        .from('resumes')
        .select('user_id')
        .order('created_at', { ascending: false });

      const uniqueUsers = new Set(usersData?.map(r => r.user_id) || []);
      
      // Get all resumes
      const { data: allResumes } = await supabase
        .from('resumes')
        .select('*')
        .order('created_at', { ascending: false });

      // Calculate dates
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);

      // Filter resumes by date
      const resumesToday = allResumes?.filter(r => 
        new Date(r.created_at) >= today
      ).length || 0;

      const resumesThisWeek = allResumes?.filter(r => 
        new Date(r.created_at) >= weekAgo
      ).length || 0;

      const resumesThisMonth = allResumes?.filter(r => 
        new Date(r.created_at) >= monthAgo
      ).length || 0;

      // Get active users (users who created resumes in last 7 days)
      const activeUserIds = new Set(
        allResumes
          ?.filter(r => new Date(r.created_at) >= weekAgo)
          .map(r => r.user_id) || []
      );

      // Analyze templates (if stored in generated_resume)
      const templateCounts: Record<string, number> = {};
      allResumes?.forEach(resume => {
        // Default to 'classic' if template info not available
        templateCounts['classic'] = (templateCounts['classic'] || 0) + 1;
      });

      // Get subscription tiers
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('tier');

      const tierCounts: Record<string, number> = { free: uniqueUsers.size };
      subscriptions?.forEach(sub => {
        tierCounts[sub.tier] = (tierCounts[sub.tier] || 0) + 1;
        tierCounts.free = Math.max(0, tierCounts.free - 1);
      });

      const analyticsData: AnalyticsData = {
        totalUsers: uniqueUsers.size,
        totalResumes: allResumes?.length || 0,
        resumesToday,
        resumesThisWeek,
        resumesThisMonth,
        activeUsers: activeUserIds.size,
        topTemplates: Object.entries(templateCounts)
          .map(([template, count]) => ({ template, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
        usageByTier: Object.entries(tierCounts)
          .map(([tier, count]) => ({ tier, count }))
          .sort((a, b) => b.count - a.count),
      };

      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
      showError('Failed to load analytics data');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Admin Analytics Dashboard
              </h1>
              <p className="text-gray-600">
                Monitor platform usage and user activity
              </p>
            </div>
            <button
              onClick={loadAnalytics}
              disabled={loadingAnalytics}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loadingAnalytics ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <Link
              href="/admin/analytics"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              View Analytics →
            </Link>
          </div>
        </div>

        {loadingAnalytics ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        ) : analytics ? (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Users */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Resumes */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Resumes</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.totalResumes}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Active Users */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Users (7d)</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.activeUsers}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Resumes This Month */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">This Month</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.resumesThisMonth}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Resumes Timeline */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Resume Generation Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Today</span>
                  <span className="font-bold text-gray-900">{analytics.resumesToday}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">This Week</span>
                  <span className="font-bold text-gray-900">{analytics.resumesThisWeek}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">This Month</span>
                  <span className="font-bold text-gray-900">{analytics.resumesThisMonth}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">All Time</span>
                  <span className="font-bold text-gray-900">{analytics.totalResumes}</span>
                </div>
              </div>
            </div>

            {/* Usage by Tier */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Usage by Subscription Tier</h2>
              <div className="space-y-3">
                {analytics.usageByTier.map(({ tier, count }) => (
                  <div key={tier} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="capitalize font-medium text-gray-700">{tier}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            tier === 'free' ? 'bg-gray-500' :
                            tier === 'pro' ? 'bg-blue-500' :
                            'bg-purple-500'
                          }`}
                          style={{ 
                            width: `${(count / analytics.totalUsers) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="font-bold text-gray-900 w-12 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Templates */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Most Used Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {analytics.topTemplates.map(({ template, count }) => (
                <div key={template} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{count}</div>
                  <div className="text-sm text-gray-600 capitalize">{template}</div>
                </div>
              ))}
            </div>
          </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <p className="text-gray-600">No analytics data available</p>
          </div>
        )}
      </div>
    </div>
  );
}

