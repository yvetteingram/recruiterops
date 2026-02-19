import { useState, useEffect } from 'react';
import { supabase } from './supabase'; // ✅ Fixed: was './supabaseClient'
import { Plan, SubscriptionStatus, Profile } from '../types';

// ─── Define what each plan can access ───────────────────────
const PLAN_FEATURES: Record<Plan, string[]> = {
  starter: [
    'dashboard',
    'jobs',
    'candidates',
    'daily_briefing',
  ],
  pro: [
    'dashboard',
    'jobs',
    'candidates',
    'daily_briefing',
    'ai_analysis',
    'outreach_drafts',
    'stalled_detection',
    'ai_scheduler',
  ],
  agency: [
    'dashboard',
    'jobs',
    'candidates',
    'daily_briefing',
    'ai_analysis',
    'outreach_drafts',
    'stalled_detection',
    'ai_scheduler',
    'team_management',
    'usage_reports',
    'white_label',
  ],
};

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!supabase) { setLoading(false); return; }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!error && data) setProfile(data as Profile);
      setLoading(false);
    };

    fetchProfile();
  }, []);

  // Check if subscription is currently valid
  const isSubscriptionActive = (): boolean => {
    if (!profile) return false;
    if (profile.subscription_status === 'active') return true;
    if (profile.subscription_status === 'trialing' && profile.trial_ends_at) {
      return new Date(profile.trial_ends_at) > new Date();
    }
    return false;
  };

  // Check if user's plan includes a specific feature
  const hasFeature = (feature: string): boolean => {
    if (!profile) return false;
    if (!isSubscriptionActive()) return false;
    const planFeatures = PLAN_FEATURES[profile.plan] ?? PLAN_FEATURES['starter'];
    return planFeatures.includes(feature);
  };

  return { profile, loading, hasFeature, isSubscriptionActive };
}