import React, { useState } from 'react';

interface LandingViewProps {
  onGetStarted: () => void;
  onDemoMode: () => void;
}

const GUMROAD_URL = 'https://ketorahdigital.gumroad.com/l/recruiteros';

const features = [
  {
    icon: 'fa-bolt',
    color: 'bg-indigo-600',
    title: 'Daily AI Briefing',
    description: 'Every session opens with an AI summary of your pipeline — who needs attention, what\'s moving, and your next actions.',
  },
  {
    icon: 'fa-triangle-exclamation',
    color: 'bg-red-500',
    title: 'Stalled Candidate Alerts',
    description: 'Candidates inactive for 3+ days get flagged automatically. Never lose a placement to silence.',
  },
  {
    icon: 'fa-paper-plane',
    color: 'bg-amber-500',
    title: 'AI Outreach Drafts',
    description: 'Generate high-quality follow-up emails for any candidate in one click. Copy to Gmail and send.',
  },
  {
    icon: 'fa-calendar-check',
    color: 'bg-green-600',
    title: 'Interview Invite Generator',
    description: 'AI drafts a professional interview coordination message — subject, body, and duration — ready to send.',
  },
  {
    icon: 'fa-note-sticky',
    color: 'bg-purple-500',
    title: 'Quick Candidate Notes',
    description: 'Add interview feedback, compensation expectations, and next steps to any candidate record.',
  },
  {
    icon: 'fa-trophy',
    color: 'bg-emerald-500',
    title: 'Placement & Fee Tracker',
    description: 'Mark candidates as placed, log your fee, and watch your earnings grow. Know your desk\'s ROI at a glance.',
  },
];

const steps = [
  { number: '1', title: 'Purchase on Gumroad', description: 'One-time $49/mo subscription. Cancel anytime.' },
  { number: '2', title: 'Sign up with the same email', description: 'Your access is activated instantly — no approval wait.' },
  { number: '3', title: 'Add jobs & start recruiting', description: 'Add your job orders, track candidates, and let AI handle the ops.' },
];

const painPoints = [
  'Losing candidates because you forgot to follow up',
  'Spending 30 minutes writing a single outreach email',
  'Tracking candidates across sticky notes, spreadsheets, and your inbox',
  'No idea which candidates have gone cold in your pipeline',
  'Manually scheduling every interview without templates',
];

const faqs = [
  {
    q: 'I already use an ATS. Why do I need this?',
    a: 'Most ATS platforms store data but don\'t tell you which candidates are going cold, don\'t draft your follow-ups, and don\'t flag what needs attention today. RecruiterOps handles the operational work that falls through the cracks.',
  },
  {
    q: 'I\'m a solo recruiter. Is this really built for me?',
    a: 'Yes — designed specifically for independent recruiters and recruiting side hustlers who don\'t have coordinator support. Every hour you spend on admin is an hour you\'re not billing.',
  },
  {
    q: 'Does it actually send emails for me?',
    a: 'RecruiterOps drafts emails and copies them to your clipboard in one click — you paste and send from your own email client. You stay in control of every communication.',
  },
  {
    q: 'What does stalled candidate detection do?',
    a: 'It monitors the last activity date on every candidate. If someone hasn\'t had activity in 3+ days, they\'re flagged with a red badge and a suggested next action from the AI.',
  },
  {
    q: 'Can I track my placement fees?',
    a: 'Yes. When you mark a candidate as placed, you log the fee right in the app. Your dashboard shows total placements and total fees earned.',
  },
  {
    q: 'How long does setup take?',
    a: 'Most recruiters are up and running in under 10 minutes. Purchase on Gumroad, sign up with the same email, and your access is activated instantly.',
  },
];

const LandingView: React.FC<LandingViewProps> = ({ onGetStarted, onDemoMode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-slate-100 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <i className="fa-solid fa-bolt text-sm"></i>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">RecruiterOps</span>
          </div>
          {/* Desktop */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={onGetStarted}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              Log In
            </button>
            <a
              href={GUMROAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-indigo-200"
            >
              Get Started — $49/mo
            </a>
          </div>
          {/* Mobile hamburger */}
          <button className="sm:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-lg`}></i>
          </button>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3">
            <button onClick={onGetStarted} className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-700">
              Log In
            </button>
            <a
              href={GUMROAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-3 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl text-center"
            >
              Get Started — $49/mo
            </a>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium mb-6">
            <i className="fa-solid fa-bolt text-xs"></i>
            Built for Solo Recruiters & Side Hustlers
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
            Add 1 Extra Placement<br />
            <span className="text-indigo-600">Every Single Month</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            The AI-powered ops tool for independent recruiters. Draft outreach, catch stalled candidates, generate interview invites, and track every placement — all from one desk.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={GUMROAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-2xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
            >
              Get Started — $49/mo
              <i className="fa-solid fa-arrow-right text-sm"></i>
            </a>
            <p className="text-sm text-slate-400">Pay on Gumroad · Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl">
            <div className="bg-slate-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-slate-700">
              {/* Mock dashboard header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Recruiting Operations</p>
                  <h3 className="text-white text-xl sm:text-2xl font-bold">Recruiter Desk</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-indigo-400 font-semibold">1 Placement / mo</span>
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">R</div>
                </div>
              </div>
              {/* Mock stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {[
                  { label: 'Active Jobs', value: '4', icon: 'fa-briefcase' },
                  { label: 'Candidates', value: '12', icon: 'fa-users' },
                  { label: 'Interviews', value: '3', icon: 'fa-calendar' },
                  { label: 'Revenue', value: '$18,500', icon: 'fa-trophy' },
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                    <div className="flex items-center gap-2 mb-2">
                      <i className={`fa-solid ${stat.icon} text-indigo-400 text-xs`}></i>
                      <span className="text-slate-400 text-xs font-medium">{stat.label}</span>
                    </div>
                    <p className="text-white text-xl font-bold">{stat.value}</p>
                  </div>
                ))}
              </div>
              {/* Mock AI briefing */}
              <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <i className="fa-solid fa-bolt text-indigo-400 text-xs"></i>
                  <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">AI Briefing</span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  2 candidates need follow-up today. Sarah Johnson hasn't been contacted in 4 days — draft a check-in email? Your interview with David Chen is confirmed for Thursday.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-16 sm:py-24 bg-slate-50 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-4">
            Sound familiar?
          </h2>
          <p className="text-slate-500 text-center mb-10 max-w-xl mx-auto">
            Solo recruiters waste hours on admin instead of making placements.
          </p>
          <div className="max-w-lg mx-auto space-y-3">
            {painPoints.map((point, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-white rounded-xl p-4 border border-slate-100 shadow-sm"
              >
                <i className="fa-solid fa-xmark text-red-400 mt-0.5"></i>
                <span className="text-slate-700 text-sm sm:text-base">{point}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <p className="text-lg font-semibold text-indigo-600 flex items-center justify-center gap-2">
              <i className="fa-solid fa-bolt"></i>
              RecruiterOps handles the ops so you can focus on placements.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-4">
            Up and running in 10 minutes
          </h2>
          <p className="text-slate-500 text-center mb-12 max-w-xl mx-auto">
            Purchase, sign up, and start recruiting — it's that simple.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 sm:py-24 bg-slate-50 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-4">
            Everything you need to run your desk
          </h2>
          <p className="text-slate-500 text-center mb-12 max-w-xl mx-auto">
            AI-powered features built specifically for independent recruiters. More placements, less admin.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`w-10 h-10 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                  <i className={`fa-solid ${feature.icon} text-white text-sm`}></i>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof + CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <i key={i} className="fa-solid fa-star text-amber-400"></i>
            ))}
          </div>
          <blockquote className="text-xl sm:text-2xl font-medium text-slate-800 italic mb-4 leading-relaxed">
            "I stopped losing candidates to follow-up gaps. RecruiterOps pays for itself with one extra placement."
          </blockquote>
          <p className="text-slate-400 text-sm mb-12">— Independent recruiter</p>

          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to close more placements?</h2>
            <p className="text-indigo-100 mb-8 max-w-lg mx-auto">
              Solo recruiters and side hustlers are using RecruiterOps to add one extra placement per month without working more hours.
            </p>
            <a
              href={GUMROAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-700 font-bold text-lg rounded-2xl hover:bg-indigo-50 transition-all shadow-lg mx-auto"
            >
              Get Started — $49/mo
              <i className="fa-solid fa-arrow-right text-sm"></i>
            </a>
            <p className="text-indigo-200 text-xs mt-4">Pay on Gumroad · Sign up with the same email · Access activated instantly</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-24 bg-slate-50 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-3">
                  <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                  {faq.q}
                </h4>
                <p className="text-slate-500 text-sm leading-relaxed ml-9">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <i className="fa-solid fa-bolt text-[10px]"></i>
            </div>
            <span className="font-semibold text-slate-700">RecruiterOps</span>
          </div>
          <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} RecruiterOps. All rights reserved.</p>
          <a href="mailto:ketorah.digital@gmail.com" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
            ketorah.digital@gmail.com
          </a>
        </div>
      </footer>
    </div>
  );
};

export default LandingView;
