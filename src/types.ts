
export enum QuestCategory {
  MAIN = 'Main Quest',
  SUNNAH = 'Sunnah Quest',
  CORRECTION = 'Correction Quest',
  CHARITY = 'Charity Quest',
  DHIKR = 'Dhikr & Dua',
  COMMUNITY = 'Community Challenge'
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  xp: number;
  subCategory?: string;
  isGreyed?: boolean;
  disclaimer?: string;
  locationType?: 'mosque' | 'charity' | 'soup_kitchen' | 'community' | null;
  completed?: boolean;
  isPackage?: boolean; // For sub-quests in packages
  isGroupQuest?: boolean;
}

export interface UserSettings {
  darkMode: boolean;
  notifications: boolean;
  fontSize: 'small' | 'medium' | 'large';
  seerahBookmark?: number;
  calcMethod?: number; // 2 for ISNA, 1 for MWL etc
  madhab?: number; // 0 for Shafi/Standard, 1 for Hanafi
}

export interface User {
  id?: string; // Supabase UUID
  name: string;
  email: string;
  location: string;
  country?: string; // ISO code or name for leaderboard
  xp: number;
  isVerified: boolean;
  activeQuests: string[];
  pinnedQuests?: string[];
  autoAddPinned?: boolean;
  settings?: UserSettings;
  completedDailyQuests?: { [questId: string]: string }; // e.g. { 'fajr': '2023-10-27' }
  readReflections?: string[]; // IDs of reflections read
  createdAt?: string;
}

export interface ReflectionItem {
  id: string;
  type: 'hadith' | 'verse' | 'nature' | 'animal' | 'wonder' | 'story' | 'quote' | 'question' | 'prophecy' | 'theology' | 'history';
  content: string; // The Hook/Title
  summary?: string; // Short teaser (always present)
  source?: string;
  author?: string; // Human author name or "AI Generated"
  isAiGenerated?: boolean;
  readTime?: string; // e.g. "3 min read"
  tags?: string[];
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
}

export interface AllahName {
  id: number;
  arabic: string;
  transliteration: string;
  meaning: string;
  explanation: string;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  coverUrl: string; // Color or Image
  description: string;
  readUrl: string; // External Link
  tags: string[];
}

// --- COMMUNITY TYPES ---

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted';
  created_at: string;
  sender?: { id: string; username: string; xp: number; country: string };
}

export interface Friend {
  id: string;
  username: string;
  xp: number;
  country: string;
  active_quests?: string[];
}

export interface Group {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  members?: GroupMember[];
}

export interface GroupMember {
  id: string;
  username: string;
  xp: number;
  country: string;
  active_quests?: string[];
  role?: 'admin' | 'member';
}

export interface GroupInvite {
  id: string;
  group_id: string;
  invited_by: string;
  invited_user: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  group_name?: string;
  inviter_name?: string;
}

export interface GroupQuestItem {
  id: string;
  group_id: string;
  title: string;
  created_by: string;
  xp: number;
  created_at: string;
  deadline?: string; // ISO timestamp
}

export interface GroupQuestCompletion {
  id: string;
  group_quest_id: string;
  user_id: string;
  completed_at: string;
  is_claimed: boolean;
}

export interface GroupQuest extends Quest {
  sharedBy: string[]; // Usernames of people in the group doing this quest
  groupId?: string;
  deadline?: string;
  completionCount?: number;
  totalMembers?: number;
  isLocked?: boolean; // True if user completed but waiting for group
}

export interface Dua {
  id: string;
  user_id: string;
  text: string;
  ameen_count: number;
  created_at: string;
  username?: string;
  has_said_ameen?: boolean;
}
