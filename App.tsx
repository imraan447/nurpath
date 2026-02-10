import React, { useState, useEffect, useCallback } from 'react';
import { User, Quest, QuestCategory, ReflectionItem } from './types';
import { ALL_QUESTS, CORRECTION_QUESTS, SEED_REFLECTIONS } from './constants';
import { 
  LayoutGrid, 
  Map, 
  Sparkles, 
  LogOut,
  Target,
  Flame,
  Star,
  AlertCircle,
  Plus,
  Download,
  Loader2,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import JSZip from 'jszip';
import QuestCard from './components/QuestCard';
import ReflectionFeed from './components/ReflectionFeed';
import { generateReflections } from './services/geminiService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'collect' | 'active' | 'reflect'>('collect');
  const [showProfile, setShowProfile] = useState(false);
  const [confirmQuest, setConfirmQuest] = useState<Quest | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Reflection State for Pre-loading
  const [reflections, setReflections] = useState<ReflectionItem[]>(SEED_REFLECTIONS);
  const [loadingReflections, setLoadingReflections] = useState(false);

  // Load user from local storage
  useEffect(() => {
    const saved = localStorage.getItem('nurpath_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        console.error("Auth error", e);
      }
    }
  }, []);

  // Pre-load Logic: Phase 1 (App Entry)
  useEffect(() => {
    const preloadOnEntry = async () => {
      setLoadingReflections(true);
      const items = await generateReflections(5); // Preload 5 items on start
      if (items.length > 0) {
        setReflections(prev => [...prev, ...items]);
      }
      setLoadingReflections(false);
    };
    preloadOnEntry();
  }, []);

  // Pre-load Logic: Phase 2 (Tab Click)
  useEffect(() => {
    if (activeTab === 'reflect' && reflections.length < 10 && !loadingReflections) {
      handleLoadMoreReflections(6);
    }
  }, [activeTab]);

  const handleLoadMoreReflections = useCallback(async (count: number) => {
    if (loadingReflections) return;
    setLoadingReflections(true);
    const news = await generateReflections(count);
    if (news.length > 0) {
      setReflections(prev => [...prev, ...news]);
    }
    setLoadingReflections(false);
  }, [loadingReflections]);

  const saveUser = (u: User) => {
    setUser(u);
    localStorage.setItem('nurpath_user', JSON.stringify(u));
  };

  const handleQuestSelect = (q: Quest) => {
    if (!user || q.isGreyed) return;
    if (user.activeQuests.includes(q.id)) {
      setActiveTab('active');
    } else {
      setConfirmQuest(q);
    }
  };

  const addAllSalah = () => {
    if (!user) return;
    const coreIds = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const updated = { ...user, activeQuests: [...new Set([...user.activeQuests, ...coreIds])] };
    saveUser(updated);
    setActiveTab('active');
  };

  const addToActive = () => {
    if (!user || !confirmQuest) return;
    const updated = { ...user, activeQuests: [...new Set([...user.activeQuests, confirmQuest.id])] };
    saveUser(updated);
    setConfirmQuest(null);
    setActiveTab('active');
  };

  const completeQuest = (q: Quest) => {
    if (!user) return;
    const updated = { 
      ...user, 
      xp: user.xp + q.xp, 
      activeQuests: user.activeQuests.filter(id => id !== q.id) 
    };
    saveUser(updated);
  };

  const handleCorrection = (type: string) => {
    if (!user) return;
    const additions = CORRECTION_QUESTS[type].map(q => q.id);
    saveUser({ ...user, activeQuests: [...new Set([...user.activeQuests, ...additions])] });
    setActiveTab('active');
  };

  const handleDownloadProject = async () => {
    setIsExporting(true);
    const zip = new JSZip();
    const files = [
      'index.html', 
      'index.tsx', 
      'App.tsx', 
      'types.ts', 
      'constants.ts', 
      'metadata.json', 
      'package.json', 
      'vite.config.ts', 
      'tsconfig.json', 
      'services/geminiService.ts', 
      'components/QuestCard.tsx', 
      'components/ReflectionFeed.tsx'
    ];
    try {
      for (const f of files) {
        const r = await fetch(`/${f}`);
        if (r.ok) {
          const content = await r.text();
          zip.file(f, content);
        }
      }
      const b = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(b);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'nurpath_optimized.zip';
      a.click();
    } catch (e) {
      console.error("Export failure:", e);
    } finally {
      setIsExporting(false);
    }
  };

  if (!user) return <AuthScreen onLogin={saveUser} />;

  return (
    <div className="max-w-md mx-auto h-screen bg-[#fdfbf7] overflow-hidden flex flex-col relative border-x border-slate-100 shadow-2xl">
      {activeTab !== 'reflect' && (
        <header className="p-6 flex items-center justify-between z-20 bg-[#fdfbf7]/90 backdrop-blur-md">
          <button onClick={() => setShowProfile(true)} className="w-12 h-12 bg-[#064e3b] rounded-[18px] shadow-lg flex items-center justify-center text-white font-bold border-2 border-[#d4af37]/40 transition-transform active:scale-90 minaret-shape">
            {user.name[0].toUpperCase()}
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[12px] font-black uppercase tracking-[0.5em] text-[#064e3b]">NurPath</span>
          </div>
          <div className="flex items-center gap-2 bg-[#064e3b]/5 px-4 py-2 rounded-full border border-[#064e3b]/10">
            <Flame size={14} className="text-[#d4af37] fill-[#d4af37]" />
            <span className="text-xs font-black text-[#064e3b]">{user.xp}</span>
          </div>
        </header>
      )}

      <main className={`flex-1 overflow-y-auto scrollbar-hide ${activeTab === 'reflect' ? '' : 'pb-40 px-6'}`}>
        {activeTab === 'collect' && (
          <div className="space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-slate-900 leading-tight tracking-tight">Salam, <br/><span className="text-[#064e3b]">{user.name.split(' ')[0]}</span></h1>
              <p className="text-[10px] text-[#d4af37] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                <Star size={12} className="fill-[#d4af37]" /> Path of the Believer
              </p>
            </div>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">The Five Pillars</h2>
                <button onClick={addAllSalah} className="text-[9px] font-black text-[#064e3b] uppercase tracking-widest bg-[#064e3b]/5 px-4 py-2 rounded-full flex items-center gap-2 border border-[#064e3b]/10 hover:bg-[#064e3b]/10 transition-all">
                  <Plus size={12} /> Add All Daily Salah
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {ALL_QUESTS.filter(q => q.category === QuestCategory.MAIN).map(q => (
                  <QuestCard key={q.id} quest={q} onAction={handleQuestSelect} />
                ))}
              </div>
            </section>

            <section className="bg-[#064e3b] p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-5"><Star size={140} className="text-[#d4af37]" /></div>
               <h3 className="text-2xl font-bold mb-2">Sunnah Daily</h3>
               <p className="text-white/60 text-[10px] mb-8 uppercase tracking-widest font-black">Emulating the Messenger (PBUH)</p>
               <div className="grid grid-cols-2 gap-3">
                 {ALL_QUESTS.filter(q => q.category === QuestCategory.SUNNAH).slice(0, 8).map(q => (
                   <button key={q.id} onClick={() => handleQuestSelect(q)} className={`p-5 rounded-3xl text-left border-2 transition-all active:scale-95 ${user.activeQuests.includes(q.id) ? 'bg-[#d4af37] border-transparent text-white shadow-lg' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                     <div className="font-bold text-[11px] mb-1 line-clamp-1">{q.title}</div>
                     <div className="text-[9px] font-black opacity-50">+{q.xp} XP</div>
                   </button>
                 ))}
               </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Kinship & Character</h2>
              <div className="grid grid-cols-1 gap-4">
                {ALL_QUESTS.filter(q => ['forgive_someone', 'maintain_kinship'].includes(q.id)).map(q => (
                  <QuestCard key={q.id} quest={q} onAction={handleQuestSelect} />
                ))}
                {ALL_QUESTS.filter(q => q.category === QuestCategory.CHARITY).map(q => (
                  <QuestCard key={q.id} quest={q} onAction={handleQuestSelect} />
                ))}
              </div>
            </section>

            <section className="bg-white border border-slate-100 p-8 rounded-[45px] space-y-6 shadow-sm">
               <div className="flex items-center gap-3 text-slate-900">
                  <AlertCircle size={22} className="text-rose-500" />
                  <h3 className="text-lg font-bold tracking-tight">Tawbah (Correction)</h3>
               </div>
               <p className="text-xs text-slate-500 leading-relaxed">Turn back through sincere repair of the self.</p>
               <div className="grid grid-cols-2 gap-3">
                  {Object.keys(CORRECTION_QUESTS).map(type => (
                    <button key={type} onClick={() => handleCorrection(type)} className="py-5 px-4 bg-slate-50 border border-slate-100 rounded-3xl text-[9px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-between">
                      {type.replace('_', ' ')}
                      <ChevronRight size={16} className="text-[#064e3b]" />
                    </button>
                  ))}
               </div>
            </section>
          </div>
        )}

        {activeTab === 'active' && (
          <div className="space-y-8 py-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-5">
               <div className="w-16 h-16 bg-[#064e3b] rounded-[24px] flex items-center justify-center text-white shadow-xl minaret-shape"><Target size={30} /></div>
               <div>
                 <h2 className="text-2xl font-bold tracking-tight text-slate-900">The Path Today</h2>
                 <p className="text-[10px] text-[#d4af37] font-black uppercase tracking-widest">Active Commitments</p>
               </div>
            </div>
            {user.activeQuests.length === 0 ? (
              <div className="h-[55vh] flex flex-col items-center justify-center text-center opacity-40">
                <LayoutGrid size={72} className="mb-6 text-[#064e3b]" />
                <p className="font-bold text-[#064e3b] text-xl">Peaceful Quiet</p>
                <p className="text-xs mt-3 text-slate-400">Begin your spiritual work in the Collect tab.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {user.activeQuests.map(id => {
                  const q = [...ALL_QUESTS, ...Object.values(CORRECTION_QUESTS).flat()].find(x => x.id === id);
                  return q ? <QuestCard key={id} quest={q} isActive onComplete={completeQuest} /> : null;
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reflect' && (
          <ReflectionFeed 
            items={reflections} 
            loading={loadingReflections} 
            onLoadMore={() => handleLoadMoreReflections(6)} 
          />
        )}
      </main>

      <nav className="fixed bottom-10 left-10 right-10 bg-white/95 backdrop-blur-3xl border border-white/50 rounded-[40px] p-2 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-[60]">
        <NavBtn active={activeTab === 'collect'} icon={<LayoutGrid />} onClick={() => setActiveTab('collect')} label="Collect" />
        <NavBtn active={activeTab === 'active'} icon={<Map />} onClick={() => setActiveTab('active')} label="Active" />
        <NavBtn active={activeTab === 'reflect'} icon={<Sparkles />} onClick={() => setActiveTab('reflect')} label="Reflect" />
      </nav>

      {showProfile && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md flex justify-end" onClick={() => setShowProfile(false)}>
           <div className="w-4/5 bg-[#fdfbf7] h-full p-10 animate-in slide-in-from-right duration-500 shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="w-24 h-24 bg-[#064e3b] rounded-[28px] minaret-shape mb-10 flex items-center justify-center text-white text-4xl font-black border-4 border-[#d4af37]/30 shadow-2xl animate-float">{user.name[0]}</div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{user.name}</h2>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-3 mb-10">{user.email}</p>
              
              <div className="space-y-4 mb-10">
                <div className="bg-white p-8 rounded-[35px] border border-slate-100 flex justify-between items-center shadow-sm">
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nur Points</div>
                  <div className="text-2xl font-black text-[#064e3b]">{user.xp}</div>
                </div>
                <div className="p-4 bg-[#064e3b]/5 rounded-2xl border border-[#064e3b]/10 text-[9px] text-slate-500 italic">
                  Note: Data is saved locally on this browser.
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <button onClick={handleDownloadProject} disabled={isExporting} className="flex items-center justify-between text-[#064e3b] font-black text-[10px] uppercase tracking-widest p-7 bg-[#064e3b]/5 border-2 border-[#064e3b]/10 rounded-[30px] w-full active:scale-95 transition-all">
                  {isExporting ? 'Bundling Source...' : 'Download Full Project'}
                  {isExporting ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                </button>
                <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="flex items-center justify-between text-rose-500 font-bold text-[10px] uppercase tracking-widest p-7 bg-rose-50 rounded-[30px] w-full active:scale-95 transition-all">
                  Sign Out <LogOut size={20} />
                </button>
              </div>
           </div>
        </div>
      )}

      {confirmQuest && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-xl flex items-center justify-center p-8">
          <div className="bg-white w-full rounded-[45px] p-10 text-center space-y-8 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-[#064e3b]/5 rounded-full flex items-center justify-center text-[#d4af37] mx-auto">
              <Star size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">New Intention</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Will you commit to <br/><strong className="text-slate-900">{confirmQuest.title}</strong> today?</p>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={() => setConfirmQuest(null)} className="flex-1 py-5 bg-slate-50 text-slate-400 font-black rounded-3xl uppercase text-[10px] tracking-widest">Wait</button>
              <button onClick={addToActive} className="flex-1 py-5 bg-[#064e3b] text-white font-black rounded-3xl shadow-xl shadow-[#064e3b]/20 uppercase text-[10px] tracking-widest">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NavBtn = ({active, icon, onClick, label}) => (
  <button onClick={onClick} className={`flex-1 flex flex-col items-center py-5 rounded-[32px] transition-all duration-300 ${active ? 'bg-[#064e3b] text-white shadow-2xl scale-110 translate-y-[-5px]' : 'text-slate-300 hover:text-slate-400'}`}>
    {React.cloneElement(icon, { size: 22 })}
    {active && <span className="text-[8px] font-black uppercase tracking-widest mt-2">{label}</span>}
  </button>
);

const AuthScreen = ({onLogin}) => {
  const [data, setData] = useState({ name: '', email: '' });
  const [step, setStep] = useState('entry');

  if (step === 'verify') return (
    <div className="max-w-md mx-auto h-screen bg-[#fdfbf7] flex flex-col items-center justify-center p-12 text-center arabian-pattern">
      <div className="w-20 h-20 bg-[#d4af37]/10 rounded-full flex items-center justify-center text-[#d4af37] mb-8">
        <ShieldCheck size={48} />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 mb-4">Identity Guard</h2>
      <p className="text-slate-400 text-sm mb-12 leading-relaxed">A specialized verification link was dispatched to <br/><strong>{data.email}</strong></p>
      <div className="flex gap-3 mb-12">
        {[1,2,3,4,5,6].map(i => <div key={i} className="w-11 h-14 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center font-bold text-[#064e3b] shadow-sm animate-pulse">•</div>)}
      </div>
      <button onClick={() => onLogin({...data, xp:0, activeQuests:[], isVerified:true, location:'Earth'})} className="w-full py-6 bg-[#064e3b] text-white rounded-[35px] font-black text-lg shadow-2xl uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all">Verify & Enter</button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto h-screen bg-[#fdfbf7] flex flex-col items-center justify-center p-12 arabian-pattern overflow-hidden relative">
      <div className="w-28 h-28 bg-[#064e3b] rounded-[35px] minaret-shape mb-14 flex items-center justify-center text-white border-4 border-[#d4af37]/30 shadow-[0_25px_50px_rgba(6,78,59,0.3)] animate-float z-10">
         <Star size={48} className="fill-[#d4af37] text-[#d4af37]" />
      </div>
      <h1 className="text-7xl font-black text-[#064e3b] mb-4 tracking-tighter">NurPath</h1>
      <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.7em] mb-16 text-center">Spiritual Mastery Reimagined</p>
      <form className="w-full space-y-5 z-10" onSubmit={e => {e.preventDefault(); setStep('verify')}}>
        <input required placeholder="Full Name" className="w-full p-7 rounded-[35px] border-2 border-slate-100 outline-none focus:border-[#064e3b] bg-white/50 backdrop-blur-sm transition-all shadow-sm" onChange={e => setData({...data, name: e.target.value})} />
        <input required type="email" placeholder="Email Address" className="w-full p-7 rounded-[35px] border-2 border-slate-100 outline-none focus:border-[#064e3b] bg-white/50 backdrop-blur-sm transition-all shadow-sm" onChange={e => setData({...data, email: e.target.value})} />
        <button type="submit" className="w-full py-8 bg-[#064e3b] text-white rounded-[35px] font-black text-xl shadow-[0_15px_30px_rgba(6,78,59,0.2)] uppercase tracking-[0.2em] mt-6 hover:scale-105 active:scale-95 transition-all">Begin Journey</button>
      </form>
    </div>
  );
};

export default App;