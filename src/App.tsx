
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase, ensureSession } from './lib/supabaseClient';
import { User, Quest, QuestCategory, ReflectionItem, UserSettings, GuideSection, NaflPrayerItem, AdhkarItem, GroupQuest } from './types';
import { ALL_QUESTS, GUIDE_SECTIONS, SEERAH_CHAPTERS, NAFL_PRAYERS, PRAYER_RELATED_QUESTS, PRAYER_PACKAGES, JUMUAH_CHECKLIST } from './constants';
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
  ChevronLeft,
  ListTodo,
  AlertTriangle
} from 'lucide-react';
import QuestCard from './components/QuestCard';
import ReflectionFeed from './components/ReflectionFeed';
import RamadanTracker from './components/RamadanTracker';
import Auth from './components/Auth';
import Leaderboard from './components/Leaderboard';
import Community from './components/Community';
import RoutineBuilder from './components/RoutineBuilder'; // Added import
import Citadel from './components/Citadel';
import { generateReflections, generateReflectionsStream } from './services/geminiService';
import { schedulePrayerNotifications } from './services/notificationService';
import { CURATED_REFLECTIONS } from './data/reflections';

const DEFAULT_SETTINGS: UserSettings = {
  darkMode: false,
  darkModePreference: 'light',
  notifications: true,
  fontSize: 'medium',
  seerahBookmark: 0,
  calcMethod: 2, // ISNA
  madhab: 0, // Shafi/Standard
  leaderboardEnabled: false
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
  const [activeTab, setActiveTab] = useState<'collect' | 'active' | 'reflect' | 'guide' | 'seerah' | 'community'>('active');
  const previousTabRef = useRef<'collect' | 'active' | 'reflect' | 'guide' | 'seerah'>('collect');
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRamadanTracker, setShowRamadanTracker] = useState(false);
  const [confirmQuest, setConfirmQuest] = useState<Quest | null>(null);
  const pendingSyncs = useRef(0);
  const [selectedSubQuests, setSelectedSubQuests] = useState<string[]>([]);
  const [infoModalQuest, setInfoModalQuest] = useState<Quest | null>(null);
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [hasFriendRequests, setHasFriendRequests] = useState(false);
  const [hasGroupInvites, setHasGroupInvites] = useState(false);
  const [groupQuests, setGroupQuests] = useState<GroupQuest[]>([]);
  const [trackedGroupQuests, setTrackedGroupQuests] = useState<GroupQuest[]>([]);
  const [groupCompletions, setGroupCompletions] = useState<{ [id: string]: boolean }>({});

  // Prayer Times & Location
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [currentPrayer, setCurrentPrayer] = useState<string | null>(null);
  const [nextPrayer, setNextPrayer] = useState<string | null>(null);
  const [city, setCity] = useState<string>('Detecting...');

  // Settings Local State
  const [manualLocationInput, setManualLocationInput] = useState('');
  const [pendingSettings, setPendingSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [pendingPrayerAdjustments, setPendingPrayerAdjustments] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Guide State
  const [activeGuideSection, setActiveGuideSection] = useState<string>('fajr_phase');

  // Seerah State
  const [seerahIndex, setSeerahIndex] = useState(0);

  // Hero Card Multi-Select State
  const [selectedHeroRelated, setSelectedHeroRelated] = useState<string[]>([]);

  // Initialize with Curated Content ("Brainrot Replacer")
  const [reflections, setReflections] = useState<ReflectionItem[]>(() => {
    return [...CURATED_REFLECTIONS].sort(() => Math.random() - 0.5);
  });
  const [loadingReflections, setLoadingReflections] = useState(false);
  const [hasMoreReflections, setHasMoreReflections] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [showRoutineBuilder, setShowRoutineBuilder] = useState(false);
  const [questTabView, setQuestTabView] = useState<'my' | 'citadel'>('my');
  const [jumuahCollapsed, setJumuahCollapsed] = useState(false);
  const [pullRefreshing, setPullRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [upcomingSalahExpanded, setUpcomingSalahExpanded] = useState(false);
  const [completedSalahExpanded, setCompletedSalahExpanded] = useState(false);
  const touchStartY = useRef(0);
  const mainScrollRef = useRef<HTMLElement>(null);

  const seerahScrollRef = useRef<HTMLDivElement>(null);

  // Display order: Fajr first through the day, Tahajjud after Isha
  const fardSalahIds = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'tahajjud'];
  const naflPrayerQuestIds = ['awwaabeen'];

  // IDs that are exclusively tied to salaah and should NEVER appear in All Quests
  const salahExclusiveIds = new Set([
    ...naflPrayerQuestIds,
    'tahiyyatul_wudhu', 'tahiyyatul_masjid', 'dua_after_adhan',
    ...ALL_QUESTS.filter(q => q.isPackage).map(q => q.id)
  ]);

  const questSections = useMemo(() => ({
    'The Five Pillars': ALL_QUESTS.filter(q => q.category === QuestCategory.MAIN && !q.isPackage && !salahExclusiveIds.has(q.id)),
    'Daily Remembrance': ALL_QUESTS.filter(q => q.category === QuestCategory.DHIKR && !q.isPackage),
    'Bonus Salaah': ALL_QUESTS.filter(q => q.category === QuestCategory.VOLUNTARY && !q.isPackage),
    'Sunnah & Character': ALL_QUESTS.filter(q => q.category === QuestCategory.SUNNAH && !salahExclusiveIds.has(q.id) && !q.isPackage),
    'Community & Charity': ALL_QUESTS.filter(q => q.category === QuestCategory.CHARITY),
    'Correction Quests': ALL_QUESTS.filter(q => q.category === QuestCategory.CORRECTION)
  }), []);

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

  // Apply manual prayer time corrections
  const applyPrayerAdjustments = (timings: any): any => {
    if (!user?.settings?.manualPrayerCorrections || !user?.prayerTimeAdjustments) return timings;
    const adjusted = { ...timings };
    for (const [prayer, offset] of Object.entries(user.prayerTimeAdjustments)) {
      if (adjusted[prayer] && typeof offset === 'number' && offset !== 0) {
        const [h, m] = adjusted[prayer].split(':').map(Number);
        const totalMin = h * 60 + m + offset;
        const newH = Math.floor(((totalMin % 1440) + 1440) % 1440 / 60);
        const newM = ((totalMin % 60) + 60) % 60;
        adjusted[prayer] = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
      }
    }
    return adjusted;
  };

  // Auto-apply adjustments when prayer times or corrections change
  useEffect(() => {
    if (prayerTimes && user?.settings?.manualPrayerCorrections && user?.prayerTimeAdjustments) {
      // Re-apply adjustments (the raw times from API are stored, adjustments overlay on display)
      determineCurrentPhase(applyPrayerAdjustments(prayerTimes));
    }
  }, [user?.prayerTimeAdjustments, user?.settings?.manualPrayerCorrections]);

  // Schedule prayer notifications when times are loaded
  useEffect(() => {
    if (prayerTimes && user?.settings?.notifications) {
      const adjusted = applyPrayerAdjustments(prayerTimes);
      schedulePrayerNotifications(adjusted).catch(console.error);
    }
  }, [prayerTimes, user?.settings?.notifications]);

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

  // Dark Mode: support system preference
  useEffect(() => {
    const pref = user?.settings?.darkModePreference || 'light';
    const applyDark = (isDark: boolean) => {
      if (isDark) document.body.classList.add('dark');
      else document.body.classList.remove('dark');
    };

    if (pref === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      applyDark(mq.matches);
      const handler = (e: MediaQueryListEvent) => applyDark(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else {
      applyDark(pref === 'dark');
    }
  }, [user?.settings?.darkModePreference, user?.settings?.darkMode]);

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

      const todayKey = new Date().toISOString().split('T')[0];

      // Fetch Today's Completions (for daily logic)
      const { data: todaysQuests } = await supabase
        .from('user_quests')
        .select('quest_id, xp_reward')
        .eq('user_id', userId)
        .gte('completed_at', startOfUtcDay.toISOString());

      const dbDailyCompletions: { [key: string]: string } = {};
      if (todaysQuests) {
        todaysQuests.forEach(q => {
          dbDailyCompletions[q.quest_id] = todayKey;
        });
      }

      // SELF-HEALING XP: Calculate true total XP from history
      // We explicitly query the sum to ensure UI reflects every quest ever done
      const { data: allHistory, error: historyError } = await supabase
        .from('user_quests')
        .select('xp_reward')
        .eq('user_id', userId);

      let trueTotalXp = 0;
      if (allHistory && !historyError) {
        trueTotalXp = allHistory.reduce((sum, q) => sum + (q.xp_reward || 0), 0);
      } else {
        trueTotalXp = profileData?.xp || 0; // Fallback
      }

      // Sync Profile XP to match history if drifted
      if (profileData && profileData.xp !== trueTotalXp) {
        console.log(`Correcting XP Drift: ${profileData.xp} -> ${trueTotalXp}`);
        await supabase.from('profiles').update({ xp: trueTotalXp }).eq('id', userId);
        profileData.xp = trueTotalXp;
      }

      const saved = localStorage.getItem(`nurpath_user_${userId}`);
      let localData: Partial<User> = {};
      if (saved) {
        localData = JSON.parse(saved);
      } else {
        localData = { activeQuests: [], completedDailyQuests: {}, settings: DEFAULT_SETTINGS };
      }

      // DB completions are the SOLE source of truth. Do NOT merge localStorage completions!
      // This prevents ghost "done" states from stale/buggy localStorage data.
      const mergedDailyQuests = { ...dbDailyCompletions };

      // DB is source of truth for activeQuests, merge any localStorage-only additions
      const dbActiveQuests: string[] = profileData?.active_quests || [];
      const localActiveQuests: string[] = localData.activeQuests || [];
      // Combine: DB first, then any local additions not already in DB
      // IMPORTANT: Do NOT re-add quests that were completed today (they were removed from DB active list for a reason)
      const localAdditions = localActiveQuests.filter(id => !dbActiveQuests.includes(id) && !mergedDailyQuests[id]);
      let activeQuests = [...dbActiveQuests, ...localAdditions];

      // HANDLE AUTO-ADD PINNED: Always add pinned quests to active, even if completed today
      if (profileData?.pinned_quests) {
        const pinned: string[] = profileData.pinned_quests;
        const toAdd = pinned.filter(pid => !activeQuests.includes(pid));
        if (toAdd.length > 0) {
          activeQuests = [...activeQuests, ...toAdd];
        }
      }

      // Sync activeQuests back to DB if changed
      if (profileData && JSON.stringify(profileData.active_quests) !== JSON.stringify(activeQuests)) {
        try {
          await supabase.from('profiles').update({ active_quests: activeQuests }).eq('id', userId);
        } catch (e) {
          console.log("Could not sync active_quests");
        }
      }

      const { count } = await supabase
        .from('friendships')
        .select('*', { count: 'exact', head: true })
        .eq('user_id_2', userId)
        .eq('status', 'pending');

      setHasFriendRequests(count !== null && count > 0);

      const { count: inviteCount } = await supabase
        .from('group_invites')
        .select('*', { count: 'exact', head: true })
        .eq('invited_user', userId)
        .eq('status', 'pending');
      setHasGroupInvites(inviteCount !== null && inviteCount > 0);

      // GROUP CHALLENGES FETCH
      const { data: myMemberships } = await supabase.from('group_members').select('group_id').eq('user_id', userId);
      const myGroupIds = myMemberships?.map(m => m.group_id) || [];

      if (myGroupIds.length > 0) {
        const { data: gQuests } = await supabase.from('group_quests').select('*').in('group_id', myGroupIds);

        if (gQuests && gQuests.length > 0) {
          const gQuestIds = gQuests.map(g => g.id);

          // Get completions for these quests (mine + total count)
          const { data: completions } = await supabase.from('group_quest_completions').select('group_quest_id, user_id, is_claimed').in('group_quest_id', gQuestIds);

          // Get total members per group
          const { data: groupCounts } = await supabase.from('group_members').select('group_id');
          const groupMemberCounts: { [gid: string]: number } = {};
          if (groupCounts) {
            groupCounts.forEach(m => {
              groupMemberCounts[m.group_id] = (groupMemberCounts[m.group_id] || 0) + 1;
            });
          }

          const myCompletionsMap: { [id: string]: boolean } = {};
          const enrichedGroupQuests: GroupQuest[] = gQuests.map(gq => {
            const totalMembers = groupMemberCounts[gq.group_id] || 1;
            const questCompletions = completions?.filter(c => c.group_quest_id === gq.id) || [];
            const completionCount = questCompletions.length;
            const iCompleted = questCompletions.some(c => c.user_id === userId);

            if (iCompleted) myCompletionsMap[`gq_${gq.id}`] = true;

            const isLocked = iCompleted && completionCount < totalMembers;

            return {
              id: `gq_${gq.id}`, // Prefix to avoid collisions
              title: gq.title,
              description: `Group Challenge • Ends ${gq.deadline ? new Date(gq.deadline).toLocaleDateString() : 'Never'}`,
              category: QuestCategory.COMMUNITY,
              xp: gq.xp,
              isGroupQuest: true,
              groupId: gq.group_id,
              deadline: gq.deadline,
              completionCount,
              totalMembers,
              isLocked,
              sharedBy: [] // Frontend only field, populated by tracking others
            } as GroupQuest;
          });
          setGroupQuests(enrichedGroupQuests);
          setGroupCompletions(myCompletionsMap);
        } else {
          setGroupQuests([]);
        }
      } else {
        setGroupQuests([]);
      }

      // FETCH TRACKED GROUP QUESTS (For My Quests Tab)
      const trackedGqIds = activeQuests.filter(id => id.startsWith('gq_')).map(id => id.replace('gq_', ''));
      if (trackedGqIds.length > 0) {
        const { data: tGQuests } = await supabase.from('group_quests').select('*, group:groups(name)').in('id', trackedGqIds);

        if (tGQuests && tGQuests.length > 0) {
          // Fetch completions for these
          const { data: tCompletions } = await supabase.from('group_quest_completions').select('group_quest_id, user_id').in('group_quest_id', trackedGqIds);

          // Map to GroupQuest
          const enrichedTracked = tGQuests.map(gq => {
            const completions = tCompletions?.filter(c => c.group_quest_id === gq.id) || [];
            const iCompleted = completions.some(c => c.user_id === userId);

            return {
              id: `gq_${gq.id}`,
              title: gq.title,
              description: `${gq.group?.name || 'Group'} • ${gq.xp} XP`,
              category: QuestCategory.COMMUNITY,
              xp: gq.xp,
              isGroupQuest: true,
              groupId: gq.group_id,
              groupName: gq.group?.name,
              deadline: gq.deadline,
              completionCount: completions.length,
              isLocked: false, // Tracked quests in My Quests are completable by user
              completed: iCompleted,
              sharedBy: []
            } as GroupQuest;
          });
          setTrackedGroupQuests(enrichedTracked);
        } else {
          setTrackedGroupQuests([]);
        }
      } else {
        setTrackedGroupQuests([]);
      }

      if (profileData) {
        // Correctly Map DB Columns to User Object using standard names
        const dbSettings = {
          ...DEFAULT_SETTINGS,
          ...(localData.settings || {}),
          ...(profileData.settings || {}), // merge full settings JSON from DB
          calcMethod: profileData.calc_method ?? 2,
          madhab: profileData.madhab ?? 0
        };

        const finalUserObj = {
          id: userId,
          name: profileData.username || 'Traveler',
          email: email,
          location: profileData.location || '',
          country: profileData.country || 'Unknown',
          xp: trueTotalXp,
          isVerified: true,
          activeQuests: activeQuests,
          pinnedQuests: profileData.pinned_quests || [],
          autoAddPinned: profileData.auto_add_pinned || false,
          completedDailyQuests: mergedDailyQuests,
          readReflections: profileData.read_reflections || [],
          settings: dbSettings,
          prayerTimeAdjustments: profileData.prayer_time_adjustments || {},
          ramadanFasting: profileData.ramadan_fasting || '',
          createdAt: createdAt
        };
        setUser(finalUserObj);

        // HOTFIX: Persist to localStorage immediately
        localStorage.setItem(`nurpath_user_${userId}`, JSON.stringify({
          activeQuests: finalUserObj.activeQuests,
          completedDailyQuests: finalUserObj.completedDailyQuests,
          pinnedQuests: finalUserObj.pinnedQuests,
          settings: finalUserObj.settings
        }));

        setPendingSettings(dbSettings);
        setPendingPrayerAdjustments(profileData.prayer_time_adjustments || {});
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

  // RE-SYNC QUESTS when switching to "My Quests" tab
  // This ensures tracked quests from Community, completions from other devices, etc. are always fresh
  useEffect(() => {
    if (!user?.id) return;

    const refreshQuests = async () => {
      try {
        await ensureSession();

        const todayKey = new Date().toISOString().split('T')[0];
        const startOfUtcDay = new Date();
        startOfUtcDay.setUTCHours(0, 0, 0, 0);

        // Helper to handle BOTH native arrays AND messy "stringified" JSON in the DB
        const getArray = (val: any): string[] => {
          if (!val) return [];

          let parsed = val;
          // Handle doubly-encoded strings or stray JSON strings in the DB
          if (typeof val === 'string') {
            try { parsed = JSON.parse(val); } catch (e) { return []; }
          }

          // If we have an array, sanitize every element
          if (Array.isArray(parsed)) {
            // Some rows might contain further stringified elements (e.g. ["[\"id\"]"])
            return parsed.flatMap(item => {
              if (typeof item === 'string' && item.startsWith('[')) {
                try { return JSON.parse(item); } catch (e) { return item; }
              }
              return item;
            }).filter(item => typeof item === 'string' && item.trim().length > 0)
              .map(item => item.trim()); // Trim whitespace to prevent ID mismatches
          }

          return [];
        };

        // 1. Fetch latest profile from DB
        const { data: profileData } = await supabase
          .from('profiles')
          .select('active_quests, pinned_quests')
          .eq('id', user.id)
          .single();

        // 2. Fetch today's completions from DB
        const { data: todaysQuests } = await supabase
          .from('user_quests')
          .select('quest_id')
          .eq('user_id', user.id)
          .gte('completed_at', startOfUtcDay.toISOString());

        const freshCompletions: { [key: string]: string } = {};
        if (todaysQuests) {
          todaysQuests.forEach(q => {
            freshCompletions[q.quest_id] = todayKey;
          });
        }

        // 3. Build the pinned (routine) list defensively
        let pinned = getArray(profileData?.pinned_quests);
        if (pinned.length === 0) {
          pinned = ["tahajjud", "fajr", "dhuhr", "asr", "maghrib", "isha"];
        }

        // 4. Merge active quests: start from DB, add local-only items
        const dbActive = getArray(profileData?.active_quests);
        const localOnly = user.activeQuests.filter(id => !dbActive.includes(id));
        let mergedActive = Array.from(new Set([...dbActive, ...localOnly]));

        // 5. Remove completed NON-PINNED quests (they go back to All Quests)
        mergedActive = mergedActive.filter(id => !freshCompletions[id] || pinned.includes(id));

        // 6. Force-add ALL pinned quests (routine ALWAYS syncs to active)
        pinned.forEach(pid => {
          if (!mergedActive.includes(pid)) {
            mergedActive.push(pid);
          }
        });

        // 7. Only update state if something changed
        const currentCompletionKeys = Object.keys(user.completedDailyQuests || {}).filter(k => (user.completedDailyQuests || {})[k] === todayKey).sort().join(',');
        const freshCompletionKeys = Object.keys(freshCompletions).sort().join(',');
        const activeChanged = JSON.stringify([...mergedActive].sort()) !== JSON.stringify([...user.activeQuests].sort());
        const completionsChanged = currentCompletionKeys !== freshCompletionKeys;
        const pinnedChanged = JSON.stringify([...pinned].sort()) !== JSON.stringify([...(user.pinnedQuests || [])].sort());

        if (pendingSyncs.current > 0) {
          console.log('Skipping sync overwrite — DB save in-flight');
        } else if (activeChanged || completionsChanged || pinnedChanged) {
          const updated = {
            ...user,
            activeQuests: mergedActive,
            completedDailyQuests: { ...freshCompletions },
            pinnedQuests: pinned
          };
          setUser(updated);
          localStorage.setItem(`nurpath_user_${user.id}`, JSON.stringify({
            activeQuests: updated.activeQuests,
            completedDailyQuests: updated.completedDailyQuests,
            pinnedQuests: updated.pinnedQuests,
            settings: updated.settings
          }));
        }

        // 5. Also refresh tracked group quests
        const trackedGqIds = mergedActive.filter(id => id.startsWith('gq_')).map(id => id.replace('gq_', ''));
        if (trackedGqIds.length > 0) {
          const { data: tGQuests } = await supabase.from('group_quests').select('*, group:groups(name)').in('id', trackedGqIds);
          if (tGQuests && tGQuests.length > 0) {
            const { data: tCompletions } = await supabase.from('group_quest_completions').select('group_quest_id, user_id').in('group_quest_id', trackedGqIds);
            const enrichedTracked = tGQuests.map(gq => {
              const completions = tCompletions?.filter(c => c.group_quest_id === gq.id) || [];
              const iCompleted = completions.some(c => c.user_id === user.id);
              return {
                id: `gq_${gq.id}`,
                title: gq.title,
                description: `${gq.group?.name || 'Group'} • ${gq.xp} XP`,
                category: QuestCategory.COMMUNITY,
                xp: gq.xp,
                isGroupQuest: true,
                groupId: gq.group_id,
                groupName: gq.group?.name,
                deadline: gq.deadline,
                completionCount: completions.length,
                isLocked: false,
                completed: iCompleted,
                sharedBy: []
              } as GroupQuest;
            });
            setTrackedGroupQuests(enrichedTracked);
          } else {
            setTrackedGroupQuests([]);
          }
        }
      } catch (e) {
        console.error('Quest refresh error:', e);
      }
    };

    refreshQuests();
  }, [activeTab]);

  // Randomize and Filter on Tab Switch to 'reflect'
  // Safety: Ensure we always have content (fixes empty state on load)
  useEffect(() => {
    if (reflections.length === 0 && CURATED_REFLECTIONS.length > 0) {
      const shuffled = [...CURATED_REFLECTIONS].sort(() => 0.5 - Math.random());
      setReflections(shuffled);
    }
  }, [reflections.length]);

  // Initial Load (removed legacy logic, handled by the effect above or default state)
  // We keep the initial state as CURATED_REFLECTIONS to ensure something is there before first tab switch if needed.

  const saveUser = (u: User) => {
    // OPTIMISTIC: Update React state immediately for instant UI response
    setUser(u);
    if (u.id) {
      // 1. Sanitize: Remove duplicates, nulls, and ensure we have clean arrays
      const cleanActive = Array.from(new Set(u.activeQuests.filter(id => !!id)));
      const cleanPinned = Array.from(new Set((u.pinnedQuests || []).filter(id => !!id)));

      // 2. Persist to localStorage (instant, no network)
      localStorage.setItem(`nurpath_user_${u.id}`, JSON.stringify({
        activeQuests: cleanActive,
        completedDailyQuests: u.completedDailyQuests,
        pinnedQuests: cleanPinned,
        settings: u.settings
      }));

      // 3. Fire-and-forget DB write (non-blocking)
      supabase.from('profiles').update({
        active_quests: cleanActive,
        pinned_quests: cleanPinned,
        location: u.location,
        auto_add_pinned: u.autoAddPinned,
        settings: u.settings,
        prayer_time_adjustments: u.prayerTimeAdjustments || {},
        ramadan_fasting: u.ramadanFasting,
        calc_method: u.settings?.calcMethod,
        madhab: u.settings?.madhab
      }).eq('id', u.id).then(({ error }) => {
        if (error) console.error('Background save error:', error);
      });
    }
  };

  const handleSaveSettings = () => {
    if (!user) return;
    setIsSaving(true);
    setSaveSuccess(false);

    // Update local user object with pending settings
    const updatedUser = {
      ...user,
      location: manualLocationInput,
      settings: pendingSettings,
      prayerTimeAdjustments: pendingPrayerAdjustments
    };

    saveUser(updatedUser); // Now non-blocking

    // Instant feedback with brief success flash
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 1500);
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

  const toggleRamadanDay = async (day: number) => {
    if (!user) return;
    const currentDays = user.settings?.ramadan_tracker || [];
    const isCompleted = currentDays.includes(day);
    const newDays = isCompleted ? currentDays.filter(d => d !== day) : [...currentDays, day];
    const newSettings = { ...user.settings, ramadan_tracker: newDays } as UserSettings;
    const xpDelta = isCompleted ? -200 : 200;
    const newXp = Math.max(0, user.xp + xpDelta);

    const updatedUser = { ...user, settings: newSettings, xp: newXp };
    saveUser(updatedUser);

    try {
      await supabase.auth.getSession();
      await supabase.from('profiles').update({ settings: newSettings, xp: newXp }).eq('id', user.id);
    } catch (e) {
      console.error('Failed to save Ramadan Tracker state', e);
    }
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
    // Remove from active AND unpin so refresh logic doesn't re-add it
    const newActive = user.activeQuests.filter(id => id !== quest.id);
    const newPinned = (user.pinnedQuests || []).filter(id => id !== quest.id);
    const updated = { ...user, activeQuests: newActive, pinnedQuests: newPinned };
    saveUser(updated);
  };

  const completeQuests = async (quests: Quest[], xpMultiplier: number = 1) => {
    if (!user || !user.id || quests.length === 0) return;

    // 1. Compute updated state IMMEDIATELY (optimistic)
    let totalXp = 0;
    const questIds = quests.map(q => q.id);
    const dailyUpdates: Record<string, string> = {};
    const today = new Date().toISOString().split('T')[0];

    quests.forEach(q => {
      totalXp += (q.xp * xpMultiplier);
      dailyUpdates[q.id] = today;
    });

    const optimisticXp = user.xp + totalXp;

    const updated = {
      ...user,
      xp: optimisticXp,
      activeQuests: user.activeQuests.filter(id => !questIds.includes(id)),
      completedDailyQuests: { ...user.completedDailyQuests, ...dailyUpdates }
    };

    // 2. OPTIMISTIC UI: Update React state instantly
    saveUser(updated);

    // Immediately update trackedGroupQuests UI (remove completed from list)
    const groupQuests = quests.filter(q => (q as any).isGroupQuest);
    if (groupQuests.length > 0) {
      setTrackedGroupQuests(prev => prev.filter(tq => !questIds.includes(tq.id)));
    }

    if (xpMultiplier > 1) {
      alert(`MashaAllah! Group Quests Completed. ${totalXp} XP (2x) Earned!`);
    }

    // 3. Fire DB writes in parallel (background, non-blocking for UI)
    try {
      await ensureSession(); // cached — skips if verified recently

      // Fetch authoritative XP to avoid race conditions
      const { data: currentProfile } = await supabase.from('profiles').select('xp').eq('id', user.id).single();
      const serverXp = (currentProfile?.xp || user.xp) + totalXp;

      // Fire all writes in parallel
      const writes: Promise<any>[] = [
        supabase.from('profiles').update({ xp: serverXp }).eq('id', user.id),
        supabase.from('user_quests').insert(
          quests.map(q => ({
            user_id: user.id,
            quest_id: q.id,
            quest_title: q.title,
            xp_reward: q.xp * xpMultiplier
          }))
        )
      ];

      // Handle Group Quest Completions
      if (groupQuests.length > 0) {
        writes.push(
          supabase.from('group_quest_completions').upsert(
            groupQuests.map(q => ({
              user_id: user.id,
              group_quest_id: q.id.replace('gq_', ''),
              is_claimed: true
            })),
            { onConflict: 'group_quest_id,user_id' }
          )
        );
      }

      await Promise.all(writes);

      // Reconcile server XP with optimistic if different
      if (serverXp !== optimisticXp) {
        setUser(prev => prev ? { ...prev, xp: serverXp } : prev);
      }
    } catch (e) {
      console.error('Background quest completion error:', e);
      // UI already updated optimistically — data will reconcile on next load
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

  const handleTrackGroupQuest = async (quest: Quest) => {
    if (!user) return;
    const id = quest.id;
    const isActive = user.activeQuests.includes(id);

    let newActive;
    if (isActive) {
      // Untrack
      newActive = user.activeQuests.filter(q => q !== id);
      setTrackedGroupQuests(prev => prev.filter(q => q.id !== id));
    } else {
      // Track
      const qToAdd = { ...quest, isLocked: false, completionCount: 0, completed: false, sharedBy: [] } as GroupQuest;
      newActive = [...user.activeQuests, id];
      setTrackedGroupQuests(prev => [...prev, qToAdd]);
    }

    const updated = { ...user, activeQuests: newActive };
    saveUser(updated);
  };

  const handleSaveRoutine = async (selectedIds: string[], removedIds: string[] = []) => {
    if (!user) return;

    // Sanitize incoming IDs
    const cleanSelected = Array.from(new Set(selectedIds.map(id => id.trim()).filter(id => !!id)));
    const cleanRemoved = Array.from(new Set(removedIds.map(id => id.trim()).filter(id => !!id)));

    // ALL selected routine IDs go into activeQuests
    let newActiveQuests = Array.from(new Set([...user.activeQuests, ...cleanSelected]));

    // Remove explicitly removed quests from active tracking
    if (cleanRemoved.length > 0) {
      newActiveQuests = newActiveQuests.filter(id => !cleanRemoved.includes(id));
    }

    const updatedUser = {
      ...user,
      pinnedQuests: cleanSelected,
      activeQuests: newActiveQuests
    };

    saveUser(updatedUser);
    setShowRoutineBuilder(false);
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
    const relatedQuests = relatedIds
      .map(id => ALL_QUESTS.find(q => q.id === id))
      .filter((q): q is Quest => !!q)
      .map(q => ({
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

    if (questId === 'tahajjud') {
      const ishaMins = getMinutesFromTime(prayerTimes['Isha']);
      const fajrMins = getMinutesFromTime(prayerTimes['Fajr']);
      const startMins = (ishaMins + 60) % 1440;

      let tStatus: 'now' | 'future' | 'past' = 'future';
      let isActive = false;

      if (startMins > fajrMins) {
        isActive = currentMins >= startMins || currentMins < fajrMins;
      } else {
        isActive = currentMins >= startMins && currentMins < fajrMins;
      }

      if (isActive) tStatus = 'now';

      let tTimeLeft = '';
      if (tStatus === 'future') {
        let diff = startMins - currentMins;
        if (diff < 0) diff += 1440;
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        if (h > 0) tTimeLeft = `${h}h ${m}m`;
        else tTimeLeft = `${m}m`;
      }

      return { time: 'Night', status: tStatus, timeLeft: tTimeLeft };
    }

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

  // NEW STRICT HERO LOGIC
  let heroQuest: Quest | undefined;
  let heroRelatedQuests: Quest[] = [];
  let heroTimeStatus = null;

  if (user) {
    let intendedHeroId: string | undefined;

    // Check main fard progression
    const trackedFard = fardSalahIds.filter(id => user.activeQuests.includes(id));
    const firstIncomplete = trackedFard.find(id => !isCompletedToday(id));
    const nowPrayer = trackedFard.find(id => getQuestTimeStatus(id)?.status === 'now');

    // "It should make Asr the main card once i complete Dhuhr, or exactly when it's time for Asr and i haven't completed Dhuhr."
    if (nowPrayer && !isCompletedToday(nowPrayer)) {
      intendedHeroId = nowPrayer; // It is exactly time for this prayer and it isn't completed
    } else if (firstIncomplete) {
      intendedHeroId = firstIncomplete; // e.g. Dhuhr completed, Asr is next
    } else {
      // Fallback to first incomplete Main quest if all fard salah are done
      intendedHeroId = user.activeQuests.find(id => {
        const q = ALL_QUESTS.find(q => q.id === id);
        return q && q.category === QuestCategory.MAIN && !isCompletedToday(id);
      });
      // Wrap around to tomorrow's Fajr if all tracked fard salah are completed today
      if (!intendedHeroId && trackedFard.length > 0 && trackedFard.includes('fajr')) {
        intendedHeroId = 'fajr';
      }
    }

    if (intendedHeroId) {
      heroQuest = ALL_QUESTS.find(q => q.id === intendedHeroId);
      if (heroQuest) {
        // Force completion mathematically false if we wrapped around to tomorrow's fajr
        const forceIncomplete = intendedHeroId === 'fajr' && isCompletedToday('fajr') && trackedFard.every(id => isCompletedToday(id));

        const relIds = PRAYER_RELATED_QUESTS[heroQuest.id] || [];
        heroRelatedQuests = relIds
          .map(id => ALL_QUESTS.find(q => q.id === id))
          .filter((q): q is Quest => !!q)
          .map(q => ({
            ...q,
            completed: isCompletedToday(q.id) && !forceIncomplete
          }));
      }
    }
  }

  if (heroQuest) {
    heroTimeStatus = getQuestTimeStatus(heroQuest.id);
    // If it's a wrapped-around Fajr, force it into the future locked state
    if (user && heroQuest.id === 'fajr' && isCompletedToday('fajr') && fardSalahIds.filter(id => user.activeQuests.includes(id)).every(id => isCompletedToday(id))) {
      if (heroTimeStatus) {
        heroTimeStatus.status = 'future';
        heroTimeStatus.timeLeft = heroTimeStatus.timeLeft || 'Tomorrow';
      }
    }
  }

  const totalHeroXP = heroQuest ? heroQuest.xp + heroRelatedQuests
    .filter(rq => selectedHeroRelated.includes(rq.id))
    .reduce((sum, rq) => sum + rq.xp, 0) : 0;

  // --- SIDE QUESTS: Only show non-completed ones (unless pinned) ---
  const activeSideQuests = user?.activeQuests
    .filter(qid => {
      const isPinned = user?.pinnedQuests?.includes(qid);
      const completed = isCompletedToday(qid);
      return !completed || isPinned;
    })
    .map(qid => ALL_QUESTS.find(q => q.id === qid))
    .filter(q => q && q.id !== heroQuest?.id && q.category !== QuestCategory.MAIN && !fardSalahIds.includes(q.id) && !q.isPackage) as Quest[] || [];

  const handleLoadMoreReflections = async () => {
    if (loadingReflections) return;

    setLoadingReflections(true);
    try {
      // Use AI to generate new reflections
      // Count: 3 items per load
      const newItems = await generateReflectionsStream(3);

      if (newItems.length > 0) {
        setReflections(prev => [...prev, ...newItems]);
        setHasMoreReflections(true); // Keep going
      } else {
        // AI failed or returned empty? Maybe retry? 
        // For now, assume end of path if empty but we can try again.
        // We won't set hasMore=false to allow user to try scrolling again later.
      }
    } catch (e) {
      console.error("Failed to load reflections", e);
    } finally {
      setLoadingReflections(false);
    }
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
  const todayStr = new Date().toISOString().split('T')[0];
  const questsCompletedCount = Object.entries(user?.completedDailyQuests || {}).filter(([_, date]) => date === todayStr).length;

  const xpGainedToday = Object.entries(user?.completedDailyQuests || {})
    .filter(([_, date]) => date === todayStr)
    .reduce((total, [questId]) => {
      const q = ALL_QUESTS.find(quest => quest.id === questId);
      return total + (q ? q.xp : 0);
    }, 0);

  if (loadingAuth) return <div className="h-screen w-full flex items-center justify-center bg-[#fdfbf7]"><Loader2 className="animate-spin text-[#064e3b]" size={48} /></div>;
  if (!user) return <Auth onLoginSuccess={() => { }} />;

  return (
    <div className={`max-w-md mx-auto h-screen overflow-hidden flex flex-col relative shadow-2xl transition-all ${activeTab === 'reflect' ? '' : 'border-x border-slate-100'} ${user.settings?.darkMode ? 'bg-[#050a09]' : 'bg-[#fdfbf7]'}`}>

      {activeTab !== 'reflect' && activeTab !== 'community' && (
        <header className={`z-20 backdrop-blur-md ${user.settings?.darkMode ? 'bg-[#050a09]/90' : 'bg-[#fdfbf7]/90'}`}>
          <div className="p-6 pb-4 flex items-center justify-between relative">
            <div className="flex flex-col z-10"><span className={`text-[12px] font-black uppercase tracking-[0.5em] ${user.settings?.darkMode ? 'text-white' : 'text-[#064e3b]'}`}>NurPath</span></div>
            <div className="flex items-center gap-2 z-10">
              <button
                onClick={() => { previousTabRef.current = activeTab as any; setActiveTab('community'); }}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all active:scale-95 border ${user.settings?.darkMode ? 'bg-white/[0.05] border-white/10 text-white hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
              >
                <HeartHandshake size={13} className={user.settings?.darkMode ? 'text-white/60' : 'text-slate-500'} />
                <span className="text-[10px] font-black uppercase tracking-wider">Nur-Connect</span>
                {(hasFriendRequests || hasGroupInvites) && <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border border-white dark:border-[#050a09]"></span></span>}
              </button>
              <button onClick={() => setShowSettings(true)} className={`p-2 rounded-full transition-colors ${user.settings?.darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><Settings size={18} /></button>
            </div>
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

      <main
        ref={mainScrollRef}
        className={`flex-1 scrollbar-hide ${activeTab === 'reflect' || activeTab === 'community' || activeTab === 'guide' ? 'overflow-hidden p-0' : 'overflow-y-auto pb-40 px-6'}`}
        onTouchStart={(e) => { touchStartY.current = e.touches[0].clientY; }}
        onTouchMove={(e) => {
          if (mainScrollRef.current && mainScrollRef.current.scrollTop <= 0) {
            const diff = e.touches[0].clientY - touchStartY.current;
            if (diff > 0 && diff < 150) setPullDistance(diff);
          }
        }}
        onTouchEnd={async () => {
          if (pullDistance > 80 && !pullRefreshing) {
            setPullRefreshing(true);
            setPullDistance(0);
            try {
              const { data: { session } } = await supabase.auth.getSession();
              if (session) await fetchProfile(session.user.id, session.user.email!, session.user.created_at);
            } catch (e) { console.error(e); }
            setPullRefreshing(false);
          } else {
            setPullDistance(0);
          }
        }}
      >
        {/* Pull to Refresh Indicator */}
        {(pullDistance > 10 || pullRefreshing) && (
          <div className="flex items-center justify-center py-4 transition-all" style={{ height: pullRefreshing ? 48 : Math.min(pullDistance, 80) }}>
            <Loader2 className={`text-[#064e3b] dark:text-[#d4af37] ${pullRefreshing ? 'animate-spin' : ''}`} size={20} style={{ opacity: pullRefreshing ? 1 : Math.min(pullDistance / 80, 1) }} />
          </div>
        )}
        {activeTab === 'community' && <Community currentUser={user} darkMode={user.settings?.darkMode} onCompleteGroupQuest={(q) => completeQuest(q, 2)} onClose={() => setActiveTab(previousTabRef.current)} hasFriendRequests={hasFriendRequests} hasGroupInvites={hasGroupInvites} onTrackQuest={handleTrackGroupQuest} />}

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

        {activeTab === 'guide' && <Citadel user={user} />}

        {activeTab === 'seerah' && (
          <div className="h-full flex items-center justify-center">
            <button onClick={() => setActiveTab('guide')} className="px-6 py-3 bg-[#064e3b] text-white rounded-full font-bold">Go to Citadel Seerah</button>
          </div>
        )}

        {activeTab === 'collect' && (
          <div className="space-y-6 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* ROUTINE BUILDER BUTTON */}
            <div className="pt-2"> {/* Removed px-6 to make it wider/bleed to edges */}
              <button
                onClick={() => setShowRoutineBuilder(true)}
                className={`w-full p-6 min-h-[160px] rounded-[32px] border transition-all flex flex-col justify-between group relative overflow-hidden ${user.settings?.darkMode ? 'border-white/10' : 'border-slate-300 shadow-xl'}`}
              >
                {/* Background Image & Ambient Overlay */}
                <div
                  className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: "url('/images/routine.jpeg')" }}
                />
                <div className="absolute inset-0 z-0 bg-black/40 backdrop-blur-[1px]" /> {/* Less blur/darkness to make musallah more visible */}

                {/* Top Section: Icon & Title */}
                <div className="w-full flex items-center justify-between relative z-10 transition-transform group-hover:translate-x-1">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl flex items-center justify-center">
                      <ListTodo size={28} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-extrabold text-[28px] uppercase leading-none tracking-tight text-white drop-shadow-md"> {/* Added uppercase here */}
                        {(user.pinnedQuests?.length || 0) > 0 ? 'EDIT ROUTINE' : 'BUILD ROUTINE'}
                      </h3>
                      <p className="text-[14px] text-white/90 font-medium mt-1.5 drop-shadow-sm">
                        {(user.pinnedQuests?.length || 0) > 0 ? `${user.pinnedQuests!.length} active daily duties.` : 'Configure your daily habits.'}
                      </p>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center relative z-10 bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-md">
                    <ChevronRight size={24} />
                  </div>
                </div>

                {/* Bottom Section: Subtext */}
                <div className="relative z-10 mt-6 text-left w-full">
                  <p className="text-[13px] font-bold tracking-normal text-[#f7f1e3] drop-shadow-md normal-case">
                    Quests added to your routine will automatically be tracked daily!
                  </p>
                </div>
              </button>
            </div>

            {/* STANDARD CATEGORIES */}
            <div className="pt-8 px-6">
              <div className="space-y-3">
                {Object.entries(questSections).map(([category, quests]) => {
                  // FILTER: Hide if in Routine (Pinned) or actively tracked
                  // Re-add them if they are completed today (unless they are Routine pinned quests)
                  const displayQuests = quests.filter(q => {
                    const isTracked = user.activeQuests.includes(q.id);
                    const isPinned = user.pinnedQuests?.includes(q.id);
                    const isCompleted = isCompletedToday(q.id);

                    if (isPinned) return false; // Hide ALL routine quests permanently from All Quests
                    if (isTracked && !isCompleted) return false; // Hide active side quests from All Quests until completed
                    return true;
                  });

                  // Count available (not tracked and not completed)
                  const availableToStart = displayQuests.filter(q => !user.activeQuests.includes(q.id) && !isCompletedToday(q.id)).length;

                  if (displayQuests.length === 0) return null;
                  const isOpen = openCategories.includes(category);
                  const isCorrection = category === 'Correction Quests';

                  // Using sophisticated Flat UI Colors
                  const categoryColors: Record<string, string> = {
                    'The Five Pillars': 'bg-[#16a085]',      // Green Sea
                    'Daily Remembrance': 'bg-[#2980b9]',    // Belize Hole
                    'Bonus Salaah': 'bg-[#064e3b]',         // Deep Forest Green
                    'Sunnah & Character': 'bg-[#8e44ad]',   // Wisteria
                    'Community & Charity': 'bg-[#d35400]',  // Pumpkin
                    'Correction Quests': 'bg-[#c0392b]'     // Pomegranate
                  };

                  // Bonus Salaah fix to use class if hex isn't intended for direct injection
                  const bgClass = categoryColors[category]?.startsWith('bg-') ? categoryColors[category] : 'bg-[#064e3b]';
                  const customStyle = categoryColors[category]?.startsWith('#') ? { backgroundColor: categoryColors[category] } : {};
                  const bgColor = categoryColors[category] || 'bg-slate-700';

                  return (
                    <section key={category} className="space-y-2 transition-all">
                      <button
                        onClick={() => toggleCategory(category)}
                        className={`w-full flex items-center justify-between p-5 rounded-2xl shadow-sm transition-all border border-white/5 ${bgClass} text-white hover:brightness-110 active:scale-[0.98] outline-none`}
                        style={customStyle}
                      >
                        <div className="flex items-center gap-3">
                          {category === 'The Five Pillars' && <div className="p-1.5 rounded-lg bg-white/10"><Shield size={16} /></div>}
                          {category === 'Daily Remembrance' && <div className="p-1.5 rounded-lg bg-white/10"><Sparkles size={16} /></div>}
                          {category === 'Bonus Salaah' && <div className="p-1.5 rounded-lg bg-white/10"><Target size={16} /></div>}
                          {category === 'Sunnah & Character' && <div className="p-1.5 rounded-lg bg-white/10"><UserIcon size={16} /></div>}
                          {category === 'Community & Charity' && <div className="p-1.5 rounded-lg bg-white/10"><Users size={16} /></div>}
                          {category === 'Correction Quests' && <div className="p-1.5 rounded-lg bg-white/10"><AlertTriangle size={16} /></div>}
                          <h2 className="text-sm font-black uppercase tracking-widest">{category}</h2>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold bg-black/20 px-2 py-1 rounded-lg">{availableToStart}/{displayQuests.length}</span>
                          <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </button>
                      {isOpen && (
                        <div className="grid grid-cols-1 gap-4 pt-2 animate-in fade-in slide-in-from-top-2 px-1">
                          {displayQuests.map(q => (
                            <React.Fragment key={q.id}>
                              <QuestCard
                                quest={q}
                                onAction={handleQuestSelect}
                                isTracked={user.activeQuests.includes(q.id)}
                                darkMode={user.settings?.darkMode}
                                isGreyed={q.isGreyed || isCompletedToday(q.id)}
                                onShowInfo={() => setInfoModalQuest(q)}
                              />
                              {q.id === 'fasting_ramadan' && (
                                <button
                                  onClick={() => setActiveTab('active')}
                                  className="w-full text-center py-2 transition-opacity hover:opacity-80"
                                >
                                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#064e3b] dark:text-[#d4af37]">
                                    Trackable - see My Journey
                                  </span>
                                </button>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* --- MY QUESTS / JOURNEY TAB --- */}
        {activeTab === 'active' && (
          <div className="space-y-6 py-6 animate-in fade-in slide-in-from-right-4 duration-500">

            {/* TAB SWITCHER: My Quests / Citadel Quests */}
            <div className={`flex rounded-2xl p-1 ${user.settings?.darkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
              <button
                onClick={() => setQuestTabView('my')}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${questTabView === 'my'
                  ? (user.settings?.darkMode ? 'bg-white/10 text-white shadow' : 'bg-white text-[#064e3b] shadow')
                  : 'text-slate-400'}`}
              >
                My Quests
              </button>
              <button
                onClick={() => levelInfo.level >= 10 ? setQuestTabView('citadel') : null}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${questTabView === 'citadel'
                  ? (user.settings?.darkMode ? 'bg-white/10 text-white shadow' : 'bg-white text-[#064e3b] shadow')
                  : 'text-slate-400'} ${levelInfo.level < 10 ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                {levelInfo.level < 10 && <Lock size={10} />}
                Citadel Quests
              </button>
            </div>

            {/* CITADEL QUESTS - LOCKED STATE */}
            {questTabView === 'citadel' && levelInfo.level < 10 && (
              <div className="h-[40vh] flex flex-col items-center justify-center text-center space-y-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${user.settings?.darkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
                  <Lock size={32} className="text-slate-300" />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${user.settings?.darkMode ? 'text-white' : 'text-slate-900'}`}>Citadel Quests</h3>
                  <p className="text-xs text-slate-400 mt-1">Unlocks at Level 10 • You are Level {levelInfo.level}</p>
                </div>
              </div>
            )}

            {/* MY QUESTS VIEW */}
            {questTabView === 'my' && (
              <div className="space-y-4">
                {/* Ramadan Tracker Card */}
                <button
                  onClick={() => setShowRamadanTracker(true)}
                  className={`w-full p-5 rounded-[24px] transition-all hover:-translate-y-0.5 active:translate-y-0 border shadow-sm ${user.settings?.darkMode ? 'bg-[#1a1500] border-[#d4af37]/30 hover:shadow-[#d4af37]/10' : 'bg-white border-amber-200/60 hover:border-amber-300 hover:shadow-amber-100/50'}`}
                >
                  <div className="flex items-center justify-between text-left">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center ${user.settings?.darkMode ? 'bg-[#d4af37]/10 text-[#d4af37]' : 'bg-amber-50 text-amber-600'}`}>
                        <Moon size={22} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 className={`font-black text-lg mb-0.5 tracking-tight ${user.settings?.darkMode ? 'text-white' : 'text-slate-800'}`}>Ramadan Tracker</h3>
                        <p className={`text-[10px] font-black uppercase tracking-[0.15em] ${user.settings?.darkMode ? 'text-[#d4af37]/80' : 'text-amber-500'}`}>
                          {(user.settings?.ramadan_tracker?.length || 0)}/30 Days • Earn 200XP per day
                        </p>
                      </div>
                    </div>
                    <div className={`p-1.5 rounded-full ${user.settings?.darkMode ? 'text-white/20' : 'text-slate-300'}`}>
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </button>

                {/* Hero Card - Next Main Goal */}
                {heroQuest ? (
                  <div className="relative group">
                    <div className={`relative p-8 rounded-[24px] overflow-hidden ${user.settings?.darkMode ? 'bg-emerald-900/40 border border-emerald-500/20' : 'bg-[#064e3b] shadow-xl'}`}>
                      <div className="absolute top-0 right-0 p-6 opacity-5 mix-blend-overlay">
                        <Zap size={140} />
                      </div>
                      <div className="relative z-10 text-white">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-white/20 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-white/90">Main Priority</span>
                          {/* Time Badge in Hero */}
                          {heroTimeStatus && (
                            <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${heroTimeStatus.status === 'now' ? 'bg-rose-500 text-white animate-pulse' : 'bg-[#043327]/80'}`}>
                              <Clock size={10} />
                              {heroTimeStatus.status === 'now' ? `NOW • ${heroTimeStatus.time}` : heroTimeStatus.time}
                            </span>
                          )}
                          <span className="text-[10px] text-[#d4af37] font-black">+{totalHeroXP} XP</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{heroQuest.title}</h3>
                        <p className="text-sm text-white/80 mb-6 max-w-[80%]">{heroQuest.description}</p>

                        {/* Interactive Checklist inside Green Card */}
                        {heroRelatedQuests.length > 0 && (() => {
                          const isPreSalah = (id: string) => ['miswak', 'wudhu', 'tahiyyatul_wudhu', 'tahiyyatul_masjid', 'sunnah-pre'].some(k => id.includes(k));
                          const preSalahQuests = heroRelatedQuests.filter(rq => isPreSalah(rq.id));
                          const postSalahQuests = heroRelatedQuests.filter(rq => !isPreSalah(rq.id));

                          const renderHeroChecklist = (title: string, items: typeof heroRelatedQuests) => {
                            if (!items.length) return null;
                            return (
                              <div className="mb-4 last:mb-0">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2 flex items-center gap-1"><CheckSquare size={12} /> {title}</h4>
                                <div className="space-y-2">
                                  {items.map(rq => (
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
                              </div>
                            );
                          };

                          return (
                            <div className="mb-6 bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                              {renderHeroChecklist('Pre-Salah Checklist', preSalahQuests)}
                              {renderHeroChecklist('Post-Salah Checklist', postSalahQuests)}
                            </div>
                          );
                        })()}

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

                {/* JUMU'AH CHECKLIST - Fridays Only, Collapsible */}
                {(() => {
                  const today = new Date();
                  const isFriday = today.getDay() === 5;
                  if (!isFriday) return null;

                  // Hide after Maghrib on Friday
                  if (prayerTimes?.Maghrib) {
                    const now = new Date();
                    const currentMins = now.getHours() * 60 + now.getMinutes();
                    const maghribMins = getMinutesFromTime(prayerTimes.Maghrib);
                    if (currentMins >= maghribMins) return null;
                  }

                  const completedCount = JUMUAH_CHECKLIST.filter(item => isCompletedToday(item.id)).length;

                  return (
                    <div className={`rounded-[24px] border-2 overflow-hidden relative ${user.settings?.darkMode ? 'bg-[#1a1500] border-[#d4af37]/30' : 'bg-[#fffbeb] border-[#d4af37]/20'}`}>
                      <div className="absolute top-0 right-0 p-4 opacity-5"><CalendarDays size={80} /></div>
                      <button
                        onClick={() => setJumuahCollapsed(!jumuahCollapsed)}
                        className="w-full relative z-10 p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[#d4af37] text-lg">☪</span>
                          <div className="text-left">
                            <h3 className={`text-sm font-bold ${user.settings?.darkMode ? 'text-[#d4af37]' : 'text-[#8b6914]'}`}>Jumu'ah Mubarak</h3>
                            <p className={`text-[9px] uppercase tracking-widest ${user.settings?.darkMode ? 'text-[#d4af37]/60' : 'text-[#8b6914]/60'}`}>{completedCount}/{JUMUAH_CHECKLIST.length} Complete</p>
                          </div>
                        </div>
                        <ChevronDown size={16} className={`text-[#d4af37] transition-transform ${jumuahCollapsed ? '-rotate-90' : ''}`} />
                      </button>
                      {!jumuahCollapsed && (
                        <div className="relative z-10 px-4 pb-4 space-y-1.5">
                          {JUMUAH_CHECKLIST.map(item => {
                            const isDone = isCompletedToday(item.id);
                            return (
                              <button
                                key={item.id}
                                onClick={() => !isDone && completeQuest({ id: item.id, title: item.title, xp: item.xp, category: QuestCategory.DHIKR, description: '' })}
                                disabled={isDone}
                                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${isDone
                                  ? 'opacity-40'
                                  : (user.settings?.darkMode ? 'hover:bg-white/5 active:scale-[0.98]' : 'hover:bg-[#d4af37]/5 active:scale-[0.98]')}`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${isDone ? 'bg-[#d4af37] border-[#d4af37]' : (user.settings?.darkMode ? 'border-[#d4af37]/40' : 'border-[#d4af37]/30')}`}>
                                    {isDone && <Check size={10} className="text-white" />}
                                  </div>
                                  <span className={`text-xs font-bold ${isDone ? 'line-through' : ''} ${user.settings?.darkMode ? 'text-white' : 'text-slate-800'}`}>{item.title}</span>
                                </div>
                                <span className="text-[9px] font-black text-[#d4af37]">{isDone ? '✓' : `+${item.xp}`}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Quest Lists */}
                <div className="space-y-6">
                  {/* Sacred Duties (Salah + Tahajjud) with Sub-Quest Encapsulation */}
                  {user?.activeQuests.some(id => fardSalahIds.includes(id) || ALL_QUESTS.find(q => q.id === id)?.category === QuestCategory.MAIN) && (() => {
                    const visiblePrayers: Quest[] = [];
                    const upcomingPrayers: Quest[] = [];
                    const completedPrayers: Quest[] = [];

                    // Gather all main quests and calculate their status
                    const allMainQuests = user.activeQuests
                      .map(id => ALL_QUESTS.find(q => q.id === id))
                      .filter(q => q && !q.isPackage && q.id !== heroQuest?.id && (fardSalahIds.includes(q.id) || q.category === QuestCategory.MAIN)) as Quest[];

                    allMainQuests.forEach(q => {
                      const isSalaah = fardSalahIds.includes(q.id);
                      const isCompleted = isCompletedToday(q.id);

                      if (isSalaah) {
                        if (isCompleted) {
                          completedPrayers.push(q);
                        } else {
                          const timeStatus = getQuestTimeStatus(q.id);
                          // If it hasn't started, it goes to upcoming 
                          if (timeStatus?.status === 'future') {
                            upcomingPrayers.push(q);
                          } else {
                            visiblePrayers.push(q);
                          }
                        }
                      } else if (isCompleted) {
                        // Non-salah main quests shouldn't stay in visible if completed unless pinned
                        if (!user?.pinnedQuests?.includes(q.id)) {
                          return; // drop it entirely
                        } else {
                          completedPrayers.push(q);
                        }
                      } else {
                        visiblePrayers.push(q);
                      }
                    });

                    // Sort chronologically
                    visiblePrayers.sort((a, b) => fardSalahIds.indexOf(a.id) - fardSalahIds.indexOf(b.id));
                    upcomingPrayers.sort((a, b) => fardSalahIds.indexOf(a.id) - fardSalahIds.indexOf(b.id));
                    completedPrayers.sort((a, b) => fardSalahIds.indexOf(a.id) - fardSalahIds.indexOf(b.id));

                    if (visiblePrayers.length === 0 && upcomingPrayers.length === 0 && completedPrayers.length === 0) return null;

                    return (
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-2 flex items-center gap-2"><Star size={12} /> Sacred Duties</h3>
                        <div className="space-y-3">
                          {/* Active / Missed prayers — always visible */}
                          {visiblePrayers.map(q => {
                            const timeStatus = getQuestTimeStatus(q.id);
                            return (
                              <div key={q.id} className={`rounded-[24px] overflow-hidden transition-all ${user.settings?.darkMode ? 'bg-white/5' : 'bg-white'}`}>
                                <QuestCard
                                  quest={q}
                                  isActive={timeStatus?.status !== 'future'}
                                  isGreyed={timeStatus?.status === 'future'}
                                  isCompleted={false}
                                  timeDisplay={timeStatus as any}
                                  onComplete={() => completeQuest(q)}
                                  onRemove={removeQuest}
                                  onPin={togglePinQuest}
                                  isPinned={user.pinnedQuests?.includes(q.id)}
                                  darkMode={user.settings?.darkMode}
                                  onShowInfo={() => setInfoModalQuest(q)}
                                />
                              </div>
                            );
                          })}

                          {/* Completed prayers — collapsible, separated */}
                          {completedPrayers.length > 0 && (
                            <>
                              <button
                                onClick={() => setCompletedSalahExpanded(!completedSalahExpanded)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${user.settings?.darkMode ? 'bg-white/5 text-emerald-400/80 hover:bg-white/10' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                              >
                                <span className="flex items-center gap-2">
                                  <CheckCircle2 size={14} />
                                  {completedPrayers.length} completed prayer{completedPrayers.length > 1 ? 's' : ''}
                                </span>
                                <ChevronDown size={14} className={`transition-transform ${completedSalahExpanded ? 'rotate-180' : ''}`} />
                              </button>

                              {completedSalahExpanded && completedPrayers.map(q => {
                                const timeStatus = getQuestTimeStatus(q.id);
                                return (
                                  <div key={q.id} className={`rounded-[24px] overflow-hidden transition-all opacity-80 ${user.settings?.darkMode ? 'bg-white/5' : 'bg-white'}`}>
                                    <QuestCard
                                      quest={q}
                                      isActive={false}
                                      isGreyed={false}
                                      isCompleted={true}
                                      timeDisplay={timeStatus as any}
                                      onComplete={() => completeQuest(q)}
                                      onRemove={removeQuest}
                                      onPin={togglePinQuest}
                                      isPinned={user.pinnedQuests?.includes(q.id)}
                                      darkMode={user.settings?.darkMode}
                                      onShowInfo={() => setInfoModalQuest(q)}
                                    />
                                  </div>
                                );
                              })}
                            </>
                          )}

                          {/* Upcoming/Locked prayers — collapsible, separated */}
                          {upcomingPrayers.length > 0 && (
                            <>
                              <button
                                onClick={() => setUpcomingSalahExpanded(!upcomingSalahExpanded)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${user.settings?.darkMode ? 'bg-white/5 text-white/40 hover:bg-white/10' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                              >
                                <span className="flex items-center gap-2">
                                  <Lock size={12} />
                                  {upcomingPrayers.length} upcoming prayer{upcomingPrayers.length > 1 ? 's' : ''}
                                </span>
                                <ChevronDown size={14} className={`transition-transform ${upcomingSalahExpanded ? 'rotate-180' : ''}`} />
                              </button>

                              {upcomingSalahExpanded && upcomingPrayers.map(q => {
                                const timeStatus = getQuestTimeStatus(q.id);
                                return (
                                  <div key={q.id} className={`rounded-[24px] overflow-hidden transition-all opacity-40 ${user.settings?.darkMode ? 'bg-white/5' : 'bg-white'}`}>
                                    <QuestCard
                                      quest={q}
                                      isActive={false}
                                      isGreyed={true}
                                      isCompleted={false}
                                      timeDisplay={timeStatus as any}
                                      onComplete={() => completeQuest(q)}
                                      onRemove={removeQuest}
                                      onPin={togglePinQuest}
                                      isPinned={user.pinnedQuests?.includes(q.id)}
                                      darkMode={user.settings?.darkMode}
                                      onShowInfo={() => setInfoModalQuest(q)}
                                    />
                                  </div>
                                );
                              })}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })()}

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
                            onShowInfo={() => setInfoModalQuest(q)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tracked Group Challenges */}
                  {trackedGroupQuests.filter(q => !q.completed && !isCompletedToday(q.id)).length > 0 && (
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-[#d4af37] mb-3 ml-2 flex items-center gap-2"><Shield size={12} /> Group Challenges</h3>
                      <div className="space-y-3">
                        {trackedGroupQuests.filter(q => !q.completed && !isCompletedToday(q.id)).map(q => (
                          <QuestCard
                            key={q.id}
                            quest={q as unknown as Quest}
                            isActive
                            onComplete={(quest) => completeQuest(quest, 2)}
                            onRemove={(quest) => removeQuest(quest)}
                            isGroupQuest
                            groupProgress={{ current: q.completionCount || 0, total: q.totalMembers || 0 }}
                            isLocked={q.isLocked}
                            darkMode={user.settings?.darkMode}
                            onShowInfo={() => setInfoModalQuest(q as unknown as Quest)}
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

      {/* FIXED: Moving Nav out of Main, and properly matching tags */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 z-50 transition-all">
        <div className={`rounded-[40px] p-2 flex items-center justify-between shadow-2xl border ${user.settings?.darkMode ? 'bg-[#050a09]/90 border-white/10 backdrop-blur-xl' : 'bg-white/95 border-[#064e3b]/5 backdrop-blur-md'}`}>
          <NavBtn active={activeTab === 'active'} label="My Quests" icon={<Target />} onClick={() => setActiveTab('active')} darkMode={user.settings?.darkMode} />
          <NavBtn active={activeTab === 'collect'} label="All Quests" icon={<LayoutGrid />} onClick={() => setActiveTab('collect')} darkMode={user.settings?.darkMode} />
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
                {/* Dark Mode: 3-way selector */}
                <div className="w-full p-5 bg-slate-50 dark:bg-white/5 rounded-[30px]">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                      <Moon size={20} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold dark:text-white">Appearance</h4>
                      <p className="text-xs text-slate-500">Choose your theme preference</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['light', 'dark', 'system'] as const).map(opt => (
                      <button
                        key={opt}
                        onClick={() => setPendingSettings({ ...pendingSettings, darkMode: opt === 'dark', darkModePreference: opt })}
                        className={`p-3 rounded-xl text-xs font-bold uppercase tracking-widest border-2 transition-all flex items-center justify-center gap-1.5 ${(pendingSettings.darkModePreference || (pendingSettings.darkMode ? 'dark' : 'light')) === opt
                          ? 'border-[#064e3b] bg-[#064e3b]/10 text-[#064e3b] dark:border-[#d4af37] dark:bg-[#d4af37]/10 dark:text-[#d4af37]'
                          : 'border-transparent bg-white dark:bg-black/20 text-slate-500'}`}
                      >
                        {opt === 'light' && <Sun size={14} />}
                        {opt === 'dark' && <Moon size={14} />}
                        {opt === 'system' && <Smartphone size={14} />}
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notifications */}
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

                {/* Leaderboard Toggle */}
                <button
                  onClick={() => setPendingSettings({ ...pendingSettings, leaderboardEnabled: !pendingSettings.leaderboardEnabled })}
                  className="w-full p-5 bg-slate-50 dark:bg-white/5 rounded-[30px] flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-cyan-500 text-white flex items-center justify-center">
                      <Users size={20} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold dark:text-white">Show on Leaderboard</h4>
                      <p className="text-xs text-slate-500">Allow others to see your rank</p>
                    </div>
                  </div>
                  <div className={`w-14 h-8 rounded-full relative transition-colors ${pendingSettings.leaderboardEnabled ? 'bg-[#064e3b]' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${pendingSettings.leaderboardEnabled ? 'left-7' : 'left-1'}`} />
                  </div>
                </button>
                {!pendingSettings.leaderboardEnabled && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 px-5 -mt-1">Your scores are hidden. Others cannot see your rank and you cannot view leaderboards.</p>
                )}
              </div>
            </section>

            {/* Section: Prayer Calc */}
            <section className="space-y-4">
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
            </section>

            {/* Section: Manual Prayer Corrections */}
            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Prayer Time Corrections</h3>
              <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-[30px] space-y-5">
                {/* Enable Toggle */}
                <button
                  onClick={() => setPendingSettings({ ...pendingSettings, manualPrayerCorrections: !pendingSettings.manualPrayerCorrections })}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-[#064e3b] dark:text-[#d4af37]" />
                    <div className="text-left">
                      <h4 className="text-sm font-bold dark:text-white">Manual Corrections</h4>
                      <p className="text-[10px] text-slate-400">Add or subtract minutes from prayer times</p>
                    </div>
                  </div>
                  <div className={`w-12 h-7 rounded-full relative transition-colors ${pendingSettings.manualPrayerCorrections ? 'bg-[#064e3b]' : 'bg-slate-300'}`}>
                    <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${pendingSettings.manualPrayerCorrections ? 'left-[22px]' : 'left-0.5'}`} />
                  </div>
                </button>

                {/* Per-Prayer Adjusters */}
                {pendingSettings.manualPrayerCorrections && (
                  <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-white/10 animate-in fade-in slide-in-from-top-2">
                    {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map(prayer => {
                      const currentOffset = pendingPrayerAdjustments[prayer] || 0;
                      return (
                        <div key={prayer} className="flex items-center justify-between">
                          <span className="text-sm font-bold dark:text-white w-20">{prayer}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setPendingPrayerAdjustments(prev => ({ ...prev, [prayer]: (prev[prayer] || 0) - 1 }))}
                              className="w-8 h-8 rounded-full bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-lg hover:bg-slate-100 active:scale-90 transition-all"
                            >−</button>
                            <span className={`w-16 text-center text-sm font-black tabular-nums ${currentOffset === 0 ? 'text-slate-400' : currentOffset > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                              {currentOffset > 0 ? '+' : ''}{currentOffset} min
                            </span>
                            <button
                              onClick={() => setPendingPrayerAdjustments(prev => ({ ...prev, [prayer]: (prev[prayer] || 0) + 1 }))}
                              className="w-8 h-8 rounded-full bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-lg hover:bg-slate-100 active:scale-90 transition-all"
                            >+</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

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
      )
      }

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
      {/* ROUTINE BUILDER MODAL (Hoisted) */}
      {
        showRoutineBuilder && (
          <RoutineBuilder
            currentRoutine={user.pinnedQuests || []}
            onSave={handleSaveRoutine}
            onClose={() => setShowRoutineBuilder(false)}
            darkMode={user.settings?.darkMode}
          />
        )
      }
      {/* Ramadan Tracker Modal */}
      {
        showRamadanTracker && user && (
          <RamadanTracker
            user={user}
            onClose={() => setShowRamadanTracker(false)}
            onToggleDay={toggleRamadanDay}
            darkMode={user.settings?.darkMode}
          />
        )
      }

      {/* QUEST INFO MODAL (Tasbeeh, Ishraq, Duha) */}
      {
        infoModalQuest && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className={`w-full max-w-sm p-6 rounded-[30px] space-y-4 shadow-2xl ${user.settings?.darkMode ? 'bg-slate-900 border border-white/10 text-white' : 'bg-white text-slate-900'}`}>
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold">{infoModalQuest.title}</h3>
                <button onClick={() => setInfoModalQuest(null)} className="p-2 rounded-full bg-slate-100 dark:bg-white/10 hover:opacity-80"><X size={16} /></button>
              </div>
              <p className="text-sm opacity-80 leading-relaxed font-medium">
                Please reference the <strong>"Key to the Treasures of Jannah"</strong> book for the complete guide, rak'aat breakdown, and specific recitations required for this prayer.
              </p>
              {infoModalQuest.id === 'salatul_tasbeeh' && (
                <div className="space-y-2 mt-2">
                  <p className="text-xs opacity-80 border-t pt-3 dark:border-white/10">300 Tasbeehs (Subhanallahi walhamdulillahi wa la ilaha illallahu wallahu akbar) split across 4 Rakaats (75 per Rakaat):</p>
                  <ul className="text-xs opacity-70 list-disc pl-4 space-y-1">
                    <li><strong>15 times</strong>: After Surah Fatiha & another Surah, while standing.</li>
                    <li><strong>10 times</strong>: In Ruku (after usual tasbeeh).</li>
                    <li><strong>10 times</strong>: Coming up from Ruku (Qiyam).</li>
                    <li><strong>10 times</strong>: In the first Sujood.</li>
                    <li><strong>10 times</strong>: Sitting between the two Sujoods (Jalsa).</li>
                    <li><strong>10 times</strong>: In the second Sujood.</li>
                    <li><strong>10 times</strong>: Sitting after the second Sujood (before standing up for next rakaat).</li>
                  </ul>
                </div>
              )}
              {infoModalQuest.id === 'ishraq_salah' && (
                <p className="text-xs opacity-60 italic border-t pt-3 dark:border-white/10">Quick reminder: Prayed approx 15-20 minutes after sunrise. Sit doing dhikr from Fajr until then.</p>
              )}
              <button onClick={() => setInfoModalQuest(null)} className="w-full py-3 mt-4 rounded-2xl bg-[#064e3b] text-white font-bold tracking-widest uppercase text-xs">Got it</button>
            </div>
          </div>
        )
      }

    </div >
  );
};

export default App;
