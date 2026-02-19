import React, { useState, useEffect } from 'react';
import { Stats, Job, Candidate, ActivityLog, CandidateStage } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getDailySummary, detectStalledCandidates } from '../services/gemini';

interface DashboardProps {
  stats: Stats;
  jobs: Job[];
  candidates: Candidate[];
  logs: ActivityLog[];
  onStartNewSearch?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, jobs, candidates, logs, onStartNewSearch }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [stalledCandidates, setStalledCandidates] = useState<any[]>([]);

  useEffect(() => {
    const fetchAILogic = async () => {
      setLoadingSummary(true);
      const [aiSummary, stalled] = await Promise.all([
        getDailySummary(jobs, candidates),
        detectStalledCandidates(candidates)
      ]);
      setSummary(aiSummary);
      setStalledCandidates(stalled);
      setLoadingSummary(false);
    };
    if (jobs.length > 0) fetchAILogic();
  }, [jobs, candidates]);
  
  const funnelData = [
    { name: 'Sourced', value: candidates.filter(c => c.stage === CandidateStage.SOURCED).length },
    { name: 'Screened', value: candidates.filter(c => c.stage === CandidateStage.SCREENED).length },
    { name: 'Interviews', value: candidates.filter(c => c.stage === CandidateStage.INTERVIEWING).length },
    { name: 'Presented', value: candidates.filter(c => c.stage === CandidateStage.PRESENTED).length },
  ];

  const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Active Reqs', value: stats.totalJobs, icon: 'fa-briefcase', color: 'bg-blue-50 text-blue-600' },
          { label: 'Pipeline Load', value: stats.activeCandidates, icon: 'fa-user-group', color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Velocity Highs', value: stats.sessionsBooked, icon: 'fa-gauge-high', color: 'bg-green-50 text-green-600' },
          { label: 'Admin Hours Saved', value: `${Math.round(stats.timeSavedMinutes / 60)}h`, icon: 'fa-clock', color: 'bg-amber-50 text-amber-600' },
          { label: 'Stalled Items', value: stalledCandidates.length, icon: 'fa-circle-exclamation', color: stalledCandidates.length > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">{stat.value}</h3>
            </div>
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.color} text-sm`}>
              <i className={`fa-solid ${stat.icon}`}></i>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Briefing Card */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <i className="fa-solid fa-bolt text-[8rem]"></i>
             </div>
             <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xl font-black uppercase tracking-tighter text-indigo-400">Daily Pipeline Summary</h3>
                   {loadingSummary && <i className="fa-solid fa-spinner fa-spin text-indigo-400"></i>}
                </div>
                <div className="prose prose-invert prose-sm max-w-none text-slate-300 font-medium leading-relaxed">
                   {summary ? (
                     <div className="whitespace-pre-wrap">{summary}</div>
                   ) : (
                     <p className="italic text-slate-500">Generating your morning Ops briefing...</p>
                   )}
                </div>
                <div className="mt-8 pt-6 border-t border-white/10 flex gap-4">
                   <button onClick={onStartNewSearch} className="bg-indigo-600 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95">Open New Requisition</button>
                   <button className="bg-white/10 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95">View Full Analytics</button>
                </div>
             </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8">Pipeline Throughput</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {funnelData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-6">Stalled Items ({stalledCandidates.length})</h3>
            <div className="space-y-4">
              {stalledCandidates.length > 0 ? stalledCandidates.map((s, i) => {
                const candidate = candidates.find(c => c.id === s.id);
                return (
                  <div key={i} className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                    <p className="text-xs font-black text-slate-900 uppercase mb-1">{candidate?.name || 'Unknown'}</p>
                    <p className="text-[10px] text-red-600 font-bold mb-2">{s.reason}</p>
                    <button className="text-[9px] font-black uppercase tracking-widest text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
                      {s.suggestedAction}
                    </button>
                  </div>
                );
              }) : (
                <div className="text-center py-10">
                   <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Pipeline moving at peak velocity.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg shadow-indigo-100">
            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2">Ops Assistant Status</p>
            <div className="flex items-center gap-2 mb-4">
               <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></span>
               <p className="text-xs font-bold text-white">Monitoring Activity</p>
            </div>
            <p className="text-[10px] text-indigo-100 leading-relaxed mb-4">Scanning your email and pipeline for bottlenecks. Automated scheduling is active.</p>
            <button className="w-full py-2 bg-white/20 text-white rounded-lg text-[10px] font-bold hover:bg-white/30 transition-colors uppercase tracking-widest">Adjust Scheduler Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;