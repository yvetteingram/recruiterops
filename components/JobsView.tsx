import React, { useState, useEffect } from 'react';
import { Job } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface JobsViewProps {
  jobs: Job[];
  onAddJob: (newJob: Job) => void;
  onUpdateJob?: (updatedJob: Job) => void;
  onDeleteJob?: (jobId: string) => void;
  onRefreshData?: () => void;
  // Adjusted plan type to align with Profile and PRICING_TIERS in types.ts and constants.tsx
  plan: 'starter' | 'professional' | 'pro_plus';
  onManageCandidates?: (jobId: string) => void;
  isForcingAdd?: boolean;
  onAddComplete?: () => void;
}

const JobsView: React.FC<JobsViewProps> = ({ 
  jobs, 
  onAddJob, 
  onUpdateJob,
  onDeleteJob,
  onRefreshData, 
  plan, 
  onManageCandidates, 
  isForcingAdd, 
  onAddComplete 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({ title: '', client: '', salary: '', location: '', description: '' });
  const [loading, setLoading] = useState(false);

  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (isForcingAdd) {
      setEditingJob(null);
      setFormData({ title: '', client: '', salary: '', location: '', description: '' });
      setShowModal(true);
      if (onAddComplete) onAddComplete();
    }
  }, [isForcingAdd, onAddComplete]);

  useEffect(() => {
    if (editingJob) {
      setFormData({
        title: editingJob.title,
        client: editingJob.client,
        salary: editingJob.salary,
        location: editingJob.location || '',
        description: editingJob.description
      });
      setShowModal(true);
    }
  }, [editingJob]);

  // Aligned plan limits with the actual capacity values defined in PRICING_TIERS
  const planLimits = { starter: 1, professional: 5, pro_plus: 1000 };
  const isAtLimit = !editingJob && jobs.length >= planLimits[plan];

  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to close this hiring requisition? All associated candidate data will be permanently archived.")) return;
    
    try {
      if (supabase && configured) {
        const { error } = await supabase.from('jobs').delete().eq('id', jobId);
        if (error) throw error;
      }
      onDeleteJob?.(jobId);
    } catch (err) {
      console.error("Error deleting requisition:", err);
      alert("Failed to close requisition.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingJob && isAtLimit && configured) {
      alert("Agent capacity reached. Please upgrade to manage more open requisitions.");
      return;
    }

    setLoading(true);

    try {
      const jobDataToSave = {
        title: formData.title,
        client: formData.client,
        salary: formData.salary,
        location: formData.location,
        status: 'active' as const,
        description: formData.description,
      };

      if (!configured || !supabase) {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (editingJob) {
          const updated: Job = { ...editingJob, ...jobDataToSave };
          onUpdateJob?.(updated);
        } else {
          const created: Job = {
            ...jobDataToSave,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            isDemo: true
          };
          onAddJob(created);
        }
        
        closeModal();
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication failure.");

      if (editingJob) {
        const { data, error } = await supabase.from('jobs')
          .update(jobDataToSave)
          .eq('id', editingJob.id)
          .select();
        
        if (error) throw error;
        if (data && data[0]) {
          onUpdateJob?.({
            ...editingJob,
            ...jobDataToSave,
            id: data[0].id
          });
        }
      } else {
        const { data, error } = await supabase.from('jobs').insert({
          ...jobDataToSave,
          user_id: user.id 
        }).select();

        if (error) throw error;
        if (data && data[0]) {
          onAddJob({
            id: data[0].id,
            ...jobDataToSave,
            createdAt: data[0].created_at
          });
        } else {
          onRefreshData?.();
        }
      }

      closeModal();
    } catch (err: any) {
      console.error("Error saving requisition:", err);
      alert(`Failed to save requisition. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingJob(null);
    setFormData({ title: '', client: '', salary: '', location: '', description: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Active Requisitions ({jobs.length})</h2>
          <p className="text-xs text-slate-500">Open hiring roles currently under AI management.</p>
        </div>
        <button 
          onClick={() => { setEditingJob(null); setShowModal(true); }}
          disabled={isAtLimit && configured}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 font-bold text-sm ${
            (isAtLimit && configured) 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
          }`}
        >
          {(isAtLimit && configured) ? <i className="fa-solid fa-lock"></i> : <i className="fa-solid fa-plus"></i>}
          <span>{(isAtLimit && configured) ? 'Capacity Reached' : 'Open New Requisition'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {jobs.map(job => (
          <div key={job.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-all group relative">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded tracking-wide ${
                job.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'
              }`}>
                {job.status}
              </span>
              <div className="flex gap-1">
                <button 
                  onClick={() => setEditingJob(job)}
                  className="h-7 w-7 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center justify-center transition-all md:opacity-0 md:group-hover:opacity-100"
                >
                  <i className="fa-solid fa-pen text-[10px]"></i>
                </button>
                <button 
                  onClick={() => handleDelete(job.id)}
                  className="h-7 w-7 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center transition-all md:opacity-0 md:group-hover:opacity-100"
                >
                  <i className="fa-solid fa-trash text-[10px]"></i>
                </button>
              </div>
            </div>
            <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{job.title}</h3>
            <p className="text-slate-500 text-sm mb-4">{job.client}</p>
            
            <div className="space-y-3 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <i className="fa-solid fa-dollar-sign w-4 text-center"></i>
                <span>{job.salary}</span>
              </div>
              {job.location && (
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <i className="fa-solid fa-location-dot w-4 text-center"></i>
                  <span>{job.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <i className="fa-solid fa-calendar w-4 text-center"></i>
                <span>Posted {new Date(job.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>

            <button 
              onClick={() => onManageCandidates?.(job.id)}
              className="w-full mt-6 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-semibold hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all"
            >
              Manage Candidates
            </button>
          </div>
        ))}
        {jobs.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl">
            <i className="fa-solid fa-folder-open text-4xl text-slate-200 mb-4 block"></i>
            <p className="text-slate-400 font-medium">No active hiring requisitions found.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[250] p-4">
          <div className="bg-white w-full max-w-lg p-8 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingJob ? 'Refine Requisition' : 'Open New Requisition'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role Title</label>
                <input 
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Senior Product Manager"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Client / Company</label>
                  <input 
                    required
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. TechCorp Inc."
                    value={formData.client}
                    onChange={e => setFormData({...formData, client: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location / Remote</label>
                  <input 
                    required
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. London / Hybrid"
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Salary Range / Budget</label>
                <input 
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. £80,000 - £110,000"
                  value={formData.salary}
                  onChange={e => setFormData({...formData, salary: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Job Description</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="Paste the role requirements and responsibilities here..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 px-4 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                  {loading ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : (editingJob ? "Update Role" : "Post Requisition")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsView;