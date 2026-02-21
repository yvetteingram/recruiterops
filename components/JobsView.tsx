import React, { useState, useEffect } from 'react';
import { Job } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const JOB_LIMIT = 10; // Pro plan — single tier

interface JobsViewProps {
  jobs: Job[];
  onAddJob: (newJob: Job) => void;
  onUpdateJob?: (updatedJob: Job) => void;
  onDeleteJob?: (jobId: string) => void;
  onRefreshData?: () => void;
  onManageCandidates?: (jobId: string) => void;
  isForcingAdd?: boolean;
  onAddComplete?: () => void;
}

const JobsView: React.FC<JobsViewProps> = ({
  jobs, onAddJob, onUpdateJob, onDeleteJob, onRefreshData,
  onManageCandidates, isForcingAdd, onAddComplete,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({ title: '', client: '', salary: '', location: '', description: '' });
  const [loading, setLoading] = useState(false);

  const configured = isSupabaseConfigured();
  const isAtLimit = !editingJob && jobs.length >= JOB_LIMIT;

  useEffect(() => {
    if (isForcingAdd) {
      setEditingJob(null);
      setFormData({ title: '', client: '', salary: '', location: '', description: '' });
      setShowModal(true);
      onAddComplete?.();
    }
  }, [isForcingAdd, onAddComplete]);

  useEffect(() => {
    if (editingJob) {
      setFormData({
        title: editingJob.title, client: editingJob.client,
        salary: editingJob.salary, location: editingJob.location || '',
        description: editingJob.description,
      });
      setShowModal(true);
    }
  }, [editingJob]);

  const handleDelete = async (jobId: string) => {
    if (!confirm("Close this job order? All associated candidate records will be archived.")) return;
    try {
      if (supabase && configured) {
        const { error } = await supabase.from('jobs').delete().eq('id', jobId);
        if (error) throw error;
      }
      onDeleteJob?.(jobId);
    } catch (err) {
      console.error("Error closing job order:", err);
      alert("Failed to close job order.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAtLimit && configured) {
      alert(`You've reached the limit of ${JOB_LIMIT} active job orders. Please close an existing order before adding a new one.`);
      return;
    }

    setLoading(true);
    try {
      const jobDataToSave = {
        title: formData.title, client: formData.client,
        salary: formData.salary, location: formData.location,
        status: 'active' as const, description: formData.description,
      };

      if (!configured || !supabase) {
        await new Promise(resolve => setTimeout(resolve, 600));
        if (editingJob) {
          onUpdateJob?.({ ...editingJob, ...jobDataToSave });
        } else {
          onAddJob({ ...jobDataToSave, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString(), isDemo: true });
        }
        closeModal();
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication required.");

      if (editingJob) {
        const { data, error } = await supabase.from('jobs').update(jobDataToSave).eq('id', editingJob.id).select();
        if (error) throw error;
        if (data?.[0]) onUpdateJob?.({ ...editingJob, ...jobDataToSave });
      } else {
        const { data, error } = await supabase.from('jobs').insert({ ...jobDataToSave, user_id: user.id }).select();
        if (error) throw error;
        if (data?.[0]) {
          onAddJob({ id: data[0].id, ...jobDataToSave, createdAt: data[0].created_at });
        } else { onRefreshData?.(); }
      }
      closeModal();
    } catch (err: any) {
      console.error("Error saving job order:", err);
      alert(`Failed to save. ${err.message}`);
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
          <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">
            Job Orders ({jobs.length}/{JOB_LIMIT})
          </h2>
          <p className="text-xs text-slate-500">Active job orders currently being worked.</p>
        </div>
        <button
          onClick={() => { setEditingJob(null); setShowModal(true); }}
          disabled={isAtLimit && configured}
          className={`px-5 py-3 rounded-xl transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest ${
            isAtLimit && configured
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95'
          }`}
        >
          <i className={`fa-solid ${isAtLimit && configured ? 'fa-lock' : 'fa-plus'}`}></i>
          {isAtLimit && configured ? 'Limit Reached' : 'Add Job Order'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {jobs.map(job => (
          <div key={job.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-all group relative">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-2 py-1 text-[10px] font-black uppercase rounded tracking-wide ${
                job.status === 'active' ? 'bg-green-50 text-green-600' :
                job.status === 'filled' ? 'bg-indigo-50 text-indigo-600' :
                'bg-slate-100 text-slate-400'
              }`}>
                {job.status === 'filled' ? 'Filled' : job.status === 'paused' ? 'On Hold' : 'Active'}
              </span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditingJob(job)}
                  className="h-7 w-7 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center justify-center transition-all">
                  <i className="fa-solid fa-pen text-[10px]"></i>
                </button>
                <button onClick={() => handleDelete(job.id)}
                  className="h-7 w-7 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center transition-all">
                  <i className="fa-solid fa-trash text-[10px]"></i>
                </button>
              </div>
            </div>
            <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight group-hover:text-indigo-600 transition-colors leading-tight mb-1">
              {job.title}
            </h3>
            <p className="text-slate-500 text-sm mb-4 font-medium">Client: {job.client}</p>
            <div className="space-y-2 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <i className="fa-solid fa-dollar-sign w-4 text-center text-indigo-400"></i>
                <span className="font-medium">{job.salary}</span>
              </div>
              {job.location && (
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <i className="fa-solid fa-location-dot w-4 text-center text-indigo-400"></i>
                  <span className="font-medium">{job.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <i className="fa-solid fa-calendar w-4 text-center text-indigo-400"></i>
                <span className="font-medium">Opened {new Date(job.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
            <button
              onClick={() => onManageCandidates?.(job.id)}
              className="w-full mt-5 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all"
            >
              View Candidates →
            </button>
          </div>
        ))}
        {jobs.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-200 rounded-3xl">
            <i className="fa-solid fa-folder-open text-4xl text-slate-200 mb-4 block"></i>
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No active job orders</p>
            <p className="text-slate-300 text-xs mt-1">Click "Add Job Order" to get started.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[250] p-4">
          <div className="bg-white w-full max-w-lg p-8 rounded-[2rem] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase tracking-tighter">
                {editingJob ? 'Edit Job Order' : 'Add Job Order'}
              </h3>
              <button onClick={closeModal} className="text-slate-300 hover:text-slate-600 transition-colors">
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Job Title *</label>
                <input required
                  className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                  placeholder="e.g. Senior Product Manager"
                  value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Client Name *</label>
                  <input required
                    className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                    placeholder="e.g. TechCorp Inc."
                    value={formData.client} onChange={e => setFormData({ ...formData, client: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Location</label>
                  <input
                    className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                    placeholder="e.g. Remote / Hybrid"
                    value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Salary Range *</label>
                <input required
                  className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                  placeholder="e.g. $80,000 - $110,000"
                  value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Job Description *</label>
                <textarea required rows={4}
                  className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium resize-none"
                  placeholder="Paste the job requirements and responsibilities..."
                  value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 py-3.5 border border-slate-200 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-50">
                  {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : (editingJob ? 'Update Job Order' : 'Save Job Order')}
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