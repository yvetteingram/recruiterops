import { Job, Candidate, CandidateStage } from './types';

export const MOCK_JOBS: Job[] = [
  {
    id: 'JOB-001',
    title: 'Senior DevOps Engineer',
    client: 'Stripe (via Boutique Partners)',
    salary: '$180k - $220k',
    status: 'active',
    description: 'Looking for K8s experts to scale payment infrastructure.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'JOB-002',
    title: 'Lead Product Manager',
    client: 'Brex (via Boutique Partners)',
    salary: '$200k + Equity',
    status: 'active',
    description: 'Fintech experience preferred. High velocity environment.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: 'C-001',
    jobId: 'JOB-001',
    name: 'Sarah Jenkins',
    title: 'Lead Infrastructure Engineer',
    company: 'Innovate Solutions',
    linkedInUrl: 'https://linkedin.com/in/sjenkins',
    phoneNumber: '+1-555-0102',
    email: 'sarah.j@innovatesolutions.com',
    stage: CandidateStage.SCREENED,
    outreachDraft: "Hi Sarah, saw your work at Innovate. We're scaling a payments pod and your profile looks like a great fit for the Lead role...",
    lastActivityAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // Stalled
  },
  {
    id: 'C-002',
    jobId: 'JOB-002',
    name: 'David Chen',
    title: 'Principal PM',
    company: 'Revolut',
    linkedInUrl: 'https://linkedin.com/in/dchen',
    phoneNumber: '+1-555-0199',
    email: 'd.chen@revolut.co',
    stage: CandidateStage.INTERVIEWING,
    lastActivityAt: new Date().toISOString(),
  }
];

export const PRICING_TIERS = {
  starter: { 
    name: 'Solo Accelerator',
    price: 49, 
    limit: 1, 
    features: [
      'Stalled Candidate Detection',
      'AI Interview Scheduler',
      'Daily Pipeline Summary',
      '1 Active Job Requisition',
      'Gumroad Verified License',
      'Make.com Webhook Support'
    ] 
  },
  professional: { 
    name: 'Boutique Office',
    price: 149, 
    limit: 10, 
    features: [
      'Everything in Solo',
      'Up to 10 Active Jobs',
      'Priority AI Scheduling',
      'Client Ghosting Alerts',
      'Candidate Export (CSV)',
      'Advanced Custom Persona'
    ] 
  },
  pro_plus: { 
    name: 'Velocity Scale',
    price: 499, 
    limit: 1000, 
    features: [
      'Everything in Boutique',
      'Unlimited Jobs & Talent',
      'Full Pipeline Automation',
      'Multi-User Access (v2)',
      'Dedicated Account Ops',
      '24/7 Priority Support'
    ] 
  },
};