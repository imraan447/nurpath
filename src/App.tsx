import React, { useState, useEffect, useCallback } from 'react';
import { User, Quest, QuestCategory, ReflectionItem, UserSettings } from './types';
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
  ShieldCheck,
  Settings,
  Moon,
  Sun,
  Bell,
  Type as TypeIcon,
  X,
  Lock
} from 'lucide-react';
import JSZip from 'jszip';
import QuestCard from './components/QuestCard';
import ReflectionFeed from './components/ReflectionFeed';
import { generateReflections } from './services/geminiService';

const DEFAULT_SETTINGS: UserSettings = {
  darkMode: false,
  notifications: true,
  fontSize: 'medium'
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'collect' | 'active' | 'reflect'>('collect');
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [confirmQuest, setConfirmQuest] = useState<Quest | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinVerified, setPinVerified] = useState(false);

  // Reflection State
  const [reflections, setReflections] = useState<ReflectionItem[]>(SEED_REFLECTIONS);
  const [loadingReflections, setLoadingReflections] = useState(false);
  const [tabLoadedOnce, setTabLoadedOnce] = useState(false);

  // Apply Dark Mode Class
  useEffect(() => {
    if (user?.settings?.darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [user?.settings?.darkMode]);

  // Persistence - Load user data forever
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

  // Pre-load Stage 1: Entry (Load 4 items -> Total 5)
  useEffect(() => {
    const entryLoad = async () => {
      setLoadingReflections(true);
      const items = await generateReflections(4);
      if (items.length > 0) {
        setReflections(prev => [...prev, ...items]);
      }
      setLoadingReflections(false);
    };
    entryLoad();
  }, []);

  // Pre-load Stage 2: Tab Click (Load 6 more -> Total 11)
  useEffect(() => {
    if (activeTab === 'reflect' && !tabLoadedOnce) {
      const tabLoad = async () => {
        setLoadingReflections(true);
        const items = await generateReflections(6);
        if (items.length > 0) {
          setReflections(prev => [...prev, ...items]);
        }
        setTabLoadedOnce(true);
        setLoadingReflections(false);
      };
      tabLoad();
    }
  }, [activeTab, tabLoadedOnce]);

  // Infinite Scroll Trigger (Trigger 6 more)
  const handleLoadMoreReflections = useCallback(async () => {
    if (loadingReflections) return;
    setLoadingReflections(true);
    const news = await generateReflections(6);
    if (news.length > 0) {
      setReflections(prev => [...prev, ...news]);
    }
    setLoadingReflections(false);
  }, [loadingReflections]);

  const saveUser = (u: User) => {
    setUser(u);
    localStorage.setItem('nurpath_user', JSON.stringify(u));
  };

  const updateSettings = (s: Partial<UserSettings>) => {
    if (!user) return;
    const updated = { 
      ...user, 
      settings: { ...(user.settings || DEFAULT_SETTINGS), ...s } 
    };
    saveUser(updated);
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
    if (!pinVerified) return;
    setIsExporting(true);
    const zip = new JSZip();
    const files = [
      'index.html', 'index.tsx', 'App.tsx', 'types.ts', 'constants.ts', 
      'metadata.json', 'package.json', 'vite.config.ts', 'tsconfig.json', 
      'services/geminiService.ts', 'components/QuestCard.tsx', 'components/ReflectionFeed.tsx'
    ];
    try {
      for (const f of files) {
        const r = await fetch(`/${f}`);
        if (r.ok) zip.file(f, await r.text());
      }
      const b = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.download = 'nurpath_source.zip';
      a.click();
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const verifyPin = () => {
    if (pinInput === '8156') {
      setPinVerified(true);
    } else {
      alert("Invalid PIN");
    }
  };

  if (!user) return <AuthScreen onLogin={(u) => saveUser({...u, settings: DEFAULT_SETTINGS})} />;

  const isImraan = user.email.toLowerCase() === 'imraan447@gmail.com';

  return (
    <div className={`max-w-md mx-auto h-screen overflow-hidden flex flex-col relative border-x border-slate-100 shadow-2xl transition-all ${user.settings?.darkMode ? 'bg-[#050a09]' : 'bg-[#fdfbf7]'}`}>
      {activeTab !== 'reflect' && (
        <header className={`p-6 flex items-center justify-between z-20 backdrop-blur-md ${user.settings?.darkMode ? 'bg-[#050a09]/90' : 'bg-[#fdfbf7]/90'}`}>
          <button onClick={() => setShowProfile(true)} className="w-12 h-12 bg-[#064e3b] rounded-[18px] shadow-lg flex items-center justify-center text-white font-bold border-2 border-[#d4af37]/40 transition-transform active:scale-90 minaret-shape">
            {user.name[0].toUpperCase()}
          </button>
          <div className="flex flex-col items-center">
            <span className={`text-[12px] font-black uppercase tracking-[0.5em] ${user.settings?.darkMode ? 'text-white' : 'text-[#064e3b]'}`}>NurPath</span>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${user.settings?.darkMode ? 'bg-white/5 border-white/10' : 'bg-[#064e3b]/5 border-[#064e3b]/10'}`}>
            <Flame size={14} className="text-[#d4af37] fill-[#d4af37]" />
            <span className={`text-xs font-black ${user.settings?.darkMode ? 'text-white' : 'text-[#064e3b]'}`}>{user.xp}</span>
          </div>
        </header>
      )}

      <main className={`flex-1 overflow-y-auto scrollbar-hide ${activeTab === 'reflect' ? '' : 'pb-40 px-6'}`}>
        {activeTab === 'collect' && (
          <div className="space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2">
              <h1 className={`text-4xl font-bold leading-tight tracking-tight ${user.settings?.darkMode ? 'text-white' : 'text-slate-900'}`}>Salam, <br/><span className="text-[#064e3b]">{user.name.split(' ')[0]}</span></h1>
              <p className="text-[10px] text-[#d4af37] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                <Star size={12} className="fill-[#d4af37]" /> Path of the Believer
              </p>
            </div>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">The Five Pillars</h2>
                <button onClick={addAllSalah} className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full flex items-center gap-2 border transition-all ${user.settings?.darkMode ? 'text-white bg-white/5 border-white/10 hover:bg-white/10' : 'text-[#064e3b] bg-[#064e3b]/5 border-[#064e3b]/10 hover:bg-[#064e3b]/10'}`}>
                  <Plus size={12} /> Add All Salah
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {ALL_QUESTS.filter(q => q.category === QuestCategory.MAIN && !user.activeQuests.includes(q.id)).map(q => (
                  <QuestCard key={q.id} quest={q} onAction={handleQuestSelect} darkMode={user.settings?.darkMode} />
                ))}
              </div>
            </section>

            <section className="bg-[#064e3b] p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-5"><Star size={140} className="text-[#d4af37]" /></div>
               <h3 className="text-2xl font-bold mb-2">Sunnah Daily</h3>
               <p className="text-white/60 text-[10px] mb-8 uppercase tracking-widest font-black">Emulating the Messenger (PBUH)</p>
               <div className="grid grid-cols-2 gap-3">
                 {ALL_QUESTS.filter(q => q.category === QuestCategory.SUNNAH && !user.activeQuests.includes(q.id)).slice(0, 8).map(q => (
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
                {ALL_QUESTS.filter(q => ['forgive_someone', 'maintain_kinship'].includes(q.id) && !user.activeQuests.includes(q.id)).map(q => (
                  <QuestCard key={q.id} quest={q} onAction={handleQuestSelect} darkMode={user.settings?.darkMode} />
                ))}
                {ALL_QUESTS.filter(q => q.category === QuestCategory.CHARITY && !user.activeQuests.includes(q.id)).map(q => (
                  <QuestCard key={q.id} quest={q} onAction={handleQuestSelect} darkMode={user.settings?.darkMode} />
                ))}
              </div>
            </section>

            <section className={`border p-8 rounded-[45px] space-y-6 shadow-sm transition-colors ${user.settings?.darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100'}`}>
               <div className="flex items-center gap-3">
                  <AlertCircle size={22} className="text-rose-500" />
                  <h3 className={`text-lg font-bold tracking-tight ${user.settings?.darkMode ? 'text-white' : 'text-slate-900'}`}>Tawbah (Correction)</h3>
               </div>
               <p className="text-xs text-slate-500 leading-relaxed">Turn back through sincere repair of the self.</p>
               <div className="grid grid-cols-2 gap-3">
                  {Object.keys(CORRECTION_QUESTS).map(type => (
                    <button key={type} onClick={() => handleCorrection(type)} className={`py-5 px-4 border rounded-3xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-between ${user.settings?.darkMode ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'}`}>
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
                 <h2 className={`text-2xl font-bold tracking-tight ${user.settings?.darkMode ? 'text-white' : 'text-slate-900'}`}>The Path Today</h2>
                 <p className="text-[10px] text-[#d4af37] font-black uppercase tracking-widest">Active Commitments</p>
               </div>
            </div>
            {user.activeQuests.length === 0 ? (
              <div className="h-[55vh] flex flex-col items-center justify-center text-center opacity-40">
                <LayoutGrid size={72} className={`mb-6 ${user.settings?.darkMode ? 'text-white' : 'text-[#064e3b]'}`} />
                <p className={`font-bold text-xl ${user.settings?.darkMode ? 'text-white' : 'text-[#064e3b]'}`}>Peaceful Quiet</p>
                <p className="text-xs mt-3 text-slate-400">Begin your journey in the Collect tab.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {user.activeQuests.map(id => {
                  const q = [...ALL_QUESTS, ...Object.values(CORRECTION_QUESTS).flat()].find(x => x.id === id);
                  return q ? <QuestCard key={id} quest={q} isActive onComplete={completeQuest} darkMode={user.settings?.darkMode} /> : null;
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reflect' && (
          <ReflectionFeed 
            items={reflections} 
            loading={loadingReflections} 
            onLoadMore={handleLoadMoreReflections} 
          />
        )}
      </main>

      <nav className={`fixed bottom-10 left-10 right-10 backdrop-blur-3xl border border-white/50 rounded-[40px] p-2 flex justify-between items-center shadow-2xl z-[60] transition-colors ${user.settings?.darkMode ? 'bg-white/5' : 'bg-white/95'}`}>
        <NavBtn active={activeTab === 'collect'} icon={<LayoutGrid />} onClick={() => setActiveTab('collect')} label="Collect" darkMode={user.settings?.darkMode} />
        <NavBtn active={activeTab === 'active'} icon={<Map />} onClick={() => setActiveTab('active')} label="Active" darkMode={user.settings?.darkMode} />
        <NavBtn active={activeTab === 'reflect'} icon={<Sparkles />} onClick={() => setActiveTab('reflect')} label="Reflect" darkMode={user.settings?.darkMode} />
      </nav>

      {/* Profile Sidebar */}
      {showProfile && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md flex justify-end" onClick={() => setShowProfile(false)}>
           <div className={`w-4/5 h-full p-10 animate-in slide-in-from-right duration-500 shadow-2xl flex flex-col transition-colors ${user.settings?.darkMode ? 'bg-[#050a09]' : 'bg-[#fdfbf7]'}`} onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-10">
                <div className="w-24 h-24 bg-[#064e3b] rounded-[28px] minaret-shape flex items-center justify-center text-white text-4xl font-black border-4 border-[#d4af37]/30 shadow-2xl animate-float">{user.name[0]}</div>
                <button onClick={() => setShowSettings(true)} className={`p-4 rounded-full transition-all ${user.settings?.darkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                  <Settings size={24} />
                </button>
              </div>

              <h2 className={`text-3xl font-bold tracking-tight ${user.settings?.darkMode ? 'text-white' : 'text-slate-900'}`}>{user.name}</h2>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-3 mb-10">{user.email}</p>
              
              <div className="space-y-4 mb-10">
                <div className={`p-8 rounded-[35px] border flex justify-between items-center shadow-sm transition-colors ${user.settings?.darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100'}`}>
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nur Points</div>
                  <div className={`text-2xl font-black ${user.settings?.darkMode ? 'text-[#d4af37]' : 'text-[#064e3b]'}`}>{user.xp}</div>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                {isImraan && (
                  <div className={`p-6 rounded-[35px] border space-y-4 ${user.settings?.darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100'}`}>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-[#064e3b]">
                      <Lock size={12} /> Master Source Unlock
                    </div>
                    {!pinVerified ? (
                      <div className="flex gap-2">
                        <input 
                          type="password" 
                          placeholder="PIN" 
                          maxLength={4}
                          value={pinInput}
                          onChange={e => setPinInput(e.target.value)}
                          className={`flex-1 p-4 rounded-2xl text-center font-bold tracking-widest border outline-none ${user.settings?.darkMode ? 'bg-black border-white/10 text-white' : 'bg-slate-50 border-slate-100'}`} 
                        />
                        <button onClick={verifyPin} className="px-6 bg-[#064e3b] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Verify</button>
                      </div>
                    ) : (
                      <button onClick={handleDownloadProject} disabled={isExporting} className="flex items-center justify-between text-[#064e3b] font-black text-[10px] uppercase tracking-widest p-7 bg-[#064e3b]/5 border-2 border-[#064e3b]/10 rounded-[30px] w-full active:scale-95 transition-all">
                        {isExporting ? 'Bundling...' : 'Download Full Project'}
                        {isExporting ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                      </button>
                    )}
                  </div>
                )}
                
                <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="flex items-center justify-between text-rose-500 font-bold text-[10px] uppercase tracking-widest p-7 bg-rose-50 rounded-[30px] w-full active:scale-95 transition-all">
                  Sign Out <LogOut size={20} />
                </button>
              </div>
           </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
           <div className={`w-full max-w-sm rounded-[45px] p-8 shadow-2xl animate-in zoom-in-95 duration-300 transition-colors ${user.settings?.darkMode ? 'bg-[#050a09] border border-white/10' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-8">
                <h3 className={`text-xl font-black uppercase tracking-widest ${user.settings?.darkMode ? 'text-white' : 'text-slate-900'}`}>Settings</h3>
                <button onClick={() => setShowSettings(false)} className="p-2 text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>

              <div className="space-y-4">
                <SettingItem 
                  icon={user.settings?.darkMode ? <Sun /> : <Moon />} 
                  label="Night Mode" 
                  checked={!!user.settings?.darkMode} 
                  onChange={(val) => updateSettings({ darkMode: val })}
                  darkMode={user.settings?.darkMode}
                />
                <SettingItem 
                  icon={<Bell />} 
                  label="Notifications" 
                  checked={!!user.settings?.notifications} 
                  onChange={(val) => updateSettings({ notifications: val })}
                  darkMode={user.settings?.darkMode}
                />
                <div className={`p-6 rounded-[30px] border transition-all ${user.settings?.darkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <TypeIcon size={18} className="text-[#d4af37]" />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${user.settings?.darkMode ? 'text-white' : 'text-slate-600'}`}>Text Size</span>
                  </div>
                  <div className="flex gap-2">
                    {['small', 'medium', 'large'].map(size => (
                      <button 
                        key={size}
                        onClick={() => updateSettings({ fontSize: size as any })}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${user.settings?.fontSize === size ? 'bg-[#064e3b] text-white' : (user.settings?.darkMode ? 'bg-white/5 text-slate-400' : 'bg-white text-slate-400')}`}
                      >
                        {size[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <p className="mt-8 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-50">NurPath v1.2.0 • Eternal Light</p>
           </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmQuest && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-xl flex items-center justify-center p-8">
          <div className={`w-full rounded-[45px] p-10 text-center space-y-8 animate-in zoom-in-95 duration-300 transition-colors ${user.settings?.darkMode ? 'bg-[#050a09] border border-white/10' : 'bg-white'}`}>
            <div className="w-16 h-16 bg-[#064e3b]/5 rounded-full flex items-center justify-center text-[#d4af37] mx-auto">
              <Star size={32} />
            </div>
            <div className="space-y-2">
              <h3 className={`text-2xl font-bold ${user.settings?.darkMode ? 'text-white' : 'text-slate-900'}`}>New Intention</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Will you commit to <br/><strong className={user.settings?.darkMode ? 'text-white' : 'text-slate-900'}>{confirmQuest.title}</strong> today?</p>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={() => setConfirmQuest(null)} className={`flex-1 py-5 font-black rounded-3xl uppercase text-[10px] tracking-widest ${user.settings?.darkMode ? 'bg-white/5 text-slate-400' : 'bg-slate-50 text-slate-400'}`}>Wait</button>
              <button onClick={addToActive} className="flex-1 py-5 bg-[#064e3b] text-white font-black rounded-3xl shadow-xl shadow-[#064e3b]/20 uppercase text-[10px] tracking-widest">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingItem = ({ icon, label, checked, onChange, darkMode }) => (
  <button 
    onClick={() => onChange(!checked)}
    className={`w-full flex items-center justify-between p-6 rounded-[30px] border transition-all ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}
  >
    <div className="flex items-center gap-4">
      <div className="text-[#d4af37]">{icon}</div>
      <span className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-slate-600'}`}>{label}</span>
    </div>
    <div className={`w-12 h-6 rounded-full relative transition-colors ${checked ? 'bg-[#064e3b]' : (darkMode ? 'bg-white/10' : 'bg-slate-200')}`}>
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${checked ? 'left-7' : 'left-1'}`} />
    </div>
  </button>
);

const NavBtn = ({active, icon, onClick, label, darkMode}) => (
  <button onClick={onClick} className={`flex-1 flex flex-col items-center py-5 rounded-[32px] transition-all duration-300 ${active ? 'bg-[#064e3b] text-white shadow-2xl scale-110 translate-y-[-5px]' : (darkMode ? 'text-white/20 hover:text-white/40' : 'text-slate-300 hover:text-slate-400')}`}>
    {React.cloneElement(icon as React.ReactElement, { size: 22 })}
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
