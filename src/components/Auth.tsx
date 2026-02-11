
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Loader2, ArrowRight, Mail, Lock, User, Globe, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';

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
  const [isLogin, setIsLogin] = useState(true);
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

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        onLoginSuccess();
      } else {
        // Sign Up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              country,
              xp: 0
            }
          }
        });
        
        if (signUpError) throw signUpError;

        setMessage("Verification email sent! Please check your inbox.");
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
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
            <div className="flex justify-center mb-8 bg-slate-100 p-1.5 rounded-full w-fit mx-auto">
                <button 
                    onClick={() => { setIsLogin(true); setError(null); }}
                    className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${isLogin ? 'bg-white text-[#064e3b] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Log In
                </button>
                <button 
                    onClick={() => { setIsLogin(false); setError(null); }}
                    className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${!isLogin ? 'bg-white text-[#064e3b] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Sign Up
                </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
                
                {!isLogin && (
                    <>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#064e3b] transition-colors" size={20} />
                        <input 
                            type="text" 
                            required={!isLogin}
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-4 pl-12 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#064e3b] outline-none font-bold text-slate-900 placeholder:text-slate-300 transition-all focus:bg-white"
                        />
                    </div>
                    <div className="relative group">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#064e3b] transition-colors" size={20} />
                        <select
                            required={!isLogin}
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

                {error && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-3">
                        <AlertCircle className="text-rose-500 shrink-0" size={20} />
                        <p className="text-xs font-bold text-rose-600 leading-relaxed">{error}</p>
                    </div>
                )}

                {message && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
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
                            {isLogin ? 'Continue Journey' : 'Begin Journey'} 
                            <ArrowRight size={18} />
                        </>
                    )}
                </button>
            </form>
        </div>
        
        <p className="text-center mt-8 text-[10px] text-slate-400 font-black uppercase tracking-widest">
            Protected by Supabase Auth
        </p>
      </div>
    </div>
  );
};

export default Auth;
