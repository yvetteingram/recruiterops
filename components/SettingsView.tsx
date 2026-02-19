import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Profile, Stats, Job } from '../types';

interface SettingsViewProps {
  profile: Profile;
  stats: Stats;
  jobs: Job[];
  activePlan: 'starter' | 'professional' | 'pro_plus';
  onPlanChange: (plan: 'starter' | 'professional' | 'pro_plus') => void;
  onUpdateProfile: (updates: Partial<Profile>) => void;
  onClearDemo: () => void;
  onExportCSV: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ profile, stats, jobs, activePlan, onPlanChange, onUpdateProfile, onClearDemo, onExportCSV }) => {
  const [saving, setSaving] = useState(false);
  const [licenseKey, setLicenseKey] = useState(profile.licenseKey || '');
  const [profileForm, setProfileForm] = useState({ 
    fullName: profile.fullName || '', 
    companyName: profile.companyName || '', 
    role: profile.role || '',
    webhookOutreach: profile.webhookOutreach || '',
    webhookCalendar: profile.webhookCalendar || ''
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (supabase) {
        await supabase.from('profiles').update({ 
          full_name: profileForm.fullName, 
          company_name: profileForm.companyName, 
          role: profileForm.role,
          license_key: licenseKey,
          webhook_outreach: profileForm.webhookOutreach,
          webhook_calendar: profileForm.webhookCalendar
        }).eq('id', profile.id);
      }
      onUpdateProfile({ 
        fullName: profileForm.fullName,
        companyName: profileForm.companyName,
        role: profileForm.role,
        licenseKey: licenseKey,
        webhookOutreach: profileForm.webhookOutreach,
        webhookCalendar: profileForm.webhookCalendar
      });
      alert("RecruiterOps configuration updated.");
    } catch (err) { 
      alert("Configuration sync failed."); 
    }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-4xl space-y-16 pb-24">
      <section className="bg-slate-900 p-12 rounded-[2.5rem] flex flex-col md:flex-row gap-10 items-center text-white border border-white/5 shadow-2xl">
        <div className="h-24 w-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black uppercase shadow-2xl">
           <i className="fa-solid fa-bolt"></i>
        </div>
        <div className="text-center md:text-left">
           <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">{profileForm.fullName || 'Ops Manager'}</h2>
           <p className="text-xs text-indigo-400 font-black uppercase tracking-widest">{profile.email} • RecruiterOps Solo Accelerator</p>
        </div>
      </section>

      <form onSubmit={handleUpdate} className="space-y-12">
        <div className="space-y-8">
           <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Subscription License</h3>
           <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex-1">
                 <p className="text-sm font-black text-slate-900 uppercase mb-2">Solo Professional — $49/mo</p>
                 <p className="text-xs text-slate-500 font-medium">Verify your Gumroad subscription by entering your license key below.</p>
              </div>
              <div className="w-full md:w-64">
                 <input 
                    type="text" 
                    value={licenseKey} 
                    onChange={e => setLicenseKey(e.target.value)} 
                    placeholder="GUMROAD-XXXX-XXXX"
                    className="w-full bg-white border border-indigo-200 rounded-xl px-5 py-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all uppercase"
                 />
              </div>
           </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Recruiter Identity</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <label className="block text-[9px] font-black uppercase text-slate-400 mb-2.5 tracking-widest">Full Name</label>
              <input type="text" value={profileForm.fullName} onChange={e => setProfileForm({...profileForm, fullName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-slate-900 uppercase transition-all"/>
            </div>
            <div>
              <label className="block text-[9px] font-black uppercase text-slate-400 mb-2.5 tracking-widest">Role</label>
              <input type="text" value={profileForm.role} onChange={e => setProfileForm({...profileForm, role: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-slate-900 uppercase transition-all"/>
            </div>
            <div>
              <label className="block text-[9px] font-black uppercase text-slate-400 mb-2.5 tracking-widest">Agency Name</label>
              <input type="text" value={profileForm.companyName} onChange={e => setProfileForm({...profileForm, companyName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-slate-900 uppercase transition-all"/>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Accelerator Webhooks (Make.com)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[9px] font-black uppercase text-slate-400 mb-2.5 tracking-widest">Auto-Follow-Up Trigger</label>
              <input type="url" value={profileForm.webhookOutreach} onChange={e => setProfileForm({...profileForm, webhookOutreach: e.target.value})} placeholder="https://hook.make.com/..." className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-[10px] font-medium transition-all"/>
            </div>
            <div>
              <label className="block text-[9px] font-black uppercase text-slate-400 mb-2.5 tracking-widest">Calendar Ops Sync</label>
              <input type="url" value={profileForm.webhookCalendar} onChange={e => setProfileForm({...profileForm, webhookCalendar: e.target.value})} placeholder="https://hook.make.com/..." className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-[10px] font-medium transition-all"/>
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-12 py-5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-2xl shadow-indigo-100">
          {saving ? 'Saving...' : 'Save RecruiterOps Config'}
        </button>
      </form>
    </div>
  );
};

export default SettingsView;