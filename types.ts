export enum CandidateStage {
  SOURCED = 'Sourced',
  CONTACTED = 'Contacted',
  RESPONDED = 'Responded',
  SCREENED = 'Screened',
  INTERVIEWING = 'Client Interview',
  PRESENTED = 'Presented',
  REJECTED = 'Rejected'
}

export interface GroundingSource {
  title: string;
  uri: string;
}

// ✅ Plan types unified across all files
export type Plan = 'starter' | 'pro' | 'agency';
export type SubscriptionStatus = 'trialing' | 'active' | 'cancelled' | 'expired';

// ✅ Matches actual Supabase profiles table columns
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  plan: Plan;
  subscription_status: SubscriptionStatus;
  trial_ends_at: string | null;
  gumroad_sale_id: string | null;
  created_at?: string;
}

export interface Job {
  id: string;
  title: string;
  client: string;
  salary: string;
  location?: string;
  status: 'active' | 'paused' | 'filled';
  description: string;
  createdAt: string;
  isDemo?: boolean;
}

export interface Candidate {
  id: string;
  jobId: string;
  name: string;
  title: string;
  company: string;
  linkedInUrl: string;
  email?: string;
  phoneNumber?: string;
  stage: CandidateStage;
  outreachDraft?: string;
  matchScore?: number;
  aiAnalysis?: string;
  isDemo?: boolean;
  lastActivityAt?: string;
}

export interface Stats {
  totalJobs: number;
  activeCandidates: number;
  sessionsBooked: number;
  placements: number;
  timeSavedMinutes: number;
  stalledItemsCount: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  event: string;
  details: string;
  type: 'ai' | 'system' | 'user';
}