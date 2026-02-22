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
  email: string;
  full_name?: string;
  plan: string;
  subscription_status: 'active' | 'trialing' | 'cancelled' | 'inactive';
  trial_ends_at?: string;
  gumroad_sale_id?: string;
  webhook_outreach?: string;
  webhook_calendar?: string;
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
  archived_at?: string;
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
  archived_at?: string;
  isDemo?: boolean;
  lastActivityAt?: string;
  notes?: string;
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