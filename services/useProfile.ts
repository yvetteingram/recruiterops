import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Profile } from '../types';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!supabase) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data, error } = await supabase
        .from('profiles').select('*').eq('id', user.id).single();
      if (!error && data) setProfile(data as Profile);
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const isSubscriptionActive = (): boolean => {
    if (!profile) return false;
    if (profile.subscription_status === 'active') return true;
    if (profile.subscription_status === 'trialing' && profile.trial_ends_at) {
      return new Date(profile.trial_ends_at) > new Date();
    }
    return false;
  };

  return { profile, loading, isSubscriptionActive };
}