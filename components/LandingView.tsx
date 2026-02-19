import React from 'react';

interface LandingViewProps {
  onGetStarted: () => void;
  onDemoMode: () => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onGetStarted, onDemoMode }) => {
  const faqs = [
    {
      q: "Is there a free trial?",
      a: "No. RecruiterOps is a professional tool for active desks. Access is restricted to paid subscribers to ensure peak infrastructure performance for all users."
    },
    {
      q: "Does this source candidates?",
      a: "No. RecruiterOps is an execution accelerator. It sits on top of your existing pipeline to handle scheduling, stalled candidate detection, and daily follow-ups. We fix the leaky bucket, we don't fill it."
    },
    {
      q: "What integrations do I need?",
      a: "The agent works best with Make.com webhooks and a Gemini API key. Setup takes less than 5 minutes."
    },
    {
      q: "How does it 'detect' stalled candidates?",
      a: "The agent monitors the 'Last Activity' timestamp of every candidate in your pipeline. If a profile remains static for 48 hours without a stage move or update, it is flagged in your morning briefing."
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-100 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed w-full top-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <i className="fa-solid fa-bolt text-sm"></i>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 uppercase">RecruiterOps</span>
          </div>
          
          <div className="flex items-center gap-6">
            <button onClick={onGetStarted} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors">Log In</button>
            <button onClick={onGetStarted} className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-slate-200">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden hero-gradient">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full mb-8">
            <span className="h-2 w-2 bg-indigo-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">The Operations Agent for Boutique Agencies</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter mb-8 leading-[1.0] uppercase">
            Add 1 extra placement <br/> <span className="text-indigo-600">every single month.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-3xl mx-auto mb-12 leading-relaxed">
            Eliminate admin friction. Automated scheduling, stalled candidate detection, and daily execution summaries. No more dropped candidates.
          </p>
          <div className="flex justify-center">
            <button onClick={onGetStarted} className="w-full sm:w-auto px-16 py-6 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
              Launch RecruiterOps — $49/mo
            </button>
          </div>
        </div>
      </section>

      {/* App Visuals / Screenshots in action */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Visual 1: Morning Briefing */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white"><i className="fa-solid fa-sun text-sm"></i></div>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Morning Briefing</h4>
              </div>
              <div className="space-y-4">
                <div className="h-3 w-full bg-slate-100 rounded-full"></div>
                <div className="h-3 w-3/4 bg-slate-100 rounded-full"></div>
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <p className="text-[10px] font-black text-indigo-600 uppercase mb-1">Top Action Item</p>
                  <p className="text-xs font-bold text-slate-800">Nudge Alex (Stalled 4 days)</p>
                </div>
              </div>
            </div>
            {/* Visual 2: Stalled Detection */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-red-500 rounded-xl flex items-center justify-center text-white"><i className="fa-solid fa-triangle-exclamation text-sm"></i></div>
                <h4 className="text-xs font-black uppercase tracking-widest text-white">Stalled Detection</h4>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-[10px] font-bold text-white uppercase">Sarah J.</span>
                  <span className="text-[8px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-black">48h+ STUCK</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10 opacity-50">
                  <span className="text-[10px] font-bold text-white uppercase">David C.</span>
                  <span className="text-[8px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-black">MOVING</span>
                </div>
              </div>
            </div>
            {/* Visual 3: AI Scheduling */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white"><i className="fa-solid fa-calendar-check text-sm"></i></div>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Auto-Scheduling</h4>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                <p className="text-[10px] font-bold text-slate-400">Subject: Technical Interview</p>
                <div className="h-2 w-full bg-slate-200 rounded-full"></div>
                <div className="h-2 w-2/3 bg-slate-200 rounded-full"></div>
                <div className="pt-2 flex justify-end">
                   <div className="h-6 w-16 bg-indigo-600 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-16 text-center">Frequently Asked Questions</h2>
          <div className="space-y-12">
            {faqs.map((faq, i) => (
              <div key={i}>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-3">
                  <span className="h-6 w-6 bg-slate-100 rounded flex items-center justify-center text-[10px] text-slate-500">{i+1}</span>
                  {faq.q}
                </h4>
                <p className="text-slate-500 text-sm leading-relaxed ml-9">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-slate-900 text-center">
         <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-6">Scale without hiring.</h2>
            <p className="text-slate-400 mb-12 font-medium">Join boutique recruiters who are using RecruiterOps to drive placement velocity.</p>
            <button onClick={onGetStarted} className="px-16 py-6 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-indigo-700 transition-all active:scale-95">
              Get Started Now — $49/mo
            </button>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 bg-indigo-600 rounded flex items-center justify-center text-white">
              <i className="fa-solid fa-bolt text-[10px]"></i>
            </div>
            <span className="text-xs font-black tracking-tighter uppercase text-slate-900">RecruiterOps</span>
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
            © 2026 RecruiterOps
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingView;