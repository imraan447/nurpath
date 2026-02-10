import { Quest, QuestCategory, ReflectionItem } from './types';

export const ALL_QUESTS: Quest[] = [
  // SALAH (MAIN)
  { id: 'fajr', title: 'Fajr Salah', description: 'The light before dawn', category: QuestCategory.MAIN, xp: 150, locationType: 'mosque' },
  { id: 'dhuhr', title: 'Dhuhr Salah', description: 'Noontime connection', category: QuestCategory.MAIN, xp: 120, locationType: 'mosque' },
  { id: 'asr', title: 'Asr Salah', description: 'Afternoon mindfulness', category: QuestCategory.MAIN, xp: 120, locationType: 'mosque' },
  { id: 'maghrib', title: 'Maghrib Salah', description: 'Sunset reflection', category: QuestCategory.MAIN, xp: 120, locationType: 'mosque' },
  { id: 'isha', title: 'Isha Salah', description: 'Resting in Divine care', category: QuestCategory.MAIN, xp: 150, locationType: 'mosque' },
  
  // PILLARS & FASTING
  { id: 'fasting_ramadan', title: 'Ramadan Fasting', description: 'The month of the Quran (Currently unavailable)', category: QuestCategory.MAIN, xp: 2000, isGreyed: true },
  { id: 'fasting_sunnah', title: 'Sunnah Fast', description: 'Mondays or Thursdays fasting as practiced by the Prophet (PBUH)', category: QuestCategory.SUNNAH, xp: 500 },
  { id: 'zakaat', title: 'Zakaat Payment', description: 'Purifying wealth (2.5%)', category: QuestCategory.MAIN, xp: 800, locationType: 'charity' },
  { id: 'hajj', title: 'Hajj Pilgrimage', description: 'The journey of a lifetime (Currently unavailable)', category: QuestCategory.MAIN, xp: 5000, isGreyed: true },

  // SUNNAH - DAILY MICRO-DEEDS (EXPANDED)
  { id: 'miswak', title: 'Using Miswak', description: 'Sunnah of oral hygiene', category: QuestCategory.SUNNAH, xp: 50 },
  { id: 'right_side_sleep', title: 'Sleep on Right Side', description: 'Following the Prophetic etiquette of rest', category: QuestCategory.SUNNAH, xp: 40 },
  { id: 'wudu_before_sleep', title: 'Wudu before Sleep', description: 'Angels pray for you through the night', category: QuestCategory.SUNNAH, xp: 60 },
  { id: 'tahajjud', title: 'Tahajjud Prayer', description: 'The prayer of the lovers of Allah in the deep night', category: QuestCategory.SUNNAH, xp: 400 },
  { id: 'duha', title: 'Salat al-Duha', description: 'Charity for every joint in your body', category: QuestCategory.SUNNAH, xp: 150 },
  { id: 'smile_sunnah', title: 'Smiling to Others', description: 'Prophetic act of kindness', category: QuestCategory.SUNNAH, xp: 50 },
  { id: 'salawat_10', title: '10x Salawat', description: 'Sending peace upon the Messenger (PBUH)', category: QuestCategory.SUNNAH, xp: 50 },
  { id: 'drink_water_3_breaths', title: 'Water in 3 Breaths', description: 'Prophetic method of drinking water', category: QuestCategory.SUNNAH, xp: 30 },
  { id: 'dua_after_adhan', title: 'Dua After Adhan', description: 'Intercession of the Prophet is guaranteed for this', category: QuestCategory.SUNNAH, xp: 70 },
  { id: 'ayatul_kursi_salah', title: 'Ayatul Kursi Post-Salah', description: 'Nothing between you and Jannah except death', category: QuestCategory.SUNNAH, xp: 80 },
  { id: 'tasbih_fatima', title: 'Tasbih Fatima', description: '33x SubhanAllah, 33x Alhamdulillah, 34x AllahuAkbar', category: QuestCategory.SUNNAH, xp: 100 },
  { id: 'dua_for_parents', title: 'Dua for Parents', description: "My Lord, have mercy upon them as they brought me up when I was small", category: QuestCategory.SUNNAH, xp: 60 },

  // SIDE QUESTS (EXPANDED)
  { id: 'clothes_poor', title: 'Give Clothes to Poor', description: 'Share your blessings with those in need', category: QuestCategory.CHARITY, xp: 250, locationType: 'charity' },
  { id: 'food_needy', title: 'Feed the Needy', description: 'No one should go hungry in your community', category: QuestCategory.CHARITY, xp: 200, locationType: 'soup_kitchen' },
  { id: 'hug_loved_one', title: 'Hug a Loved One', description: 'Spread warmth and mercy in your own home', category: QuestCategory.SUNNAH, xp: 50 },
  { id: 'reflect_universe', title: 'Universe Reflection', description: 'Contemplate the vastness of creation and your unique existence against such high odds', category: QuestCategory.SUNNAH, xp: 100 },
  { id: 'call_relative', title: 'Call a Relative', description: 'Maintaining the ties of kinship', category: QuestCategory.SUNNAH, xp: 120 },
  { id: 'remove_road_obstacle', title: 'Clear the Path', description: 'Remove something harmful from the road', category: QuestCategory.SUNNAH, xp: 80 },
  { id: 'water_thirsty_plant', title: 'Water a Thirsty Plant', description: 'Mercy to creation is mercy from the Creator', category: QuestCategory.CHARITY, xp: 40 },
  { id: 'feed_stray_animal', title: 'Feed a Stray Animal', description: 'Kindness to animals is an act of charity', category: QuestCategory.CHARITY, xp: 90 },
  { id: 'help_neighbor_groceries', title: 'Help a Neighbor', description: 'Assist someone in your building or street with their tasks', category: QuestCategory.CHARITY, xp: 150 },
  { id: 'tidy_public_space', title: 'Tidy Public Space', description: 'Pick up litter in your local park or street to benefit the community', category: QuestCategory.CHARITY, xp: 110 },
  { id: 'forgive_grudge', title: 'Release a Grudge', description: 'Forgive someone who hurt you today for the sake of Allah', category: QuestCategory.SUNNAH, xp: 300 },
];

export const CORRECTION_QUESTS: Record<string, Quest[]> = {
  minor_sin: [{ id: 'dhikr_100', title: '100x Astaghfirullah', description: 'Cleansing the soul', category: QuestCategory.CORRECTION, xp: 50 }],
  major_sin: [{ id: 'salah_taubah', title: 'Salat-ul-Tawbah', description: 'Repentance prayer', category: QuestCategory.CORRECTION, xp: 300 }],
  wronged_someone: [{ id: 'apology', title: 'Seek Forgiveness', description: 'Heal the heart of another', category: QuestCategory.CORRECTION, xp: 400 }],
  missed_salah: [{ id: 'qadha', title: 'Qadha Salah', description: 'Restoring your covenant', category: QuestCategory.CORRECTION, xp: 100 }],
};

export const SEED_REFLECTIONS: ReflectionItem[] = [
  {
    id: 'seed-1',
    type: 'verse',
    content: "And He is with you wherever you are.",
    source: "Quran 57:4",
    praise: "Subhanallah",
    details: `The Divine Presence is the ultimate comfort...`
  }
];