import React from 'react';

interface LandingViewProps {
  onGetStarted: () => void;
  onDemoMode: () => void;
}

const GUMROAD_URL = 'https://ketorahdigital.gumroad.com/l/recruiteros';

const LandingView: React.FC<LandingViewProps> = ({ onGetStarted, onDemoMode }) => {
  const faqs = [
    {
      q: "I already use an ATS. Why do I need this?",
      a: "Most ATS platforms are built for tracking, not for taking action. They store your data but don't tell you which candidates are going cold, don't draft your follow-ups, and don't flag what needs attention today. RecruiterOps handles the operational work that falls through the cracks — the follow-ups you meant to send, the interviews that didn't get coordinated, the candidates who went silent."
    },
    {
      q: "I'm a solo recruiter. Is this really built for me?",
      a: "Yes — this was designed specifically for independent recruiters and recruiting side hustlers who don't have coordinator or admin support. When you're running a full desk alone, every hour you spend on follow-ups, notes, and status updates is an hour you're not billing. RecruiterOps handles that operational layer so you can stay focused on placements."
    },
    {
      q: "Does it actually send emails for me?",
      a: "RecruiterOps drafts the emails and copies them to your clipboard in one click — you paste and send from your own Gmail or email client. This keeps you in control of every communication while eliminating the time you spend writing from scratch."
    },
    {
      q: "What does the stalled candidate detection actually do?",
      a: "RecruiterOps monitors the last activity date on every candidate. If a candidate hasn't had any activity in 3+ days, they're flagged with a red badge in your sidebar and highlighted in your pipeline. You'll also see a suggested action from the AI so you know exactly what to do next."
    },
    {
      q: "Can I track my placement fees?",
      a: "Yes. When you mark a candidate as placed, you log the fee right in the app. Your dashboard shows total placements and total fees earned so you always know your desk's ROI."
    },
    {
      q: "Does RecruiterOps source or screen candidates?",
      a: "No. RecruiterOps works with candidates already in your pipeline — people you've already identified and are actively working. It does not source from job boards, LinkedIn, or any external database. Think of it as your operations layer, not your sourcing tool."
    },
    {
      q: "How long does setup take?",
      a: "Most recruiters are up and running in under 10 minutes. Purchase on Gumroad, sign up with the same email, and your access is activated instantly. Add your first job order and candidate and the AI features activate automatically."
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
            {/* LOG IN → opens AuthView in login mode */}
            <button
              onClick={onGetStarted}
              className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
            >
              Log In
            </button>
            {/* GET STARTED → goes to Gumroad to pay first */}
            <a
              href={GUMROAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-slate-200"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden hero-gradient">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full mb-8">
            <span className="h-2 w-2 bg-indigo-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Built for Solo Recruiters & Recruiting Side Hustlers</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter mb-8 leading-[1.0] uppercase">
            Add 1 extra placement <br/> <span className="text-indigo-600">every single month.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-3xl mx-auto mb-12 leading-relaxed">
            RecruiterOps is the AI-powered ops tool for independent recruiters. Draft outreach, catch stalled candidates, generate interview invites, and track every placement — all from one desk.
          </p>
          <div className="flex flex-col items-center gap-4">
            {/* Hero CTA → goes to Gumroad */}
            <a
              href={GUMROAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-16 py-6 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
            >
              Get Started — $49/mo
            </a>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Pay once on Gumroad → sign up with the same email to activate access
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">Everything on your desk. Nothing falling through the cracks.</h2>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto">Every feature is built around one goal — more placements with less admin.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: 'fa-bolt', color: 'bg-indigo-600', title: 'Daily AI Briefing', desc: 'Every session opens with an AI summary of your pipeline — who needs attention, what\'s moving, and your next actions.' },
              { icon: 'fa-triangle-exclamation', color: 'bg-red-500', title: 'Stalled Candidate Alerts', desc: 'Candidates inactive for 3+ days get flagged automatically with a red badge in your sidebar. Never lose a placement to silence.' },
              { icon: 'fa-paper-plane', color: 'bg-amber-500', title: 'AI Outreach Drafts', desc: 'Generate high-quality follow-up emails for any candidate in one click. Copy to Gmail and send — no blank page staring.' },
              { icon: 'fa-calendar-check', color: 'bg-green-600', title: 'Interview Invite Generator', desc: 'AI drafts a professional interview coordination message — subject, body, and duration — ready to copy and paste.' },
              { icon: 'fa-note-sticky', color: 'bg-purple-500', title: 'Quick Candidate Notes', desc: 'Add interview feedback, compensation expectations, and next steps to any candidate. Always know where things stand.' },
              { icon: 'fa-user-tie', color: 'bg-blue-500', title: 'Client Contact Tracking', desc: 'Store your hiring manager\'s name and email on every job order. One click to email your client without digging through your inbox.' },
              { icon: 'fa-trophy', color: 'bg-emerald-500', title: 'Placement Tracker', desc: 'Mark candidates as placed, log your fee, and watch your earnings grow on the dashboard. Know your desk\'s ROI at a glance.' },
              { icon: 'fa-gauge-high', color: 'bg-slate-700', title: 'Pipeline Health Widget', desc: 'Active candidates, stalled count, interviews scheduled, and last AI briefing time — all visible at a glance.' },
            ].map((f, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className={`h-10 w-10 ${f.color} rounded-xl flex items-center justify-center text-white mb-4`}>
                  <i className={`fa-solid ${f.icon} text-sm`}></i>
                </div>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-2">{f.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
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
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-6">Your desk. Fully loaded.</h2>
            <p className="text-slate-400 mb-4 font-medium">Solo recruiters and side hustlers are using RecruiterOps to close more placements without working more hours.</p>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-10">
              Purchase on Gumroad → Sign up with the same email → Access activated instantly
            </p>
            <a
              href={GUMROAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-16 py-6 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-indigo-700 transition-all active:scale-95"
            >
              Get Started Now — $49/mo
            </a>
            <div className="mt-8">
              <button
                onClick={onGetStarted}
                className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                Already a subscriber? Log In →
              </button>
            </div>
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