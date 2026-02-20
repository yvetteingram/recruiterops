import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Profile, Stats, Job } from '../types';

interface SettingsViewProps {
  profile: Profile;
  stats: Stats;
  jobs: Job[];
  onUpdateProfile: (updates: Partial<Profile>) => void;
  onClearDemo: () => void;
  onExportCSV: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  profile, stats, jobs, onUpdateProfile, onClearDemo, onExportCSV
}) => {
  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: profile.full_name || '',
    webhookOutreach: '',
    webhookCalendar: '',
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (supabase) {
        await supabase.from('profiles').update({
          full_name: profileForm.fullName,
        }).eq('id', profile.id);
      }
      onUpdateProfile({ full_name: profileForm.fullName });
      alert("Settings saved.");
    } catch (err) {
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const isActive = profile.subscription_status === 'active' ||
    (profile.subscription_status === 'trialing' && profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date());

  return (
    <div className="max-w-4xl space-y-12 pb-24">

      {/* Profile Header */}
      <section className="bg-slate-900 p-12 rounded-[2.5rem] flex flex-col md:flex-row gap-10 items-center text-white border border-white/5 shadow-2xl">
        <div className="h-24 w-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black uppercase shadow-2xl">
          {(profileForm.fullName || profile.email || 'R').charAt(0).toUpperCase()}
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
            {profileForm.fullName || 'Recruiter'}
          </h2>
          <p className="text-xs text-indigo-400 font-black uppercase tracking-widest">{profile.email}</p>
        </div>
      </section>

      {/* Subscription Status */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Subscription</h3>
        <div className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-green-400' : 'bg-red-400'}`}></span>
                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                  RecruiterOps Pro — $49/mo
                </p>
              </div>
              <p className="text-xs text-slate-500 font-medium ml-5">
                {isActive ? 'Your subscription is active.' : 'Your subscription is inactive.'}
              </p>
              {profile.gumroad_sale_id && (
                <p className="text-[10px] text-slate-400 font-bold ml-5 mt-1">
                  Sale ID: {profile.gumroad_sale_id}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-3 items-end">
              {!isActive && (
                <a
                  href="https://ketorahdigital.gumroad.com/l/kjsurs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all"
                >
                  Reactivate Subscription
                </a>
              )}
              <a
                href="https://app.gumroad.com/subscriptions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-slate-400 hover:text-red-500 font-black uppercase tracking-widest transition-colors"
              >
                Manage or Cancel Subscription →
              </a>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-50">
            <p className="text-[10px] text-slate-400 leading-relaxed">
              To cancel your subscription, click "Manage or Cancel Subscription" above. 
              You will be taken to your Gumroad account where you can manage your billing. 
              Your access remains active until the end of your current billing period.
            </p>
          </div>
        </div>
      </section>

      {/* Account Settings */}
      <form onSubmit={handleUpdate} className="space-y-12">
        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Account</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[9px] font-black uppercase text-slate-400 mb-2.5 tracking-widest">Full Name</label>
              <input
                type="text"
                value={profileForm.fullName}
                onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
              />
            </div>
            <div>
              <label className="block text-[9px] font-black uppercase text-slate-400 mb-2.5 tracking-widest">Email</label>
              <input
                type="text"
                value={profile.email}
                disabled
                className="w-full bg-slate-100 border border-slate-100 rounded-xl px-5 py-4 text-xs font-bold text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Make.com Webhooks */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Automation Webhooks (Make.com)</h3>
          <p className="text-xs text-slate-500">Connect your Make.com scenarios to enable automated follow-ups and calendar scheduling.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[9px] font-black uppercase text-slate-400 mb-2.5 tracking-widest">Follow-Up Outreach Webhook</label>
              <input
                type="url"
                value={profileForm.webhookOutreach}
                onChange={e => setProfileForm({ ...profileForm, webhookOutreach: e.target.value })}
                placeholder="https://hook.make.com/..."
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-[10px] font-medium transition-all focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-[9px] font-black uppercase text-slate-400 mb-2.5 tracking-widest">Calendar Scheduling Webhook</label>
              <input
                type="url"
                value={profileForm.webhookCalendar}
                onChange={e => setProfileForm({ ...profileForm, webhookCalendar: e.target.value })}
                placeholder="https://hook.make.com/..."
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-[10px] font-medium transition-all focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-indigo-600 text-white px-12 py-5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-2xl shadow-indigo-100"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>

      {/* Data & Export */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Data</h3>
        <div className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <p className="text-sm font-black text-slate-900 uppercase mb-1">Export Pipeline</p>
            <p className="text-xs text-slate-500">Download all your candidate data as a CSV file.</p>
          </div>
          <button
            onClick={onExportCSV}
            className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            Export CSV
          </button>
        </div>
      </section>

    </div>
  );
};

export default SettingsView;