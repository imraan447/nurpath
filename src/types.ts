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
  seerahBookmark?: number;
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
  content: string;
  summary?: string;
  source?: string;
  mediaUrl?: string;
  praise: 'Subhanallah' | 'Alhamdulillah' | 'Allahu Akbar' | 'MashaAllah' | 'Astaghfirullah' | 'Ya Allah' | 'La ilaha illa anta';
  details?: string;
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
  timeRange: string;
  description: string;
  quests: string[];
  icon: any;
  adhkar: AdhkarItem[];
  specialGuide?: {
    title: string;
    content: string;
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