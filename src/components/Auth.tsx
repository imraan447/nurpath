
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

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            setError(null);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                    redirectTo: window.location.origin,
                },
            });
            if (error) throw error;
        } catch (err: any) {
            console.error("Google Auth error:", err);
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#f7f1e3] relative overflow-hidden">

            <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">

                {/* Logo Section */}
                <img
                    src="/images/nurpath_logo.png"
                    alt="NurPath"
                    className="w-48 h-auto mx-auto mb-6 object-contain"
                />

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

                        <div className="relative flex items-center gap-4 my-6">
                            <div className="h-px bg-slate-200 flex-1"></div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or continue with</span>
                            <div className="h-px bg-slate-200 flex-1"></div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full py-4 rounded-2xl bg-white border-2 border-slate-100 text-slate-600 font-bold uppercase tracking-widest shadow-sm hover:shadow-md hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.7666 15.9274 23.7666 12.2764Z" fill="#4285F4" />
                                <path d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3276 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z" fill="#34A853" />
                                <path d="M5.50253 14.3003C5.00236 12.8099 5.00236 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z" fill="#FBBC05" />
                                <path d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Auth;
