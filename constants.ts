import { Quest, QuestCategory, ReflectionItem } from '@/types';
export const ALL_QUESTS: Quest[] = [
  {
    "id": "fajr",
    "title": "Fajr Salah",
    "description": "The light before dawn",
    "category": "Main Quest",
    "xp": 150,
    "locationType": "mosque"
  },
  {
    "id": "dhuhr",
    "title": "Dhuhr Salah",
    "description": "Noontime connection",
    "category": "Main Quest",
    "xp": 120,
    "locationType": "mosque"
  },
  {
    "id": "asr",
    "title": "Asr Salah",
    "description": "Afternoon mindfulness",
    "category": "Main Quest",
    "xp": 120,
    "locationType": "mosque"
  },
  {
    "id": "maghrib",
    "title": "Maghrib Salah",
    "description": "Sunset reflection",
    "category": "Main Quest",
    "xp": 120,
    "locationType": "mosque"
  },
  {
    "id": "isha",
    "title": "Isha Salah",
    "description": "Resting in Divine care",
    "category": "Main Quest",
    "xp": 150,
    "locationType": "mosque"
  },
  {
    "id": "fasting_ramadan",
    "title": "Ramadan Fasting",
    "description": "The month of the Quran (Currently unavailable)",
    "category": "Main Quest",
    "xp": 2000,
    "isGreyed": true
  },
  {
    "id": "fasting_sunnah",
    "title": "Sunnah Fast",
    "description": "Mondays or Thursdays fasting as practiced by the Prophet (PBUH)",
    "category": "Sunnah Quest",
    "xp": 500
  },
  {
    "id": "zakaat",
    "title": "Zakaat Payment",
    "description": "Purifying wealth (2.5%)",
    "category": "Main Quest",
    "xp": 800,
    "locationType": "charity"
  },
  {
    "id": "hajj",
    "title": "Hajj Pilgrimage",
    "description": "The journey of a lifetime (Currently unavailable)",
    "category": "Main Quest",
    "xp": 5000,
    "isGreyed": true
  },
  {
    "id": "miswak",
    "title": "Using Miswak",
    "description": "Sunnah of oral hygiene",
    "category": "Sunnah Quest",
    "xp": 50
  },
  {
    "id": "right_side_sleep",
    "title": "Sleep on Right Side",
    "description": "Following the Prophetic etiquette of rest",
    "category": "Sunnah Quest",
    "xp": 40
  },
  {
    "id": "wudu_before_sleep",
    "title": "Wudu before Sleep",
    "description": "Angels pray for you through the night",
    "category": "Sunnah Quest",
    "xp": 60
  },
  {
    "id": "tahajjud",
    "title": "Tahajjud Prayer",
    "description": "The prayer of the lovers of Allah in the deep night",
    "category": "Sunnah Quest",
    "xp": 400
  },
  {
    "id": "duha",
    "title": "Salat al-Duha",
    "description": "Charity for every joint in your body",
    "category": "Sunnah Quest",
    "xp": 150
  },
  {
    "id": "bismillah_food",
    "title": "Saying Bismillah",
    "description": "Invoking the name of Allah before eating",
    "category": "Sunnah Quest",
    "xp": 30
  },
  {
    "id": "three_breaths",
    "title": "Drink in 3 Breaths",
    "description": "The mindful way to hydrate",
    "category": "Sunnah Quest",
    "xp": 20
  },
  {
    "id": "enter_mosque_right",
    "title": "Right Foot in Mosque",
    "description": "Honoring the House of Allah",
    "category": "Sunnah Quest",
    "xp": 30
  },
  {
    "id": "exit_mosque_left",
    "title": "Left Foot out Mosque",
    "description": "Departing with etiquette",
    "category": "Sunnah Quest",
    "xp": 30
  },
  {
    "id": "smile_sunnah",
    "title": "Smiling to Others",
    "description": "Prophetic act of kindness",
    "category": "Sunnah Quest",
    "xp": 50
  },
  {
    "id": "remove_obstacle",
    "title": "Remove Obstacle",
    "description": "Clearing a path for others",
    "category": "Sunnah Quest",
    "xp": 100
  },
  {
    "id": "salawat_10",
    "title": "10x Salawat",
    "description": "Sending peace upon the Messenger (PBUH)",
    "category": "Sunnah Quest",
    "xp": 50
  },
  {
    "id": "visit_sick_quest",
    "title": "Visit the Sick",
    "description": "A duty of every Muslim",
    "category": "Charity Quest",
    "xp": 300,
    "locationType": "community"
  },
  {
    "id": "feed_animal",
    "title": "Feed an Animal",
    "description": "Mercy to all living things",
    "category": "Charity Quest",
    "xp": 150
  },
  {
    "id": "water_charity",
    "title": "Give Water",
    "description": "Best form of ongoing charity",
    "category": "Charity Quest",
    "xp": 150,
    "locationType": "charity"
  }
];
export const CORRECTION_QUESTS: Record<string, Quest[]> = {
  "minor_sin": [
    {
      "id": "dhikr_100",
      "title": "100x Astaghfirullah",
      "description": "Cleansing the soul",
      "category": "Correction Quest",
      "xp": 50
    }
  ],
  "major_sin": [
    {
      "id": "salah_taubah",
      "title": "Salat-ul-Tawbah",
      "description": "Repentance prayer",
      "category": "Correction Quest",
      "xp": 300
    }
  ],
  "wronged_someone": [
    {
      "id": "apology",
      "title": "Seek Forgiveness",
      "description": "Heal the heart of another",
      "category": "Correction Quest",
      "xp": 400
    }
  ],
  "missed_salah": [
    {
      "id": "qadha",
      "title": "Qadha Salah",
      "description": "Restoring your covenant",
      "category": "Correction Quest",
      "xp": 100
    }
  ]
};
export const SEED_REFLECTIONS: ReflectionItem[] = []; // Initial seed handled by UI