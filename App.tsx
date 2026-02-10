import React, { useState, useEffect } from 'react';
import { User, Quest, QuestCategory } from './types';
import { ALL_QUESTS, CORRECTION_QUESTS } from './constants';
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
  Heart
} from 'lucide-react';
import JSZip from 'jszip';
import QuestCard from './components/QuestCard';
import ReflectionFeed from './components/ReflectionFeed';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'collect' | 'active' | 'reflect'>('collect');
  const [showProfile, setShowProfile] = useState(false);
  const [confirmQuest, setConfirmQuest] = useState<Quest | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nurpath_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  const saveUser = (u: User) => {
    setUser(u);
    localStorage.setItem('nurpath_user', JSON.stringify(u));
  };

  const handleQuestSelect = (q: Quest) => {
    if (!user || q.isGreyed) return;
    const isAlreadyActive = user.activeQuests.includes(q.id);
    if (isAlreadyActive) {
      setActiveTab('active');
    } else {
      setConfirmQuest(q);
    }
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

    try {
      // THE COMPLETE PROJECT EXPORT
      const filesToInclude = [
        { path: 'index.html', fetchPath: '/' },
        { path: 'index.tsx', fetchPath: '/index.tsx' },
        { path: 'App.tsx', fetchPath: '/App.tsx' },
        { path: 'types.ts', fetchPath: '/types.ts' },
        { path: 'constants.ts', fetchPath: '/constants.ts' },
        { path: 'metadata.json', fetchPath: '/metadata.json' },
        { path: 'package.json', fetchPath: '/package.json' },
        { path: 'vite.config.ts', fetchPath: '/vite.config.ts' },
        { path: 'tsconfig.json', fetchPath: '/tsconfig.json' },
        { path: 'services/geminiService.ts', fetchPath: '/services/geminiService.ts' },
        { path: 'components/QuestCard.tsx', fetchPath: '/components/QuestCard.tsx' },
        { path: 'components/ReflectionFeed.tsx', fetchPath: '/components/ReflectionFeed.tsx' }
      ];

      for (const file of filesToInclude) {
        try {
          const res = await fetch(file.fetchPath);
          if (res.ok) {
            const content = await res.text();
            zip.file(file.path, content);
          }
        } catch (e) {
          console.warn(`Could not bundle ${file.path}`, e);
        }
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'nurpath_full_source.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  if (!user) return <AuthScreen onLogin={saveUser} />;

  const sunnahQuests = ALL_QUESTS.filter(q => q.category === QuestCategory.SUNNAH).slice(0, 10);
  const sideQuests = ALL_QUESTS.filter(q => q.category === QuestCategory.CHARITY || q.id === 'reflect_universe' || q.id === 'hug_loved_one' || q.id === 'forgive_grudge');

  return (
    <div className="max-w-md mx-auto h-screen bg-[#fdfbf7] overflow-hidden flex flex-col relative border-x border-slate-100 shadow-2xl">
      {activeTab !== 'reflect' && (
        <header className="p-6 flex items-center justify-between z-20 bg-[#fdfbf7]/90 backdrop-blur-md">
          <button onClick={() => setShowProfile(true)} className="w-12 h-12 bg-[#064e3b] rounded-[18px] shadow-lg flex items-center justify-center text-white font-bold border-2 border-[#d4af37]/30 transition-transform active:scale-90 minaret-shape">
            {user.name[0].toUpperCase()}
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-black uppercase tracking-[0.5em] text-[#064e3b]">NurPath</span>
          </div>
          <div className="flex items-center gap-2 bg-[#064e3b]/5 px-4 py-2 rounded-full border border-[#064e3b]/10">
            <Flame size={14} className="text-[#d4af37] fill-[#d4af37]" />
            <span className="text-xs font-black text-[#064e3b]">{user.xp}</span>
          </div>
        </header>
      )}

      <main className={`flex-1 overflow-y-auto ${activeTab === 'reflect' ? '' : 'pb-32 px-6'} transition-all scrollbar-hide`}>
        {activeTab === 'collect' && (
          <div className="space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-slate-900 leading-tight">Peace be upon you, <br/><span className="text-[#064e3b]">{user.name.split(' ')[0]}</span></h1>
              <p className="text-[10px] text-[#d4af37] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Star size={12} className="fill-[#d4af37]" /> Path of the Seeker
              </p>
            </div>

            <section className="space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Core Foundations</h2>
              <div className="grid grid-cols-1 gap-4">
                {ALL_QUESTS.filter(q => q.category === QuestCategory.MAIN).map(q => (
                  <QuestCard key={q.id} quest={q} onAction={handleQuestSelect} />
                ))}
              </div>
            </section>

            <section className="bg-[#064e3b] p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-5"><Star size={120} className="text-[#d4af37]" /></div>
               <h3 className="text-xl font-bold mb-2">Sunnah Deeds</h3>
               <p className="text-white/60 text-[10px] mb-8 uppercase tracking-widest">Following the Messenger (PBUH).</p>
               <div className="grid grid-cols-2 gap-3">
                 {sunnahQuests.map(q => (
                   <button key={q.id} onClick={() => handleQuestSelect(q)} className={`p-4 rounded-3xl text-left border-2 transition-all active:scale-95 ${user.activeQuests.includes(q.id) ? 'bg-[#d4af37] border-transparent text-white shadow-lg' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                     <div className="font-bold text-[11px] mb-1 line-clamp-1">{q.title}</div>
                     <div className="text-[9px] opacity-50">+{q.xp} XP</div>
                   </button>
                 ))}
               </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Side Quests</h2>
                <Heart size={14} className="text-rose-400 fill-rose-400" />
              </div>
              <div className="grid grid-cols-1 gap-4">
                {sideQuests.map(q => (
                  <QuestCard key={q.id} quest={q} onAction={handleQuestSelect} />
                ))}
              </div>
            </section>

            <section className="bg-white border border-slate-100 p-8 rounded-[45px] space-y-6 shadow-sm">
               <div className="flex items-center gap-3 text-slate-900">
                  <AlertCircle size={20} className="text-rose-500" />
                  <h3 className="text-lg font-bold tracking-tight">Path Correction</h3>
               </div>
               <p className="text-xs text-slate-500 leading-relaxed">If you slipped today, use these deeds to find your way back.</p>
               <div className="grid grid-cols-2 gap-2">
                  {Object.keys(CORRECTION_QUESTS).map(type => (
                    <button key={type} onClick={() => handleCorrection(type)} className="py-4 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-[9px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-between">
                      {type.replace('_', ' ')}
                      <ChevronRight size={14} />
                    </button>
                  ))}
               </div>
            </section>
          </div>
        )}

        {activeTab === 'active' && (
          <div className="space-y-8 py-8 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center gap-5">
               <div className="w-16 h-16 bg-[#064e3b] rounded-[22px] flex items-center justify-center text-white shadow-xl"><Target size={30} /></div>
               <div>
                 <h2 className="text-2xl font-bold tracking-tight text-slate-900">Active Path</h2>
                 <p className="text-[10px] text-[#d4af37] font-black uppercase tracking-widest">Ongoing Commitments</p>
               </div>
            </div>
            {user.activeQuests.length === 0 ? (
              <div className="h-[50vh] flex flex-col items-center justify-center text-center opacity-30">
                <LayoutGrid size={64} className="mb-6 text-[#064e3b]" />
                <p className="font-bold text-[#064e3b] text-xl">The path is clear.</p>
                <p className="text-xs mt-2">Add goals from the Collect tab.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {user.activeQuests.map(id => {
                  const q = [...ALL_QUESTS, ...Object.values(CORRECTION_QUESTS).flat()].find(x => x.id === id);
                  return q ? <QuestCard key={id} quest={q} isActive onComplete={completeQuest} /> : null;
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reflect' && <ReflectionFeed />}
      </main>

      <nav className="fixed bottom-8 left-8 right-8 bg-white/90 backdrop-blur-2xl border border-white/40 rounded-[35px] p-2 flex justify-between items-center shadow-2xl z-50">
        <NavBtn active={activeTab === 'collect'} icon={<LayoutGrid />} onClick={() => setActiveTab('collect')} label="Collect" />
        <NavBtn active={activeTab === 'active'} icon={<Map />} onClick={() => setActiveTab('active')} label="Active" />
        <NavBtn active={activeTab === 'reflect'} icon={<Sparkles />} onClick={() => setActiveTab('reflect')} label="Reflect" />
      </nav>

      {showProfile && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex justify-end" onClick={() => setShowProfile(false)}>
           <div className="w-4/5 bg-[#fdfbf7] h-full p-10 animate-in slide-in-from-right duration-500 shadow-3xl flex flex-col overflow-y-auto scrollbar-hide" onClick={e => e.stopPropagation()}>
              <div className="w-20 h-20 bg-[#064e3b] rounded-[24px] minaret-shape mb-8 flex items-center justify-center text-white text-3xl font-black border-2 border-[#d4af37]/30">{user.name[0]}</div>
              <h2 className="text-3xl font-bold text-slate-900">{user.name}</h2>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2 mb-12">{user.email}</p>
              
              <div className="space-y-4 mb-12">
                <div className="bg-white p-6 rounded-[30px] border border-slate-100 flex justify-between items-center shadow-sm">
                  <div className="text-[10px] font-black uppercase text-slate-400">Total XP</div>
                  <div className="text-xl font-black text-[#064e3b]">{user.xp}</div>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Developer Utilities</h4>
                <button 
                  onClick={handleDownloadProject} 
                  disabled={isExporting}
                  className="flex items-center justify-between text-[#064e3b] font-black text-[10px] uppercase tracking-widest p-6 bg-[#064e3b]/5 border-2 border-[#064e3b]/10 rounded-[25px] w-full active:scale-95 transition-all disabled:opacity-50"
                >
                  {isExporting ? 'Bundling Source...' : 'Download Full Source'}
                  {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                </button>

                <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest pt-6">Account Settings</h4>
                <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="flex items-center justify-between text-rose-500 font-bold text-xs p-6 bg-rose-50 rounded-[25px] w-full active:scale-95 transition-all">
                  Sign Out <LogOut size={16} />
                </button>
              </div>
           </div>
        </div>
      )}

      {confirmQuest && (
        <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-md flex items-center justify-center p-8">
          <div className="bg-white w-full rounded-[40px] p-8 text-center space-y-6 animate-in zoom-in-95">
            <h3 className="text-xl font-bold">Add to Active?</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Commit to: <br/><strong>{confirmQuest.title}</strong></p>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setConfirmQuest(null)} className="flex-1 py-4 bg-slate-50 text-slate-400 font-bold rounded-2xl">Cancel</button>
              <button onClick={addToActive} className="flex-1 py-4 bg-[#064e3b] text-white font-bold rounded-2xl shadow-lg">Commit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NavBtn = ({active, icon, onClick, label}) => (
  <button onClick={onClick} className={`flex-1 flex flex-col items-center py-4 rounded-[28px] transition-all duration-300 ${active ? 'bg-[#064e3b] text-white shadow-xl scale-105' : 'text-slate-300'}`}>
    {React.cloneElement(icon, { size: 20 })}
    {active && <span className="text-[8px] font-black uppercase tracking-widest mt-1">{label}</span>}
  </button>
);

const AuthScreen = ({onLogin}) => {
  const [data, setData] = useState({ name: '', email: '' });
  const [step, setStep] = useState('entry');

  if (step === 'verify') return (
    <div className="max-w-md mx-auto h-screen bg-[#fdfbf7] flex flex-col items-center justify-center p-12 text-center">
      <h2 className="text-3xl font-bold mb-4">Verify Identity</h2>
      <p className="text-slate-400 text-sm mb-12">A code was sent to {data.email}</p>
      <button onClick={() => onLogin({...data, xp:0, activeQuests:[], isVerified:true, location:'Earth'})} className="w-full py-5 bg-[#064e3b] text-white rounded-3xl font-bold text-lg shadow-2xl">Verify (Use 123456)</button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto h-screen bg-[#fdfbf7] flex flex-col items-center justify-center p-12 arabian-pattern overflow-hidden relative">
      <div className="w-24 h-24 bg-[#064e3b] rounded-[30px] minaret-shape mb-12 flex items-center justify-center text-white border-4 border-[#d4af37]/30 shadow-2xl animate-float z-10">
         <Star size={40} className="fill-[#d4af37] text-[#d4af37]" />
      </div>
      <h1 className="text-6xl font-black text-[#064e3b] mb-4 tracking-tighter">NurPath</h1>
      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em] mb-16 text-center">Spiritual Growth Reimagined</p>
      <form className="w-full space-y-4 z-10" onSubmit={e => {e.preventDefault(); setStep('verify')}}>
        <input required placeholder="Full Name" className="w-full p-6 rounded-[30px] border-2 border-slate-100 outline-none focus:border-[#064e3b] transition-colors" onChange={e => setData({...data, name: e.target.value})} />
        <input required type="email" placeholder="Email Address" className="w-full p-6 rounded-[30px] border-2 border-slate-100 outline-none focus:border-[#064e3b] transition-colors" onChange={e => setData({...data, email: e.target.value})} />
        <button type="submit" className="w-full py-7 bg-[#064e3b] text-white rounded-[30px] font-black text-xl shadow-2xl">Begin Journey</button>
      </form>
    </div>
  );
};

export default App;