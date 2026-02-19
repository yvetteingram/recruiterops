import React, { useState } from 'react';
import { Candidate, Job, CandidateStage, Profile } from '../types';
import { generateOutreach, coordinateInterview } from '../services/gemini';
import { supabase } from '../services/supabase';

interface CandidatesViewProps {
  candidates: Candidate[];
  jobs: Job[];
  profile: Profile | null;
  onUpdateCandidate: (updated: Candidate) => void;
  onAddCandidate: (newCandidate: Candidate) => void;
  onLog?: (event: string, details: string, type: 'ai' | 'system' | 'user') => void;
  filterJobId?: string | null;
  onClearFilter?: () => void;
}

const CandidatesView: React.FC<CandidatesViewProps> = ({ candidates, jobs, profile, onUpdateCandidate, onAddCandidate, onLog, filterJobId, onClearFilter }) => {
  const [isScheduling, setIsScheduling] = useState<string | null>(null);
  const [isDrafting, setIsDrafting] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState<{ candidate: Candidate, invite: any } | null>(null);

  const [newCandidateForm, setNewCandidateForm] = useState({ name: '', title: '', company: '', jobId: filterJobId || '', linkedInUrl: '', email: '', phoneNumber: '' });

  const displayedCandidates = filterJobId ? candidates.filter(c => c.jobId === filterJobId) : candidates;

  const triggerWebhook = async (url: string | undefined, data: any) => {
    if (!url) return;
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      onLog?.("CRM Sync Triggered", `Operational data successfully pushed to external endpoint.`, "system");
    } catch (e) {
      console.error("Webhook failure:", e);
    }
  };

  const handleDraftOutreach = async (candidate: Candidate) => {
    setIsDrafting(candidate.id);
    const job = jobs.find(j => j.id === candidate.jobId);
    if (!job) return;
    
    const outreach = await generateOutreach(candidate.name, candidate.title + ' at ' + candidate.company, job.title, profile?.aiPersona);
    if (outreach) {
      const updated = { ...candidate, outreachDraft: outreach };
      if (supabase && !candidate.isDemo) await supabase.from('candidates').update({ outreach_draft: outreach }).eq('id', candidate.id);
      onUpdateCandidate(updated);
      onLog?.("Follow-up Drafted", `AI Agent prepared a nudge for ${candidate.name}.`, "ai");
      
      if (profile?.webhookOutreach) {
        triggerWebhook(profile.webhookOutreach, { event: 'outreach_drafted', candidate: updated });
      }
    }
    setIsDrafting(null);
  };

  const handleScheduleInterview = async (candidate: Candidate) => {
    setIsScheduling(candidate.id);
    const job = jobs.find(j => j.id === candidate.jobId);
    if (!job) return;

    const invite = await coordinateInterview(
      candidate.name, 
      candidate.email || 'not-provided@email.com', 
      candidate.phoneNumber || 'not-provided', 
      job.title, 
      profile?.fullName || 'Senior Recruiter'
    );

    if (invite) {
      setShowScheduleModal({ candidate, invite });
      onLog?.("Interview Coordination Initialized", `Agent formulated scheduling parameters for ${candidate.name}.`, "ai");
    }
    setIsScheduling(null);
  };

  const finalizeSchedule = async () => {
    if (!showScheduleModal) return;
    const { candidate, invite } = showScheduleModal;
    
    onLog?.("Dispatching Invite", `Calendar coordination request sent for ${candidate.name}.`, "user");
    
    if (profile?.webhookCalendar) {
      await triggerWebhook(profile.webhookCalendar, { 
        event: 'schedule_prescreen', 
        candidate, 
        invite,
        recruiterEmail: profile.email 
      });
    }

    const updated = { ...candidate, stage: CandidateStage.INTERVIEWING };
    if (supabase && !candidate.isDemo) await supabase.from('candidates').update({ stage: CandidateStage.INTERVIEWING }).eq('id', candidate.id);
    onUpdateCandidate(updated);
    setShowScheduleModal(null);
  };

  const handleAddCandidateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandidateForm.jobId) return alert("Select an active requisition for this candidate.");
    try {
      const payload = { 
        name: newCandidateForm.name, 
        title: newCandidateForm.title, 
        company: newCandidateForm.company, 
        job_id: newCandidateForm.jobId, 
        linkedIn_url: newCandidateForm.linkedInUrl, 
        email: newCandidateForm.email,
        phoneNumber: newCandidateForm.phoneNumber,
        stage: CandidateStage.SOURCED 
      };

      if (!supabase) {
        onAddCandidate({ id: Math.random().toString(36).substr(2, 9), ...newCandidateForm, stage: CandidateStage.SOURCED, isDemo: true });
        return setShowAddModal(false);
      }
      const { data, error } = await supabase.from('candidates').insert(payload).select();
      if (error) throw error;
      if (data && data[0]) {
        onAddCandidate({ 
          id: data[0].id, 
          ...newCandidateForm, 
          jobId: data[0].job_id,
          linkedInUrl: data[0].linkedIn_url,
          stage: CandidateStage.SOURCED 
        });
        setShowAddModal(false);
        setNewCandidateForm({ name: '', title: '', company: '', jobId: filterJobId || '', linkedInUrl: '', email: '', phoneNumber: '' });
      }
    } catch (err) { alert("Failed to append candidate to pipeline."); }
  };

  return (
    <div className="space-y-10">
      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[150] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-slate-100">
            <div className="p-10 border-b border-slate-50 bg-indigo-50/30 flex items-center justify-between">
               <div>
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Coordination Audit</h3>
                 <p className="text-[9px] text-indigo-500 font-black uppercase tracking-widest">Pre-Screen Scheduling</p>
               </div>
               <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                 <i className="fa-solid fa-calendar-check"></i>
               </div>
            </div>
            <div className="p-10 space-y-8">
               <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Proposed Invite</h4>
                  <p className="text-sm font-black text-slate-900 mb-2">{showScheduleModal.invite.subject}</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-medium mb-4">{showScheduleModal.invite.description}</p>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-600 uppercase tracking-widest">
                      <i className="fa-solid fa-clock mr-1.5 text-indigo-500"></i>
                      {showScheduleModal.invite.suggestedDuration} MIN
                    </span>
                  </div>
               </div>
               <div className="space-y-3">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Candidate</span>
                    <span className="text-slate-900">{showScheduleModal.candidate.name}</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Email</span>
                    <span className="text-slate-900">{showScheduleModal.candidate.email || 'N/A'}</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Mobile</span>
                    <span className="text-slate-900">{showScheduleModal.candidate.phoneNumber || 'N/A'}</span>
                 </div>
               </div>
               <div className="flex gap-4">
                  <button onClick={() => setShowScheduleModal(null)} className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Cancel</button>
                  <button onClick={finalizeSchedule} className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all">Confirm & Dispatched</button>
               </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1.5">Recruiter Workspace</h3>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Talent Pipeline</h2>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-slate-900 text-white px-10 py-5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 shadow-2xl shadow-slate-200 transition-all active:scale-95 flex items-center gap-3">
          <i className="fa-solid fa-plus text-xs"></i>
          Ingest Candidate
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Applicant Profile</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Requisition</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hiring Stage</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ops Tools</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {displayedCandidates.map(candidate => (
              <tr key={candidate.id} className="hover:bg-slate-50/20 transition-all group">
                <td className="px-10 py-7">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-900 font-black text-sm uppercase">
                      {candidate.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-black text-slate-900 text-sm tracking-tight mb-1 uppercase">{candidate.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{candidate.company}</div>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-7">
                  <div className="text-[10px] font-black text-slate-900 uppercase tracking-wide">
                    {jobs.find(j => j.id === candidate.jobId)?.title || 'Unassigned Pipeline'}
                  </div>
                </td>
                <td className="px-10 py-7">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    candidate.stage === CandidateStage.SCREENED ? 'bg-indigo-600 text-white' : 
                    candidate.stage === CandidateStage.INTERVIEWING ? 'bg-slate-900 text-white' :
                    'bg-slate-50 text-slate-400'
                  }`}>
                    {candidate.stage}
                  </span>
                </td>
                <td className="px-10 py-7 text-right">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => handleDraftOutreach(candidate)} disabled={isDrafting === candidate.id} title="Draft Nudge" className={`h-11 w-11 rounded-xl flex items-center justify-center border transition-all active:scale-90 ${isDrafting === candidate.id ? 'bg-amber-500 text-white animate-pulse border-amber-500' : 'bg-white border-slate-100 text-slate-900 hover:border-amber-600 hover:bg-slate-50 shadow-sm'}`}>
                      <i className={`fa-solid ${isDrafting === candidate.id ? 'fa-spinner fa-spin' : 'fa-paper-plane'} text-xs`}></i>
                    </button>
                    <button onClick={() => handleScheduleInterview(candidate)} disabled={isScheduling === candidate.id} title="Calendar Coordination" className={`h-11 w-11 rounded-xl flex items-center justify-center border transition-all active:scale-90 ${isScheduling === candidate.id ? 'bg-indigo-500 text-white animate-pulse border-indigo-500' : 'bg-white border-slate-100 text-indigo-500 hover:border-indigo-500 hover:bg-indigo-50 shadow-sm'}`}>
                      <i className={`fa-solid ${isScheduling === candidate.id ? 'fa-spinner fa-spin' : 'fa-calendar-plus'} text-xs`}></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {displayedCandidates.length === 0 && <div className="py-32 text-center text-slate-300 font-black uppercase tracking-[0.4em] text-xs">No Active Talent Profiles</div>}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-slate-100">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
               <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">New Candidate Entry</h3>
               <button onClick={() => setShowAddModal(false)} className="h-10 w-10 flex items-center justify-center text-slate-300 hover:text-slate-900 transition-colors active:scale-90"><i className="fa-solid fa-times text-xl"></i></button>
            </div>
            <form onSubmit={handleAddCandidateSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Legal Name</label>
                  <input required type="text" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all uppercase" placeholder="e.g. Jane Doe" value={newCandidateForm.name} onChange={e => setNewCandidateForm({...newCandidateForm, name: e.target.value})}/>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Assign to Requisition</label>
                  <select required className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all" value={newCandidateForm.jobId} onChange={e => setNewCandidateForm({...newCandidateForm, jobId: e.target.value})}>
                    <option value="">Select Pipeline</option>
                    {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Personal Email</label>
                  <input type="email" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all" placeholder="jane@example.com" value={newCandidateForm.email} onChange={e => setNewCandidateForm({...newCandidateForm, email: e.target.value})}/>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Phone Number</label>
                  <input type="tel" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all" placeholder="+1-202-555-0101" value={newCandidateForm.phoneNumber} onChange={e => setNewCandidateForm({...newCandidateForm, phoneNumber: e.target.value})}/>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-5 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all">Submit to Pipeline</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidatesView;