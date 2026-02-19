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

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  companyName?: string;
  role?: string;
  hasCompletedOnboarding: boolean;
  plan: 'starter' | 'professional' | 'pro_plus';
  subscriptionStatus: 'active' | 'expired' | 'cancelled';
  aiPersona?: string;
  webhookOutreach?: string;
  webhookCalendar?: string;
  licenseKey?: string;
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