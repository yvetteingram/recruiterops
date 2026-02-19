import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Profile, Stats, Job, Plan } from '../types';

interface SettingsViewProps {
  profile: Profile;
  stats: Stats;
  jobs: Job[];
  onUpdateProfile: (updates: Partial<Profile>) => void;
  onClearDemo: () => void;
  onExportCSV: () => void;
}

const PLAN_DETAILS: Record<Plan, { label: string; price: string; description: string }> = {
  starter: {
    label: 'Starter',
    price: '$29/mo',
    description: 'Dashboard, jobs, and candidate pipeline. Up to 1 active requisition.',
  },
  pro: {
    label: 'Pro',
    price: '$49/mo',
    description: 'Everything in Starter plus AI analysis, outreach drafts, stalled detection, and AI scheduler.',
  },
  agency: {
    label: 'Agency',
    price: '$99/mo',
    description: 'Everything in Pro plus team management, usage reports, and white label.',
  },
};

const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  stats,
  jobs,
  onUpdateProfile,
  onClearDemo,
  onExportCSV,
}) => {
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  // ✅ Only editable fields that exist in the actual profiles table
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [gumroadSaleId, setGumroadSaleId] = useState(profile.gumroad_sale_id || '');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      if (supabase) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: fullName,
            gumroad_sale_id: gumroadSaleId || null,
          })
          .eq('id', profile.id);

        if (error) throw error;
      }

      onUpdateProfile({
        full_name: fullName,
        gumroad_sale_id: gumroadSaleId || null,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("Configuration sync failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const planInfo = PLAN_DETAILS[profile.plan] || PLAN_DETAILS['starter'];
  const isTrialing = profile.subscription_status === 'trialing';
  const trialEndsDate = profile.trial_ends_at
    ? new Date(profile.trial_ends_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div className="max-w-4xl space-y-16 pb-24">

      {/* Profile Header */}
      <section className="bg-slate-900 p-12 rounded-[2.5rem] flex flex-col md:flex-row gap-10 items-center text-white border border-white/5 shadow-2xl">
        <div className="h-24 w-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black uppercase shadow-2xl">
          <i className="fa-solid fa-bolt"></i>
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
            {profile.full_name || 'Ops Manager'}
          </h2>
          <p className="text-xs text-indigo-400 font-black uppercase tracking-widest">
            {profile.email} · RecruiterOps {planInfo.label}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <span className={`h-2 w-2 rounded-full ${profile.subscription_status === 'active' ? 'bg-green-400' : profile.subscription_status === 'trialing' ? 'bg-amber-400 animate-pulse' : 'bg-red-400'}`}></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {profile.subscription_status === 'active' ? 'Active Subscription' :
               profile.subscription_status === 'trialing' ? `Trial${trialEndsDate ? ` — ends ${trialEndsDate}` : ''}` :
               'Subscription Inactive'}
            </span>
          </div>
        </div>
      </section>

      {/* Stats Snapshot */}
      <section>
        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] mb-8">Pipeline Snapshot</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Jobs', value: stats.totalJobs },
            { label: 'Candidates', value: stats.activeCandidates },
            { label: 'Interviews', value: stats.sessionsBooked },
            { label: 'Hours Saved', value: `${Math.round(stats.timeSavedMinutes / 60)}h` },
          ].map((s, i) => (
            <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-2xl font-black text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Subscription / License */}
      <section>
        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] mb-8">Subscription</h3>
        <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2rem]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-sm font-black text-slate-900 uppercase mb-1">
                {planInfo.label} Plan — {planInfo.price}
              </p>
              <p className="text-xs text-slate-500 font-medium max-w-md">{planInfo.description}</p>
              {isTrialing && trialEndsDate && (
                <p className="text-xs text-amber-600 font-bold mt-2">
                  ⚠ Trial ends {trialEndsDate}. Enter your Gumroad Sale ID below to activate.
                </p>
              )}
            </div>
            <a
              href="https://gumroad.com"
              target="_blank"
              rel="noreferrer"
              className="shrink-0 px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              Manage on Gumroad →
            </a>
          </div>
        </div>
      </section>

      {/* Edit Profile Form */}
      <form onSubmit={handleUpdate} className="space-y-12">
        <div className="space-y-8">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Profile Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[9px] font-black uppercase text-slate-400 mb-2.5 tracking-widest">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
              />
            </div>
            <div>
              <label className="block text-[9px] font-black uppercase text-slate-400 mb-2.5 tracking-widest">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full bg-slate-100 border border-slate-100 rounded-xl px-5 py-4 text-xs font-bold text-slate-400 cursor-not-allowed"
              />
              <p className="text-[9px] text-slate-400 mt-1.5 font-medium">Email cannot be changed here.</p>
            </div>
          </div>
        </div>

        {/* Gumroad License */}
        <div className="space-y-8">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">License Activation</h3>
          <div>
            <label className="block text-[9px] font-black uppercase text-slate-400 mb-2.5 tracking-widest">Gumroad Sale ID</label>
            <input
              type="text"
              value={gumroadSaleId}
              onChange={e => setGumroadSaleId(e.target.value)}
              placeholder="e.g. GUMROAD-XXXX-XXXX"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all uppercase tracking-widest"
            />
            <p className="text-[9px] text-slate-400 mt-1.5 font-medium">
              Find your Sale ID in your Gumroad purchase confirmation email.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 text-white px-12 py-5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-2xl shadow-indigo-100 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {saveSuccess && (
            <span className="text-[10px] font-black uppercase tracking-widest text-green-600 flex items-center gap-2">
              <i className="fa-solid fa-check"></i> Saved
            </span>
          )}
        </div>
      </form>

      {/* Data Actions */}
      <section className="border-t border-slate-100 pt-12 space-y-8">
        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Data & Export</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={onExportCSV}
            className="px-8 py-4 border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-download text-xs"></i>
            Export Pipeline CSV
          </button>
          <button
            onClick={onClearDemo}
            className="px-8 py-4 border border-slate-200 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-arrows-rotate text-xs"></i>
            Refresh Data
          </button>
        </div>
      </section>
    </div>
  );
};

export default SettingsView;