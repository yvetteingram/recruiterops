import React from 'react';

interface SidebarProps {
  activeTab: 'dashboard' | 'jobs' | 'candidates' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'jobs' | 'candidates' | 'settings') => void;
  jobCount: number;
  plan: 'starter' | 'professional' | 'pro_plus';
  onLogout: () => void;
  dbConnected?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, jobCount, plan, onLogout, dbConnected }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Ops Dashboard', icon: 'fa-gauge-high' },
    { id: 'jobs', label: 'Hiring Reqs', icon: 'fa-briefcase' },
    { id: 'candidates', label: 'Candidate Pipeline', icon: 'fa-user-group' },
    { id: 'settings', label: 'Recruiter Config', icon: 'fa-cog' },
  ] as const;

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-100 flex flex-col fixed h-screen z-20 overflow-hidden">
      <div className="p-10">
        <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-3 mb-16 w-full group">
          <div className="h-10 w-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all group-hover:scale-105 active:scale-95">
            <i className="fa-solid fa-bolt"></i>
          </div>
          <span className="text-lg font-black tracking-tighter uppercase text-slate-900">RecruiterOps</span>
        </button>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-slate-900 text-white shadow-xl'
                  : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              <i className={`fa-solid ${item.icon} w-5 text-center text-xs`}></i>
              <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-10 space-y-6">
        <button onClick={onLogout} className="w-full text-slate-400 hover:text-slate-900 flex items-center gap-3 px-5 py-2 transition-colors active:scale-95">
          <i className="fa-solid fa-arrow-right-from-bracket text-xs"></i>
          <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;