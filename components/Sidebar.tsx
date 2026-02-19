import React from 'react';
import { Plan } from '../types';

interface SidebarProps {
  activeTab: 'dashboard' | 'jobs' | 'candidates' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'jobs' | 'candidates' | 'settings') => void;
  jobCount: number;
  plan: Plan; // ✅ Uses unified Plan type
  onLogout: () => void;
  dbConnected?: boolean;
}

const PLAN_BADGE: Record<Plan, { label: string; color: string }> = {
  starter: { label: 'Starter', color: 'text-slate-400 bg-slate-100' },
  pro: { label: 'Pro', color: 'text-indigo-600 bg-indigo-50' },
  agency: { label: 'Agency', color: 'text-purple-600 bg-purple-50' },
};

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, jobCount, plan, onLogout, dbConnected }) => {
  const menuItems = [
    { id: 'dashboard' as const, label: 'Ops Dashboard', icon: 'fa-gauge-high' },
    { id: 'jobs' as const, label: 'Hiring Reqs', icon: 'fa-briefcase' },
    { id: 'candidates' as const, label: 'Candidate Pipeline', icon: 'fa-user-group' },
    { id: 'settings' as const, label: 'Recruiter Config', icon: 'fa-cog' },
  ];

  const badge = PLAN_BADGE[plan] || PLAN_BADGE['starter'];

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-100 flex flex-col fixed h-screen z-20 overflow-hidden">
      <div className="p-8">
        {/* Logo */}
        <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-3 mb-10 w-full group">
          <div className="h-10 w-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all group-hover:scale-105 active:scale-95">
            <i className="fa-solid fa-bolt"></i>
          </div>
          <span className="text-lg font-black tracking-tighter uppercase text-slate-900">RecruiterOps</span>
        </button>

        {/* Plan Badge */}
        <div className="mb-8">
          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${badge.color}`}>
            {badge.label} Plan
          </span>
          {!dbConnected && (
            <span className="ml-2 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-amber-600 bg-amber-50">
              Demo
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-sm'
              }`}
            >
              <i className={`fa-solid ${item.icon} w-5 text-center text-xs`}></i>
              <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>
              {item.id === 'jobs' && jobCount > 0 && (
                <span className={`ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                  activeTab === item.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {jobCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="mt-auto p-8 space-y-4 border-t border-slate-100">
        {dbConnected && (
          <div className="flex items-center gap-2 px-4">
            <span className="h-1.5 w-1.5 bg-green-400 rounded-full"></span>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">DB Connected</span>
          </div>
        )}
        <button
          onClick={onLogout}
          className="w-full text-slate-400 hover:text-slate-900 flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white transition-all"
        >
          <i className="fa-solid fa-arrow-right-from-bracket text-xs"></i>
          <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;