

import { Quest, QuestCategory, ReflectionItem, GuideSection, SeerahChapter, AdhkarItem, NaflPrayerItem } from './types';
import { Sun, Moon, Sunrise, Sunset, Clock, Star, CloudSun, Hand, CalendarDays, Shield, BookHeart } from 'lucide-react';

export const ALL_QUESTS: Quest[] = [
  // SALAH (MAIN)
  { id: 'fajr', title: 'Fajr Salah', description: 'The light before dawn. "Prayer is better than sleep."', category: QuestCategory.MAIN, xp: 600, locationType: 'mosque' },
  { id: 'dhuhr', title: 'Dhuhr Salah', description: 'Noontime connection amidst the chaos of the day.', category: QuestCategory.MAIN, xp: 480, locationType: 'mosque' },
  { id: 'asr', title: 'Asr Salah', description: 'The middle prayer. Guard it strictly.', category: QuestCategory.MAIN, xp: 480, locationType: 'mosque' },
  { id: 'maghrib', title: 'Maghrib Salah', description: 'The gratitude at the end of the day.', category: QuestCategory.MAIN, xp: 480, locationType: 'mosque' },
  { id: 'isha', title: 'Isha Salah', description: 'The heavy prayer that proves faith.', category: QuestCategory.MAIN, xp: 600, locationType: 'mosque' },
  
  // PDF SPECIFIC - DAILY ROUTINE
  { id: 'surah_yaseen', title: 'Surah Yaseen', description: 'The Heart of the Quran. Read in the early morning for fulfillment of needs.', category: QuestCategory.DHIKR, xp: 350 },
  { id: 'morning_adhkar', title: 'Morning Adhkar', description: 'The fortress of the believer. Protection until evening.', category: QuestCategory.DHIKR, xp: 200 },
  { id: 'kalima_100', title: '100x Kalima Tayyiba', description: 'La ilaha illallah. The best of Dhikr.', category: QuestCategory.DHIKR, xp: 300 },
  { id: 'ishraq_salah', title: 'Ishraq Salah', description: 'Prayer after sunrise. Reward of a Hajj and Umrah.', category: QuestCategory.SUNNAH, xp: 500 },
  { id: 'surah_fatah', title: 'Surah Fatah', description: 'To be read after Dhuhr. "Verily We have granted you a manifest victory."', category: QuestCategory.DHIKR, xp: 300 },
  { id: 'surah_naba', title: 'Surah Naba (Amma)', description: 'To be read after Asr. Reflection on the Great News.', category: QuestCategory.DHIKR, xp: 250 },
  { id: 'istighfar_100', title: '100x Istighfar', description: 'Seeking forgiveness. Eraser of sins.', category: QuestCategory.DHIKR, xp: 200 },
  { id: 'durood_100', title: '100x Durood', description: 'Sending peace upon the Prophet ﷺ.', category: QuestCategory.DHIKR, xp: 250 },
  { id: 'awwaabeen', title: 'Awwaabeen Salah', description: '6 Rakaats after Maghrib. The prayer of the oft-returning.', category: QuestCategory.SUNNAH, xp: 600 },
  { id: 'surah_waqiah', title: 'Surah Waqiah', description: 'Read after Maghrib. Protection from poverty.', category: QuestCategory.DHIKR, xp: 350 },
  { id: 'surah_mulk', title: 'Surah Mulk', description: 'Read after Isha. Protection from the punishment of the grave.', category: QuestCategory.DHIKR, xp: 350 },
  { id: 'surah_sajdah', title: 'Surah Sajdah', description: 'Sunnah of the Prophet ﷺ before sleeping.', category: QuestCategory.DHIKR, xp: 300 },
  { id: 'ayatul_kursi', title: 'Ayatul Kursi', description: 'Greatest verse. Protection from Shaitan.', category: QuestCategory.DHIKR, xp: 100 },
  { id: 'tahajjud', title: 'Tahajjud Salah', description: 'The arrow of the night that does not miss.', category: QuestCategory.SUNNAH, xp: 1000 },
  { id: 'salatul_tasbeeh', title: 'Salatul Tasbeeh', description: 'The prayer of forgiveness. 300 Tasbeehs.', category: QuestCategory.SUNNAH, xp: 1500 },
  
  // PILLARS & FASTING
  { id: 'fasting_ramadan', title: 'Ramadan Fasting', description: 'The month of the Quran (Currently unavailable)', category: QuestCategory.MAIN, xp: 8000, isGreyed: true },
  { id: 'fasting_sunnah', title: 'Sunnah Fast', description: 'Mondays or Thursdays fasting.', category: QuestCategory.SUNNAH, xp: 400 },
  { id: 'zakaat', title: 'Zakaat', description: 'Purifying wealth (2.5%).', category: QuestCategory.MAIN, xp: 3200, locationType: 'charity' },
  { id: 'hajj', title: 'Hajj Pilgrimage', description: 'The journey of a lifetime (Currently unavailable)', category: QuestCategory.MAIN, xp: 100000, isGreyed: true },

  // SUNNAH - DAILY MICRO-DEEDS
  { id: 'miswak', title: 'Using Miswak', description: 'Sunnah of oral hygiene', category: QuestCategory.SUNNAH, xp: 200 },
  { id: 'right_side_sleep', title: 'Sleep on Right Side', description: 'Prophetic etiquette of rest', category: QuestCategory.SUNNAH, xp: 160 },
  { id: 'wudu_before_sleep', title: 'Wudu before Sleep', description: 'Angels pray for you through the night', category: QuestCategory.SUNNAH, xp: 240 },
  { id: 'duha', title: 'Salat al-Duha', description: 'Charity for every joint', category: QuestCategory.SUNNAH, xp: 600 },
  { id: 'smile_sunnah', title: 'Smiling to Others', description: 'Prophetic act of kindness', category: QuestCategory.SUNNAH, xp: 200 },
  { id: 'salawat_10', title: '10x Salawat', description: 'Sending peace upon the Messenger (PBUH)', category: QuestCategory.SUNNAH, xp: 200 },
  { id: 'drink_water_3_breaths', title: 'Water in 3 Breaths', description: 'Prophetic method of drinking', category: QuestCategory.SUNNAH, xp: 120 },
  { id: 'dua_after_adhan', title: 'Dua After Adhan', description: 'Intercession guaranteed', category: QuestCategory.SUNNAH, xp: 280 },
  { id: 'ayatul_kursi_salah', title: 'Ayatul Kursi Post-Salah', description: 'Protection until next prayer', category: QuestCategory.SUNNAH, xp: 320 },
  { id: 'tahiyyatul_wudhu', title: 'Tahiyyatul Wudhu', description: '2 Rakaats after performing Wudhu, a key to Jannah.', category: QuestCategory.SUNNAH, xp: 250 },
  { id: 'tahiyyatul_masjid', title: 'Tahiyyatul Masjid', description: '2 Rakaats upon entering the Masjid, honoring Allah\'s house.', category: QuestCategory.SUNNAH, xp: 200 },

  // CHARACTER & COMMUNITY
  { id: 'forgive_someone', title: 'Forgive a Grudge', description: 'Release a grievance for the sake of Allah.', category: QuestCategory.SUNNAH, xp: 1600 },
  { id: 'maintain_kinship', title: 'Maintain Kinship', description: 'Call or visit a relative you haven’t spoken to recently', category: QuestCategory.SUNNAH, xp: 1200 },
  { id: 'clothes_poor', title: 'Give Clothes to Poor', description: 'Share your blessings', category: QuestCategory.CHARITY, xp: 1000, locationType: 'charity' },
  { id: 'food_needy', title: 'Feed the Needy', description: 'Provide a meal for someone hungry', category: QuestCategory.CHARITY, xp: 800, locationType: 'soup_kitchen' },
  { id: 'visit_sick', title: 'Visit the Sick', description: '70,000 angels pray for you.', category: QuestCategory.SUNNAH, xp: 800 },
  { id: 'hug_loved_one', title: 'Hug a Loved One', description: 'Spread warmth in your home', category: QuestCategory.SUNNAH, xp: 200 },
  { id: 'reflect_universe', title: 'Universe Reflection', description: 'Contemplate the vastness of creation', category: QuestCategory.SUNNAH, xp: 400 },
  { id: 'feed_stray_animal', title: 'Feed a Stray Animal', description: 'Mercy to all creation', category: QuestCategory.CHARITY, xp: 360 },
  { id: 'help_neighbor', title: 'Help a Neighbor', description: 'Assist with groceries or tasks', category: QuestCategory.CHARITY, xp: 600 },
  { id: 'convey_islam', title: 'Convey Islam\'s Message', description: 'Convey the message of Islam to someone, even with a smile.', category: QuestCategory.CHARITY, xp: 1500 },
  { id: 'quran_traffic', title: 'Quran During Commute', description: 'Listen to the Quran during traffic or your daily commute.', category: QuestCategory.CHARITY, xp: 300 },
  { id: 'no_road_rage', title: 'Patience on the Road', description: 'Repress road rage and practice patience while driving.', category: QuestCategory.CHARITY, xp: 500 },
  { id: 'dua_for_ummah', title: 'Dua for the Ummah', description: 'Make a sincere dua for the well-being of the Muslim community.', category: QuestCategory.CHARITY, xp: 250 },
  { id: 'help_elderly', title: 'Assist the Elderly', description: 'Assist, be kind to, and spend time with an elderly person.', category: QuestCategory.CHARITY, xp: 700 },


  // GUIDE-DERIVED QUESTS
  { id: 'jumuah_surah_kahf', title: 'Recite Surah Kahf', description: 'A light illuminated for you until the next Jumu\'ah.', category: QuestCategory.DHIKR, xp: 400 },
  { id: 'jumuah_durood_80', title: '80x Durood (Post-Asr)', description: 'On Jumu\'ah, after Asr, 80 years of sins are forgiven.', category: QuestCategory.DHIKR, xp: 300 },
  { id: 'read_manzil', title: 'Recite Manzil', description: 'The 33 verses of security and protection against evil influences.', category: QuestCategory.DHIKR, xp: 350 },
  { id: 'tasbeeh_fatimi', title: 'Tasbeeh Fatimi', description: 'Recite before sleep: Subhanallah (33x), Alhamdulillah (33x), Allahu Akbar (34x). Better than a servant.', category: QuestCategory.DHIKR, xp: 150 },
  { id: 'post_salah_adhkar', title: 'Post-Salah Adhkar', description: 'Perform the sunnah remembrance after obligatory prayers.', category: QuestCategory.DHIKR, xp: 200 },
  
  // --- NEW CORRECTION QUESTS ---
  // Minor Sin
  { id: 'corr_pay_sadaqa_minor', title: 'Pay Sadaqa', description: 'Charity extinguishes sin as water extinguishes fire.', category: QuestCategory.CORRECTION, subCategory: 'Minor Sin', xp: 300, locationType: 'charity' },
  { id: 'corr_istighfar_100_minor', title: '100x Astaghfirullah', description: 'Seek Allah\'s forgiveness to cleanse the heart.', category: QuestCategory.CORRECTION, subCategory: 'Minor Sin', xp: 200 },
  { id: 'corr_subhanallah_100_minor', title: '100x Subhanallah', description: 'Glorify Allah to erase misdeeds.', category: QuestCategory.CORRECTION, subCategory: 'Minor Sin', xp: 200 },
  // Major Sin
  { id: 'corr_salah_taubah', title: 'Salat-ul-Tawbah', description: 'Offer 2 Rakaats of sincere repentance.', category: QuestCategory.CORRECTION, subCategory: 'Major Sin', xp: 1200 },
  { id: 'corr_pay_sadaqa_major', title: 'Pay Sadaqa Generously', description: 'Give charity to seek mercy and forgiveness.', category: QuestCategory.CORRECTION, subCategory: 'Major Sin', xp: 800, locationType: 'charity' },
  { id: 'corr_istighfar_100_major', title: '100x Astaghfirullah', description: 'Beg for forgiveness with deep regret.', category: QuestCategory.CORRECTION, subCategory: 'Major Sin', xp: 300 },
  { id: 'corr_subhanallah_100_major', title: '100x Subhanallah', description: 'Glorify Allah\'s perfection as a part of repentance.', category: QuestCategory.CORRECTION, subCategory: 'Major Sin', xp: 300 },
  { id: 'corr_feed_needy', title: 'Feed a Family', description: 'Provide a good meal to a person or family in need.', category: QuestCategory.CORRECTION, subCategory: 'Major Sin', xp: 1000, locationType: 'soup_kitchen' },
  { id: 'corr_sacrifice_animal', title: 'Sacrifice for the Poor', description: 'Sacrifice an animal and distribute the meat to the needy.', category: QuestCategory.CORRECTION, subCategory: 'Major Sin', xp: 2000, locationType: 'community' },
  // Wronged Someone
  { id: 'corr_apology', title: 'Seek Forgiveness', description: 'Sincerely apologize to the one you have wronged.', category: QuestCategory.CORRECTION, subCategory: 'Wronged Someone', xp: 1600 },
  // Missed Salah
  { id: 'corr_qadha', title: 'Pray Qadha Salah', description: 'Make up the obligatory prayer you missed.', category: QuestCategory.CORRECTION, subCategory: 'Missed Salah', xp: 400 },
];

export const CORRECTION_SUB_CATEGORIES = ['Minor Sin', 'Major Sin', 'Wronged Someone', 'Missed Salah'];

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
  {
    id: 'ref-3',
    type: 'verse',
    content: "The Art of Kintsugi",
    praise: "Alhamdulillah",
    mediaUrl: "https://images.unsplash.com/photo-1620317539074-6725227702f2?q=80&w=1920&auto=format&fit=crop",
    summary: "Japanese art repairs broken pottery with gold. Allah repairs broken hearts with Light.",
    details: `In Japan, the art of Kintsugi involves repairing broken pottery with lacquer mixed with powdered gold. The result is a bowl that is more beautiful and valuable *because* it was broken. The cracks are not hidden; they are highlighted.

The human heart is similar. We are terrified of heartbreak—whether from loss, failure, or sin. We think our brokenness makes us unworthy. We think we are "damaged goods." But in the Divine Kingdom, the broken heart is the vessel that holds the most light.

The Prophet (PBUH) said, "Verily, Allah looks not at your bodies nor your appearances, but He looks at your hearts." When a heart is broken for the sake of Allah, or turns to Allah in its brokenness, He does not just patch it up. He fills the cracks with the gold of wisdom, humility, and reliance (Tawakkul).

A heart that has never broken is often hard, arrogant, and self-sufficient. A heart that has shattered and been rebuilt by Tawbah (repentance) is soft, empathetic, and radiant. Do not hide your scars from Allah. Show Him your cracks. He is Al-Jabbar (The Mender). He will rebuild you, and the new version of you will be stronger than the one that never fell.`
  },
  {
    id: 'ref-4',
    type: 'animal',
    content: "The Spider's False Security",
    praise: "Subhanallah",
    mediaUrl: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=1920&auto=format&fit=crop",
    summary: "The Quran compares our worldly reliance to the most fragile home in nature.",
    details: `Surah Al-Ankabut (The Spider) contains a terrifying analogy: "The example of those who take allies other than Allah is like that of the spider who takes a home. And indeed, the weakest of homes is the home of the spider, if they only knew." (29:41)

Look at a spider web. To the spider, it looks like a fortress. It is an engineering marvel. It catches prey. It seems secure. But to us, giants compared to the spider, we know that a single sweep of a broom or a gust of wind destroys it instantly.

We build "webs" of security. We think our bank account is our fortress. We think our social status, our degrees, or our political connections will save us. We spend a lifetime weaving these webs, thinking we are safe. But when the winds of Decree (Qadr) blow—a sudden diagnosis, a market crash, a death—the web vanishes.

This verse is not telling us to be homeless. It is telling us not to trust the walls we build more than the One who created the materials. Live in the world, build your life, but know that your true security, your true "Home," is only in your relationship with the Master of the House.`
  },
  {
    id: 'ref-5',
    type: 'hadith',
    content: "The River at Your Door",
    praise: "Allahu Akbar",
    mediaUrl: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?q=80&w=1920&auto=format&fit=crop",
    summary: "If a river flowed by your door and you bathed five times a day, would any dirt remain?",
    details: `The Prophet Muhammad (PBUH) once asked his companions a simple question: "If there was a river at the door of anyone of you and he took a bath in it five times a day would you notice any dirt on him?" They said, "Not a trace of dirt would be left." The Prophet added, "That is the example of the five prayers with which Allah blots out evil deeds."

We accumulate spiritual dirt constantly. A glance we shouldn't have taken, a word we shouldn't have said, a thought of arrogance, a moment of ingratitude. This dirt accumulates like sweat on a hot day. If left unwashed, it begins to smell; the soul begins to rot.

Salah is the shower. It is the reset button. It is the spiritual hygiene that keeps us human. Imagine going weeks without a shower; you would be unbearable to be around. Yet many go months without Salah and wonder why their lives feel chaotic and their souls feel sticky with anxiety.

The mercy of the system is that the "River" is not in Mecca. It is not in a cave. It is at your door. It is accessible anywhere you are. The moment you say "Allahu Akbar," you dive into the cooling waters of mercy. Don't stand on the dry banks of life, covered in the dust of the Dunya, when the river is flowing right in front of you.`
  },
  {
    id: 'ref-6',
    type: 'wonder',
    content: "The Expansion of the Chest",
    praise: "Alhamdulillah",
    mediaUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920&auto=format&fit=crop",
    summary: "Anxiety feels like a tightening of the ribs. Faith is the oxygen that expands them.",
    details: `One of the most profound Duas of Musa (AS) was "Rabbish rahli sadri" — "My Lord, expand for me my chest."

Why "expand"? Because fear, anxiety, and stress are constrictive. When you are panicked, you literally struggle to breathe. Your world shrinks. You get tunnel vision. You feel like you are being crushed by your circumstances. This is the state of "Dayq" (tightness).

The counter to this is "Sharh" (expansion). When Allah guides someone, He "expands their chest" to contain the truth. When you have Tawakkul (reliance), your capacity to handle life grows. The problem doesn't necessarily get smaller, but the container (your heart) gets bigger.

Think of a cup of water. If you put a spoon of salt in it, it becomes undrinkable. But if you put that same spoon of salt into a lake, the water remains fresh. The salt (the problem) is the same size. The vessel changed.

We often pray for the salt to be removed. "O Allah, remove this problem." But sometimes, Allah answers by making you a lake. He expands your chest so that the problem no longer overwhelms you. You find a calm amidst the storm. That expansion is a greater miracle than the removal of the obstacle.`
  },
  {
    id: 'ref-7',
    type: 'story',
    content: "The Whale of Yunus",
    praise: "La ilaha illa anta",
    mediaUrl: "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?q=80&w=1920&auto=format&fit=crop",
    summary: "Three layers of darkness: the night, the ocean, and the belly of the whale.",
    details: `Prophet Yunus (Jonah) found himself in a situation of absolute despair. He was deep underwater, inside a massive creature, in the middle of the night. Mathematically, his chance of survival was zero. There was no cell service, no rescue team, no way out.

In that suffocating darkness, he did not scream for help from people. He did not panic. He admitted his fault and glorified his Lord: "La ilaha illa anta subhanaka inni kuntu minaz-zalimin" (There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers).

This Dua broke the laws of nature. The whale did not digest him. The ocean did not drown him. The darkness did not consume him. He was delivered safely to the shore.

You have your own whale. It might be debt. It might be a failing marriage. It might be depression. It might be a sin you can't stop. You feel you are in layers of darkness. But the God of Yunus is your God. The frequency that worked from the belly of the whale works from your bedroom. Admit your weakness, glorify His perfection, and watch the walls of your whale open up.`
  }
];

const POST_SALAH_ADHKAR: AdhkarItem[] = [
  { id: 'ps1', arabic: 'اللهُ أَكْبَرُ', translation: 'Allah is the Greatest!', count: 1, reference: 'Bukhari/Muslim', virtue: 'Habit of Prophet ﷺ after Fard Salaat.' },
  { id: 'ps2', arabic: 'أَسْتَغْفِرُ اللهَ', translation: 'I seek the forgiveness of Allah.', count: 3, reference: 'Muslim', virtue: 'Recited 3 times after Salaat.' },
  { id: 'ps3', arabic: 'اَللّهُمَّ أَنْتَ السَّلاَمُ وَمِنْكَ السَّلاَمُ تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ', translation: 'O Allah! You are peace and from You is peace...', count: 1, reference: 'Muslim' },
  { id: 'ps4', arabic: 'اللّهُمَّ أَعِنِّيْ عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ', translation: 'O! Allah help me to remember You...', count: 1, reference: 'Ahmad/Nasai', virtue: 'Never fail to say this after every prayer.' },
  { id: 'ps5', arabic: 'سُبْحَانَ اللهِ (33) اَلْحَمْدُ لِلهِ (33) اَللهُ أَكْبَرُ (34)', translation: 'Glory be to Allah, Praise be to Allah, Allah is Greatest.', count: 1, virtue: 'Minor sins forgiven even if they are like the foam of the sea.' },
  { id: 'ps6', arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', translation: 'Our Lord, give us in this world that which is good...', count: 1, virtue: 'Recited by Nabi ﷺ in abundance.' }
];

const MORNING_EVENING_ADHKAR: AdhkarItem[] = [
  { id: 'me1', arabic: 'Surah Al-Ikhlas, Al-Falaq, An-Nas', translation: 'The Three Quls', count: 3, reference: 'Mishkaat', virtue: 'Sufficient for protection from all evil.' },
  { id: 'me2', arabic: 'حَسْبِيَ اللهُ لَآ إلهَ إلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيْمِ', translation: 'Allah is sufficient for me...', count: 7, reference: 'Ruhul Ma\'ani', virtue: 'Elimination of grief of both worlds.' },
  { id: 'me3', arabic: 'بِسْم.ِ اللهِ الَّذِيْ لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيْعُ الْعَلِيْمُ', translation: 'In the name of Allah...', count: 3, reference: 'Abu Dawood', virtue: 'Nothing shall harm the reciter.' },
  { id: 'me4', arabic: 'أَعُوذُ بِاللهِ السَّمِيعِ الْعَلِيمِ مِنَ الشَّيْطَانِ الرَّجِيمِ + Surah Hashr (Last 3 verses)', translation: 'I seek protection with Allah...', count: 1, virtue: '70,000 Angels seek forgiveness for you until nightfall.' },
  { id: 'me5', arabic: 'Sayyidul Istighfaar', translation: 'The Master of Forgiveness', count: 1, reference: 'Bukhari', virtue: 'Recite with conviction; if you die that day, you enter Jannah.' }
];

export const NAFL_PRAYERS: NaflPrayerItem[] = [
  { id: 'n1', title: 'Tahiyyatul Wudhu', time: 'After performing Wudhu', rakaats: '2 Rakaats', benefit: 'Entitled to enter Jannat.' },
  { id: 'n2', title: 'Tahiyyatul Masjid', time: 'Upon entering the Masjid', rakaats: '2 Rakaats', benefit: 'Honour for Allah\'s house.' },
  { id: 'n3', title: 'Ishraaq', time: '15 mins after sunrise', rakaats: '2 or 4 Rakaats', benefit: 'Thawaab of one Hajj and one Umrah.' },
  { id: 'n4', title: 'Salaatul Duha (Chaast)', time: '10am until Zawaal', rakaats: '2, 4, 8, or 12 Rakaats', benefit: 'Charity for 360 joints; built a castle of gold in Jannah.' },
  { id: 'n5', title: 'Awwaabeen', time: 'After Maghrib', rakaats: '6 to 20 Rakaats', benefit: 'Reward equivalent to 12 years of worship.' },
  { id: 'n6', title: 'Salaatul Taubah', time: 'When needed', rakaats: '2 Rakaats', benefit: 'Allah forgives the sin committed.' },
  { id: 'n7', title: 'Salatul Tasbeeh', time: 'Any time', rakaats: '4 Rakaats', benefit: 'Forgives all sins, old/new, small/large.', details: `**Method:**\nRecite the Tasbeeh: "Subhanallahi wal hamdulillahi wa la ilaha illallahu wallahu akbar" 75 times per Rakaat.\n- 15x After Thana\n- 10x After Surah\n- 10x In Ruku\n- 10x After Ruku\n- 10x In 1st Sajdah\n- 10x Between Sajdahs\n- 10x In 2nd Sajdah` }
];

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'fajr_phase',
    title: 'Morning',
    timeRange: 'Fajr-Sunrise',
    description: 'Begin with the "Heart of the Quran" and the fortress of morning zikr.',
    icon: Sunrise,
    quests: ['fajr', 'surah_yaseen', 'morning_adhkar'],
    adhkar: MORNING_EVENING_ADHKAR,
    specialGuide: {
      title: 'Morning Routine',
      content: `**Upon Awakening:**
1. Rub face with hands to remove sleep effects.
2. Recite: "Alhamdulillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur."
3. Use Miswaak immediately.`
    }
  },
  {
    id: 'post_salah',
    title: 'Post-Salah',
    timeRange: 'Every Prayer',
    description: 'Sunnah practices to be observed after every Fard Salaat as detailed in the Treasures of Jannah.',
    icon: Hand,
    quests: ['post_salah_adhkar', 'ayatul_kursi_salah'],
    adhkar: POST_SALAH_ADHKAR,
    specialGuide: {
      title: 'Special Surahs After Salah',
      content: `**After Fajr:** Surah Yaseen (Solves all problems)
**After Zohr:** Surah Fatah (Saves from fitnah)
**After Asr:** Surah Naba (Grants great knowledge)
**After Maghrib:** Surah Waqiah (Protects from poverty)
**After Esha:** Surah Mulk (Protection from grave)`
    }
  },
  {
    id: 'jumuah_tab',
    title: 'Jumu\'ah',
    timeRange: 'Friday',
    description: 'The best day of the week. Prepare from Thursday night.',
    icon: CalendarDays,
    quests: ['jumuah_surah_kahf', 'jumuah_durood_80'],
    adhkar: [
      { id: 'j1', arabic: 'اَللّهُمَّ صَلِّ عَلى مُحَمَّدِ نِ النَّبِيِّ الْأُمِّيِّ وَعَلى آلِهِ وَسَلِّمْ تَسْلِيْمًا', translation: 'O Allah, bestow Your blessings...', count: 80, virtue: 'Recited 80x after Asr on Friday: 80 years of sins forgiven.' },
      { id: 'j2', arabic: 'Recite Surah Kahf', translation: 'Read the Cave', count: 1, virtue: 'A light illuminated for you until the next Jumu\'ah.' },
      { id: 'j3', arabic: 'Durood Shareef', translation: 'Abundant Salawat', count: 1000, virtue: 'High rank in Jannah.' }
    ],
    specialGuide: {
      title: 'Etiquette of Friday',
      content: `**Thursday Night:**
- Prepare clothes, clip nails, recite Surah Dukhaan.

**Friday Morning:**
- Perform Ghusl (Sunnah bath).
- Use Miswaak.
- Wear best clothes (preferably white).
- Apply non-alcoholic perfume (Itr).
- Proceed early to the Masjid by foot.
- Sit near the Imam and listen attentively to Khutbah.`
    }
  },
  {
    id: 'manzil_tab',
    title: 'Manzil',
    timeRange: 'Protection',
    description: 'The verses of security and protection against evil influences.',
    icon: Shield,
    quests: ['read_manzil'],
    adhkar: [],
    specialGuide: {
      title: 'The 33 Verses',
      content: `**Benefits:**
- Protection against Jinn, Black Magic (Sihr), and Sorcery.
- Safety from thieves and burglars.
- Security of home, family, and honour.

**The Verses Include:**
- Surah Fatihah (1-7)
- Surah Baqarah (1-5, 163, 255-257, 284-286)
- Surah Aal-e-Imran (18, 26, 27)
- Surah A'araf (54-56)
- Surah Israa (110-111)
- Surah Muminoon (115-118)
- Surah Saaffaat (1-11)
- Surah Rehman (33-40)
- Surah Hashr (21-24)
- Surah Jinn (1-4)
- Surah Kaafiroon (1-6)
- Surah Ikhlas (1-4)
- Surah Falaq (1-5)
- Surah Naas (1-6)`
    }
  },
  {
    id: 'night_phase',
    title: 'Night',
    timeRange: 'Isha-Tahajjud',
    description: 'Protection before sleep and the special acceptance of the last third of the night.',
    icon: Moon,
    quests: ['isha', 'surah_mulk', 'surah_sajdah', 'tahajjud', 'tasbeeh_fatimi', 'wudu_before_sleep'],
    adhkar: [
      { id: 'n1', arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', translation: 'In Your Name O Allah I die and live.', count: 1 },
      { id: 'n2', arabic: 'Subhanallah (33) Alhamdulillah (33) Allahu Akbar (34)', translation: 'Tasbeeh before sleep.', count: 1, virtue: 'Better than having a servant.' }
    ],
    specialGuide: {
      title: 'Method of Sleep',
      content: `**Sunnahs:**
1. Perform Wudu.
2. Dust the bedding 3 times with a cloth.
3. Sleep on the right side facing Qiblah.
4. Recite Ayatul Kursi and the last 2 verses of Surah Baqarah.`
    }
  }
];

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
    title: 'The Honest Merchant',
    period: 'Pre-Prophethood',
    year: '595 CE',
    content: `Growing up under the care of his uncle Abu Talib after his mother and grandfather passed, Muhammad ﷺ became known as Al-Amin (The Trustworthy) and As-Sadiq (The Truthful). He never lied, never worshipped an idol, and never engaged in the lewdness of Jahiliyyah (Ignorance).

Khadija bint Khuwaylid, a noble and wealthy businesswoman, hired him to trade for her in Syria. Impressed by his honesty and the barakah in his trade, she proposed marriage to him. He was 25; she was 40. Their marriage was one of immense love and support. She was the first to believe in him when the world would later reject him.`
  },
  {
    id: 's4',
    title: 'The Cave of Hira',
    period: 'Mecca',
    year: '610 CE',
    content: `At the age of 40, Muhammad ﷺ began to love seclusion. He would retreat to the Cave of Hira, overlooking Mecca, to reflect on the Creator. One night in Ramadan, the Angel Jibreel appeared, squeezing him tight, commanding: "Iqra!" (Read!). 

He replied, "I am not a reader." This happened three times. Finally, the first verses revealed were: "Read! In the Name of your Lord, Who has created..." (96:1-5).

Trembling, he ran home to Khadija, crying "Zammilooni" (Cover me!). She comforted him with the famous words: "By Allah, Allah will never disgrace you. You unite uterine relations, you bear the burden of the weak, you help the poor and the needy, you entertain guests, and you endure hardships in the path of truth."`
  },
  {
    id: 's5',
    title: 'The Secret Call',
    period: 'Mecca',
    year: '610-613 CE',
    content: `For three years, the message was spread secretly. The early converts were the "Strangers." Khadija (his wife), Ali (his cousin), Zaid (his freed slave), and Abu Bakr (his best friend) were the first. They met in the house of Al-Arqam to learn the revelation. 

The social structure of Mecca was based on tribal arrogance and idolatry. The message of One God (Tawhid) and equality threatened the power of the elites. These early believers faced mockery but held onto the burning coal of faith.`
  },
  {
    id: 's6',
    title: 'Public Preaching & Persecution',
    period: 'Mecca',
    year: '613-619 CE',
    content: `When the command came to "Warn your closest kindred," the Prophet ﷺ climbed Mount Safa and called out to the tribes. When he told them he was a Messenger, his own uncle Abu Lahab cursed him.

Persecution began. Bilal was dragged on burning sand. The family of Yasir was tortured; Sumayyah became the first martyr. The Prophet ﷺ himself had camel intestines thrown on his back while praying. Through it all, his character remained impeccable. He did not retaliate with violence; he responded with patience and the Quran.`
  },
  {
    id: 's7',
    title: 'The Year of Sorrow',
    period: 'Mecca',
    year: '619 CE',
    content: `A devastating year. Khadija, his beloved wife and emotional support, passed away. Abu Talib, his uncle and political protector, passed away. 

With his protection gone, the Prophet ﷺ went to Ta'if to seek a new home for Islam. They rejected him brutally, ordering children to stone him until his shoes filled with blood. He sat in a garden, bleeding, and made the famous Dua: "O Allah, to You I complain of my weakness..." 

The Angel of Mountains appeared, offering to crush the city between two mountains. The Prophet ﷺ refused, saying, "No, I hope that Allah will bring forth from their loins people who will worship Allah alone." This was the mercy of the Mercy to the Worlds.`
  },
  {
    id: 's8',
    title: 'Isra wal Mi\'raj',
    period: 'Mecca',
    year: '620 CE',
    content: `To comfort His messenger, Allah invited him to the Heavens. In a single night, he traveled from Mecca to Jerusalem (Isra), led all Prophets in prayer, and ascended through the seven heavens (Mi'raj).

He met Adam, Isa, Yusuf, Idris, Harun, Musa, and Ibrahim. He reached the Sidrat al-Muntaha (Lote Tree of the Furthest Boundary), where he heard the scratching of the Pens writing destiny. He spoke directly to Allah.

Here, the gift of 5 daily prayers was given. It was originally 50, but reduced to 5 out of mercy, though the reward remains 50. This journey established the spiritual stature of the Prophet ﷺ and the sanctity of Jerusalem.`
  },
  {
    id: 's9',
    title: 'The Hijrah',
    period: 'Migration',
    year: '622 CE',
    content: `The persecution in Mecca became a plot to assassinate the Prophet ﷺ. Allah commanded him to migrate to Yathrib (Medina). He left his house while assassins surrounded it, reciting Surah Yasin, and they were blinded to his exit.

He hid in the Cave of Thawr with Abu Bakr for three days. A spider spun a web and a pigeon laid eggs at the entrance, deceiving the pursuers. Abu Bakr whispered, "If they look down, they will see us." The Prophet ﷺ replied, "What do you think of two, where Allah is the third?"

They arrived in Medina to the song "Tala'al Badru Alayna" (The Full Moon has risen upon us). Yathrib became Madinat-un-Nabi (City of the Prophet). The Islamic Calendar (Hijri) begins here.`
  },
  {
    id: 's10',
    title: 'Brotherhood in Medina',
    period: 'Medina',
    year: '623 CE',
    content: `The first task was building the Masjid an-Nabawi. The Prophet ﷺ worked with his own hands, carrying bricks. 

He then established the "Mu'akhah" (Brotherhood). He paired every Muhajir (immigrant from Mecca) with an Ansari (helper from Medina). The Ansar shared their wealth, homes, and businesses with their brothers. It was a society based not on blood or tribe, but on Faith. The Constitution of Medina was drafted, establishing rights for all, including Jews and non-Muslims.`
  },
  {
    id: 's11',
    title: 'Battle of Badr',
    period: 'Medina',
    year: '624 CE',
    content: `The first major encounter. 313 ill-equipped Muslims faced 1,000 well-armed Quraish soldiers. The Prophet ﷺ spent the night in the tent crying in prayer, "O Allah, if this small group is destroyed, You will not be worshipped on earth."

Allah sent 1,000 angels to assist. The Muslims won a decisive victory. It proved that victory comes not from numbers, but from Allah. It established the Muslims as a force to be reckoned with.`
  },
  {
    id: 's12',
    title: 'The Conquest of Mecca',
    period: 'Medina',
    year: '630 CE',
    content: `After years of battles (Uhud, Khandaq) and the Treaty of Hudaybiyyah (which Quraish broke), the Prophet ﷺ marched on Mecca with 10,000 believers. The city that tortured him surrendered without a fight.

He entered Mecca with his head lowered in humility, not looking up. He went to the Kabah and smashed the 360 idols, reciting: "Truth has come, and falsehood has vanished."

The Quraish gathered, expecting execution. He asked, "What do you think I will do to you?" They said, "You are a noble brother, son of a noble brother." He said, "I say to you what Yusuf said to his brothers: No blame upon you today. Go, for you are free."`
  },
  {
    id: 's13',
    title: 'The Farewell Sermon',
    period: 'Medina',
    year: '632 CE',
    content: `During his only Hajj, the Prophet ﷺ delivered his final sermon on Mount Arafat. He declared the sanctity of life and property, the rights of women, and the end of racism: "An Arab has no superiority over a non-Arab, nor a white over a black, except by piety."

He asked the massive crowd, "Have I conveyed the message?" They roared, "Yes!" He pointed to the sky and said, "O Allah, bear witness."`
  },
  {
    id: 's14',
    title: 'The Departure',
    period: 'Medina',
    year: '632 CE',
    content: `The Prophet ﷺ fell ill. He spent his final days in the house of Aisha. His last command to the Ummah was: "The Prayer, The Prayer! And fear Allah regarding those under your care."

On Monday, 12th Rabi al-Awwal, he passed away with his head on Aisha's lap, whispering "Allahumma ar-Rafiq al-A'la" (O Allah, the Highest Companion).

Medina darkened with grief. Umar drew his sword in denial. Abu Bakr stood firm and said: "Whoever worshipped Muhammad, know that Muhammad is dead. But whoever worships Allah, know that Allah is Alive and never dies." 

He left no wealth, no palaces. He left the Quran, his Sunnah, and a light that guides billions to this day.`
  }
];
