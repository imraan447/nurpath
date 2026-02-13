
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './lib/supabaseClient';
import { User, Quest, QuestCategory, ReflectionItem, UserSettings, GuideSection, NaflPrayerItem, AdhkarItem } from './types';
import { ALL_QUESTS, CORRECTION_SUB_CATEGORIES, GUIDE_SECTIONS, SEERAH_CHAPTERS, NAFL_PRAYERS, PRAYER_RELATED_QUESTS } from './constants';
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
  Download,
  Trophy,
  Users,
  Pin,
  MapPin,
  Zap,
  Check,
  CheckSquare,
  Square,
  Save,
  Bell,
  EyeOff,
  Smartphone,
  Globe,
  ChevronLeft
} from 'lucide-react';
import QuestCard from './components/QuestCard';
import ReflectionFeed from './components/ReflectionFeed';
import Auth from './components/Auth';
import Leaderboard from './components/Leaderboard';
import Community from './components/Community';
import Citadel from './components/Citadel';
import { generateReflections } from './services/geminiService';
import { CURATED_REFLECTIONS } from './data/reflections';

const DEFAULT_SETTINGS: UserSettings = {
  darkMode: false,
  notifications: true,
  fontSize: 'medium',
  seerahBookmark: 0,
  calcMethod: 2, // ISNA
  madhab: 0 // Shafi/Standard
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
    className={`flex-1 flex flex-col items-center gap-1 min-w-0 py-2 sm:py-3 rounded-[30px] transition-all relative ${active
      ? (darkMode ? 'bg-white/10 text-white' : 'bg-[#064e3b] text-white shadow-lg')
      : 'text-slate-400 hover:text-slate-600'
      }`}
  >
    {React.cloneElement(icon, { size: 20 })}
    <span className="text-[8px] font-black uppercase tracking-widest truncate w-full text-center px-1">{label}</span>
  </button>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<'collect' | 'active' | 'reflect' | 'guide' | 'seerah' | 'community'>('collect');
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [confirmQuest, setConfirmQuest] = useState<Quest | null>(null);
  const [showTasbeehGuide, setShowTasbeehGuide] = useState(false);
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [hasFriendRequests, setHasFriendRequests] = useState(false);

  // Prayer Times & Location
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [currentPrayer, setCurrentPrayer] = useState<string | null>(null);
  const [nextPrayer, setNextPrayer] = useState<string | null>(null);
  const [city, setCity] = useState<string>('Detecting...');

  // Settings Local State
  const [manualLocationInput, setManualLocationInput] = useState('');
  const [pendingSettings, setPendingSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Guide State
  const [activeGuideSection, setActiveGuideSection] = useState<string>('fajr_phase');

  // Seerah State
  const [seerahIndex, setSeerahIndex] = useState(0);

  // Hero Card Multi-Select State
  const [selectedHeroRelated, setSelectedHeroRelated] = useState<string[]>([]);

  // Initialize with Curated Content ("Brainrot Replacer")
  const [reflections, setReflections] = useState<ReflectionItem[]>(CURATED_REFLECTIONS);
  const [loadingReflections, setLoadingReflections] = useState(false);
  const [hasMoreReflections, setHasMoreReflections] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [showPinned, setShowPinned] = useState(false);

  const seerahScrollRef = useRef<HTMLDivElement>(null);

  const fardSalahIds = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const naflPrayerQuestIds = ['ishraq_salah', 'awwaabeen', 'tahajjud', 'salatul_tasbeeh', 'duha', 'tahiyyatul_wudhu', 'tahiyyatul_masjid'];
  const sunnahSalahIds = ['sunnah_fajr', 'sunnah_dhuhr', 'sunnah_maghrib', 'sunnah_isha', 'witr']; // Hidden from main list

  const questSections = {
    'The Five Pillars': ALL_QUESTS.filter(q => q.category === QuestCategory.MAIN),
    'Nafl Salaah': ALL_QUESTS.filter(q => naflPrayerQuestIds.includes(q.id)),
    'Daily Remembrance': ALL_QUESTS.filter(q => q.category === QuestCategory.DHIKR),
    'Sunnah & Character': ALL_QUESTS.filter(q => q.category === QuestCategory.SUNNAH && !naflPrayerQuestIds.includes(q.id) && !sunnahSalahIds.includes(q.id)),
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

  // --- HELPER FUNCTIONS ---
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hours = h % 12 || 12;
    return `${hours}:${m.toString().padStart(2, '0')} ${suffix}`;
  };

  const getMinutesFromTime = (timeStr: string) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // --- PRAYER TIME LOGIC ---
  const fetchPrayerTimes = async () => {
    if (!user) return;

    const date = new Date().toISOString().split('T')[0];
    const method = user.settings?.calcMethod || 2;
    const school = user.settings?.madhab || 0;

    // 1. Try Manual Location from DB/User State
    if (user.location && user.location.trim().length > 1) {
      try {
        const res = await fetch(`https://api.aladhan.com/v1/timingsByAddress/${date}?address=${encodeURIComponent(user.location)}&method=${method}&school=${school}`);
        const data = await res.json();
        if (data.code === 200) {
          setPrayerTimes(data.data.timings);
          setCity(user.location);
          determineCurrentPhase(data.data.timings);
          return; // Success, skip GPS
        }
      } catch (e) {
        console.error("Manual location fetch failed, falling back to GPS", e);
      }
    }

    // 2. Fallback to GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://api.aladhan.com/v1/timings/${date}?latitude=${latitude}&longitude=${longitude}&method=${method}&school=${school}`);
          const data = await res.json();
          if (data.code === 200) {
            setPrayerTimes(data.data.timings);
            setCity(data.data.meta?.timezone || 'Local Time');
            determineCurrentPhase(data.data.timings);
          }
        } catch (e) { console.error(e); }
      }, (err) => {
        console.error(err);
        setCity('Location needed for times');
      });
    }
  };

  useEffect(() => {
    fetchPrayerTimes();
  }, [user?.settings?.calcMethod, user?.settings?.madhab, user?.location]);

  const determineCurrentPhase = (timings: any) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const fajr = getMinutesFromTime(timings.Fajr);
    const sunrise = getMinutesFromTime(timings.Sunrise);
    const dhuhr = getMinutesFromTime(timings.Dhuhr);
    const asr = getMinutesFromTime(timings.Asr);
    const maghrib = getMinutesFromTime(timings.Maghrib);
    const isha = getMinutesFromTime(timings.Isha);

    let current = '';
    let next = '';

    if (currentTime >= fajr && currentTime < sunrise) {
      current = 'fajr'; next = 'sunrise';
    } else if (currentTime >= sunrise && currentTime < dhuhr) {
      current = 'duha'; next = 'dhuhr';
    } else if (currentTime >= dhuhr && currentTime < asr) {
      current = 'dhuhr'; next = 'asr';
    } else if (currentTime >= asr && currentTime < maghrib) {
      current = 'asr'; next = 'maghrib';
    } else if (currentTime >= maghrib && currentTime < isha) {
      current = 'maghrib'; next = 'isha';
    } else if (currentTime >= isha) {
      current = 'isha'; next = 'fajr';
    } else {
      current = 'tahajjud'; next = 'fajr';
    }

    setCurrentPrayer(current);
    setNextPrayer(next);
  };

  useEffect(() => {
    if (user?.settings?.darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [user?.settings?.darkMode]);

  // SUPABASE AUTH INIT
  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        await fetchProfile(session.user.id, session.user.email!, session.user.created_at);
      } else {
        setLoadingAuth(false);
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session) {
          // OPTIMIZATION: Do not set global loading on SIGNED_IN events (like tab focus or restore)
          // This prevents the "spinning circle" from blocking the UI unnecessarily.
          // We only fetch the profile if it's a genuine sign-in or initial session, ignoring token refreshes.
          if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
            await fetchProfile(session.user.id, session.user.email!, session.user.created_at);
          }
        } else {
          setUser(null);
          setLoadingAuth(false);
        }
      });

      return () => subscription.unsubscribe();
    };

    initAuth();
  }, []);

  const fetchProfile = async (userId: string, email: string, createdAt: string) => {
    try {
      // 1. Try to get existing profile
      let { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).single();

      // 2. SELF-HEALING (Robust): Force creation if missing
      if (!profileData) {
        console.log("Profile missing, attempting robust self-healing...");
        const { data: authUser } = await supabase.auth.getUser();
        const meta = authUser.user?.user_metadata || {};
        const baseUsername = meta.username || `User-${userId.substring(0, 6)}`;

        const fullProfile = {
          id: userId,
          username: baseUsername,
          country: meta.country || 'Unknown',
          xp: 0,
          active_quests: [],
          pinned_quests: [],
          auto_add_pinned: false,
          calc_method: 2,
          madhab: 0
        };

        // Attempt 1: Safe Insert (Do not overwrite existing XP)
        let { data: inserted, error: insertError } = await supabase
          .from('profiles')
          .upsert(fullProfile, { onConflict: 'id', ignoreDuplicates: true })
          .select()
          .single();

        // If ignoreDuplicates is true and row exists, inserted might be null. 
        // We should fetch again if we didn't insert.
        if (!inserted && !insertError) {
          const retryFetch = await supabase.from('profiles').select('*').eq('id', userId).single();
          inserted = retryFetch.data;
        }

        // Attempt 2: If conflict (duplicate username), try with suffix
        if (insertError && (insertError.code === '23505' || insertError.message.includes('unique'))) {
          console.log("Username collision, retrying with suffix...");
          fullProfile.username = `${baseUsername}_${Math.floor(Math.random() * 9999)}`;
          // Here we can force upsert because the username is new
          const retry = await supabase.from('profiles').upsert(fullProfile).select().single();
          inserted = retry.data;
          insertError = retry.error;
        }

        // Attempt 3: Minimal Insert (Fallback if schema is missing columns like 'active_quests')
        if (insertError) {
          console.log("Full insert failed (likely schema mismatch), trying minimal insert...", insertError);
          const minimalProfile = { id: userId, username: fullProfile.username };
          const minimalRetry = await supabase.from('profiles').upsert(minimalProfile).select().single();
          inserted = minimalRetry.data;
          // If minimal insert works, we have a profile!
        }

        if (inserted) {
          profileData = inserted;
        }
      }

      const startOfUtcDay = new Date();
      startOfUtcDay.setUTCHours(0, 0, 0, 0);

      const { data: todaysQuests } = await supabase
        .from('user_quests')
        .select('quest_id')
        .eq('user_id', userId)
        .gte('completed_at', startOfUtcDay.toISOString());

      const todayKey = new Date().toISOString().split('T')[0];
      const dbDailyCompletions: { [key: string]: string } = {};

      if (todaysQuests) {
        todaysQuests.forEach(q => {
          dbDailyCompletions[q.quest_id] = todayKey;
        });
      }

      const saved = localStorage.getItem(`nurpath_user_${userId}`);
      let localData: Partial<User> = {};
      if (saved) {
        localData = JSON.parse(saved);
      } else {
        localData = { activeQuests: [], completedDailyQuests: {}, settings: DEFAULT_SETTINGS };
      }

      const mergedDailyQuests = { ...localData.completedDailyQuests, ...dbDailyCompletions };

      // HANDLE AUTO-ADD PINNED
      let activeQuests = localData.activeQuests || [];
      if (profileData?.auto_add_pinned && profileData?.pinned_quests) {
        const pinned: string[] = profileData.pinned_quests;
        const toAdd = pinned.filter(pid => !activeQuests.includes(pid) && !mergedDailyQuests[pid]);
        if (toAdd.length > 0) {
          activeQuests = [...activeQuests, ...toAdd];
        }
      }

      // Sync activeQuests
      if (profileData && JSON.stringify(profileData.active_quests) !== JSON.stringify(activeQuests)) {
        // Only try to update active_quests if profileData has the field (checking via presence)
        // But since we can't easily check schema here, we just try. 
        // If minimal insert happened, this update might fail if column missing, but that's okay for now.
        try {
          await supabase.from('profiles').update({ active_quests: activeQuests }).eq('id', userId);
        } catch (e) { console.log("Could not sync active_quests"); }
      }

      const { count } = await supabase
        .from('friendships')
        .select('*', { count: 'exact', head: true })
        .eq('user_id_2', userId)
        .eq('status', 'pending');

      setHasFriendRequests(count !== null && count > 0);

      if (profileData) {
        // Correctly Map DB Columns to User Object using standard names
        const dbSettings = {
          ...DEFAULT_SETTINGS,
          ...(localData.settings || {}),
          calcMethod: profileData.calc_method ?? 2,
          madhab: profileData.madhab ?? 0
        };

        setUser({
          id: userId,
          name: profileData.username || 'Traveler',
          email: email,
          location: profileData.location || '',
          country: profileData.country || 'Unknown',
          xp: profileData.xp || 0,
          isVerified: true,
          activeQuests: activeQuests,
          pinnedQuests: profileData.pinned_quests || [],
          autoAddPinned: profileData.auto_add_pinned || false,
          completedDailyQuests: mergedDailyQuests,
          settings: dbSettings,
          createdAt: createdAt
        });
        setPendingSettings(dbSettings); // Initialize pending settings for modal
        setManualLocationInput(profileData.location || '');
      } else {
        // Fallback if self-healing completely failed (should not happen often)
        setUser({
          id: userId,
          name: 'Traveler',
          email: email,
          location: '',
          xp: 0,
          isVerified: true,
          activeQuests: [],
          completedDailyQuests: {},
          settings: DEFAULT_SETTINGS,
          createdAt: createdAt
        });
        setPendingSettings(DEFAULT_SETTINGS);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleMarkReflectionAsRead = (id: string) => {
    if (!user) return;

    const currentRead = user.readReflections || [];
    if (!currentRead.includes(id)) {
      const updatedRead = [...currentRead, id];
      const updatedUser = { ...user, readReflections: updatedRead };
      setUser(updatedUser);
      saveUser(updatedUser); // Consider debouncing this if it happens too often, but for clicks it's fine
    }
  };

  // Randomize and Filter on Tab Switch to 'reflect'
  useEffect(() => {
    if (activeTab === 'reflect') {
      // Filter out read items
      const readIds = user?.readReflections || [];
      const unreadItems = CURATED_REFLECTIONS.filter(item => !readIds.includes(item.id));

      // If all read, maybe show them again or show a message? For now, let's just show all if everything is read to avoid empty state.
      const itemsPool = unreadItems.length > 0 ? unreadItems : CURATED_REFLECTIONS;

      // Shuffle
      const shuffled = [...itemsPool];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setReflections(shuffled);
    }
  }, [activeTab, user?.readReflections?.length]); // Re-run when tab changes or read count changes (though typically user reads inside the tab)

  // Initial Load (removed legacy logic, handled by the effect above or default state)
  // We keep the initial state as CURATED_REFLECTIONS to ensure something is there before first tab switch if needed.

  const saveUser = async (u: User) => {
    setUser(u);
    if (u.id) {
      localStorage.setItem(`nurpath_user_${u.id}`, JSON.stringify({
        activeQuests: u.activeQuests,
        completedDailyQuests: u.completedDailyQuests,
        settings: u.settings
      }));
      try {
        // Explicitly update columns to user custom names
        await supabase.from('profiles').update({
          active_quests: u.activeQuests,
          location: u.location,
          auto_add_pinned: u.autoAddPinned,
          pinned_quests: u.pinnedQuests,
          calc_method: u.settings?.calcMethod,
          madhab: u.settings?.madhab
        }).eq('id', u.id);
      } catch (e) { console.error("Save User Error:", e); }
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveSuccess(false);

    // Update local user object with pending settings
    const updatedUser = {
      ...user,
      location: manualLocationInput,
      settings: pendingSettings
    };

    await saveUser(updatedUser);

    // Animation Delay
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }, 800);
  };

  const updateSettings = (s: Partial<UserSettings>) => {
    if (!user) return;
    const updated = { ...user, settings: { ...(user.settings || DEFAULT_SETTINGS), ...s } };
    saveUser(updated);
  };

  const updateLocation = (newLocation: string) => {
    if (!user) return;
    const updated = { ...user, location: newLocation };
    saveUser(updated);
    alert('Location saved successfully!');
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
    alert('Added all 5 prayers to your journey!');
  };

  const addToActive = () => {
    if (!user || !confirmQuest) return;
    const updated = { ...user, activeQuests: [...new Set([...user.activeQuests, confirmQuest.id])] };
    saveUser(updated);
    setConfirmQuest(null);
    // Stay on current tab to allow adding more
  };

  const removeQuest = (quest: Quest) => {
    if (!user) return;
    const updated = { ...user, activeQuests: user.activeQuests.filter(id => id !== quest.id) };
    saveUser(updated);
  };

  const completeQuests = async (quests: Quest[], xpMultiplier: number = 1) => {
    if (!user || !user.id || quests.length === 0) return;

    try {
      let totalXp = 0;
      const questIds = quests.map(q => q.id);
      const dailyUpdates: Record<string, string> = {};
      const today = new Date().toISOString().split('T')[0];

      quests.forEach(q => {
        totalXp += (q.xp * xpMultiplier);
        dailyUpdates[q.id] = today;
      });

      const { data: currentProfile, error: fetchError } = await supabase.from('profiles').select('xp').eq('id', user.id).single();
      if (fetchError) throw fetchError;

      const newTotalXp = (currentProfile?.xp || user.xp) + totalXp;

      await supabase.from('profiles').update({ xp: newTotalXp }).eq('id', user.id);

      const questLogs = quests.map(q => ({
        user_id: user.id,
        quest_id: q.id,
        quest_title: q.title,
        xp_reward: q.xp * xpMultiplier
      }));
      await supabase.from('user_quests').insert(questLogs);

      const updated = {
        ...user,
        xp: newTotalXp,
        activeQuests: user.activeQuests.filter(id => !questIds.includes(id)),
        completedDailyQuests: { ...user.completedDailyQuests, ...dailyUpdates }
      };

      saveUser(updated);

      if (xpMultiplier > 1) {
        alert(`MashaAllah! Group Quests Completed. ${totalXp} XP (2x) Earned!`);
      }
    } catch (e) {
      console.error("Error completing quests", e);
    }
  };

  const completeQuest = async (q: Quest, xpMultiplier: number = 1) => {
    await completeQuests([q], xpMultiplier);
  };

  const togglePinQuest = async (quest: Quest) => {
    if (!user) return;
    const currentPinned = user.pinnedQuests || [];
    const isUnpinning = currentPinned.includes(quest.id);

    let newPinned;
    let newActive = user.activeQuests;

    if (isUnpinning) {
      newPinned = currentPinned.filter(id => id !== quest.id);
      // FORCE REMOVE from active quests if not completed today so it "goes back" to the list
      if (!isCompletedToday(quest.id)) {
        newActive = newActive.filter(id => id !== quest.id);
      }
    } else {
      newPinned = [...currentPinned, quest.id];
      // If auto-add is on, ensure it's active
      if (user.autoAddPinned && !newActive.includes(quest.id) && !isCompletedToday(quest.id)) {
        newActive = [...newActive, quest.id];
      }
    }

    const updated = { ...user, pinnedQuests: newPinned, activeQuests: newActive };
    saveUser(updated);
  };

  const toggleAutoAddPinned = async () => {
    if (!user) return;
    const newValue = !user.autoAddPinned;
    const updated = { ...user, autoAddPinned: newValue };
    saveUser(updated);
  };

  // --- HERO CARD LOGIC ---
  const toggleHeroRelated = (id: string) => {
    setSelectedHeroRelated(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleHeroComplete = async (mainQuest: Quest, relatedQuests: Quest[]) => {
    const questsToComplete = [mainQuest];

    // Add selected related quests
    relatedQuests.forEach(rq => {
      if (selectedHeroRelated.includes(rq.id)) {
        questsToComplete.push(rq);
      }
    });

    await completeQuests(questsToComplete);
    setSelectedHeroRelated([]); // Reset selection
  };

  const getHereAndNowBundle = () => {
    if (!currentPrayer || !user) return null;
    let mainId = currentPrayer === 'duha' ? 'duha' : currentPrayer;
    if (currentPrayer === 'tahajjud') mainId = 'tahajjud';

    const mainQuest = ALL_QUESTS.find(q => q.id === mainId);
    if (!mainQuest) return null;

    const relatedIds = PRAYER_RELATED_QUESTS[mainId] || [];
    const relatedQuests = ALL_QUESTS.filter(q => relatedIds.includes(q.id)).map(q => ({
      ...q,
      completed: isCompletedToday(q.id)
    }));

    return { mainQuest, relatedQuests };
  };

  const getQuestTimeStatus = (questId: string) => {
    if (!prayerTimes) return null;
    const map: Record<string, string> = {
      fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha', tahajjud: 'Isha'
    };
    const key = map[questId];
    if (!key) return null;

    const prayerTimeStr = prayerTimes[key];
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const prayerMins = getMinutesFromTime(prayerTimeStr);

    if (questId === 'tahajjud') return { time: 'Last Third', status: currentPrayer === 'tahajjud' ? 'now' : 'upcoming' };

    let status: 'now' | 'future' | 'past' = 'future';
    if (currentPrayer === questId) status = 'now';
    else if (currentMins > prayerMins) status = 'past';

    let timeLeft = '';
    if (status === 'future') {
      const diff = prayerMins - currentMins;
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      if (h > 0) timeLeft = `${h}h ${m}m`;
      else timeLeft = `${m}m`;
    }

    return { time: formatTime(prayerTimeStr), status, timeLeft };
  };

  // Determine Hero Quest
  let heroQuest: Quest | undefined;
  let heroRelatedQuests: Quest[] = [];
  const bundle = getHereAndNowBundle();
  let heroTimeStatus = null;

  if (bundle && user?.activeQuests.includes(bundle.mainQuest.id)) {
    heroQuest = bundle.mainQuest;
    heroRelatedQuests = bundle.relatedQuests;
  } else if (user) {
    const firstMain = user.activeQuests
      .map(qid => ALL_QUESTS.find(q => q.id === qid))
      .find(q => q && (q.category === QuestCategory.MAIN || fardSalahIds.includes(q.id)));

    if (firstMain) {
      heroQuest = firstMain;
      const relIds = PRAYER_RELATED_QUESTS[firstMain.id] || [];
      heroRelatedQuests = ALL_QUESTS.filter(q => relIds.includes(q.id)).map(q => ({
        ...q,
        completed: isCompletedToday(q.id)
      }));
    }
  }

  if (heroQuest) {
    heroTimeStatus = getQuestTimeStatus(heroQuest.id);
  }

  const totalHeroXP = heroQuest ? heroQuest.xp + heroRelatedQuests
    .filter(rq => selectedHeroRelated.includes(rq.id))
    .reduce((sum, rq) => sum + rq.xp, 0) : 0;

  const activeMainQuests = (user?.activeQuests
    .map(qid => ALL_QUESTS.find(q => q.id === qid))
    .filter(q => q && q.id !== heroQuest?.id && (q.category === QuestCategory.MAIN || fardSalahIds.includes(q.id))) as Quest[] || [])
    .sort((a, b) => {
      // Sort Salaah specifically by fardSalahIds order
      const indexA = fardSalahIds.indexOf(a.id);
      const indexB = fardSalahIds.indexOf(b.id);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      // Put Salaah first before other main quests
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return 0;
    });

  const activeSideQuests = user?.activeQuests
    .map(qid => ALL_QUESTS.find(q => q.id === qid))
    .filter(q => q && q.id !== heroQuest?.id && q.category !== QuestCategory.MAIN && !fardSalahIds.includes(q.id)) as Quest[] || [];

  const handleLoadMoreReflections = async () => {
    // For now, we only have curated content. 
    // Just simulate a delay and then stop loading to prevent infinite loops.
    if (loadingReflections || !hasMoreReflections) return;
    setLoadingReflections(true);
    setTimeout(() => {
      setLoadingReflections(false);
      setHasMoreReflections(false); // No more to load for now
    }, 1000);
  };

  const handleUpdateItem = (id: string, updates: Partial<ReflectionItem>) => {
    setReflections(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };
  const handleLogout = async () => {
    try { await supabase.auth.signOut(); setUser(null); setShowSettings(false); }
    catch (error) { console.error("Logout failed", error); }
  };
  const handleDownloadSource = async () => { /* ... */ };

  const activeSectionData = GUIDE_SECTIONS.find(s => s.id === activeGuideSection);
  const levelInfo = user ? getLevelInfo(user.xp) : { level: 1, rank: 'Seeker', progress: 0 };
  const islamicDate = new Intl.DateTimeFormat('en-US-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  const questsCompletedCount = Object.keys(user?.completedDailyQuests || {}).length;

  if (loadingAuth) return <div className="h-screen w-full flex items-center justify-center bg-[#fdfbf7]"><Loader2 className="animate-spin text-[#064e3b]" size={48} /></div>;
  if (!user) return <Auth onLoginSuccess={() => { }} />;

  const pinnedQuestsList = (user.pinnedQuests?.map(pid => ALL_QUESTS.find(q => q.id === pid)).filter(Boolean) as Quest[] || [])
    .sort((a, b) => {
      const indexA = fardSalahIds.indexOf(a.id);
      const indexB = fardSalahIds.indexOf(b.id);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return 0;
    });

  return (
    <div className={`max-w-md mx-auto h-screen overflow-hidden flex flex-col relative shadow-2xl transition-all ${activeTab === 'reflect' ? '' : 'border-x border-slate-100'} ${user.settings?.darkMode ? 'bg-[#050a09]' : 'bg-[#fdfbf7]'}`}>

      {activeTab !== 'reflect' && activeTab !== 'community' && (
        <header className={`z-20 backdrop-blur-md ${user.settings?.darkMode ? 'bg-[#050a09]/90' : 'bg-[#fdfbf7]/90'}`}>
          <div className="p-6 pb-4 flex items-center justify-between relative">
            <div className="flex flex-col z-10"><span className={`text-[12px] font-black uppercase tracking-[0.5em] ${user.settings?.darkMode ? 'text-white' : 'text-[#064e3b]'}`}>NurPath</span></div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pt-2 flex items-center gap-2">
              <button onClick={() => setActiveTab('community')} className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-transform active:scale-95 ${user.settings?.darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-[#064e3b]/5 border-[#064e3b]/10 hover:bg-[#064e3b]/10'}`}>
                <Trophy size={12} className={user.settings?.darkMode ? 'text-yellow-400' : 'text-[#d4af37]'} />
                <span className={`text-[10px] font-black uppercase tracking-wider ${user.settings?.darkMode ? 'text-white' : 'text-[#064e3b]'}`}>Community</span>
                {hasFriendRequests && <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border border-white dark:border-[#050a09]"></span></span>}
              </button>
            </div>
            <div className="z-10"><button onClick={() => setShowSettings(true)} className={`p-2 rounded-full transition-colors ${user.settings?.darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><Settings size={18} /></button></div>
          </div>
          <div className="px-6 pb-6 pt-0">
            <div className="flex justify-between items-end mb-1">
              <span className={`text-[10px] font-black uppercase tracking-widest ${user.settings?.darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Level {levelInfo.level} • {levelInfo.rank} <span className="text-[#d4af37] ml-2">{user.xp.toLocaleString()} XP</span></span>
              <span className="text-[10px] font-bold text-[#d4af37]">{Math.floor(levelInfo.progress)}%</span>
            </div>
            <div className={`h-2 w-full rounded-full overflow-hidden ${user.settings?.darkMode ? 'bg-white/10' : 'bg-slate-100'}`}><div className="h-full bg-[#d4af37] transition-all duration-1000 ease-out" style={{ width: `${levelInfo.progress}%` }}></div></div>
          </div>
        </header>
      )}

      <main className={`flex-1 scrollbar-hide ${activeTab === 'reflect' || activeTab === 'community' || activeTab === 'guide' ? 'overflow-hidden p-0' : 'overflow-y-auto pb-40 px-6'}`}>
        {activeTab === 'community' && <Community currentUser={user} darkMode={user.settings?.darkMode} onCompleteGroupQuest={(q) => completeQuest(q, 2)} />}

        {activeTab === 'collect' && (
          <div className="space-y-6 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Same collection content as before */}
            <div className="flex justify-between items-end px-6 mt-2 mb-6">
              <div><h1 className={`text-lg font-bold leading-tight tracking-tight ${user.settings?.darkMode ? 'text-white' : 'text-slate-900'}`}>Salaam Alaykum, <br /><span className="text-[#064e3b] text-xl">{user.name.split(' ')[0]}</span></h1></div>
              <div className="text-right flex flex-col items-end gap-0.5">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{city}</div>
                <div className="text-[9px] text-slate-400 font-medium uppercase tracking-widest opacity-80">{islamicDate}</div>
              </div>
            </div>

            {/* PINNED QUESTS */}
            <div className="space-y-4">
              <button onClick={() => setShowPinned(!showPinned)} className="w-full flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 shadow-sm">
                <div className="flex items-center gap-2"><Pin size={16} className="text-[#d4af37]" /><span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Pinned Quests</span></div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Auto-Add</span>
                    <button onClick={toggleAutoAddPinned} className={`w-8 h-4 rounded-full relative transition-colors ${user.autoAddPinned ? 'bg-[#d4af37]' : 'bg-slate-300'}`}><div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${user.autoAddPinned ? 'left-[18px]' : 'left-0.5'}`} /></button>
                  </div>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${showPinned ? 'rotate-180' : ''}`} />
                </div>
              </button>
              {showPinned && (
                <div className="grid gap-3 animate-in fade-in slide-in-from-top-2">
                  {pinnedQuestsList.length === 0 ? <p className="text-center text-xs text-slate-400 py-2">Pin quests to see them here.</p> :
                    pinnedQuestsList.map(q => <QuestCard key={q.id} quest={q} onAction={handleQuestSelect} onPin={togglePinQuest} isPinned={true} isCompleted={isCompletedToday(q.id)} darkMode={user.settings?.darkMode} />)
                  }
                </div>
              )}
            </div>

            {/* STANDARD CATEGORIES */}
            <div className="space-y-4 pt-4">
              {Object.entries(questSections).map(([category, quests]) => {
                const availableQuests = quests.filter(q => !user.activeQuests.includes(q.id));
                const availableCount = availableQuests.filter(q => !(fardSalahIds.includes(q.id) && isCompletedToday(q.id))).length;

                if (availableQuests.length === 0) return null;
                const isOpen = openCategories.includes(category);
                const isCorrection = category === 'Correction Quests';

                return (
                  <section key={category} className={`space-y-4 rounded-[30px] transition-all ${isCorrection && isOpen ? (user.settings?.darkMode ? 'bg-rose-900/10 p-2 pb-6 border border-rose-500/20' : 'bg-rose-50/50 p-2 pb-6 border border-rose-100') : ''}`}>
                    <button onClick={() => toggleCategory(category)} className={`sticky top-0 z-10 w-full flex items-center justify-between p-4 rounded-2xl border shadow-sm transition-all ${isCorrection
                      ? (user.settings?.darkMode ? 'bg-rose-900/20 border-rose-500/30 text-rose-300' : 'bg-rose-100 border-rose-200 text-rose-700')
                      : (user.settings?.darkMode ? 'bg-slate-900/95 border-white/10 text-slate-400' : 'bg-slate-50/95 border-slate-100 text-slate-500')
                      } backdrop-blur-sm`}>
                      <h2 className="text-[10px] font-black uppercase tracking-[0.4em]">{category}</h2>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold opacity-70">{availableCount}</span>
                        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    {isOpen && (
                      <div className="grid grid-cols-1 gap-4 pt-2 animate-in fade-in slide-in-from-top-2 px-1">
                        {category === 'The Five Pillars' && (
                          <button onClick={addAllSalah} className={`w-full text-[9px] font-black uppercase tracking-widest px-3 py-3 rounded-2xl flex items-center justify-center gap-2 border transition-all mb-2 ${user.settings?.darkMode ? 'text-white bg-white/5 border-white/10 hover:bg-white/10' : 'text-[#064e3b] bg-[#064e3b]/5 border-[#064e3b]/10 hover:bg-[#064e3b]/10'} ${availableCount < quests.length ? 'opacity-50 pointer-events-none' : ''}`}>
                            <Plus size={12} /> Add All 5 Salah
                          </button>
                        )}
                        {category === 'Correction Quests' ? (
                          CORRECTION_SUB_CATEGORIES.map(subCat => {
                            const subCatQuests = availableQuests.filter(q => q.subCategory === subCat);
                            if (subCatQuests.length === 0) return null;
                            return (
                              <div key={subCat} className="space-y-3">
                                <h3 className="text-xs font-bold text-rose-500 dark:text-rose-400 pl-4">{subCat}</h3>
                                <div className="grid grid-cols-1 gap-4">
                                  {subCatQuests.map(q => <QuestCard key={q.id} quest={q} onAction={handleQuestSelect} darkMode={user.settings?.darkMode} />)}
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
                              onPin={togglePinQuest}
                              isPinned={user.pinnedQuests?.includes(q.id)}
                              darkMode={user.settings?.darkMode}
                              isGreyed={q.isGreyed || isCompletedToday(q.id)}
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

        {/* --- MY QUESTS / JOURNEY TAB --- */}
        {activeTab === 'active' && (
          <div className="space-y-8 py-8 animate-in fade-in slide-in-from-right-4 duration-500">

            {/* Header Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-gradient-to-br from-[#064e3b] to-[#043327] rounded-[24px] flex items-center justify-center text-white shadow-xl minaret-shape">
                  <Target size={30} />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold tracking-tight ${user.settings?.darkMode ? 'text-white' : 'text-slate-900'}`}>My Journey</h2>
                  <p className="text-[10px] text-[#d4af37] font-black uppercase tracking-widest">Today's Focus</p>
                </div>
              </div>
              {/* Progress Ring */}
              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-200 dark:text-white/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path className="text-[#064e3b] dark:text-[#d4af37]" strokeDasharray={`${Math.min(100, (questsCompletedCount / Math.max(1, user.activeQuests.length + questsCompletedCount)) * 100)}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
                <span className="absolute text-[10px] font-bold text-slate-400">{questsCompletedCount}</span>
              </div>
            </div>

            {/* Hero Card - Next Main Goal */}
            {heroQuest ? (
              <div className="relative group">
                <div className="absolute inset-0 bg-[#064e3b] blur-xl opacity-20 group-hover:opacity-30 transition-opacity rounded-[30px]" />
                <div className="relative p-6 rounded-[30px] bg-gradient-to-br from-[#064e3b] to-[#043327] text-white overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Zap size={100} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-white/20 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-white/90">Main Priority</span>
                      {/* Time Badge in Hero */}
                      {heroTimeStatus && (
                        <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${heroTimeStatus.status === 'now' ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-900/40 text-white'}`}>
                          <Clock size={10} />
                          {heroTimeStatus.status === 'now' ? `NOW • ${heroTimeStatus.time}` : heroTimeStatus.time}
                        </span>
                      )}
                      <span className="text-[10px] text-[#d4af37] font-black">+{totalHeroXP} XP</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{heroQuest.title}</h3>
                    <p className="text-sm text-white/80 mb-6 max-w-[80%]">{heroQuest.description}</p>

                    {/* Interactive Checklist inside Green Card */}
                    {heroRelatedQuests.length > 0 && (
                      <div className="mb-6 space-y-2 bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2 flex items-center gap-1"><CheckSquare size={12} /> Related Optional Quests</h4>
                        {heroRelatedQuests.map(rq => (
                          <button
                            key={rq.id}
                            onClick={() => !rq.completed && toggleHeroRelated(rq.id)}
                            disabled={!!rq.completed}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${rq.completed ? 'opacity-50' : 'hover:bg-white/10 active:scale-95'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${rq.completed ? 'bg-emerald-500 border-emerald-500' :
                                selectedHeroRelated.includes(rq.id) ? 'bg-[#d4af37] border-[#d4af37]' :
                                  'border-white/40'
                                }`}>
                                {rq.completed && <Check size={12} />}
                                {!rq.completed && selectedHeroRelated.includes(rq.id) && <Check size={12} className="text-white" />}
                              </div>
                              <span className={`text-xs font-bold ${rq.completed ? 'line-through text-white/50' : 'text-white'}`}>{rq.title}</span>
                            </div>
                            <span className="text-[9px] font-black text-[#d4af37]">{rq.completed ? 'Done' : `+${rq.xp}`}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {heroTimeStatus?.status === 'future' ? (
                      <button
                        disabled
                        className="w-full py-3 bg-white/20 text-white/70 rounded-2xl font-black text-xs uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Lock size={16} /> Starts in {heroTimeStatus.timeLeft}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleHeroComplete(heroQuest!, heroRelatedQuests)}
                        className="w-full py-3 bg-white text-[#064e3b] rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        Complete Mission <Check size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-[30px] bg-slate-100 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 text-center">
                <p className="text-slate-400 font-bold text-sm">No active focus. Start a quest!</p>
              </div>
            )}

            {/* Quest Lists */}
            <div className="space-y-6">
              {/* Main Quests (Obligatory) */}
              {activeMainQuests.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-2 flex items-center gap-2"><Star size={12} /> Sacred Duties</h3>
                  <div className="space-y-3">
                    {activeMainQuests.map(q => {
                      const timeStatus = getQuestTimeStatus(q.id);
                      // Logic: If future, grey it out. If past, keep active (white).
                      const isFuture = timeStatus?.status === 'future';
                      return (
                        <QuestCard
                          key={q.id}
                          quest={q}
                          isActive={!isFuture}
                          isGreyed={isFuture} // THIS IS KEY: Passes greyed state for future items
                          timeDisplay={timeStatus as any}
                          onComplete={(q) => completeQuest(q)}
                          onRemove={removeQuest}
                          onPin={togglePinQuest}
                          isPinned={user.pinnedQuests?.includes(q.id)}
                          darkMode={user.settings?.darkMode}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Side Quests (Voluntary) */}
              {activeSideQuests.length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-2 flex items-center gap-2"><Sparkles size={12} /> Voluntary Acts</h3>
                  <div className="space-y-3">
                    {activeSideQuests.map(q => (
                      <QuestCard
                        key={q.id}
                        quest={q}
                        isActive
                        onComplete={(q) => completeQuest(q)}
                        onRemove={removeQuest}
                        onPin={togglePinQuest}
                        isPinned={user.pinnedQuests?.includes(q.id)}
                        darkMode={user.settings?.darkMode}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {user.activeQuests.length === 0 && (
              <div className="h-[20vh] flex flex-col items-center justify-center text-center opacity-40">
                <p className={`text-sm font-bold ${user.settings?.darkMode ? 'text-white' : 'text-slate-900'}`}>All caught up!</p>
                <p className="text-xs text-slate-500 mt-1">Check back later or add more from the collection.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reflect' && (
          <div className="fixed inset-0 z-50 bg-black flex flex-col">
            <ReflectionFeed
              items={Array.isArray(reflections) ? reflections : CURATED_REFLECTIONS} // Safety fallback
              loading={loadingReflections}
              hasMore={hasMoreReflections}
              onLoadMore={handleLoadMoreReflections}
              onUpdateItem={(id, updates) => {
                setReflections(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
              }}
              onMarkAsRead={handleMarkReflectionAsRead}
            />
            {/* Back Button for Reflect Mode */}
            <button
              onClick={() => setActiveTab('collect')}
              className="absolute top-6 left-6 z-[60] text-white/50 hover:text-white transition-colors bg-black/20 backdrop-blur-md p-2 rounded-full"
            >
              <ChevronLeft size={24} />
            </button>
          </div>
        )}

        {/* NEW TREASURY GUIDE COMPONENT REPLACING OLD GUIDE */}
        {activeTab === 'guide' && <Citadel user={user} />}

        {/* Seerah Tab is handled inside Citadel now, but if activeTab is 'seerah' (legacy), redirect to guide */}
        {/* We can remove the old Seerah tab if desired, or keep it as a shortcut */}
        {activeTab === 'seerah' && (
          <div className="h-full flex items-center justify-center">
            <button onClick={() => setActiveTab('guide')} className="px-6 py-3 bg-[#064e3b] text-white rounded-full font-bold">Go to Citadel Seerah</button>
          </div>
        )}
      </main>

      <nav className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 z-50 transition-all`}>
        <div className={`rounded-[40px] p-2 flex items-center justify-between shadow-2xl border ${user.settings?.darkMode ? 'bg-[#050a09]/90 border-white/10 backdrop-blur-xl' : 'bg-white/95 border-[#064e3b]/5 backdrop-blur-md'}`}>
          <NavBtn active={activeTab === 'collect'} label="All Quests" icon={<LayoutGrid />} onClick={() => setActiveTab('collect')} darkMode={user.settings?.darkMode} />
          <NavBtn active={activeTab === 'active'} label="My Quests" icon={<Target />} onClick={() => setActiveTab('active')} darkMode={user.settings?.darkMode} />
          <NavBtn active={activeTab === 'reflect'} label="Reflect" icon={<Sparkles />} onClick={() => setActiveTab('reflect')} darkMode={user.settings?.darkMode} />
          <NavBtn active={activeTab === 'guide'} label="Citadel" icon={<BookOpen />} onClick={() => setActiveTab('guide')} darkMode={user.settings?.darkMode} />
        </div>
      </nav>

      {/* FULL SCREEN SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-900 animate-in slide-in-from-bottom-10 duration-300 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/10">
            <h2 className="text-2xl font-bold dark:text-white">Settings</h2>
            <button onClick={() => setShowSettings(false)} className="p-3 bg-slate-50 dark:bg-white/5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10">
              <X size={24} className="text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 pb-32 space-y-8">

            {/* Section: Profile */}
            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Account & Location</h3>
              <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-[30px] space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Username</label>
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-lg">
                    <UserIcon size={20} className="text-[#064e3b] dark:text-[#d4af37]" />
                    {user.name}
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                  <label className="text-xs font-bold text-slate-500 mb-2 block">City, Country</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. Cape Town, SA"
                        value={manualLocationInput}
                        onChange={(e) => setManualLocationInput(e.target.value)}
                        className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white dark:bg-black/20 font-bold text-slate-900 dark:text-white outline-none border-2 border-transparent focus:border-[#064e3b]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section: Appearance */}
            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Experience</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setPendingSettings({ ...pendingSettings, darkMode: !pendingSettings.darkMode })}
                  className="w-full p-5 bg-slate-50 dark:bg-white/5 rounded-[30px] flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${pendingSettings.darkMode ? 'bg-indigo-500 text-white' : 'bg-orange-400 text-white'}`}>
                      {pendingSettings.darkMode ? <Moon size={20} /> : <Sun size={20} />}
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold dark:text-white">Dark Mode</h4>
                      <p className="text-xs text-slate-500">Easier on the eyes at night</p>
                    </div>
                  </div>
                  <div className={`w-14 h-8 rounded-full relative transition-colors ${pendingSettings.darkMode ? 'bg-[#064e3b]' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${pendingSettings.darkMode ? 'left-7' : 'left-1'}`} />
                  </div>
                </button>

                <button
                  onClick={() => setPendingSettings({ ...pendingSettings, notifications: !pendingSettings.notifications })}
                  className="w-full p-5 bg-slate-50 dark:bg-white/5 rounded-[30px] flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center">
                      <Bell size={20} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold dark:text-white">Notifications</h4>
                      <p className="text-xs text-slate-500">Reminders for prayer times</p>
                    </div>
                  </div>
                  <div className={`w-14 h-8 rounded-full relative transition-colors ${pendingSettings.notifications ? 'bg-[#064e3b]' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${pendingSettings.notifications ? 'left-7' : 'left-1'}`} />
                  </div>
                </button>
              </div>
            </section>

            {/* Section: Prayer Calc */}
            < section className="space-y-4" >
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Calculation Standards</h3>
              <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-[30px] space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold dark:text-white flex items-center gap-2">
                    <Globe size={16} className="text-[#064e3b] dark:text-[#d4af37]" /> Method
                  </label>
                  <select
                    value={pendingSettings.calcMethod}
                    onChange={(e) => setPendingSettings({ ...pendingSettings, calcMethod: parseInt(e.target.value) })}
                    className="w-full p-4 rounded-2xl bg-white dark:bg-black/20 font-medium text-sm outline-none border border-slate-200 dark:border-white/10"
                  >
                    <option value={2}>ISNA (North America)</option>
                    <option value={3}>Muslim World League</option>
                    <option value={1}>Karachi</option>
                    <option value={4}>Makkah</option>
                    <option value={5}>Egyptian General Authority</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold dark:text-white flex items-center gap-2">
                    <Book size={16} className="text-[#064e3b] dark:text-[#d4af37]" /> Asr Juristic (Madhab)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPendingSettings({ ...pendingSettings, madhab: 0 })}
                      className={`p-3 rounded-xl text-sm font-bold border-2 transition-all ${pendingSettings.madhab === 0 ? 'border-[#064e3b] bg-[#064e3b]/5 text-[#064e3b] dark:border-[#d4af37] dark:text-[#d4af37]' : 'border-transparent bg-white dark:bg-black/20 text-slate-500'}`}
                    >
                      Standard
                    </button>
                    <button
                      onClick={() => setPendingSettings({ ...pendingSettings, madhab: 1 })}
                      className={`p-3 rounded-xl text-sm font-bold border-2 transition-all ${pendingSettings.madhab === 1 ? 'border-[#064e3b] bg-[#064e3b]/5 text-[#064e3b] dark:border-[#d4af37] dark:text-[#d4af37]' : 'border-transparent bg-white dark:bg-black/20 text-slate-500'}`}
                    >
                      Hanafi
                    </button>
                  </div>
                </div>
              </div>
            </section >

            {/* Section: Advanced / Other */}
            < section className="space-y-4" >
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Preferences</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-4 bg-slate-50 dark:bg-white/5 rounded-3xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                  <Smartphone size={24} />
                  <span className="text-xs font-bold">Haptic Feedback</span>
                </button>
                <button className="p-4 bg-slate-50 dark:bg-white/5 rounded-3xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                  <Target size={24} />
                  <span className="text-xs font-bold">Daily Goal</span>
                </button>
              </div>
              <button onClick={handleDownloadSource} className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-3xl flex items-center justify-center gap-2 text-[#064e3b] dark:text-[#d4af37] font-bold hover:bg-slate-100 transition-colors">
                {isZipping ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                <span>Backup / Download Source</span>
              </button>
            </section >

            <button onClick={handleLogout} className="w-full py-4 text-rose-500 font-bold text-sm bg-rose-50 dark:bg-rose-900/10 rounded-2xl">
              Log Out
            </button>
          </div >

          {/* Floating Save Button */}
          < div className="absolute bottom-8 left-0 right-0 px-6 flex justify-center z-20 pointer-events-none" >
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className={`pointer-events-auto flex items-center gap-3 px-8 py-4 rounded-full font-black uppercase tracking-widest shadow-2xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-80 disabled:scale-100 ${saveSuccess
                ? 'bg-emerald-500 text-white w-full max-w-xs justify-center'
                : 'bg-[#064e3b] text-white w-full max-w-xs justify-center'
                }`}
            >
              {isSaving ? (
                <Loader2 className="animate-spin" size={20} />
              ) : saveSuccess ? (
                <>
                  <Check size={20} /> Saved!
                </>
              ) : (
                <>
                  <Save size={20} /> Save Changes
                </>
              )}
            </button>
          </div >
        </div >
      )}

      {/* CONFIRM QUEST MODAL */}
      {
        confirmQuest && (
          <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className={`w-full max-w-sm p-6 rounded-[40px] space-y-6 animate-in slide-in-from-bottom-10 ${user.settings?.darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
              <div className="text-center space-y-2"><div className="w-16 h-16 bg-[#d4af37]/10 text-[#d4af37] rounded-full flex items-center justify-center mx-auto mb-4"><Target size={32} /></div><h3 className="text-xl font-bold">Accept this Quest?</h3><p className="text-sm text-slate-500">{confirmQuest.title}</p></div>
              <div className="grid grid-cols-2 gap-3"><button onClick={() => setConfirmQuest(null)} className="py-4 rounded-2xl font-bold text-slate-500 bg-slate-100 dark:bg-white/5 dark:text-slate-400">Cancel</button><button onClick={addToActive} className="py-4 rounded-2xl font-bold text-white bg-[#064e3b] shadow-lg shadow-[#064e3b]/30">Start Quest</button></div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default App;
