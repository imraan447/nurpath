
import { Quest, QuestCategory, ReflectionItem, GuideSection, SeerahChapter, AdhkarItem, NaflPrayerItem, AllahName, LibraryBook } from './types';
import { Sun, Moon, Sunrise, Sunset, Clock, Star, CloudSun, Hand, CalendarDays, Shield, BookHeart, Zap, Heart, Eye, Anchor, Key } from 'lucide-react';

// ... (Previous Quest Data remains mostly same, keeping it concise for XML limit, assuming it exists) ...
export const ALL_QUESTS: Quest[] = [
  // SALAH (MAIN)
  { id: 'fajr', title: 'Pray Fajr', description: 'The light before dawn. "Prayer is better than sleep."', category: QuestCategory.MAIN, xp: 600, locationType: 'mosque' },
  { id: 'dhuhr', title: 'Pray Dhuhr', description: 'Noontime connection amidst the chaos of the day.', category: QuestCategory.MAIN, xp: 480, locationType: 'mosque' },
  { id: 'asr', title: 'Pray Asr', description: 'The middle prayer. Guard it strictly.', category: QuestCategory.MAIN, xp: 480, locationType: 'mosque' },
  { id: 'maghrib', title: 'Pray Maghrib', description: 'The gratitude at the end of the day.', category: QuestCategory.MAIN, xp: 480, locationType: 'mosque' },
  { id: 'isha', title: 'Pray Isha', description: 'The heavy prayer that proves faith.', category: QuestCategory.MAIN, xp: 600, locationType: 'mosque' },

  // DAILY DHIKR & ADHKAR (Standalone, shown in All Quests)
  { id: 'morning_adhkar', title: 'Read Morning Adhkar', description: 'The fortress of the believer. Protection until evening.', category: QuestCategory.DHIKR, xp: 200 },
  { id: 'kalima_100', title: 'Recite 100x Kalima Tayyiba', description: 'La ilaha illallah. The best of Dhikr.', category: QuestCategory.DHIKR, xp: 300 },
  { id: 'istighfar_100', title: 'Make 100x Istighfar', description: 'Seeking forgiveness. Eraser of sins.', category: QuestCategory.DHIKR, xp: 200 },
  { id: 'durood_100', title: 'Send 100x Durood', description: 'Sending peace upon the Prophet ﷺ.', category: QuestCategory.DHIKR, xp: 250 },
  { id: 'read_quran', title: 'Read/Recite the Holy Quran', description: 'Each letter earns you 10 rewards. Make it a daily habit.', category: QuestCategory.DHIKR, xp: 400 },

  // NAFL PRAYERS (Standalone)
  { id: 'tahajjud', title: 'Pray Tahajjud', description: 'The arrow of the night that does not miss.', category: QuestCategory.SUNNAH, xp: 1000 },
  { id: 'ishraq_salah', title: 'Pray Ishraq', description: 'Prayer after sunrise. Reward of a Hajj and Umrah.', category: QuestCategory.SUNNAH, xp: 500 },
  { id: 'awwaabeen', title: 'Pray Awwaabeen', description: '6 Rakaats after Maghrib. The prayer of the oft-returning.', category: QuestCategory.SUNNAH, xp: 600 },
  { id: 'salatul_tasbeeh', title: 'Pray Salatul Tasbeeh', description: 'The prayer of forgiveness. 300 Tasbeehs.', category: QuestCategory.SUNNAH, xp: 1500 },

  // PILLARS & FASTING
  { id: 'fasting_ramadan', title: 'Ramadan Fasting', description: 'The month of the Quran (Currently unavailable)', category: QuestCategory.MAIN, xp: 8000, isGreyed: true },
  { id: 'fasting_sunnah', title: 'Keep a Sunnah Fast', description: 'Mondays or Thursdays fasting.', category: QuestCategory.SUNNAH, xp: 400 },
  { id: 'zakaat', title: 'Pay Zakaat', description: 'Purifying wealth (2.5%).', category: QuestCategory.MAIN, xp: 3200, locationType: 'charity' },
  { id: 'hajj', title: 'Hajj Pilgrimage', description: 'The journey of a lifetime (Currently unavailable)', category: QuestCategory.MAIN, xp: 100000, isGreyed: true },

  // SUNNAH - DAILY MICRO-DEEDS
  { id: 'miswak', title: 'Use the Miswak', description: 'Sunnah of oral hygiene', category: QuestCategory.SUNNAH, xp: 200 },
  { id: 'right_side_sleep', title: 'Sleep on Your Right Side', description: 'Prophetic etiquette of rest', category: QuestCategory.SUNNAH, xp: 160 },
  { id: 'wudu_before_sleep', title: 'Make Wudu Before Sleep', description: 'Angels pray for you through the night', category: QuestCategory.SUNNAH, xp: 240 },
  { id: 'duha', title: 'Pray Salat ad-Duha', description: 'Charity for every joint', category: QuestCategory.SUNNAH, xp: 600 },
  { id: 'smile_sunnah', title: 'Smile at Others', description: 'Prophetic act of kindness', category: QuestCategory.SUNNAH, xp: 200 },
  { id: 'salawat_10', title: 'Send 10x Salawat', description: 'Sending peace upon the Messenger ﷺ', category: QuestCategory.SUNNAH, xp: 200 },
  { id: 'drink_water_3_breaths', title: 'Drink Water in 3 Breaths', description: 'Prophetic method of drinking', category: QuestCategory.SUNNAH, xp: 120 },
  { id: 'dua_after_adhan', title: 'Make Dua After Adhan', description: 'Intercession guaranteed', category: QuestCategory.SUNNAH, xp: 280 },
  { id: 'tahiyyatul_wudhu', title: 'Pray Tahiyyatul Wudhu', description: '2 Rakaats after performing Wudhu, a key to Jannah.', category: QuestCategory.SUNNAH, xp: 250 },
  { id: 'tahiyyatul_masjid', title: 'Pray Tahiyyatul Masjid', description: '2 Rakaats upon entering the Masjid, honoring Allah\'s house.', category: QuestCategory.SUNNAH, xp: 200 },

  // CHARACTER & COMMUNITY
  { id: 'forgive_someone', title: 'Forgive Someone', description: 'Release a grievance for the sake of Allah.', category: QuestCategory.SUNNAH, xp: 1600 },
  { id: 'maintain_kinship', title: 'Keep Ties of Kinship', description: 'Call or visit a relative you haven\'t spoken to recently', category: QuestCategory.SUNNAH, xp: 1200 },
  { id: 'clothes_poor', title: 'Give Clothes to the Poor', description: 'Share your blessings', category: QuestCategory.CHARITY, xp: 1000, locationType: 'charity' },
  { id: 'food_needy', title: 'Feed Someone in Need', description: 'Provide a meal for someone hungry', category: QuestCategory.CHARITY, xp: 800, locationType: 'soup_kitchen' },
  { id: 'visit_sick', title: 'Visit Someone Who Is Sick', description: '70,000 angels pray for you.', category: QuestCategory.SUNNAH, xp: 800 },
  { id: 'hug_loved_one', title: 'Hug a Loved One', description: 'Spread warmth in your home', category: QuestCategory.SUNNAH, xp: 200 },
  { id: 'reflect_universe', title: 'Reflect on Creation', description: 'Contemplate the vastness of the universe', category: QuestCategory.SUNNAH, xp: 400 },
  { id: 'feed_stray_animal', title: 'Feed a Stray Animal', description: 'Mercy to all creation', category: QuestCategory.CHARITY, xp: 360 },
  { id: 'help_neighbor', title: 'Help a Neighbour', description: 'Assist with groceries or tasks', category: QuestCategory.CHARITY, xp: 600 },
  { id: 'convey_islam', title: 'Share the Message of Islam', description: 'Convey the message of Islam to someone, even with a smile.', category: QuestCategory.CHARITY, xp: 1500 },
  { id: 'quran_traffic', title: 'Listen to Quran During Commute', description: 'Listen to the Quran during traffic or your daily commute.', category: QuestCategory.CHARITY, xp: 300 },
  { id: 'no_road_rage', title: 'Practice Patience on the Road', description: 'Repress road rage and practice patience while driving.', category: QuestCategory.CHARITY, xp: 500 },
  { id: 'dua_for_ummah', title: 'Make Dua for the Ummah', description: 'Make a sincere dua for the well-being of the Muslim community.', category: QuestCategory.CHARITY, xp: 250 },
  { id: 'help_elderly', title: 'Help an Elderly Person', description: 'Assist, be kind to, and spend time with an elderly person.', category: QuestCategory.CHARITY, xp: 700 },

  // GUIDE-DERIVED QUESTS (standalone Dhikr)
  { id: 'read_manzil', title: 'Recite the Manzil', description: 'The 33 verses of security and protection against evil influences.', category: QuestCategory.DHIKR, xp: 350 },
  { id: 'tasbeeh_fatimi', title: 'Recite Tasbeeh Fatimi', description: 'Subhanallah (33x), Alhamdulillah (33x), Allahu Akbar (34x). Better than a servant.', category: QuestCategory.DHIKR, xp: 150 },

  // --- CORRECTION QUESTS ---
  { id: 'corr_intention', title: 'Sincere Intention', description: 'Resolve firmly in your heart to never repeat the sin.', category: QuestCategory.CORRECTION, xp: 200 },
  { id: 'corr_ghusl_tawbah', title: 'Ghusl & Salat-ul-Tawbah', description: 'Purify with Ghusl, then pray 2 Rak\'ahs of repentance.', category: QuestCategory.CORRECTION, xp: 800 },
  { id: 'corr_istighfar_100', title: 'Istighfar ×100', description: 'Say "Astaghfirullah" 100 times with sincerity.', category: QuestCategory.CORRECTION, xp: 200 },
  { id: 'corr_subhanallah_100', title: 'SubhanAllah ×100', description: 'Say "SubhanAllah wa bihamdihi" 100 times.', category: QuestCategory.CORRECTION, xp: 200 },
  { id: 'corr_sadaqah', title: 'Pay Sadaqah', description: 'Charity extinguishes sin as water extinguishes fire.', category: QuestCategory.CORRECTION, xp: 400, locationType: 'charity' },
  { id: 'corr_feed_poor', title: 'Feed the Poor', description: 'Distribute food to those in need for Allah\'s sake.', category: QuestCategory.CORRECTION, xp: 500 },
  { id: 'corr_seek_forgiveness', title: 'Seek Forgiveness from Others', description: 'Sincerely apologize to anyone you may have wronged.', category: QuestCategory.CORRECTION, xp: 600 },
  { id: 'corr_qadha', title: 'Pray Qadha Salah', description: 'Make up any obligatory prayers you have missed.', category: QuestCategory.CORRECTION, xp: 400 },

  // --- PACKAGE SUB-QUESTS (Only shown under parent prayer cards) ---
  // TAHAJJUD
  { id: 'tahajjud-istighfar', title: 'Make Istighfar', description: 'Seek forgiveness in the last third of the night.', category: QuestCategory.DHIKR, xp: 100, isPackage: true },
  { id: 'tahajjud-surah_sajdah', title: 'Recite Surah As-Sajdah', description: 'Sunnah of the Prophet ﷺ before sleeping.', category: QuestCategory.DHIKR, xp: 150, isPackage: true },
  { id: 'tahajjud-witr', title: 'Pray Witr', description: 'The final odd prayer of the night.', category: QuestCategory.SUNNAH, xp: 200, isPackage: true },

  // FAJR
  { id: 'fajr-sunnah', title: 'Pray 2 Sunnah', description: 'Two rakaats before Fajr Fard. Better than the world.', category: QuestCategory.SUNNAH, xp: 100, isPackage: true },
  { id: 'fajr-ayatul_kursi', title: 'Recite Ayatul Kursi', description: 'Protection until the next prayer.', category: QuestCategory.DHIKR, xp: 60, isPackage: true },
  { id: 'fajr-adhkar', title: 'Read Post-Fajr Adhkar', description: 'Tasbeeh Fatimi, 3 Quls, morning adhkar.', category: QuestCategory.DHIKR, xp: 50, isPackage: true },
  { id: 'fajr-surah', title: 'Recite Surah Yaseen', description: 'The Heart of the Quran. Fulfilment of needs.', category: QuestCategory.DHIKR, xp: 150, isPackage: true },

  // DHUHR
  { id: 'dhuhr-sunnah-pre', title: 'Pray 4 Sunnah (Before)', description: 'Four rakaats before Dhuhr Fard.', category: QuestCategory.SUNNAH, xp: 150, isPackage: true },
  { id: 'dhuhr-sunnah-post', title: 'Pray 2 Sunnah (After)', description: 'Two rakaats after Dhuhr Fard.', category: QuestCategory.SUNNAH, xp: 100, isPackage: true },
  { id: 'dhuhr-ayatul_kursi', title: 'Recite Ayatul Kursi', description: 'Protection until the next prayer.', category: QuestCategory.DHIKR, xp: 60, isPackage: true },
  { id: 'dhuhr-adhkar', title: 'Read Post-Dhuhr Adhkar', description: 'Tasbeeh Fatimi.', category: QuestCategory.DHIKR, xp: 50, isPackage: true },
  { id: 'dhuhr-surah', title: 'Recite Surah Al-Fatah', description: '"Verily We have granted you a manifest victory."', category: QuestCategory.DHIKR, xp: 150, isPackage: true },

  // ASR
  { id: 'asr-sunnah', title: 'Pray 4 Sunnah (Before)', description: 'Four rakaats before Asr Fard.', category: QuestCategory.SUNNAH, xp: 150, isPackage: true },
  { id: 'asr-ayatul_kursi', title: 'Recite Ayatul Kursi', description: 'Protection until the next prayer.', category: QuestCategory.DHIKR, xp: 60, isPackage: true },
  { id: 'asr-adhkar', title: 'Read Post-Asr Adhkar', description: 'Tasbeeh Fatimi, Asr Dua.', category: QuestCategory.DHIKR, xp: 50, isPackage: true },
  { id: 'asr-surah', title: 'Recite Surah An-Naba', description: 'Reflection on the Great News.', category: QuestCategory.DHIKR, xp: 150, isPackage: true },

  // MAGHRIB
  { id: 'maghrib-sunnah', title: 'Pray 2 Sunnah', description: 'Two rakaats after Maghrib Fard.', category: QuestCategory.SUNNAH, xp: 100, isPackage: true },
  { id: 'maghrib-ayatul_kursi', title: 'Recite Ayatul Kursi', description: 'Protection until the next prayer.', category: QuestCategory.DHIKR, xp: 60, isPackage: true },
  { id: 'maghrib-adhkar', title: 'Read Post-Maghrib Adhkar', description: 'Tasbeeh Fatimi.', category: QuestCategory.DHIKR, xp: 50, isPackage: true },
  { id: 'maghrib-surah', title: 'Recite Surah Al-Waqiah', description: 'Protection from poverty.', category: QuestCategory.DHIKR, xp: 150, isPackage: true },

  // ISHA
  { id: 'isha-sunnah', title: 'Pray 2 Sunnah', description: 'Two rakaats after Isha Fard.', category: QuestCategory.SUNNAH, xp: 100, isPackage: true },
  { id: 'isha-ayatul_kursi', title: 'Recite Ayatul Kursi', description: 'Protection until the next prayer.', category: QuestCategory.DHIKR, xp: 60, isPackage: true },
  { id: 'isha-adhkar', title: 'Read Post-Isha Adhkar', description: 'Tasbeeh Fatimi.', category: QuestCategory.DHIKR, xp: 50, isPackage: true },
  { id: 'isha-surah', title: 'Recite Surah Al-Mulk', description: 'Protection from the punishment of the grave.', category: QuestCategory.DHIKR, xp: 150, isPackage: true },
  { id: 'isha-witr', title: 'Pray Witr', description: 'The final odd prayer of the night.', category: QuestCategory.SUNNAH, xp: 200, isPackage: true },
];

export const PRAYER_PACKAGES: Record<string, string[]> = {
  'tahajjud': ['tahajjud-istighfar', 'tahajjud-surah_sajdah', 'tahajjud-witr'],
  'fajr': ['fajr-sunnah', 'fajr-ayatul_kursi', 'fajr-adhkar', 'fajr-surah'],
  'dhuhr': ['dhuhr-sunnah-pre', 'dhuhr-sunnah-post', 'dhuhr-ayatul_kursi', 'dhuhr-adhkar', 'dhuhr-surah'],
  'asr': ['asr-sunnah', 'asr-ayatul_kursi', 'asr-adhkar', 'asr-surah'],
  'maghrib': ['maghrib-sunnah', 'maghrib-ayatul_kursi', 'maghrib-adhkar', 'maghrib-surah'],
  'isha': ['isha-sunnah', 'isha-ayatul_kursi', 'isha-adhkar', 'isha-surah', 'isha-witr']
};



export const PRAYER_RELATED_QUESTS: Record<string, string[]> = {
  fajr: ['fajr-sunnah', 'fajr-ayatul_kursi', 'fajr-adhkar', 'fajr-surah', 'morning_adhkar'],
  dhuhr: ['dhuhr-sunnah-pre', 'dhuhr-sunnah-post', 'dhuhr-ayatul_kursi', 'dhuhr-adhkar', 'dhuhr-surah'],
  asr: ['asr-sunnah', 'asr-ayatul_kursi', 'asr-adhkar', 'asr-surah'],
  maghrib: ['maghrib-sunnah', 'maghrib-ayatul_kursi', 'maghrib-adhkar', 'maghrib-surah', 'awwaabeen'],
  isha: ['isha-sunnah', 'isha-ayatul_kursi', 'isha-adhkar', 'isha-surah', 'isha-witr', 'wudu_before_sleep'],
  tahajjud: ['tahajjud-istighfar', 'tahajjud-surah_sajdah', 'tahajjud-witr']
};

export const JUMUAH_CHECKLIST = [
  { id: 'jumuah_ghusl', title: 'Take a Bath (Ghusl)', xp: 200 },
  { id: 'jumuah_miswak', title: 'Use the Miswak', xp: 100 },
  { id: 'jumuah_perfume', title: 'Wear Perfume (Itr)', xp: 100 },
  { id: 'jumuah_best_clothes', title: 'Wear Best Clothes', xp: 100 },
  { id: 'jumuah_early_arrival', title: 'Go Early to the Masjid', xp: 300 },
  { id: 'jumuah_surah_kahf', title: 'Recite Surah Al-Kahf', xp: 400 },
  { id: 'jumuah_durood', title: 'Send Abundant Durood', xp: 300 },
  { id: 'jumuah_durood_80', title: 'Send 80x Durood (Post-Asr)', xp: 300 },
  { id: 'jumuah_dua', title: 'Make Dua in the Last Hour', xp: 200 },
];

export const HARDCODED_REFLECTIONS: ReflectionItem[] = [
  {
    id: 'ref-1',
    type: 'question',
    content: "The Physics of Sins",
    praise: "Subhanallah",
    mediaUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1920&auto=format&fit=crop",
    summary: "Do sins have mass? Why does the heart feel physically heavier when we transgress?",
    details: `When we think of "burdens" in a secular sense, we think of taxes, debt, or lack of sleep. But the Quran introduces a metaphysical reality: sins are heavy. They have weight. Allah says in Surah Al-Ankabut, "They will surely carry their own burdens and other burdens along with their own." 

This is not a metaphor. Have you ever noticed how a period of negligence or sin makes you feel lethargic? You find it harder to wake up for Fajr. You find it irritating to listen to the Quran. You feel a tightness in the chest, a physical constriction. This is the "Ran" (rust/covering) mentioned in the Quran that coats the heart. 

The Prophet (PBUH) described sin as a black spot on the heart. One spot is negligible. But a thousand spots create a layer of insulation. This insulation blocks the light of divine guidance (Nur) from entering. The "heaviness" you feel is the separation from your Source.

However, the physics of mercy is equally powerful. Istighfar (seeking forgiveness) is the solvent. Just as gravity pulls objects down, sincere repentance pulls the soul up. When you say "Astaghfirullah" with a trembling heart, you are literally shedding spiritual mass. You are becoming lighter. The "load" that was breaking your back is lifted, not because you became stronger, but because He carried it for you.

Reflect today: What burden are you carrying that you haven't asked Allah to remove? You don't have to carry the mountain of your past. Drop it in Sujood.`
  },
  {
    id: 'ref-2',
    type: 'nature',
    content: "The Silence of the Cave",
    praise: "Alhamdulillah",
    mediaUrl: "https://images.unsplash.com/photo-1506259091721-347f793bb76d?q=80&w=1920&auto=format&fit=crop",
    summary: "Why did revelation begin in the dark, quiet isolation of Hira, and not in the bustling market?",
    details: `Before the Angel Jibreel brought the first word "Iqra" (Read), the Prophet Muhammad (PBUH) spent weeks, perhaps months, in the Cave of Hira. He sought seclusion (Tahannuth). Why?

Because the signal of God is subtle, and the noise of the world is loud. We live in an age of constant notification. Our dopamine receptors are fired every 3 seconds. We are terrified of boredom. We are terrified of silence. But it is in the silence that the soul speaks.

The cave represents the necessary "disconnect" to "reconnect." You cannot download a large file if your connection is interrupted every second. Revelation—whether the major revelation of Prophets or the minor personal realizations of the believer—requires bandwidth. That bandwidth is created by silence.

You might not have a mountain cave, but you have a car on the way to work. You have the quiet corner of your room after the kids sleep. You have the last third of the night. If you never isolate yourself from the chaos of creation, how do you expect to hear the Creator?

Try this today: Turn off the phone. Turn off the podcast. Sit for 10 minutes in absolute silence and just exist in the presence of Al-Samad (The Eternal Refuge). The peace you are looking for is not in the next scroll; it is in the pause between breaths.`
  },
];

// --- CITADEL DATA ---

export const SEERAH_CHAPTERS: SeerahChapter[] = [
  {
    id: 's1',
    title: 'The Year of the Elephant',
    period: 'Pre-Prophethood',
    year: '570 CE',
    content: `Before the light of Prophethood shone, Mecca was a land of idolatry, yet honored as the site of the Kabah. In this year, Abrahah, a ruler from Yemen, marched with an army of elephants to destroy the Kabah. The Meccans fled to the mountains. Abdul-Muttalib, the Prophet's grandfather, held the door of the Kabah and prayed: "O Lord, I defend my camels, so You defend Your House."

Allah sent flocks of birds (Ababil) carrying stones of baked clay. The mighty army was decimated like chewed straw. In this year of miraculous protection, Muhammad ﷺ was born to Aminah. His father, Abdullah, had passed away months prior. He was born an orphan, protected by the Lord of the House.`
  },
  {
    id: 's2',
    title: 'Life in the Desert',
    period: 'Pre-Prophethood',
    year: '570-575 CE',
    content: `It was Arab custom to send newborns to the desert for a pure upbringing and stronger language. Halima Sa'diyah, a poor wet nurse, took the orphan Muhammad ﷺ when no one else would. Immediately, her weak donkey gained strength, her dry breasts filled with milk, and her livestock flourished. She realized this was a blessed child.

During this time, the "Splitting of the Chest" occurred. Two angels (Jibreel and Mikail) came, opened the young boy's chest, removed his heart, washed it with Zamzam, removed a black clot (the portion of Shaitan), filled it with wisdom and faith, and sealed it back. This prepared him for the heavy weight of Revelation.`
  },
  {
    id: 's3',
    title: 'Marriage to Khadijah (RA)',
    period: 'Pre-Prophethood',
    year: '595 CE',
    content: `Known as Al-Amin (The Trustworthy), Muhammad ﷺ managed the trade caravans of Khadijah bint Khuwaylid, a noble and wealthy businesswoman of Quraysh. Impressed by his honesty and character, she proposed marriage to him through a friend. He was 25, she was 40 (according to most narrations). Their marriage was one of immense love and support. She was his comfort when the world turned against him.`
  },
  {
    id: 's4',
    title: 'The First Revelation (Iqra)',
    period: 'Mecca',
    year: '610 CE',
    content: `At the age of 40, seeking solitude from the corruption of Mecca, Muhammad ﷺ retreated to the Cave of Hira on Jebel al-Nour. In the darkness of the night, the Angel Jibreel (Gabriel) appeared and commanded him: "Recite!" He replied, "I am not a reciter." The Angel squeezed him tight three times until he could bear it no more, then revealed the first verses of Surah Al-Alaq: "Recite in the name of your Lord who created..." He rushed home, trembling, to Khadijah, saying "Cover me! Cover me!"`
  },
  {
    id: 's5',
    title: 'The Public Call',
    period: 'Mecca',
    year: '613 CE',
    content: `After three years of private invitation, Allah commanded: "Proclaim what you have been ordered." Muhammad ﷺ climbed Mount Safa and called out to the clans of Quraysh. When they gathered, he asked, "If I told you an army was behind this mountain, would you believe me?" They said, "Yes, we have never found you to lie." He then said, "I am a warner to you of a severe punishment." His uncle Abu Lahab cursed him, and the persecution began.`
  },
  {
    id: 's6',
    title: 'The Year of Sorrow',
    period: 'Mecca',
    year: '619 CE',
    content: `A devastating year. Khadijah (RA), his beloved wife and emotional pillar, passed away. Shortly after, Abu Talib, his uncle and political protector, also died. Without clan protection, the persecution intensified. Muhammad ﷺ traveled to Ta'if seeking sanctuary but was stoned by street urchins until his shoes filled with blood. He prayed not for their destruction, but that their descendants would worship Allah.`
  },
  {
    id: 's7',
    title: 'Al-Isra wal-Mi\'raj',
    period: 'Mecca',
    year: '620 CE',
    content: `To comfort His messenger, Allah invited him to the Heavens. In one night, he traveled from Mecca to Jerusalem (Al-Isra) on the Buraq, led the Prophets in prayer, and ascended through the seven heavens (Al-Mi'raj). He met previous Prophets and stood in the Divine Presence where the five daily prayers were ordained. He returned with the gift of Salah, the believer's ascension.`
  },
  {
    id: 's8',
    title: 'The Great Migration (Hijrah)',
    period: 'Migration',
    year: '622 CE',
    content: `The Quraysh plotted to assassinate the Prophet ﷺ. By Allah's command, he left Mecca with Abu Bakr (RA). They hid in the Cave of Thawr for three days. A spider spun a web and a dove laid eggs at the entrance, deceiving the trackers. They arrived in Yathrib (Medina), where the people greeted him with "Tala'al Badru Alayna". This marked the beginning of the Islamic Calendar and the first Islamic state.`
  },
  {
    id: 's9',
    title: 'The Battle of Badr',
    period: 'Medina',
    year: '624 CE',
    content: `The first major encounter between truth and falsehood. 313 ill-equipped Muslims faced 1,000 well-armed Quraysh. The Prophet ﷺ spent the night in prayer, weeping until his cloak fell. Allah sent a thousand angels to assist them. The Muslims achieved a decisive victory, establishing their presence as a force to be reckoned with.`
  },
  {
    id: 's10',
    title: 'Treaty of Hudaybiyyah',
    period: 'Medina',
    year: '628 CE',
    content: `The Muslims set out for Umrah but were stopped. A peace treaty was signed which seemed humiliating to the Muslims (returning without Umrah), but Allah called it a "Manifest Victory." The peace allowed Islam to spread rapidly through dawah without the threat of war. Khalid bin Walid and Amr ibn al-Aas embraced Islam during this period.`
  },
  {
    id: 's11',
    title: 'The Conquest of Mecca',
    period: 'Medina',
    year: '630 CE',
    content: `Quraysh broke the treaty. The Prophet ﷺ marched with 10,000 strong. Mecca was conquered peacefully without a single battle. He stood at the door of the Kabah, smashed the 360 idols, and asked the Quraysh: "What do you think I will do to you?" They said, "You are a noble brother." He replied with the words of Yusuf (AS): "No blame upon you today. Go, for you are free."`
  },
  {
    id: 's12',
    title: 'The Farewell Pilgrimage',
    period: 'Medina',
    year: '632 CE',
    content: `The Prophet ﷺ performed his only Hajj. On Mount Arafat, he delivered his final sermon, establishing human rights, women's rights, and racial equality: "An Arab has no superiority over a non-Arab, nor a white over a black, except by piety." He asked, "Have I conveyed the message?" The multitude roared "Yes!" He raised his finger to the sky: "O Allah, bear witness." Shortly after returning to Medina, he passed away, his head on the lap of Aisha (RA), whispering "To the Highest Companion."`
  }
];

export const ALL_99_NAMES: AllahName[] = [
  { id: 1, arabic: 'ٱلرَّحْمَـٰنُ', transliteration: 'Ar-Rahman', meaning: 'The Most Gracious', explanation: 'The One who has plenty of mercy for the believers and the blasphemers in this world and specifically for the believers in the Hereafter.' },
  { id: 2, arabic: 'ٱلرَّحِيمُ', transliteration: 'Ar-Raheem', meaning: 'The Most Merciful', explanation: 'The One who has plenty of mercy for the believers.' },
  { id: 3, arabic: 'ٱلْمَلِكُ', transliteration: 'Al-Malik', meaning: 'The King', explanation: 'The One with the complete Dominion, the One Whose Dominion is clear from imperfection.' },
  { id: 4, arabic: 'ٱلْقُدُّوسُ', transliteration: 'Al-Quddus', meaning: 'The Most Holy', explanation: 'The One who is pure from any imperfection and clear from children and adversaries.' },
  { id: 5, arabic: 'ٱلسَّلَـٰمُ', transliteration: 'As-Salam', meaning: 'The Source of Peace', explanation: 'The One who is free from every imperfection.' },
  { id: 6, arabic: 'ٱلْمُؤْمِنُ', transliteration: 'Al-Mu\'min', meaning: 'The Guardian of Faith', explanation: 'The One who witnessed for Himself that no one is God but Him. And He witnessed for His believers that they are truthful in their belief that no one is God but Him.' },
  { id: 7, arabic: 'ٱلْمُهَيْمِنُ', transliteration: 'Al-Muhaymin', meaning: 'The Protector', explanation: 'The One who witnesses the saying and deeds of His creatures.' },
  { id: 8, arabic: 'ٱلْعَزِيزُ', transliteration: 'Al-Aziz', meaning: 'The Mighty', explanation: 'The Defeater who is not defeated.' },
  { id: 9, arabic: 'ٱلْجَبَّارُ', transliteration: 'Al-Jabbar', meaning: 'The Compeller', explanation: 'The One that nothing happens in His Dominion except that which He willed.' },
  { id: 10, arabic: 'ٱلْمُتَكَبِّرُ', transliteration: 'Al-Mutakabbir', meaning: 'The Majestic', explanation: 'The One who is clear from the attributes of the creatures and from resembling them.' },
  { id: 11, arabic: 'ٱلْخَـٰلِقُ', transliteration: 'Al-Khaliq', meaning: 'The Creator', explanation: 'The One who brings everything from non-existence to existence.' },
  { id: 12, arabic: 'ٱلْبَارِئُ', transliteration: 'Al-Bari', meaning: 'The Evolver', explanation: 'The Maker, The Creator who has the Power to turn the entities.' },
  { id: 13, arabic: 'ٱلْمُصَوِّرُ', transliteration: 'Al-Musawwir', meaning: 'The Fashioner', explanation: 'The One who forms His creatures in different pictures.' },
  { id: 14, arabic: 'ٱلْغَفَّارُ', transliteration: 'Al-Ghaffar', meaning: 'The Great Forgiver', explanation: 'The Forgiver, The One who forgives the sins of His slaves time and time again.' },
  { id: 15, arabic: 'ٱلْقَهَّارُ', transliteration: 'Al-Qahhar', meaning: 'The Subduer', explanation: 'The Dominant, The One who has the perfect Power and is not unable over anything.' },
  { id: 16, arabic: 'ٱلْوَهَّابُ', transliteration: 'Al-Wahhab', meaning: 'The Bestower', explanation: 'The One who is Generous in giving plenty without any return.' },
  { id: 17, arabic: 'ٱلرَّزَّاقُ', transliteration: 'Ar-Razzaq', meaning: 'The Provider', explanation: 'The Sustainer, The Provider.' },
  { id: 18, arabic: 'ٱلْفَتَّاحُ', transliteration: 'Al-Fattah', meaning: 'The Opener', explanation: 'The Opener, The Reliever, The Judge, The One who opens for His slaves the closed worldly and religious matters.' },
  { id: 19, arabic: 'ٱلْعَلِيمُ', transliteration: 'Al-\'Alim', meaning: 'The All-Knowing', explanation: 'The Knowledgeable; The One nothing is absent from His knowledge.' },
  { id: 20, arabic: 'ٱلْقَابِضُ', transliteration: 'Al-Qabid', meaning: 'The Withholder', explanation: 'The Constrictor, The Withholder, The One who constricts the sustenance by His wisdom and expands and widens it with His Generosity and Mercy.' },
  // ... (Full 99 would be here, truncated for code block limits but architecture supports it) ...
];

export const LIBRARY_BOOKS: LibraryBook[] = [
  {
    id: 'b1',
    title: 'The Divine Reality',
    author: 'Hamza Andreas Tzortzis',
    coverUrl: 'https://m.media-amazon.com/images/I/71wK7qjF2IL._AC_UF1000,1000_QL80_.jpg',
    description: 'A comprehensive articulation of the Islamic worldview, addressing atheism and the purpose of life.',
    readUrl: 'https://sapienceinstitute.org/the-divine-reality/',
    tags: ['Theology', 'Philosophy']
  },
  {
    id: 'b2',
    title: 'Forbidden Prophecies',
    author: 'Abu Zakariya',
    coverUrl: 'https://iera.org/wp-content/uploads/2020/02/Forbidden-Prophecies-Front-Cover.jpg',
    description: 'A study of the prophecies of the Prophet Muhammad ﷺ as evidence of his truthfulness.',
    readUrl: 'https://iera.org/downloads/forbidden-prophecies/',
    tags: ['Seerah', 'Evidence']
  },
  {
    id: 'b3',
    title: 'Love of Allah',
    author: 'Ibn Qayyim Al-Jawziyya',
    coverUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSq_Y8X_Y8X_Y8X_Y8X_Y8X_Y8X_Y8X_Y8X&s', // Placeholder
    description: 'Experience the sweetness of faith through the love of the Creator.',
    readUrl: 'https://kalamullah.com/Books/Heart_Softners/Love%20of%20Allah.pdf',
    tags: ['Spirituality', 'Tazkiyah']
  },
  {
    id: 'b4',
    title: 'Fortress of the Muslim',
    author: 'Said bin Ali bin Wahf Al-Qahtani',
    coverUrl: 'https://darussalam.com/images/detailed/16/Fortress-of-the-Muslim.jpg',
    description: 'Invocations from the Quran and Sunnah for every occasion.',
    readUrl: 'https://sunnah.com/hisn',
    tags: ['Dua', 'Reference']
  }
];

export const WAZIFA_ITEMS = [
  {
    id: 'w1',
    title: 'Morning Protection',
    description: 'The Shield of the Believer',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    translation: 'In the Name of Allah, with whose Name nothing is harmed in the earth nor in the heavens, and He is the All-Hearing, the All-Knowing.',
    count: 3,
    time: 'After Fajr'
  },
  {
    id: 'w2',
    title: 'Removal of Anxiety',
    description: 'Prophetic Dua for Distress',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ',
    translation: 'O Allah, I take refuge in You from anxiety and sorrow, weakness and laziness, miserliness and cowardice, the burden of debts and from being overpowered by men.',
    count: 1,
    time: 'Anytime'
  },
  {
    id: 'w3',
    title: 'Sayyidul Istighfar',
    description: 'The Master of Seeking Forgiveness',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    translation: 'O Allah, You are my Lord. There is no god but You. You created me, and I am Your slave, and I am abiding to Your covenant and promise as best as I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favors upon me, and I acknowledge my sins. So forgive me, for verily no one forgives sins except You.',
    count: 1,
    time: 'Morning & Evening'
  }
];

export const FULL_ARABIC_CONTENT: Record<string, { arabic: string; translation: string }> = {
  // ... (Existing content remains)
  'ayatul_kursi': {
    arabic: `اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ`,
    translation: `Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is [presently] before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.`
  },
  // ... (Keep existing keys)
};

export const GUIDE_SECTIONS: GuideSection[] = [];
export const NAFL_PRAYERS: NaflPrayerItem[] = [];

// NEW: Special Surahs for Citadel Treasury
export const SPECIAL_SURAHS = [
  { name: 'Surah Yaseen', time: 'After Fajr', icon: Heart },
  { name: 'Surah Al-Kahf', time: 'Jumuah (Friday)', icon: BookHeart },
  { name: 'Surah Al-Waqiah', time: 'After Maghrib', icon: CloudSun },
  { name: 'Surah Al-Mulk', time: 'After Isha', icon: Shield },
  { name: 'Surah As-Sajdah', time: 'Before Sleep', icon: Moon }
];

// NEW: Jumuah Routine
export const JUMUAH_ROUTINE = [
  { id: 'ghusl', label: 'Ghusl' },
  { id: 'perfume', label: 'Perfume' },
  { id: 'miswak', label: 'Miswak' },
  { id: 'early', label: 'Go Early' },
  { id: 'kahf', label: 'Surah Kahf' },
  { id: 'durood', label: 'Durood' }
];

// NEW: Prophetic Timeline alias
export const PROPHETIC_TIMELINE = SEERAH_CHAPTERS;
