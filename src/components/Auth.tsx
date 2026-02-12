
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Loader2, ArrowRight, Mail, Lock, User, Globe, AlertCircle, CheckCircle2, ChevronDown, ArrowLeft } from 'lucide-react';

interface AuthProps {
  onLoginSuccess: () => void;
}

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria", "Bahrain", "Bangladesh", "Belgium", "Bosnia", "Brazil", "Brunei", 
  "Canada", "China", "Croatia", "Denmark", "Egypt", "Ethiopia", "Finland", "France", "Gambia", "Germany", "Ghana", "Greece", "India", 
  "Indonesia", "Iran", "Iraq", "Ireland", "Italy", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Lebanon", "Libya", "Malaysia", 
  "Maldives", "Mali", "Mauritania", "Morocco", "Netherlands", "New Zealand", "Nigeria", "Norway", "Oman", "Pakistan", "Palestine", 
  "Philippines", "Poland", "Portugal", "Qatar", "Russia", "Saudi Arabia", "Senegal", "Singapore", "Somalia", "South Africa", "South Korea", 
  "Spain", "Sri Lanka", "Sudan", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Tunisia", "Turkey", "Turkmenistan", 
  "UAE", "UK", "USA", "Uganda", "Uzbekistan", "Yemen", "Other"
];

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<'login' | 'signup' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const cleanEmail = email.trim();
    const cleanUsername = username.trim();

    try {
      if (view === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });
        if (error) throw error;
        onLoginSuccess();
      } else if (view === 'signup') {
        
        // Direct Sign Up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              username: cleanUsername,
              country,
            }
          }
        });
        
        if (signUpError) throw signUpError;

        // 3. Handle Auto-Login vs Email Verification
        if (data.session) {
            // ARTIFICIAL DELAY: Give the DB Trigger time to create the profile
            await new Promise(resolve => setTimeout(resolve, 1500));
            onLoginSuccess();
        } else if (data.user) {
            setMessage("Verification email sent! Please check your inbox to activate your account.");
            setView('login');
            setPassword('');
        }
      } else if (view === 'forgot') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
            redirectTo: window.location.origin,
        });
        if (resetError) throw resetError;
        setMessage("Password reset link sent to your email.");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let errMsg = err.message || (typeof err === 'string' ? err : "An error occurred");
      const lowerMsg = errMsg.toLowerCase();

      // 1. Handle Existing User -> Redirect to Login
      if (lowerMsg.includes("already registered") || lowerMsg.includes("unique constraint") || lowerMsg.includes("already exists")) {
         setView('login');
         setMessage("Account already exists. Please log in.");
         setLoading(false);
         return; 
      } 
      
      // 2. Handle Rate Limit -> Extended Wait Message (Doubled again as requested: ~10 minutes)
      else if (lowerMsg.includes("rate limit") || lowerMsg.includes("too many requests") || lowerMsg.includes("429")) {
         errMsg = "Security Pause: Please wait 10 minutes before trying again.";
      } 
      
      // 3. Handle Weak Password
      else if (lowerMsg.includes("security purposes") || lowerMsg.includes("weak password")) {
         errMsg = "Password is too weak. Try using a longer password.";
      }
      
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#fdfbf7] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 arabian-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#064e3b]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Logo Section */}
        <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#064e3b] to-[#042f24] rounded-[24px] flex items-center justify-center text-white shadow-2xl minaret-shape mb-6 border-4 border-[#d4af37]">
                <span className="text-3xl font-serif">N</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">NurPath</h1>
            <p className="text-[#d4af37] font-black uppercase tracking-[0.3em] text-xs">Journey to Light</p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[40px] shadow-2xl p-8 border border-white/50">
            {view !== 'forgot' && (
                <div className="flex justify-center mb-8 bg-slate-100 p-1.5 rounded-full w-fit mx-auto">
                    <button 
                        onClick={() => { setView('login'); setError(null); }}
                        className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${view === 'login' ? 'bg-white text-[#064e3b] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Log In
                    </button>
                    <button 
                        onClick={() => { setView('signup'); setError(null); }}
                        className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${view === 'signup' ? 'bg-white text-[#064e3b] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Sign Up
                    </button>
                </div>
            )}

            {view === 'forgot' && (
                <div className="mb-6">
                    <button onClick={() => { setView('login'); setError(null); setMessage(null); }} className="flex items-center gap-2 text-slate-400 hover:text-[#064e3b] text-xs font-bold mb-4">
                        <ArrowLeft size={16} /> Back to Login
                    </button>
                    <h2 className="text-xl font-bold text-slate-900">Reset Password</h2>
                    <p className="text-sm text-slate-500 mt-1">Enter your email to receive a reset link.</p>
                </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
                
                {view === 'signup' && (
                    <>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#064e3b] transition-colors" size={20} />
                        <input 
                            type="text" 
                            required
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-4 pl-12 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#064e3b] outline-none font-bold text-slate-900 placeholder:text-slate-300 transition-all focus:bg-white"
                        />
                    </div>
                    <div className="relative group">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#064e3b] transition-colors" size={20} />
                        <select
                            required
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full p-4 pl-12 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#064e3b] outline-none font-bold text-slate-900 transition-all focus:bg-white appearance-none text-sm"
                        >
                            <option value="" disabled className="text-slate-300">Select Country</option>
                            {COUNTRIES.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                    </>
                )}

                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#064e3b] transition-colors" size={20} />
                    <input 
                        type="email" 
                        required
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-4 pl-12 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#064e3b] outline-none font-bold text-slate-900 placeholder:text-slate-300 transition-all focus:bg-white"
                    />
                </div>

                {view !== 'forgot' && (
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#064e3b] transition-colors" size={20} />
                        <input 
                            type="password" 
                            required
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 pl-12 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#064e3b] outline-none font-bold text-slate-900 placeholder:text-slate-300 transition-all focus:bg-white"
                        />
                    </div>
                )}
                
                {view === 'login' && (
                    <div className="flex justify-end">
                        <button type="button" onClick={() => setView('forgot')} className="text-[10px] font-bold text-slate-400 hover:text-[#064e3b] uppercase tracking-wider">
                            Forgot Password?
                        </button>
                    </div>
                )}

                {error && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="text-rose-500 shrink-0" size={20} />
                        <p className="text-xs font-bold text-rose-600 leading-relaxed">{error}</p>
                    </div>
                )}

                {message && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
                        <p className="text-xs font-bold text-emerald-600 leading-relaxed">{message}</p>
                    </div>
                )}

                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-[#064e3b] text-white font-bold uppercase tracking-widest shadow-xl shadow-[#064e3b]/20 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 hover:bg-[#053c2e] mt-4 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : (
                        <>
                            {view === 'login' ? 'Continue Journey' : view === 'signup' ? 'Begin Journey' : 'Send Reset Link'} 
                            <ArrowRight size={18} />
                        </>
                    )}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
