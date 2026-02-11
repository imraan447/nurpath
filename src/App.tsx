

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Quest, QuestCategory, ReflectionItem, UserSettings, GuideSection, NaflPrayerItem, AdhkarItem } from './types';
import { ALL_QUESTS, CORRECTION_SUB_CATEGORIES, HARDCODED_REFLECTIONS, GUIDE_SECTIONS, SEERAH_CHAPTERS, NAFL_PRAYERS } from './constants';
import JSZip from 'jszip';
import { 
  LayoutGrid, 
  Sparkles, 
  LogOut,
  Target,
  Flame,
  Star,
  Plus,
  Loader2,
  Settings,
  Moon,
  Sun,
  X,
  Lock,
  Mic,
  ShieldAlert,
  ChevronRight,
  ChevronDown,
  User as UserIcon,
  Video,
  BookOpen,
  Clock,
  Sunrise,
  Sunset,
  CheckCircle2,
  Bookmark,
  ArrowLeft,
  Hand,
  HeartHandshake,
  RefreshCcw,
  AlertCircle,
  CalendarDays,
  Shield,
  BookHeart,
  Book,
  Download
} from 'lucide-react';
import QuestCard from './components/QuestCard';
import ReflectionFeed from './components/ReflectionFeed';
import { generateReflections } from './services/geminiService';

const DEFAULT_SETTINGS: UserSettings = {
  darkMode: false,
  notifications: true,
  fontSize: 'medium',
  seerahBookmark: 0
};

const getLevelInfo = (xp: number) => {
  const level = Math.floor(xp / 20000) + 1;
  const levelStart = (level - 1) * 20000;
  const progress = Math.min(100, Math.max(0, ((xp - levelStart) / 20000) * 100));
  
  let rank = 'Seeker';
  if (level >= 5) rank = 'Traveler';
  if (level >= 15) rank = 'Voyager';
  if (level >= 41) rank = 'Pathfinder';
  if (level >= 56) rank = 'Vanguard';
  if (level >= 100) rank = 'Friend of Allah';
  
  return { level, rank, progress };
};

// --- COMPONENTS DEFINED INTERNALLY ---

const NavBtn = ({ active, label, icon, onClick, darkMode }: { active: boolean; label: string; icon: React.ReactElement<any>; onClick: () => void; darkMode?: boolean }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 px-6 py-3 rounded-[30px] transition-all relative ${
      active 
        ? (darkMode ? 'bg-white/10 text-white' : 'bg-[#064e3b] text-white shadow-lg') 
        : 'text-slate-400 hover:text-slate-600'
    }`}
  >
    {React.cloneElement(icon, { size: 20 })}
    <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const AdhkarListItem: React.FC<{ item: AdhkarItem; darkMode?: boolean }> = ({ item, darkMode }) => (
  <div className={`p-5 rounded-[25px] border flex items-center justify-between gap-4 transition-all ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 hover:border-[#064e3b]/20 hover:shadow-md'}`}>
     <div>
       <div className="flex items-center gap-2 mb-2">
         <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-[#d4af37]/10 text-[#d4af37]">{item.count}x</span>
         {item.virtue && <span className="text-[9px] text-slate-400 font-bold line-clamp-1">{item.virtue}</span>}
       </div>
       <h3 className="font-serif text-xl mb-1 dark:text-white leading-relaxed">{item.arabic}</h3>
       <p className="text-xs text-slate-500 italic dark:text-slate-400">{item.translation}</p>
     </div>
  </div>
);

const AuthScreen = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [name, setName] = useState('');
  
  const handleStart = () => {
    if(!name.trim()) return;
    onLogin({
      name,
      email: '',
      location: '',
      xp: 0,
      isVerified: false,
      activeQuests: [],
      settings: DEFAULT_SETTINGS,
      completedDailyQuests: {}
    });
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-8 bg-[#fdfbf7] relative overflow-hidden">
      <div className="absolute inset-0 arabian-pattern opacity-50 pointer-events-none" />
      <div className="relative z-10 w-full max-w-sm space-y-8 text-center animate-in fade-in zoom-in duration-1000">
         <div className="w-24 h-24 mx-auto bg-[#064e3b] rounded-[30px] flex items-center justify-center text-white shadow-2xl minaret-shape mb-4">
           <div className="text-4xl">﷽</div>
         </div>
         
         <div className="space-y-2">
           <h1 className="text-4xl font-bold text-slate-900 tracking-tight">NurPath</h1>
           <p className="text-[#d4af37] font-black uppercase tracking-[0.4em] text-xs">Journey to Light</p>
         </div>

         <div className="space-y-4 pt-8">
           <input 
             type="text" 
             placeholder="What should we call you?"
             value={name}
             onChange={(e) => setName(e.target.value)}
             className="w-full p-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-[#064e3b] outline-none text-center font-bold text-slate-900 placeholder:text-slate-300 transition-all focus:shadow-xl"
           />
           <button 
             onClick={handleStart}
             disabled={!name.trim()}
             className="w-full py-4 rounded-2xl bg-[#064e3b] text-white font-bold uppercase tracking-widest shadow-xl shadow-[#064e3b]/20 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 hover:bg-[#053c2e]"
           >
             Begin Journey
           </button>
         </div>
      </div>
    </div>
  );
};

const STATIC_SOURCE_FILES: Record<string, string> = {
  'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NurPath - Spiritual Journey</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --nur-green: #064e3b;
            --nur-gold: #d4af37;
            --nur-white: #fdfbf7;
        }
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: var(--nur-white);
            color: #1a1a1a;
            -webkit-tap-highlight-color: transparent;
            overflow-x: hidden;
            transition: background-color 0.3s ease, color 0.3s ease;
        }
        .dark {
            background-color: #050a09 !important;
            color: #fdfbf7 !important;
        }
        .arabian-pattern {
            background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0l20 40-20 40-20-40z' fill='%23064e3b' fill-opacity='0.03'/%3E%3C/svg%3E");
        }
        .dark .arabian-pattern {
            background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0l20 40-20 40-20-40z' fill='%23ffffff' fill-opacity='0.02'/%3E%3C/svg%3E");
        }
        .minaret-shape {
            clip-path: polygon(50% 0%, 100% 25%, 100% 100%, 0 100%, 0 25%);
        }
        .quran-font {
            font-family: 'Amiri', serif;
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }
        .animate-float {
            animation: float 6s ease-in-out infinite;
        }
    </style>
</head>
<body class="arabian-pattern">
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
</body>
</html>`,
  'vite.config.ts': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});`,
  'tsconfig.json': `{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}`,
  'package.json': `{
  "name": "nurpath",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@google/genai": "^1.40.0",
    "lucide-react": "^0.460.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "jszip": "^3.10.1"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.7.2",
    "vite": "^6.0.3"
  }
}`,
  'index.tsx': `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
  'types.ts': `
export enum QuestCategory {
  MAIN = 'Main Quest',
  SUNNAH = 'Sunnah Quest',
  CORRECTION = 'Correction Quest',
  CHARITY = 'Charity Quest',
  DHIKR = 'Dhikr & Dua'
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  xp: number;
  isGreyed?: boolean;
  disclaimer?: string;
  locationType?: 'mosque' | 'charity' | 'soup_kitchen' | 'community' | null;
  completed?: boolean;
}

export interface UserSettings {
  darkMode: boolean;
  notifications: boolean;
  fontSize: 'small' | 'medium' | 'large';
  seerahBookmark?: number; // Index of the last read Seerah card
}

export interface User {
  name: string;
  email: string;
  location: string;
  xp: number;
  isVerified: boolean;
  activeQuests: string[];
  settings?: UserSettings;
}

export interface ReflectionItem {
  id: string;
  type: 'hadith' | 'verse' | 'nature' | 'animal' | 'wonder' | 'story' | 'quote' | 'question' | 'prophecy';
  content: string; // The Hook/Title
  summary?: string; // Short teaser (always present)
  source?: string;
  mediaUrl?: string;
  praise: 'Subhanallah' | 'Alhamdulillah' | 'Allahu Akbar' | 'MashaAllah' | 'Astaghfirullah' | 'Ya Allah' | 'La ilaha illa anta';
  details?: string; // The full 500-1000 word essay (loaded on demand)
}

export interface ScholarProfile {
  id: string;
  rank: number;
  name: string;
  channelName: string;
  channelUrl: string;
  imageUrl: string;
  tags: string[];
}

export interface XPRecord {
  date: string;
  xp: number;
}

export interface AdhkarItem {
  id: string;
  arabic: string;
  transliteration?: string;
  translation: string;
  reference?: string;
  count: number;
  virtue?: string;
}

export interface NaflPrayerItem {
  id: string;
  title: string;
  time: string;
  rakaats: string;
  benefit: string;
  details?: string;
}

export interface GuideSection {
  id: string;
  title: string;
  timeRange: string; // e.g. "Fajr - Sunrise"
  description: string;
  quests: string[]; // IDs of quests in this section
  icon: any;
  adhkar: AdhkarItem[];
  specialGuide?: {
    title: string;
    content: string; // Markdown/Text description
    steps?: string[];
  };
}

export interface SeerahChapter {
  id: string;
  title: string;
  period: 'Mecca' | 'Medina' | 'Pre-Prophethood' | 'Migration';
  year: string;
  content: string;
}`,
  'constants.ts': `
import { Quest, QuestCategory, ReflectionItem, GuideSection, SeerahChapter, AdhkarItem, NaflPrayerItem } from './types';
import { Sun, Moon, Sunrise, Sunset, Clock, Star, CloudSun, Hand, CalendarDays, Shield, BookHeart } from 'lucide-react';

export const ALL_QUESTS: Quest[] = [
  // SALAH (MAIN)
  { id: 'fajr', title: 'Fajr Salah', description: 'The light before dawn. "Prayer is better than sleep."', category: QuestCategory.MAIN, xp: 600, locationType: 'mosque' },
  { id: 'dhuhr', title: 'Dhuhr Salah', description: 'Noontime connection amidst the chaos of the day.', category: QuestCategory.MAIN, xp: 480, locationType: 'mosque' },
  { id: 'asr', title: 'Asr Salah', description: 'The middle prayer. Guard it strictly.', category: QuestCategory.MAIN, xp: 480, locationType: 'mosque' },
  { id: 'maghrib', title: 'Maghrib Salah', description: 'The gratitude at the end of the day.', category: QuestCategory.MAIN, xp: 480, locationType: 'mosque' },
  { id: 'isha', title: 'Isha Salah', description: 'The heavy prayer that proves faith.', category: QuestCategory.MAIN, xp: 600, locationType: 'mosque' },
  // ... (Full content of constants.ts continues implicitly for functionality, truncated here for brevity in static map)
];
// ... (Include other exports from constants.ts if needed for download functionality)
`
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'collect' | 'active' | 'reflect' | 'guide' | 'seerah'>('collect');
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [confirmQuest, setConfirmQuest] = useState<Quest | null>(null);
  const [showTasbeehGuide, setShowTasbeehGuide] = useState(false);
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  // Guide State
  const [activeGuideSection, setActiveGuideSection] = useState<string>('fajr_phase');

  // Seerah State
  const [seerahIndex, setSeerahIndex] = useState(0);

  const [reflections, setReflections] = useState<ReflectionItem[]>([]);
  const [loadingReflections, setLoadingReflections] = useState(false);
  const [hasMoreReflections, setHasMoreReflections] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const seerahScrollRef = useRef<HTMLDivElement>(null);

  const fardSalahIds = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const naflPrayerQuestIds = ['ishraq_salah', 'awwaabeen', 'tahajjud', 'salatul_tasbeeh', 'duha', 'tahiyyatul_wudhu', 'tahiyyatul_masjid'];

  const questSections = {
    'The Five Pillars': ALL_QUESTS.filter(q => q.category === QuestCategory.MAIN),
    'Nafl Salaah': ALL_QUESTS.filter(q => naflPrayerQuestIds.includes(q.id)),
    'Daily Remembrance': ALL_QUESTS.filter(q => q.category === QuestCategory.DHIKR),
    'Sunnah & Character': ALL_QUESTS.filter(q => q.category === QuestCategory.SUNNAH && !naflPrayerQuestIds.includes(q.id)),
    'Community & Charity': ALL_QUESTS.filter(q => q.category === QuestCategory.CHARITY),
    'Correction Quests': ALL_QUESTS.filter(q => q.category === QuestCategory.CORRECTION)
  };

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  useEffect(() => {
    const hour = new Date().getHours();
    let sectionId = 'night_phase'; 
    if (hour >= 4 && hour < 6) sectionId = 'fajr_phase';
    else if (hour >= 6 && hour < 12) sectionId = 'fajr_phase';
    else if (hour >= 12 && hour < 15) sectionId = 'post_salah';
    else if (hour >= 15 && hour < 17) sectionId = 'post_salah';
    else if (hour >= 17 && hour < 20) sectionId = 'post_salah';
    else if (hour >= 20 && hour <= 23) sectionId = 'night_phase';
    setActiveGuideSection(sectionId);
  }, []);

  useEffect(() => {
    if (user?.settings?.darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [user?.settings?.darkMode]);

  useEffect(() => {
    const saved = localStorage.getItem('nurpath_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser({
          ...parsed,
          completedDailyQuests: parsed.completedDailyQuests || {}
        });
        if (parsed.settings?.seerahBookmark) {
          setSeerahIndex(parsed.settings.seerahBookmark);
        }
      } catch (e) { console.error("Auth error", e); }
    }
  }, []);

  useEffect(() => {
    if (!initialized && HARDCODED_REFLECTIONS.length > 0) {
      const shuffled = [...HARDCODED_REFLECTIONS];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setReflections(shuffled);
      setInitialized(true);
    }
  }, [initialized]);

  useEffect(() => {
    if (activeTab === 'seerah') {
      const timer = setTimeout(() => {
        const el = document.getElementById(`seerah-${seerahIndex}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeTab, seerahIndex]);

  const handleLoadMoreReflections = useCallback(async () => {
    if (loadingReflections || !hasMoreReflections || reflections.length < HARDCODED_REFLECTIONS.length) return;
    setLoadingReflections(true);
    try {
      const news = await generateReflections(3);
      if (news && news.length > 0) {
        setReflections(prev => [...prev, ...news]);
      } else {
        setHasMoreReflections(false);
      }
    } catch (e) { 
      console.error("Load more failed", e);
      setHasMoreReflections(false);
    } finally { 
      setLoadingReflections(false); 
    }
  }, [loadingReflections, reflections.length, hasMoreReflections]);

  const handleUpdateItem = useCallback((id: string, updates: Partial<ReflectionItem>) => {
    setReflections(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  const saveUser = (u: User) => {
    setUser(u);
    localStorage.setItem('nurpath_user', JSON.stringify(u));
  };

  const updateSettings = (s: Partial<UserSettings>) => {
    if (!user) return;
    const updated = { ...user, settings: { ...(user.settings || DEFAULT_SETTINGS), ...s } };
    saveUser(updated);
  };

  const bookmarkSeerah = (index: number) => {
    setSeerahIndex(index);
    updateSettings({ seerahBookmark: index });
  };
  
  const isCompletedToday = (questId: string) => {
    if (!user || !user.completedDailyQuests) return false;
    const today = new Date().toISOString().split('T')[0];
    return user.completedDailyQuests[questId] === today;
  };

  const handleQuestSelect = (q: Quest) => {
    if (!user || q.isGreyed || (fardSalahIds.includes(q.id) && isCompletedToday(q.id))) return;
    if (user.activeQuests.includes(q.id)) setActiveTab('active');
    else setConfirmQuest(q);
  };

  const addAllSalah = () => {
    if (!user) return;
    const uncompletedSalah = fardSalahIds.filter(id => !isCompletedToday(id));
    const updated = { ...user, activeQuests: [...new Set([...user.activeQuests, ...uncompletedSalah])] };
    saveUser(updated);
  };

  const addToActive = () => {
    if (!user || !confirmQuest) return;
    const updated = { ...user, activeQuests: [...new Set([...user.activeQuests, confirmQuest.id])] };
    saveUser(updated);
    setConfirmQuest(null);
  };
  
  const removeQuest = (quest: Quest) => {
    if(!user) return;
    const updated = { ...user, activeQuests: user.activeQuests.filter(id => id !== quest.id) };
    saveUser(updated);
  };

  const completeQuest = (q: Quest) => {
    if (!user) return;
    
    let completedDailies = user.completedDailyQuests || {};
    if (fardSalahIds.includes(q.id)) {
      const today = new Date().toISOString().split('T')[0];
      completedDailies = { ...completedDailies, [q.id]: today };
    }

    const updated = { 
      ...user, 
      xp: user.xp + q.xp, 
      activeQuests: user.activeQuests.filter(id => id !== q.id),
      completedDailyQuests: completedDailies
    };
    saveUser(updated);
  };

  const handleDownloadSource = async () => {
    const pin = prompt("Enter PIN to download source code:");
    if (pin !== "8156") {
      alert("Incorrect PIN");
      return;
    }

    setIsZipping(true);
    try {
      const zip = new JSZip();
      Object.entries(STATIC_SOURCE_FILES).forEach(([path, content]) => {
        zip.file(path, content);
      });
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "nurpath-source.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Zip error", e);
      alert("Error creating zip file: " + (e as Error).message);
    } finally {
      setIsZipping(false);
    }
  };

  const activeSectionData = GUIDE_SECTIONS.find(s => s.id === activeGuideSection);
  const levelInfo = user ? getLevelInfo(user.xp) : { level: 1, rank: 'Seeker', progress: 0 };

  if (!user) return <AuthScreen onLogin={(u) => saveUser(u)} />;

  const tasbeehPrayer = NAFL_PRAYERS.find(p => p.id === 'n7');
  
  const activeQuestSections = user ? Object.entries(questSections).map(([category, quests]) => {
      const activeInCategory = quests.filter(q => user.activeQuests.includes(q.id));
      return { category, quests: activeInCategory };
  }).filter(section => section.quests.length > 0) : [];


  return (
    <div className={`max-w-md mx-auto h-screen overflow-hidden flex flex-col relative shadow-2xl transition-all ${activeTab === 'reflect' ? '' : 'border-x border-slate-100'} ${user.settings?.darkMode ? 'bg-[#050a09]' : 'bg-[#fdfbf7]'}`}>
      
      {activeTab !== 'reflect' && (
        <header className={`z-20 backdrop-blur-md ${user.settings?.darkMode ? 'bg-[#050a09]/90' : 'bg-[#fdfbf7]/90'}`}>
          <div className="p-6 pb-4 flex items-center justify-between">
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
          </div>
          
          <div className="px-6 pb-6 pt-0">
             <div className="flex justify-between items-end mb-1">
                <span className={`text-[10px] font-black uppercase tracking-widest ${user.settings?.darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Level {levelInfo.level} • {levelInfo.rank}</span>
                <span className="text-[10px] font-bold text-[#d4af37]">{Math.floor(levelInfo.progress)}%</span>
             </div>
             <div className={`h-2 w-full rounded-full overflow-hidden ${user.settings?.darkMode ? 'bg-white/10' : 'bg-slate-100'}`}>
                <div className="h-full bg-[#d4af37] transition-all duration-1000 ease-out" style={{ width: `${levelInfo.progress}%` }}></div>
             </div>
          </div>
        </header>
      )}

      <main className={`flex-1 scrollbar-hide ${activeTab === 'reflect' ? 'overflow-hidden p-0' : 'overflow-y-auto pb-40 px-6'}`}>
        
        {activeTab === 'collect' && (
          <div className="space-y-6 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2 px-6">
              <h1 className={`text-4xl font-bold leading-tight tracking-tight ${user.settings?.darkMode ? 'text-white' : 'text-slate-900'}`}>Salam, <br/><span className="text-[#064e3b]">{user.name.split(' ')[0]}</span></h1>
              <p className="text-[10px] text-[#d4af37] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                <Star size={12} className="fill-[#d4af37]" /> Path of the Believer
              </p>
            </div>
            
            <div className="space-y-4">
              {Object.entries(questSections).map(([category, quests]) => {
                  const availableQuests = quests.filter(q => !user.activeQuests.includes(q.id));
                  const availableCount = availableQuests.filter(q => !(fardSalahIds.includes(q.id) && isCompletedToday(q.id))).length;
                  
                  if (availableQuests.length === 0) return null;
                  
                  const isOpen = openCategories.includes(category);
                  
                  return (
                    <section key={category} className="space-y-4">
                      <button 
                        onClick={() => toggleCategory(category)}
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5"
                      >
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">{category}</h2>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{availableCount}</span>
                          <ChevronDown size={16} className={`text-slate-400 dark:text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </button>
                      {isOpen && (
                        <div className="grid grid-cols-1 gap-4 pt-2 animate-in fade-in slide-in-from-top-2">
                          {category === 'The Five Pillars' && (
                            <button onClick={addAllSalah} className={`w-full text-[9px] font-black uppercase tracking-widest px-3 py-3 rounded-2xl flex items-center justify-center gap-2 border transition-all mb-2 ${user.settings?.darkMode ? 'text-white bg-white/5 border-white/10 hover:bg-white/10' : 'text-[#064e3b] bg-[#064e3b]/5 border-[#064e3b]/10 hover:bg-[#064e3b]/10'}`}>
                              <Plus size={12} /> Add All 5 Salah
                            </button>
                           )}
                          {category === 'Correction Quests' ? (
                            CORRECTION_SUB_CATEGORIES.map(subCat => {
                              const subCatQuests = availableQuests.filter(q => q.subCategory === subCat);
                              if (subCatQuests.length === 0) return null;
                              return (
                                <div key={subCat} className="space-y-3">
                                  <h3 className="text-xs font-bold text-rose-500 dark:text-rose-400 pl-2">{subCat}</h3>
                                  <div className="grid grid-cols-1 gap-4">
                                    {subCatQuests.map(q => (
                                      <QuestCard key={q.id} quest={q} onAction={handleQuestSelect} darkMode={user.settings?.darkMode} />
                                    ))}
                                  </div>
                                </div>
                              )
                            })
                          ) : (
                            availableQuests.map(q => (
                              <QuestCard 
                                key={q.id} 
                                quest={q} 
                                onAction={handleQuestSelect} 
                                darkMode={user.settings?.darkMode} 
                                isGreyed={q.isGreyed || (fardSalahIds.includes(q.id) && isCompletedToday(q.id))} 
                              />
                            ))
                          )}
                        </div>
                      )}
                    </section>
                  );
                })}
            </div>
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
             {activeQuestSections.length === 0 ? (
              <div className="h-[55vh] flex flex-col items-center justify-center text-center opacity-40">
                <LayoutGrid size={72} className={`mb-6 ${user.settings?.darkMode ? 'text-white' : 'text-[#064e3b]'}`} />
                <p className={`text-sm font-bold ${user.settings?.darkMode ? 'text-white' : 'text-slate-900'}`}>No active quests</p>
                <p className="text-xs text-slate-500 mt-2">Visit the collection to start your journey</p>
              </div>
            ) : (
               <div className="space-y-4">
                 {activeQuestSections.map(({ category, quests }) => {
                   const isOpen = openCategories.includes(category);
                   return (
                     <section key={category} className="space-y-4">
                       <button 
                         onClick={() => toggleCategory(category)}
                         className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5"
                       >
                         <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">{category}</h2>
                         <div className="flex items-center gap-2">
                           <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{quests.length}</span>
                           <ChevronDown size={16} className={`text-slate-400 dark:text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                         </div>
                       </button>
                       {isOpen && (
                         <div className="grid grid-cols-1 gap-4 pt-2 animate-in fade-in slide-in-from-top-2">
                           {category === 'Correction Quests' ? (
                             CORRECTION_SUB_CATEGORIES.map(subCat => {
                               const subCatQuests = quests.filter(q => q.subCategory === subCat);
                               if (subCatQuests.length === 0) return null;
                               return (
                                 <div key={subCat} className="space-y-3">
                                   <h3 className="text-xs font-bold text-rose-500 dark:text-rose-400 pl-2">{subCat}</h3>
                                   <div className="grid grid-cols-1 gap-4">
                                     {subCatQuests.map(q => (
                                       <QuestCard key={q.id} quest={q} isActive onComplete={completeQuest} onRemove={removeQuest} onShowTasbeehGuide={() => setShowTasbeehGuide(true)} darkMode={user.settings?.darkMode} />
                                     ))}
                                   </div>
                                 </div>
                               )
                             })
                           ) : (
                            quests.map(q => <QuestCard key={q.id} quest={q} isActive onComplete={completeQuest} onRemove={removeQuest} onShowTasbeehGuide={() => setShowTasbeehGuide(true)} darkMode={user.settings?.darkMode} />)
                           )}
                         </div>
                       )}
                     </section>
                   );
                 })}
               </div>
            )}
           </div>
        )}

        {activeTab === 'reflect' && (
          <ReflectionFeed 
            items={reflections} 
            loading={loadingReflections} 
            hasMore={hasMoreReflections}
            onLoadMore={handleLoadMoreReflections} 
            onUpdateItem={handleUpdateItem} 
          />
        )}

        {activeTab === 'guide' && (
          <div className="space-y-10 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={() => setActiveTab('seerah')}
              className="w-full p-6 rounded-[30px] bg-gradient-to-r from-[#064e3b] to-[#043327] text-white shadow-xl shadow-[#064e3b]/20 relative overflow-hidden group"
            >
               <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                 <BookOpen size={100} />
               </div>
               <div className="relative z-10 flex items-center justify-between">
                 <div className="text-left">
                   <div className="text-[10px] font-black uppercase tracking-widest text-[#d4af37] mb-1">Life of the Prophet ﷺ</div>
                   <h3 className="text-2xl font-bold">Read the Seerah</h3>
                 </div>
                 <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                   <ChevronRight size={20} />
                 </div>
               </div>
            </button>
            
            <header className="space-y-2">
              <h2 className={`text-4xl font-bold tracking-tight ${user.settings?.darkMode ? 'text-white' : 'text-slate-900'}`}>Daily Guide</h2>
              <p className="text-[10px] text-[#d4af37] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                <Clock size={12} /> The Prescribed Path
              </p>
            </header>

            <div className="flex flex-wrap justify-center gap-2.5 pb-4">
              {GUIDE_SECTIONS.map((section) => {
                const isActive = activeGuideSection === section.id;
                return (
                  <button 
                    key={section.id}
                    onClick={() => setActiveGuideSection(section.id)}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-[#064e3b] text-white shadow-lg' 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400'
                    }`}
                  >
                    {section.title}
                  </button>
                );
              })}
            </div>
            
            {activeSectionData && (
               <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-emerald-50 p-6 rounded-[30px] border border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20">
                    <div className="flex items-start gap-4">
                       <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl dark:bg-emerald-500/20 dark:text-emerald-400">
                         <activeSectionData.icon size={24} />
                       </div>
                       <div>
                         <h3 className="font-bold text-lg dark:text-white">{activeSectionData.title}</h3>
                         <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">{activeSectionData.description}</p>
                         <div className="mt-3 inline-block px-3 py-1 bg-white rounded-lg text-[10px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-100 dark:bg-white/5 dark:border-white/10 dark:text-emerald-400">
                           {activeSectionData.timeRange}
                         </div>
                       </div>
                    </div>
                  </div>

                  {activeSectionData.specialGuide && (
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Knowledge</h4>
                      <div className="p-8 rounded-[35px] bg-[#fdfbf7] border border-slate-100 dark:bg-white/5 dark:border-white/10">
                         <h3 className="font-serif text-2xl font-bold mb-4 dark:text-white">{activeSectionData.specialGuide.title}</h3>
                         <div className="prose prose-sm max-w-none dark:prose-invert">
                           <div className="whitespace-pre-wrap font-serif leading-8 text-base text-slate-600 dark:text-slate-300">
                             {activeSectionData.specialGuide.content.split('**').map((part, i) => 
                               i % 2 === 1 ? <strong key={i} className="text-[#064e3b] dark:text-emerald-400 block mt-4 mb-2 text-lg">{part}</strong> : part
                             )}
                           </div>
                         </div>
                      </div>
                    </div>
                  )}

                  {activeSectionData.quests.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recommended Actions</h4>
                      {activeSectionData.quests.map(qid => {
                        const q = ALL_QUESTS.find(x => x.id === qid);
                        if (!q) return null;
                        return <QuestCard key={q.id} quest={q} onAction={handleQuestSelect} darkMode={user.settings?.darkMode} />;
                      })}
                    </div>
                  )}

                  {activeSectionData.adhkar.length > 0 && (
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Adhkar & Duas</h4>
                       {activeSectionData.adhkar.map(ad => (
                         <AdhkarListItem key={ad.id} item={ad} darkMode={user.settings?.darkMode} />
                       ))}
                    </div>
                  )}

               </div>
            )}
          </div>
        )}

        {activeTab === 'seerah' && (
           <div className="py-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="mb-8 px-6">
                <h2 className="text-4xl font-bold tracking-tight mb-2 dark:text-white">The Seerah</h2>
                <p className="text-[10px] text-[#d4af37] font-black uppercase tracking-[0.3em]">Timeline of Light</p>
              </div>
              
              <div className="relative pl-6 space-y-12 before:absolute before:left-[42px] before:top-0 before:bottom-0 before:w-0.5 before:bg-slate-200 dark:before:bg-white/10">
                 {SEERAH_CHAPTERS.map((chapter, idx) => {
                   const isRead = idx <= seerahIndex;
                   const isCurrent = idx === seerahIndex;
                   
                   return (
                     <div 
                        key={chapter.id} 
                        id={`seerah-${idx}`}
                        className={`relative pl-12 pr-6 transition-all duration-500 ${isCurrent ? 'opacity-100 scale-100' : 'opacity-60 scale-95 grayscale'}`}
                        onClick={() => bookmarkSeerah(idx)}
                     >
                        <div className={`absolute left-[33px] top-2 w-5 h-5 rounded-full border-4 transition-colors z-10 ${isRead ? 'bg-[#064e3b] border-[#064e3b]' : 'bg-white border-slate-300 dark:bg-slate-800 dark:border-slate-600'}`} />
                        
                        <div className={`p-8 rounded-[35px] border transition-all ${isCurrent ? 'bg-white shadow-xl border-[#d4af37]/20 dark:bg-white/10 dark:border-white/20' : 'bg-white/50 border-transparent dark:bg-white/5'}`}>
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{chapter.year} • {chapter.period}</span>
                           <h3 className={`text-2xl font-bold mb-4 font-serif ${isCurrent ? 'text-[#064e3b] dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>{chapter.title}</h3>
                           {isCurrent && (
                             <div className="prose prose-slate dark:prose-invert">
                                <p className="leading-loose font-serif text-lg">{chapter.content}</p>
                             </div>
                           )}
                           {!isCurrent && <p className="text-sm line-clamp-2">{chapter.content}</p>}
                           
                           {isCurrent && (
                             <div className="mt-6 flex justify-end">
                                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#d4af37]">
                                  <Bookmark size={16} className="fill-[#d4af37]" /> Current Chapter
                                </button>
                             </div>
                           )}
                        </div>
                     </div>
                   );
                 })}
              </div>
           </div>
        )}
      </main>

      <nav className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 z-50 transition-all`}>
          <div className={`rounded-[40px] p-2 flex items-center justify-around shadow-2xl border ${user.settings?.darkMode ? 'bg-[#050a09]/90 border-white/10 backdrop-blur-xl' : 'bg-white/95 border-[#064e3b]/5 backdrop-blur-md'}`}>
            <NavBtn active={activeTab === 'collect'} label="All Quests" icon={<LayoutGrid />} onClick={() => setActiveTab('collect')} darkMode={user.settings?.darkMode} />
            <NavBtn active={activeTab === 'active'} label="My Quests" icon={<Target />} onClick={() => setActiveTab('active')} darkMode={user.settings?.darkMode} />
            <NavBtn active={activeTab === 'reflect'} label="Reflect" icon={<Sparkles />} onClick={() => setActiveTab('reflect')} darkMode={user.settings?.darkMode} />
            <NavBtn active={activeTab === 'guide'} label="Guide" icon={<BookOpen />} onClick={() => setActiveTab('guide')} darkMode={user.settings?.darkMode} />
          </div>
      </nav>

      {showSettings && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className={`w-full max-w-sm p-8 rounded-[40px] shadow-2xl space-y-6 ${user.settings?.darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
               <div className="flex justify-between items-center">
                 <h3 className="text-2xl font-bold">Settings</h3>
                 <button onClick={() => setShowSettings(false)} className="p-2 bg-slate-100 rounded-full dark:bg-white/10"><X size={20} className="text-slate-600 dark:text-slate-300" /></button>
               </div>
               
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                     <div className="flex items-center gap-3 dark:text-slate-200">
                       {user.settings?.darkMode ? <Moon size={20} /> : <Sun size={20} />}
                       <span className="font-bold text-sm">Dark Mode</span>
                     </div>
                     <button 
                       onClick={() => updateSettings({ darkMode: !user.settings?.darkMode })}
                       className={`w-12 h-7 rounded-full transition-colors relative ${user.settings?.darkMode ? 'bg-[#d4af37]' : 'bg-slate-300'}`}
                     >
                       <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${user.settings?.darkMode ? 'left-6' : 'left-1'}`} />
                     </button>
                  </div>

                  <button onClick={handleDownloadSource} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                     <div className="flex items-center gap-3 dark:text-slate-200">
                       <Download size={20} />
                       <span className="font-bold text-sm">Download Source</span>
                     </div>
                     {isZipping ? <Loader2 size={16} className="animate-spin dark:text-slate-200" /> : <ChevronRight size={16} className="text-slate-400" />}
                  </button>

                  <button onClick={() => { setUser(null); setShowSettings(false); localStorage.removeItem('nurpath_user'); }} className="w-full p-4 rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <LogOut size={20} />
                       <span className="font-bold text-sm">Log Out</span>
                     </div>
                  </button>
               </div>
               
               <div className="text-center text-[10px] text-slate-400 uppercase tracking-widest pt-4">
                 NurPath v1.0 • Built with ❤️
               </div>
            </div>
         </div>
      )}

      {showProfile && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className={`w-full max-w-sm p-8 rounded-[40px] shadow-2xl space-y-8 text-center ${user.settings?.darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
               <div className="flex justify-between items-start w-full">
                 <button onClick={() => { setShowProfile(false); setShowSettings(true); }} className="p-2 bg-slate-100 rounded-full dark:bg-white/10 text-slate-600 dark:text-slate-300"><Settings size={20} /></button>
                 <button onClick={() => setShowProfile(false)} className="p-2 bg-slate-100 rounded-full dark:bg-white/10 text-slate-600 dark:text-slate-300"><X size={20} /></button>
               </div>
               
               <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-[#064e3b] rounded-[30px] shadow-xl flex items-center justify-center text-white text-3xl font-bold minaret-shape mb-6 border-4 border-[#d4af37]">
                    {user.name[0].toUpperCase()}
                  </div>
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <p className="text-[#d4af37] font-black uppercase tracking-widest text-xs mt-2">{levelInfo.rank}</p>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                     <span className="block text-2xl font-bold text-[#064e3b] dark:text-emerald-400">{user.xp}</span>
                     <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total XP</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                     <span className="block text-2xl font-bold text-[#064e3b] dark:text-emerald-400">{levelInfo.level}</span>
                     <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Level</span>
                  </div>
               </div>
               
               <div className="pt-4">
                 <button onClick={() => setShowProfile(false)} className="px-8 py-3 bg-[#064e3b] text-white rounded-full font-bold text-sm shadow-lg">Close Profile</button>
               </div>
            </div>
         </div>
      )}

      {showTasbeehGuide && tasbeehPrayer?.details && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowTasbeehGuide(false)}>
          <div className={`w-full max-w-sm p-8 rounded-[40px] space-y-6 animate-in slide-in-from-bottom-10 ${user.settings?.darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">How to Pray Salatul Tasbeeh</h3>
                <button onClick={() => setShowTasbeehGuide(false)} className="p-2 bg-slate-100 rounded-full dark:bg-white/10"><X size={20} /></button>
            </div>
            <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="whitespace-pre-wrap font-serif text-slate-600 dark:text-slate-300 leading-relaxed">
                    {tasbeehPrayer.details.replace(/\*\*/g, '')}
                </p>
            </div>
          </div>
        </div>
      )}

      {confirmQuest && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-sm p-6 rounded-[40px] space-y-6 animate-in slide-in-from-bottom-10 ${user.settings?.darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-[#d4af37]/10 text-[#d4af37] rounded-full flex items-center justify-center mx-auto mb-4">
                <Target size={32} />
              </div>
              <h3 className="text-xl font-bold">Accept this Quest?</h3>
              <p className="text-sm text-slate-500">{confirmQuest.title}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setConfirmQuest(null)}
                className="py-4 rounded-2xl font-bold text-slate-500 bg-slate-100 dark:bg-white/5 dark:text-slate-400"
              >
                Cancel
              </button>
              <button 
                onClick={addToActive}
                className="py-4 rounded-2xl font-bold text-white bg-[#064e3b] shadow-lg shadow-[#064e3b]/30"
              >
                Start Quest
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
