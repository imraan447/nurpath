export enum QuestCategory {
  MAIN = 'Main Quest',
  SUNNAH = 'Sunnah Quest',
  CORRECTION = 'Correction Quest',
  CHARITY = 'Charity Quest'
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
  type: 'hadith' | 'verse' | 'nature' | 'animal' | 'wonder' | 'story' | 'quote' | 'question';
  content: string;
  source?: string;
  mediaUrl?: string;
  praise: 'Subhanallah' | 'Alhamdulillah' | 'Allahu Akbar' | 'MashaAllah';
  details?: string;
}

export interface XPRecord {
  date: string;
  xp: number;
}