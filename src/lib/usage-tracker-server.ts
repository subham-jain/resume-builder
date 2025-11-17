// Server-side only - DO NOT IMPORT IN CLIENT COMPONENTS
import { createClient } from './supabase-server';

export interface UsageStats {
  resumesGenerated: number;
  resumesThisMonth: number;
  lastResetDate: Date;
  totalDownloads: number;
  templatesUsed: Record<string, number>;
}

// Server-side version - uses server client
export async function getUserUsage(userId: string): Promise<UsageStats> {
  const supabase = await createClient();
  
  // Get current month's start date
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Fetch resumes for this month
  const { data: resumesThisMonth } = await supabase
    .from('resumes')
    .select('id, created_at, generated_resume')
    .eq('user_id', userId)
    .gte('created_at', monthStart.toISOString());
  
  // Fetch all resumes for total count
  const { data: allResumes } = await supabase
    .from('resumes')
    .select('id, generated_resume')
    .eq('user_id', userId);
  
  const templatesUsed: Record<string, number> = {};
  allResumes?.forEach(() => {
    // Extract template info if stored
    // For now, count all as 'classic'
    templatesUsed['classic'] = (templatesUsed['classic'] || 0) + 1;
  });
  
  return {
    resumesGenerated: allResumes?.length || 0,
    resumesThisMonth: resumesThisMonth?.length || 0,
    lastResetDate: monthStart,
    totalDownloads: 0, // Track this separately if needed
    templatesUsed,
  };
}

