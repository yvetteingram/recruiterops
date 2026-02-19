import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Job, Candidate, Profile, ActivityLog, CandidateStage } from './types';
import { supabase, isSupabaseConfigured } from './services/supabase';
import { MOCK_JOBS, MOCK_CANDIDATES } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import JobsView from './components/JobsView';
import CandidatesView from './components/CandidatesView';
import SettingsView from './components/SettingsView';
import AuthView from './components/AuthView';
import LandingView from './components/LandingView';

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
      type
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    if (supabase && configured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error("Logout error", e);
      }
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
    if (!candidates.length) {
      alert("No candidate data to export.");
      return;
    }
    const headers = ["Name", "Title", "Company", "Stage", "Last Activity"];
    const rows = candidates.map(c => [
      `"${c.name}"`,
      `"${c.title}"`,
      `"${c.company}"`,
      `"${c.stage}"`,
      `"${c.lastActivityAt || ''}"`
    ]);
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `RecruiterOps_pipeline_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    addLog("Pipeline Exported", "Candidate data has been extracted to CSV for offline analysis.", "user");
  }, [candidates, addLog]);

  const fetchData = useCallback(async (force = false) => {
    if (!configured && !demoMode) { setLoading(false); return; }
    
    if (demoMode) {
      setJobs(MOCK_JOBS);
      setCandidates(MOCK_CANDIDATES);
      setProfile({
        id: 'demo-user',
        fullName: 'Solo Recruiter',
        email: 'hello@recruiterops.ai',
        companyName: 'Boutique Search Partners',
        role: 'Founder & Principal',
        hasCompletedOnboarding: true,
        plan: 'starter',
        subscriptionStatus: 'active',
        webhookOutreach: process.env.MAKE_WEBHOOK_OUTREACH,
        webhookCalendar: undefined
      });
      setLoading(false);
      return;
    }

    if (initialFetchDone.current && !force) return;
    setLoading(true);
    try {
      if (!supabase || !configured) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profileData) {
        setProfile({
          id: profileData.id,
          fullName: profileData.full_name,
          email: user.email || '',
          companyName: profileData.company_name,
          role: profileData.role,
          hasCompletedOnboarding: profileData.has_completed_onboarding,
          plan: profileData.plan,
          subscriptionStatus: profileData.subscription_status,
          aiPersona: profileData.ai_persona,
          webhookOutreach: profileData.webhook_outreach || process.env.MAKE_WEBHOOK_OUTREACH,
          webhookCalendar: profileData.webhook_calendar,
          licenseKey: profileData.license_key
        });
      }
      const { data: jobsData } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
      const { data: candidatesData } = await supabase.from('candidates').select('*').order('created_at', { ascending: false });
      if (jobsData) setJobs(jobsData.map((j: any) => ({ ...j, jobId: j.id, createdAt: j.created_at, isDemo: j.is_demo })) as Job[]);
      if (candidatesData) setCandidates(candidatesData.map((c: any) => ({ ...c, jobId: c.job_id, linkedInUrl: c.linkedIn_url, outreachDraft: c.outreach_draft, isDemo: c.is_demo, phoneNumber: c.phoneNumber, lastActivityAt: c.last_activity_at })) as Candidate[]);
      initialFetchDone.current = true;
    } catch (error) {
      console.error("Error fetching talent data:", error);
    } finally {
      setLoading(false);
    }
  }, [configured, demoMode]);

  useEffect(() => {
    if (!configured || !supabase || !supabase.auth) { 
      setLoading(false); 
      return; 
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setLoading(false);
    }).catch(e => {
      console.error("Session protocol error", e);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session && !demoMode) {
        setLoading(false);
        initialFetchDone.current = false;
        setProfile(null);
        setJobs([]);
        setCandidates([]);
      }
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [configured, demoMode]);

  useEffect(() => {
    if ((session && configured) || demoMode) fetchData();
  }, [session, configured, demoMode, fetchData]);

  // Strict check: Only 'active' subscribers get in.
  const isExpired = profile && profile.subscriptionStatus !== 'active';

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

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900">
      {isExpired && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-12 max-w-lg text-center border border-slate-100">
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Subscription Required</h2>
            <p className="text-slate-500 mb-8 font-medium">RecruiterOps access is restricted to active paid members. Please verify your professional license key to enter the workspace.</p>
            <button 
              onClick={() => setActiveTab('settings')}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all mb-4 shadow-xl active:scale-[0.98]"
            >
              Update Subscription
            </button>
            <button onClick={handleLogout} className="text-sm font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Sign Out</button>
          </div>
        </div>
      )}

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => { setActiveTab(tab); if (tab !== 'candidates') setSelectedJobId(null); }} 
        jobCount={jobs.length} 
        plan={profile?.plan || 'starter'} 
        onLogout={handleLogout}
        dbConnected={configured}
      />

      <main className={`flex-1 p-10 ml-64 overflow-y-auto ${isExpired && activeTab !== 'settings' ? 'pointer-events-none grayscale' : ''}`}>
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Execution Accelerator</h1>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Ops Desk</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end mr-4">
              <span className="text-xs font-black text-slate-900 uppercase">1 Placement / mo</span>
              <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Velocity Target</span>
            </div>
            <button onClick={() => setActiveTab('settings')} className="h-14 w-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-900 font-black shadow-sm transition-all hover:bg-slate-50 active:scale-95">
              {(profile?.fullName || 'R').charAt(0).toUpperCase()}
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' && <Dashboard stats={{totalJobs: jobs.length, activeCandidates: candidates.length, sessionsBooked: candidates.filter(c => c.stage === CandidateStage.INTERVIEWING).length, placements: candidates.filter(c => c.stage === CandidateStage.PRESENTED).length, timeSavedMinutes: candidates.length * 20, stalledItemsCount: 0}} jobs={jobs} candidates={candidates} logs={logs} onStartNewSearch={() => setActiveTab('jobs')} />}
        {activeTab === 'jobs' && <JobsView jobs={jobs} onAddJob={(j) => setJobs(p => [j, ...p])} onUpdateJob={(j) => setJobs(p => p.map(x => x.id === j.id ? j : x))} onDeleteJob={(id) => setJobs(p => p.filter(x => x.id !== id))} plan={profile?.plan || 'starter'} onManageCandidates={(id) => { setSelectedJobId(id); setActiveTab('candidates'); }} isForcingAdd={isAddingJob} onAddComplete={() => setIsAddingJob(false)} />}
        {activeTab === 'candidates' && <CandidatesView candidates={candidates} jobs={jobs} profile={profile} onUpdateCandidate={(c) => setCandidates(p => p.map(x => x.id === c.id ? c : x))} onAddCandidate={(c) => setCandidates(p => [c, ...p])} onLog={addLog} filterJobId={selectedJobId} onClearFilter={() => setSelectedJobId(null)} />}
        {activeTab === 'settings' && profile && <SettingsView profile={profile} stats={{totalJobs: jobs.length, activeCandidates: candidates.length, sessionsBooked: candidates.filter(c => c.stage === CandidateStage.INTERVIEWING).length, placements: candidates.filter(c => c.stage === CandidateStage.PRESENTED).length, timeSavedMinutes: candidates.length * 20, stalledItemsCount: 0}} jobs={jobs} activePlan={profile.plan} onPlanChange={(p) => setProfile(prev => prev ? {...prev, plan: p} : null)} onUpdateProfile={(p) => setProfile(prev => prev ? {...prev, ...p} : null)} onClearDemo={() => fetchData(true)} onExportCSV={handleExportCSV} />}
      </main>
    </div>
  );
};

export default App;