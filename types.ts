export enum CandidateStage {
  SOURCED = 'Sourced',
  CONTACTED = 'Contacted',
  RESPONDED = 'Responded',
  SCREENED = 'Screened',
  INTERVIEWING = 'Client Interview',
  PRESENTED = 'Presented',
  PLACED = 'Placed',
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
  contactName?: string;
  contactEmail?: string;
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
  contactName?: string;
  contactEmail?: string;
  isDemo?: boolean;
  lastActivityAt?: string;
  notes?: string;
  placed_at?: string;
  placement_fee?: number;
  placement_type?: 'full_time' | 'contract';
  fee_clears_at?: string;
}

export interface Stats {
  totalJobs: number;
  activeCandidates: number;
  sessionsBooked: number;
  placements: number;
  totalFees: number;
  confirmedFees: number;
  pendingFees: number;
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