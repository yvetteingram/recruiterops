import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface AuthViewProps {
  onAuthSuccess: () => void;
  onDemoLogin?: () => void;
  onBack?: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess, onDemoLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const configured = isSupabaseConfigured();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured || !supabase) {
      setError("Database connection not detected. Launch demo to explore.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // Check if email has an active Gumroad subscription before allowing signup
        const { data: profileData } = await supabase
          .from('profiles')
          .select('subscription_status')
          .eq('email', email.toLowerCase().trim())
          .single();

        if (!profileData || profileData.subscription_status !== 'active') {
          setError("No active subscription found for this email. Please purchase RecruiterOps on Gumroad first, then return here to create your account.");
          setLoading(false);
          return;
        }

        const { error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) {
          setError(authError.message);
        } else {
          alert("Activation email sent. Please verify your email to access your account.");
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) {
          setError(authError.message);
        } else {
          onAuthSuccess();
        }
      }
    } catch (e: any) {
      setError(e.message || "Auth protocol failure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="w-full px-8 h-20 flex justify-between items-center bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <i className="fa-solid fa-bolt text-sm"></i>
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900 uppercase">RecruiterOps</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-xs font-black uppercase text-slate-400 hover:text-slate-900 transition-colors tracking-widest">
            {isSignUp ? 'Log In' : 'Sign Up'}
          </button>
          {!configured && (
            <button onClick={onDemoLogin} className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all shadow-sm">
              Launch Demo
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Background Accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[500px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none"></div>

        <button 
          onClick={onBack}
          className="mb-8 text-slate-400 hover:text-slate-600 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors z-10"
        >
          <i className="fa-solid fa-arrow-left text-[8px]"></i>
          Back to landing
        </button>

        <div className="w-full max-w-[460px] bg-white rounded-[2.5rem] p-12 text-center shadow-2xl shadow-slate-200 border border-slate-100 z-10 relative">
          <h2 className="text-[32px] font-black text-slate-900 tracking-tight mb-2 leading-none uppercase">
            {isSignUp ? 'Create Account' : 'Recruiter Login'}
          </h2>
          <p className="text-slate-500 font-medium text-sm mb-10 leading-relaxed">
            {isSignUp 
              ? 'Use the same email you purchased with on Gumroad to activate your account.' 
              : 'Welcome back. Sign in to your recruiting desk.'}
          </p>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold text-left flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-circle-exclamation mt-0.5"></i>
                <p>{error}</p>
              </div>
              {error.includes('Gumroad') && (
                <a
                  href="https://ketorahdigital.gumroad.com/l/recruiteros"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-6 text-indigo-600 hover:text-indigo-700 font-black uppercase tracking-widest text-[10px] underline underline-offset-4"
                >
                  Purchase RecruiterOps on Gumroad →
                </a>
              )}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6 text-left">
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5">Email Address</label>
              <input
                type="email"
                required
                placeholder="recruiter@boutique.co"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5">Secure Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 bottom-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
            >
              {loading ? (
                <i className="fa-solid fa-spinner fa-spin"></i>
              ) : (
                isSignUp ? 'ACTIVATE ACCOUNT' : 'SIGN IN'
              )}
            </button>
          </form>

          {!configured && (
            <div className="mt-10 pt-8 border-t border-slate-50">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4 italic leading-relaxed">
                 Database integration required for persistent ops.
               </p>
               <button onClick={onDemoLogin} className="text-indigo-600 hover:text-indigo-700 font-black text-[10px] uppercase tracking-[0.2em]">
                 Enter Workspace in Demo Mode
               </button>
            </div>
          )}

          <div className="mt-8">
            <p className="text-xs text-slate-500 font-medium">
              {isSignUp ? 'Already have an account?' : "New to RecruiterOps?"}{' '}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-indigo-600 hover:text-indigo-700 font-bold underline underline-offset-4"
              >
                {isSignUp ? 'Sign In' : 'Create an Account'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;