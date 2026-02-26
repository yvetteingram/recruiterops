import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Job, Candidate, Profile, ActivityLog, CandidateStage } from './types';
import { supabase, isSupabaseConfigured } from './services/supabase';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import JobsView from './components/JobsView';
import CandidatesView from './components/CandidatesView';
import SettingsView from './components/SettingsView';
import AuthView from './components/AuthView';
import LandingView from './components/LandingView';

const DEMO_PROFILE: Profile = {
  id: 'demo-user',
  full_name: 'Solo Recruiter',
  email: 'hello@recruiterops.ai',
  plan: 'pro',
  subscription_status: 'active',
  trial_ends_at: null,
  gumroad_sale_id: null,
};

const MOCK_JOBS: Job[] = [
  {
    id: 'mock-job-1',
    title: 'Senior Product Manager',
    client: 'TechCorp Inc.',
    salary: '$120,000 - $150,000',
    location: 'New York / Hybrid',
    status: 'active',
    description: 'Leading product strategy for a B2B SaaS platform.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isDemo: true,
  },
  {
    id: 'mock-job-2',
    title: 'Head of Engineering',
    client: 'Boutique Search Partners',
    salary: '$180,000 - $220,000',
    location: 'Remote',
    status: 'active',
    description: 'Leading a team of 12 engineers in a scale-up environment.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isDemo: true,
  },
];

const MOCK_CANDIDATES: Candidate[] = [
  {
    id: 'mock-c-1',
    jobId: 'mock-job-1',
    name: 'Sarah Johnson',
    title: 'Product Manager',
    company: 'Acme Corp',
    linkedInUrl: '',
    email: 'sarah@example.com',
    stage: CandidateStage.SCREENED,
    lastActivityAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isDemo: true,
  },
  {
    id: 'mock-c-2',
    jobId: 'mock-job-2',
    name: 'David Chen',
    title: 'VP Engineering',
    company: 'StartupXYZ',
    linkedInUrl: '',
    email: 'david@example.com',
    stage: CandidateStage.INTERVIEWING,
    lastActivityAt: new Date().toISOString(),
    isDemo: true,
  },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'jobs' | 'candidates' | 'settings'>('dashboard');
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isAddingJob, setIsAddingJob] = useState(false);

  const initialFetchDone = useRef(false);
  const configured = isSupabaseConfigured();

  const addLog = useCallback((event: string, details: string, type: 'ai' | 'system' | 'user' = 'system') => {
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      event,
      details,
      type,
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    if (supabase && configured) {
      try { await supabase.auth.signOut(); } catch (e) { console.error("Logout error", e); }
    }
    setSession(null);
    setProfile(null);
    setJobs([]);
    setCandidates([]);
    setDemoMode(false);
    setShowAuth(false);
    initialFetchDone.current = false;
    setLoading(false);
    setActiveTab('dashboard');
  };

  const handleExportCSV = useCallback(() => {
    if (!candidates.length) { alert("No candidate data to export."); return; }
    const headers = ["Name", "Title", "Company", "Stage", "Last Activity"];
    const rows = candidates.map(c => [
      `"${c.name}"`, `"${c.title}"`, `"${c.company}"`,
      `"${c.stage}"`, `"${c.lastActivityAt || ''}"`
    ]);
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `RecruiterOps_candidates_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    addLog("Pipeline Exported", "Candidate data exported to CSV.", "user");
  }, [candidates, addLog]);

  const fetchData = useCallback(async (force = false) => {
    if (!configured && !demoMode) { setLoading(false); return; }

    if (demoMode) {
      setJobs(MOCK_JOBS);
      setCandidates(MOCK_CANDIDATES);
      setProfile(DEMO_PROFILE);
      setLoading(false);
      return;
    }

    if (initialFetchDone.current && !force) return;
    setLoading(true);

    try {
      if (!supabase || !configured) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, email, full_name, plan, subscription_status, trial_ends_at, gumroad_sale_id')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile({
          id: profileData.id,
          email: profileData.email || user.email || '',
          full_name: profileData.full_name || '',
          plan: profileData.plan || 'starter',
          subscription_status: profileData.subscription_status || 'active',
          trial_ends_at: profileData.trial_ends_at || null,
          gumroad_sale_id: profileData.gumroad_sale_id || null,
          
        });
      }

      const { data: jobsData } = await supabase
        .from('jobs').select('*').order('created_at', { ascending: false });
      const { data: candidatesData } = await supabase
        .from('candidates').select('*').order('created_at', { ascending: false });

      if (jobsData) {
        setJobs(jobsData.map((j: any) => ({
          id: j.id, title: j.title, client: j.client,
          salary: j.salary, location: j.location,
          status: j.status, description: j.description,
          createdAt: j.created_at,
          contactName: j.contact_name || '',
          contactEmail: j.contact_email || '',
        })));
      }

      if (candidatesData) {
        setCandidates(candidatesData.map((c: any) => ({
          id: c.id, jobId: c.job_id, name: c.name,
          title: c.title, company: c.company,
          linkedInUrl: c.linkedin_url || '',
          email: c.email, phoneNumber: c.phone,
          stage: c.stage, outreachDraft: c.outreach_draft,
          matchScore: c.match_score, aiAnalysis: c.ai_analysis,
          lastActivityAt: c.last_activity_at,
          notes: c.notes,
          placed_at: c.placed_at,
          placement_fee: c.placement_fee,
          placement_type: c.placement_type || 'full_time',
          fee_clears_at: c.fee_clears_at,
        })));
      }

      initialFetchDone.current = true;
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [configured, demoMode]);

  useEffect(() => {
    if (!configured || !supabase || !supabase.auth) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setLoading(false);
    }).catch(e => { console.error("Session error", e); setLoading(false); });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session && !demoMode) {
        setLoading(false);
        initialFetchDone.current = false;
        setProfile(null); setJobs([]); setCandidates([]);
      }
    });
    return () => { if (subscription) subscription.unsubscribe(); };
  }, [configured, demoMode]);

  useEffect(() => {
    if ((session && configured) || demoMode) fetchData();
  }, [session, configured, demoMode, fetchData]);

  const isExpired = profile &&
    profile.subscription_status !== 'active' &&
    !(profile.subscription_status === 'trialing' && profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date());

  if (loading && !jobs.length) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="h-12 w-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );

  if (!session && !demoMode) {
    if (showAuth) {
      return (
        <AuthView
          onAuthSuccess={() => { setShowAuth(false); fetchData(true); }}
          onDemoLogin={() => { setDemoMode(true); setShowAuth(false); }}
          onBack={() => setShowAuth(false)}
        />
      );
    }
    return <LandingView onGetStarted={() => setShowAuth(true)} onDemoMode={() => setDemoMode(true)} />;
  }

  const STALL_DAYS = 3;
  const stalledCandidates = candidates.filter(c => {
    if (c.stage === CandidateStage.PLACED || c.stage === CandidateStage.PRESENTED || c.stage === CandidateStage.REJECTED) return false;
    if (!c.lastActivityAt) return true;
    const daysSince = (Date.now() - new Date(c.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= STALL_DAYS;
  });
  const stalledCount = stalledCandidates.length;

  const GUARANTEE_DAYS = 90;
  const placedCandidates = candidates.filter(c => c.stage === CandidateStage.PLACED);
  const confirmedFees = placedCandidates
    .filter(c => {
      if (c.placement_type === 'contract') return true;
      if (!c.fee_clears_at) return false;
      return new Date(c.fee_clears_at) <= new Date();
    })
    .reduce((sum, c) => sum + (c.placement_fee || 0), 0);
  const pendingFees = placedCandidates
    .filter(c => {
      if (c.placement_type === 'contract') return false;
      if (!c.fee_clears_at) return true;
      return new Date(c.fee_clears_at) > new Date();
    })
    .reduce((sum, c) => sum + (c.placement_fee || 0), 0);
  const totalFees = confirmedFees + pendingFees;

  const stats = {
    totalJobs: jobs.length,
    activeCandidates: candidates.length,
    sessionsBooked: candidates.filter(c => c.stage === CandidateStage.INTERVIEWING).length,
    placements: placedCandidates.length,
    totalFees,
    confirmedFees,
    pendingFees,
    timeSavedMinutes: candidates.length * 20,
    stalledItemsCount: stalledCount,
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900">
      {isExpired && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-12 max-w-lg text-center border border-slate-100">
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Subscription Required</h2>
            <p className="text-slate-500 mb-8 font-medium">
              Your RecruiterOps subscription is inactive. Please update your subscription to continue.
            </p>
            <button
              onClick={() => setActiveTab('settings')}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all mb-4 shadow-xl active:scale-[0.98]"
            >
              Update Subscription
            </button>
            <button onClick={handleLogout} className="text-sm font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      )}

      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => { setActiveTab(tab); if (tab !== 'candidates') setSelectedJobId(null); }}
        jobCount={jobs.length}
        stalledCount={stalledCount}
        onLogout={handleLogout}
        dbConnected={configured}
      />

      <main className={`flex-1 p-10 ml-64 overflow-y-auto ${isExpired && activeTab !== 'settings' ? 'pointer-events-none grayscale' : ''}`}>
        <header className="flex justify-between items-center mb-12">
          <div>
            {/* ✅ Updated header verbiage */}
            <h1 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Recruiting Operations</h1>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Recruiter Desk</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end mr-4">
              <span className="text-xs font-black text-slate-900 uppercase">1 Placement / mo</span>
              <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Placement Target</span>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="h-14 w-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-900 font-black shadow-sm transition-all hover:bg-slate-50 active:scale-95"
            >
              {(profile?.full_name || 'R').charAt(0).toUpperCase()}
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <Dashboard stats={stats} jobs={jobs} candidates={candidates} logs={logs} onStartNewSearch={() => setActiveTab('jobs')} />
        )}
        {activeTab === 'jobs' && (
          <JobsView
            jobs={jobs}
            onAddJob={(j) => setJobs(p => [j, ...p])}
            onUpdateJob={(j) => setJobs(p => p.map(x => x.id === j.id ? j : x))}
            onDeleteJob={(id) => setJobs(p => p.filter(x => x.id !== id))}
            onManageCandidates={(id) => { setSelectedJobId(id); setActiveTab('candidates'); }}
            isForcingAdd={isAddingJob}
            onAddComplete={() => setIsAddingJob(false)}
          />
        )}
        {activeTab === 'candidates' && (
          <CandidatesView
            candidates={candidates}
            jobs={jobs}
            profile={profile}
            onUpdateCandidate={(c) => {
              setCandidates(p => p.map(x => x.id === c.id ? c : x));
              // Auto-mark job as filled when candidate is placed
              if (c.stage === CandidateStage.PLACED && c.jobId) {
                setJobs(p => p.map(j => j.id === c.jobId ? { ...j, status: 'filled' } : j));
                if (supabase && !c.isDemo) {
                  supabase.from('jobs').update({ status: 'filled' }).eq('id', c.jobId);
                }
              }
            }}
            onAddCandidate={(c) => setCandidates(p => [c, ...p])}
            onLog={addLog}
            filterJobId={selectedJobId}
            onClearFilter={() => setSelectedJobId(null)}
          />
        )}
        {activeTab === 'settings' && profile && (
          <SettingsView
            profile={profile}
            stats={stats}
            jobs={jobs}
            onUpdateProfile={(updates) => setProfile(prev => prev ? { ...prev, ...updates } : null)}
            onClearDemo={() => fetchData(true)}
            onExportCSV={handleExportCSV}
          />
        )}
      </main>
    </div>
  );
};

export default App;