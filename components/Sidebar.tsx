import React from 'react';

interface SidebarProps {
  activeTab: 'dashboard' | 'jobs' | 'candidates' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'jobs' | 'candidates' | 'settings') => void;
  jobCount: number;
  stalledCount?: number;
  onLogout: () => void;
  dbConnected?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, jobCount, stalledCount = 0, onLogout, dbConnected }) => {
  const menuItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: 'fa-gauge-high' },
    { id: 'jobs' as const, label: 'Job Orders', icon: 'fa-briefcase' },
    { id: 'candidates' as const, label: 'Candidates', icon: 'fa-user-group' },
    { id: 'settings' as const, label: 'Settings', icon: 'fa-cog' },
  ];

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-100 flex flex-col fixed h-screen z-20 overflow-hidden">
      <div className="p-8">
        <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-3 mb-10 w-full group">
          <div className="h-10 w-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all group-hover:scale-105 active:scale-95">
            <i className="fa-solid fa-bolt"></i>
          </div>
          <span className="text-lg font-black tracking-tighter uppercase text-slate-900">RecruiterOps</span>
        </button>

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
              {item.id === 'candidates' && stalledCount > 0 && (
                <span className={`ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                  activeTab === item.id ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600'
                }`}>
                  {stalledCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-8 space-y-4 border-t border-slate-100">
        {dbConnected && (
          <div className="flex items-center gap-2 px-4">
            <span className="h-1.5 w-1.5 bg-green-400 rounded-full"></span>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Connected</span>
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