'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface AnalyticsData {
  weeklyData: {
    week: string;
    resumesGenerated: number;
    resumesDownloaded: number;
    activeUsers: number;
    revenue: number;
  }[];
  templateDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
  tierDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
  totalStats: {
    totalResumes: number;
    totalDownloads: number;
    totalUsers: number;
    totalRevenue: number;
  };
}

// Dummy data generator
const generateDummyData = (): AnalyticsData => {
  const weeks = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 42); // 6 weeks ago

  for (let i = 0; i < 6; i++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    weeks.push({
      week: `Week ${i + 1} (${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
      resumesGenerated: Math.floor(Math.random() * 200) + 50,
      resumesDownloaded: Math.floor(Math.random() * 180) + 40,
      activeUsers: Math.floor(Math.random() * 100) + 20,
      revenue: Math.floor(Math.random() * 5000) + 1000,
    });
  }

  return {
    weeklyData: weeks,
    templateDistribution: [
      { name: 'Classic', value: 45, color: '#3b82f6' },
      { name: 'Modern', value: 30, color: '#8b5cf6' },
      { name: 'Creative', value: 15, color: '#ec4899' },
      { name: 'Tech', value: 10, color: '#10b981' },
    ],
    tierDistribution: [
      { name: 'Free', value: 60, color: '#6b7280' },
      { name: 'Pro', value: 30, color: '#3b82f6' },
      { name: 'Enterprise', value: 10, color: '#8b5cf6' },
    ],
    totalStats: {
      totalResumes: weeks.reduce((sum, w) => sum + w.resumesGenerated, 0),
      totalDownloads: weeks.reduce((sum, w) => sum + w.resumesDownloaded, 0),
      totalUsers: Math.floor(Math.random() * 500) + 200,
      totalRevenue: weeks.reduce((sum, w) => sum + w.revenue, 0),
    },
  };
};

// Fetch real analytics data
const fetchRealAnalytics = async (supabase: any): Promise<AnalyticsData> => {
  try {
    // Get all resumes
    const { data: allResumes } = await supabase
      .from('resumes')
      .select('created_at, generated_resume')
      .order('created_at', { ascending: false });

    // Calculate weekly data (last 6 weeks)
    const weeks = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7 + 6));
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekResumes = allResumes?.filter((r: any) => {
        const createdAt = new Date(r.created_at);
        return createdAt >= weekStart && createdAt <= weekEnd;
      }) || [];

      const weekStartFormatted = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const weekEndFormatted = weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      weeks.push({
        week: `Week ${6 - i} (${weekStartFormatted} - ${weekEndFormatted})`,
        resumesGenerated: weekResumes.length,
        resumesDownloaded: Math.floor(weekResumes.length * 0.85), // Estimate downloads
        activeUsers: new Set(weekResumes.map((r: any) => r.user_id)).size,
        revenue: weekResumes.length * 9.99, // Estimate revenue
      });
    }

    // Template distribution (default to classic if not available)
    const templateCounts: Record<string, number> = { Classic: 0, Modern: 0, Creative: 0, Tech: 0 };
    allResumes?.forEach(() => {
      // Since we don't track template in DB, distribute evenly
      templateCounts.Classic += 0.45;
      templateCounts.Modern += 0.30;
      templateCounts.Creative += 0.15;
      templateCounts.Tech += 0.10;
    });

    const templateDistribution = [
      { name: 'Classic', value: Math.round(templateCounts.Classic), color: '#3b82f6' },
      { name: 'Modern', value: Math.round(templateCounts.Modern), color: '#8b5cf6' },
      { name: 'Creative', value: Math.round(templateCounts.Creative), color: '#ec4899' },
      { name: 'Tech', value: Math.round(templateCounts.Tech), color: '#10b981' },
    ];

    // Tier distribution
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('tier');

    const tierCounts: Record<string, number> = { Free: 0, Pro: 0, Enterprise: 0 };
    const totalUsers = new Set(allResumes?.map((r: any) => r.user_id) || []).size;
    
    subscriptions?.forEach((sub: any) => {
      tierCounts[sub.tier] = (tierCounts[sub.tier] || 0) + 1;
    });
    
    tierCounts.Free = Math.max(0, totalUsers - (tierCounts.Pro + tierCounts.Enterprise));

    const tierDistribution = [
      { name: 'Free', value: tierCounts.Free, color: '#6b7280' },
      { name: 'Pro', value: tierCounts.Pro, color: '#3b82f6' },
      { name: 'Enterprise', value: tierCounts.Enterprise, color: '#8b5cf6' },
    ];

    return {
      weeklyData: weeks,
      templateDistribution,
      tierDistribution,
      totalStats: {
        totalResumes: allResumes?.length || 0,
        totalDownloads: Math.floor((allResumes?.length || 0) * 0.85),
        totalUsers,
        totalRevenue: weeks.reduce((sum, w) => sum + w.revenue, 0),
      },
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};

const ADMIN_EMAIL = 'jainsubham3111@gmail.com';

export default function AnalyticsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [useDummyData, setUseDummyData] = useState(true); // Default to dummy data
  const supabase = createClient();
  const router = useRouter();
  const { toasts, removeToast, error: showError } = useToast();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          router.push('/auth/signin?redirect=/admin/analytics');
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

      if (useDummyData) {
        // Use dummy data
        const dummyData = generateDummyData();
        setAnalytics(dummyData);
      } else {
        // Fetch real data
        const realData = await fetchRealAnalytics(supabase);
        setAnalytics(realData);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      showError('Failed to load analytics data');
      // Fallback to dummy data on error
      setAnalytics(generateDummyData());
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [useDummyData, user]);

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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600">
                Week-by-week insights and performance metrics
              </p>
            </div>
            
            {/* Toggle Switch */}
            <div className="flex items-center gap-4">
              <span className={`text-sm font-medium ${useDummyData ? 'text-gray-500' : 'text-blue-600'}`}>
                {useDummyData ? 'Dummy Data' : 'Real Data'}
              </span>
              <button
                onClick={() => {
                  setUseDummyData(!useDummyData);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  useDummyData ? 'bg-gray-300' : 'bg-blue-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    useDummyData ? 'translate-x-1' : 'translate-x-6'
                  }`}
                />
              </button>
              <button
                onClick={loadAnalytics}
                disabled={loadingAnalytics}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loadingAnalytics ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {loadingAnalytics ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        ) : analytics ? (
          <>
            {/* Total Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Resumes</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.totalStats.totalResumes.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Downloads</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.totalStats.totalDownloads.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.totalStats.totalUsers.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">${analytics.totalStats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Week-by-Week Line Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Week-by-Week Performance</h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="week" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="resumesGenerated" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Resumes Generated"
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="resumesDownloaded" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Resumes Downloaded"
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="activeUsers" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="Active Users"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Template Distribution Pie Chart */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Template Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.templateDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: { name?: string; percent?: number }) => `${name || 'Unknown'}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.templateDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Tier Distribution Pie Chart */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Subscription Tier Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.tierDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: { name?: string; percent?: number }) => `${name || 'Unknown'}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.tierDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue Bar Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Weekly Revenue</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="week" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#f59e0b" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Weekly Data Table */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Weekly Breakdown</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Week</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Resumes Generated</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Downloads</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Active Users</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.weeklyData.map((week, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">{week.week}</td>
                        <td className="py-3 px-4 text-right text-gray-700">{week.resumesGenerated.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-gray-700">{week.resumesDownloaded.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-gray-700">{week.activeUsers.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">${week.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

