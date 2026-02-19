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

const STAGE_COLORS: Record<CandidateStage, string> = {
  [CandidateStage.SOURCED]: 'bg-slate-100 text-slate-500',
  [CandidateStage.CONTACTED]: 'bg-blue-50 text-blue-600',
  [CandidateStage.RESPONDED]: 'bg-cyan-50 text-cyan-600',
  [CandidateStage.SCREENED]: 'bg-indigo-600 text-white',
  [CandidateStage.INTERVIEWING]: 'bg-slate-900 text-white',
  [CandidateStage.PRESENTED]: 'bg-green-600 text-white',
  [CandidateStage.REJECTED]: 'bg-red-50 text-red-500',
};

const CandidatesView: React.FC<CandidatesViewProps> = ({
  candidates, jobs, profile, onUpdateCandidate,
  onAddCandidate, onLog, filterJobId, onClearFilter,
}) => {
  const [isScheduling, setIsScheduling] = useState<string | null>(null);
  const [isDrafting, setIsDrafting] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState<{ candidate: Candidate; invite: any } | null>(null);
  const [expandedDraft, setExpandedDraft] = useState<string | null>(null);

  const [newCandidateForm, setNewCandidateForm] = useState({
    name: '', title: '', company: '',
    jobId: filterJobId || '',
    linkedInUrl: '', email: '', phoneNumber: '',
  });

  const displayedCandidates = filterJobId
    ? candidates.filter(c => c.jobId === filterJobId)
    : candidates;

  const filterJob = filterJobId ? jobs.find(j => j.id === filterJobId) : null;

  const handleDraftOutreach = async (candidate: Candidate) => {
    setIsDrafting(candidate.id);
    const job = jobs.find(j => j.id === candidate.jobId);
    if (!job) { setIsDrafting(null); return; }

    const outreach = await generateOutreach(
      candidate.name,
      `${candidate.title} at ${candidate.company}`,
      job.title
    );

    if (outreach) {
      const updated = { ...candidate, outreachDraft: outreach };
      if (supabase && !candidate.isDemo) {
        await supabase.from('candidates')
          .update({ outreach_draft: outreach, last_activity_at: new Date().toISOString() })
          .eq('id', candidate.id);
      }
      onUpdateCandidate(updated);
      onLog?.("Follow-up Drafted", `AI drafted a follow-up message for ${candidate.name}.`, "ai");
      setExpandedDraft(candidate.id);
    }
    setIsDrafting(null);
  };

  const handleScheduleInterview = async (candidate: Candidate) => {
    setIsScheduling(candidate.id);
    const job = jobs.find(j => j.id === candidate.jobId);
    if (!job) { setIsScheduling(null); return; }

    const invite = await coordinateInterview(
      candidate.name,
      candidate.email || 'not-provided@email.com',
      candidate.phoneNumber || 'not-provided',
      job.title,
      profile?.full_name || 'Senior Recruiter'
    );

    if (invite) {
      setShowScheduleModal({ candidate, invite });
      onLog?.("Interview Scheduling Started", `AI prepared interview details for ${candidate.name}.`, "ai");
    }
    setIsScheduling(null);
  };

  const finalizeSchedule = async () => {
    if (!showScheduleModal) return;
    const { candidate, invite } = showScheduleModal;

    onLog?.("Interview Confirmed", `Interview scheduled for ${candidate.name}.`, "user");

    const updated = { ...candidate, stage: CandidateStage.INTERVIEWING };
    if (supabase && !candidate.isDemo) {
      await supabase.from('candidates')
        .update({ stage: CandidateStage.INTERVIEWING, last_activity_at: new Date().toISOString() })
        .eq('id', candidate.id);
    }
    onUpdateCandidate(updated);
    setShowScheduleModal(null);
  };

  const handleStageChange = async (candidate: Candidate, newStage: CandidateStage) => {
    const updated = { ...candidate, stage: newStage, lastActivityAt: new Date().toISOString() };
    if (supabase && !candidate.isDemo) {
      await supabase.from('candidates')
        .update({ stage: newStage, last_activity_at: new Date().toISOString() })
        .eq('id', candidate.id);
    }
    onUpdateCandidate(updated);
    onLog?.("Stage Updated", `${candidate.name} moved to ${newStage}.`, "user");
  };

  const handleAddCandidateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandidateForm.jobId) return alert("Please select a job order for this candidate.");

    try {
      const payload = {
        name: newCandidateForm.name,
        title: newCandidateForm.title,
        company: newCandidateForm.company,
        job_id: newCandidateForm.jobId,
        linkedIn_url: newCandidateForm.linkedInUrl,
        email: newCandidateForm.email,
        phoneNumber: newCandidateForm.phoneNumber,
        stage: CandidateStage.SOURCED,
        last_activity_at: new Date().toISOString(),
      };

      if (!supabase) {
        onAddCandidate({
          id: Math.random().toString(36).substr(2, 9),
          jobId: newCandidateForm.jobId,
          name: newCandidateForm.name,
          title: newCandidateForm.title,
          company: newCandidateForm.company,
          linkedInUrl: newCandidateForm.linkedInUrl,
          email: newCandidateForm.email,
          phoneNumber: newCandidateForm.phoneNumber,
          stage: CandidateStage.SOURCED,
          isDemo: true,
        });
        return setShowAddModal(false);
      }

      const { data, error } = await supabase.from('candidates').insert(payload).select();
      if (error) throw error;

      if (data && data[0]) {
        onAddCandidate({
          id: data[0].id,
          jobId: data[0].job_id,
          name: data[0].name,
          title: data[0].title,
          company: data[0].company,
          linkedInUrl: data[0].linkedIn_url || '',
          email: data[0].email,
          phoneNumber: data[0].phoneNumber,
          stage: CandidateStage.SOURCED,
          lastActivityAt: data[0].last_activity_at,
        });
        setShowAddModal(false);
        setNewCandidateForm({ name: '', title: '', company: '', jobId: filterJobId || '', linkedInUrl: '', email: '', phoneNumber: '' });
      }
    } catch (err) {
      alert("Failed to add candidate to pipeline.");
    }
  };

  return (
    <div className="space-y-10">

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[150] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-10 border-b border-slate-50 bg-indigo-50/30 flex items-center justify-between">
              <div>
                {/* ✅ Updated modal title */}
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Schedule Interview</h3>
                <p className="text-[9px] text-indigo-500 font-black uppercase tracking-widest">AI-Generated Interview Invite</p>
              </div>
              <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                <i className="fa-solid fa-calendar-check"></i>
              </div>
            </div>
            <div className="p-10 space-y-8">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Interview Invite Draft</h4>
                <p className="text-sm font-black text-slate-900 mb-2">{showScheduleModal.invite.subject}</p>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium mb-4">{showScheduleModal.invite.description}</p>
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  <i className="fa-solid fa-clock mr-1.5 text-indigo-500"></i>
                  {showScheduleModal.invite.suggestedDuration} MIN
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Candidate', value: showScheduleModal.candidate.name },
                  { label: 'Email', value: showScheduleModal.candidate.email || 'N/A' },
                  { label: 'Phone', value: showScheduleModal.candidate.phoneNumber || 'N/A' },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">{row.label}</span>
                    <span className="text-slate-900">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setShowScheduleModal(null)} className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-xl font-black uppercase text-[10px] tracking-widest">Cancel</button>
                <button onClick={finalizeSchedule} className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">
                  Confirm Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1.5">Recruiting Workspace</h3>
          {/* ✅ Updated page title */}
          <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Candidate Pipeline</h2>
          {filterJob && (
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                Job Order: {filterJob.title} — {filterJob.client}
              </span>
              <button onClick={onClearFilter} className="text-[10px] text-slate-400 hover:text-slate-600 font-bold uppercase tracking-widest">
                Clear ×
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-slate-900 text-white px-10 py-5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 shadow-2xl transition-all active:scale-95 flex items-center gap-3"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          {/* ✅ Updated button label */}
          Add Candidate
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidate</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Order</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stage</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Activity</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {displayedCandidates.map(candidate => (
              <React.Fragment key={candidate.id}>
                <tr className="hover:bg-slate-50/30 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-900 font-black text-sm uppercase shrink-0">
                        {candidate.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-slate-900 text-sm tracking-tight uppercase">{candidate.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold">{candidate.title} · {candidate.company}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div>
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-wide">
                        {jobs.find(j => j.id === candidate.jobId)?.title || '—'}
                      </span>
                      <div className="text-[9px] text-slate-400 font-bold mt-0.5">
                        {jobs.find(j => j.id === candidate.jobId)?.client || ''}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <select
                      value={candidate.stage}
                      onChange={e => handleStageChange(candidate, e.target.value as CandidateStage)}
                      className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-0 cursor-pointer ${STAGE_COLORS[candidate.stage]}`}
                    >
                      {Object.values(CandidateStage).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] text-slate-400 font-bold">
                      {candidate.lastActivityAt
                        ? new Date(candidate.lastActivityAt).toLocaleDateString()
                        : '—'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleDraftOutreach(candidate)}
                        disabled={isDrafting === candidate.id}
                        title="Draft Follow-Up"
                        className={`h-10 w-10 rounded-xl flex items-center justify-center border transition-all ${
                          isDrafting === candidate.id
                            ? 'bg-amber-500 text-white border-amber-500 animate-pulse'
                            : 'bg-white border-slate-100 text-slate-600 hover:border-amber-400 hover:text-amber-600 shadow-sm'
                        }`}
                      >
                        <i className={`fa-solid ${isDrafting === candidate.id ? 'fa-spinner fa-spin' : 'fa-paper-plane'} text-xs`}></i>
                      </button>
                      <button
                        onClick={() => handleScheduleInterview(candidate)}
                        disabled={isScheduling === candidate.id}
                        title="Schedule Interview"
                        className={`h-10 w-10 rounded-xl flex items-center justify-center border transition-all ${
                          isScheduling === candidate.id
                            ? 'bg-indigo-500 text-white border-indigo-500 animate-pulse'
                            : 'bg-white border-slate-100 text-indigo-500 hover:border-indigo-400 hover:bg-indigo-50 shadow-sm'
                        }`}
                      >
                        <i className={`fa-solid ${isScheduling === candidate.id ? 'fa-spinner fa-spin' : 'fa-calendar-plus'} text-xs`}></i>
                      </button>
                      {candidate.outreachDraft && (
                        <button
                          onClick={() => setExpandedDraft(expandedDraft === candidate.id ? null : candidate.id)}
                          title="View Follow-Up Draft"
                          className="h-10 w-10 rounded-xl flex items-center justify-center border bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600 shadow-sm transition-all"
                        >
                          <i className={`fa-solid ${expandedDraft === candidate.id ? 'fa-chevron-up' : 'fa-envelope-open'} text-xs`}></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                {expandedDraft === candidate.id && candidate.outreachDraft && (
                  <tr>
                    <td colSpan={5} className="px-8 pb-6 pt-0">
                      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
                        <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-3">AI Follow-Up Draft</p>
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">{candidate.outreachDraft}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {displayedCandidates.length === 0 && (
          <div className="py-24 text-center">
            <i className="fa-solid fa-user-group text-4xl text-slate-200 mb-4 block"></i>
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs">No candidates in pipeline</p>
            <p className="text-slate-300 text-xs mt-1">Click "Add Candidate" to get started.</p>
          </div>
        )}
      </div>

      {/* Add Candidate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
              {/* ✅ Updated modal title */}
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Add Candidate</h3>
              <button onClick={() => setShowAddModal(false)} className="h-10 w-10 flex items-center justify-center text-slate-300 hover:text-slate-900 transition-colors">
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleAddCandidateSubmit} className="p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Candidate Name *</label>
                  <input required type="text" placeholder="e.g. Jane Smith"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
                    value={newCandidateForm.name} onChange={e => setNewCandidateForm({ ...newCandidateForm, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Assign to Job Order *</label>
                  <select required
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
                    value={newCandidateForm.jobId} onChange={e => setNewCandidateForm({ ...newCandidateForm, jobId: e.target.value })}>
                    <option value="">Select Job Order</option>
                    {jobs.map(j => <option key={j.id} value={j.id}>{j.title} — {j.client}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Current Title</label>
                  <input type="text" placeholder="e.g. Senior Developer"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
                    value={newCandidateForm.title} onChange={e => setNewCandidateForm({ ...newCandidateForm, title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Current Employer</label>
                  <input type="text" placeholder="e.g. Acme Corp"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
                    value={newCandidateForm.company} onChange={e => setNewCandidateForm({ ...newCandidateForm, company: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Email</label>
                  <input type="email" placeholder="jane@example.com"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
                    value={newCandidateForm.email} onChange={e => setNewCandidateForm({ ...newCandidateForm, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Phone</label>
                  <input type="tel" placeholder="+1-202-555-0101"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
                    value={newCandidateForm.phoneNumber} onChange={e => setNewCandidateForm({ ...newCandidateForm, phoneNumber: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">LinkedIn URL</label>
                <input type="url" placeholder="https://linkedin.com/in/..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
                  value={newCandidateForm.linkedInUrl} onChange={e => setNewCandidateForm({ ...newCandidateForm, linkedInUrl: e.target.value })} />
              </div>
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-xl font-black uppercase text-[10px] tracking-widest">Cancel</button>
                <button type="submit"
                  className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">
                  {/* ✅ Updated submit button */}
                  Add to Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidatesView;