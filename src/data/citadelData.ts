// ============================================================
// THE CITADEL 2.1 — KNOWLEDGE DECKS
// ============================================================

// --- SEERAH (The Keep) ---

export interface SeerahEvent {
    id: string;
    chapter: number;
    title: string;
    era: 'introduction' | 'early-life' | 'mecca' | 'medina';
    year: string;
    summary: string;
    keyLesson: string;
    quranicRef?: string;
}

export const SEERAH_TIMELINE: SeerahEvent[] = [
    { id: 'ch1', chapter: 1, title: 'About the Prophet ﷺ', era: 'introduction', year: '', summary: 'Understanding who Muhammad ﷺ was — his lineage, his role as the final Messenger, and why studying the Seerah matters for every Muslim.', keyLesson: 'The Prophet ﷺ is the best example for humanity in every aspect of life.', quranicRef: 'Al-Ahzab 33:21' },
    { id: 'ch2', chapter: 2, title: 'Setting the Scene', era: 'introduction', year: '~570 CE', summary: 'Pre-Islamic Arabia: the political, social, and religious landscape. The Ka\'bah had been filled with 360 idols, yet remnants of Ibrahimic monotheism persisted among the Hunafa.', keyLesson: 'Allah sends guidance when darkness is at its peak.' },
    { id: 'ch3', chapter: 3, title: 'Birth & Childhood', era: 'early-life', year: '570 CE', summary: 'Born in the Year of the Elephant, orphaned early — losing his father before birth, his mother at age 6, and grandfather at age 8. Raised by his uncle Abu Talib.', keyLesson: 'Allah prepares His chosen ones through trials from the very beginning.' },
    { id: 'ch4', chapter: 4, title: 'Early Adulthood', era: 'early-life', year: '595 CE', summary: 'Known as Al-Amin (The Trustworthy) and As-Sadiq (The Truthful). His marriage to Khadijah RA — a partnership that would become the bedrock of early Islam.', keyLesson: 'Character and integrity speak louder than any claim.' },
    { id: 'ch5', chapter: 5, title: 'The Revelation', era: 'mecca', year: '610 CE', summary: 'In Cave Hira, Jibreel AS descended with "Iqra!" — Read! The Prophet ﷺ trembled and returned to Khadijah who comforted him with the famous words: "Allah will never disgrace you."', keyLesson: 'The first command was to read — knowledge is the foundation of faith.', quranicRef: 'Al-Alaq 96:1-5' },
    { id: 'ch6', chapter: 6, title: 'Early Islam', era: 'mecca', year: '610-615 CE', summary: 'The first believers: Khadijah, Abu Bakr, Ali, Zayd. Secret da\'wah for 3 years. The early Muslims faced mockery and social boycotts but remained steadfast.', keyLesson: 'Every great movement begins with a small, sincere group.' },
    { id: 'ch7', chapter: 7, title: 'Emigration to Abyssinia', era: 'mecca', year: '615 CE', summary: 'As persecution intensified, the Prophet ﷺ sent a group of Muslims to the Christian king of Abyssinia (Najashi), who granted them protection after hearing Ja\'far RA recite Surah Maryam.', keyLesson: 'Justice transcends religious boundaries — truth recognizes truth.', quranicRef: 'Surah Maryam 19' },
    { id: 'ch8', chapter: 8, title: 'Mecca Reaches Boiling Point', era: 'mecca', year: '616 CE', summary: 'The conversion of Umar RA and Hamza RA strengthened Islam publicly. The Quraysh imposed a total boycott on Banu Hashim — no trade, no marriage, no contact for 3 years.', keyLesson: 'Oppressors always overplay their hand, and Allah\'s plan unfolds through patience.' },
    { id: 'ch9', chapter: 9, title: 'The Year of Sorrow', era: 'mecca', year: '619 CE', summary: 'The Prophet ﷺ lost both Khadijah RA and Abu Talib within weeks. He traveled to Ta\'if seeking support but was pelted with stones. In his darkest moment, he made his famous dua.', keyLesson: 'After every hardship comes ease — the darkest hour is just before dawn.', quranicRef: 'Ash-Sharh 94:5-6' },
    { id: 'ch10', chapter: 10, title: 'Al-Isra\' wal Mi\'raj', era: 'mecca', year: '620 CE', summary: 'After the Year of Sorrow, Allah gifted the Prophet ﷺ the Night Journey to Jerusalem and Ascension through the seven heavens. The five daily prayers were prescribed.', keyLesson: 'Allah\'s gifts come after the greatest trials — Salah is the believer\'s ascension.', quranicRef: 'Al-Isra 17:1' },
    { id: 'ch11', chapter: 11, title: 'In Search of a New Base', era: 'mecca', year: '621 CE', summary: 'The Pledges of Aqabah — delegations from Yathrib (Medina) accepted Islam and pledged to protect the Prophet ﷺ. A new homeland was being prepared by Allah.', keyLesson: 'When one door closes, Allah opens another — trust His timing.' },
    { id: 'ch12', chapter: 12, title: 'The Hijrah', era: 'mecca', year: '622 CE', summary: 'The migration to Medina — the Prophet ﷺ and Abu Bakr RA hid in Cave Thawr while the Quraysh hunted them. "Do not grieve, indeed Allah is with us."', keyLesson: 'Tawakkul (trust in Allah) means taking the means AND relying on Him.', quranicRef: 'At-Tawbah 9:40' },
    { id: 'ch13', chapter: 13, title: 'Establishing a Muslim Nation', era: 'medina', year: '622 CE', summary: 'Building Masjid al-Nabawi, the Constitution of Medina (first multi-faith charter), brotherhood between Muhajirun and Ansar. A model state built on justice.', keyLesson: 'Islam provides a complete framework for governance, justice, and community.' },
    { id: 'ch14', chapter: 14, title: 'The Battle of Badr', era: 'medina', year: '624 CE', summary: '313 Muslims vs 1000 Quraysh — a decisive victory granted by Allah. Angels descended to fight alongside the believers. The first major military encounter of Islam.', keyLesson: 'Victory comes from Allah alone, not from numbers or resources.', quranicRef: 'Al-Anfal 8:9' },
    { id: 'ch15', chapter: 15, title: 'Between Badr and Uhud', era: 'medina', year: '624-625 CE', summary: 'The aftermath of Badr: managing prisoners, dealing with the growing threat of hypocrites, and the expulsion of Banu Qaynuqa for breaking their covenant.', keyLesson: 'Victory must be followed by wisdom and vigilance.' },
    { id: 'ch16', chapter: 16, title: 'The Battle of Uhud', era: 'medina', year: '625 CE', summary: 'A pre-planned revenge attack by the Quraysh. Initial Muslim success turned to setback when archers abandoned their posts. The Prophet ﷺ himself was wounded.', keyLesson: 'Disobedience has consequences — discipline and obedience to leadership are paramount.', quranicRef: 'Aal-Imran 3:152' },
    { id: 'ch17', chapter: 17, title: 'External & Internal Threats', era: 'medina', year: '625-627 CE', summary: 'The rise of the Munafiqun (hypocrites) led by Abdullah ibn Ubayy. Multiple expeditions to secure Medina\'s borders and maintain alliances.', keyLesson: 'The internal enemy is often more dangerous than the external one.' },
    { id: 'ch18', chapter: 18, title: 'The Slander of Aisha RA', era: 'medina', year: '627 CE', summary: 'Abdullah ibn Ubayy spread a heinous slander against Aisha RA. Revelation from Allah vindicated her in Surah An-Nur, establishing laws against false accusations.', keyLesson: 'Patience in the face of slander — Allah defends the honor of the righteous.', quranicRef: 'An-Nur 24:11-20' },
    { id: 'ch19', chapter: 19, title: 'The Battle of the Trench', era: 'medina', year: '627 CE', summary: 'A 10,000-strong confederate army besieged Medina. Salman al-Farisi suggested digging a trench. Nu\'aym ibn Mas\'ud\'s intelligence operation broke the alliance from within.', keyLesson: 'Innovation and strategy are part of the Sunnah — and Allah sends help from unseen sources.', quranicRef: 'Al-Ahzab 33:9-11' },
    { id: 'ch20', chapter: 20, title: 'Banu Qurayza', era: 'medina', year: '627 CE', summary: 'The Banu Qurayza broke their covenant during the siege and conspired with the Confederates. They were judged by Sa\'d ibn Mu\'adh according to the Torah\'s own law.', keyLesson: 'Treason in wartime has severe consequences in any legal system.' },
    { id: 'ch21', chapter: 21, title: 'The Treaty of Hudaybiyyah', era: 'medina', year: '628 CE', summary: 'What seemed like defeat was called "a clear victory" by Allah. The peace treaty allowed Islam to spread freely. More people embraced Islam in 2 years than in the previous 18.', keyLesson: 'Sometimes apparent setback is actually the greatest victory.', quranicRef: 'Al-Fath 48:1' },
    { id: 'ch22', chapter: 22, title: 'Letters to Kings', era: 'medina', year: '628 CE', summary: 'The Prophet ﷺ sent letters to Heraclius of Rome, Khosrow of Persia, Negus of Abyssinia, and others, inviting them to Islam. Islam became a global message.', keyLesson: 'The message of Islam is universal — for all people, all times, all places.' },
    { id: 'ch23', chapter: 23, title: 'Fulfilling the Treaty', era: 'medina', year: '629 CE', summary: 'The Umrah of fulfillment — Muslims returned to Mecca peacefully. Khalid ibn al-Waleed and Amr ibn al-As embraced Islam during this period.', keyLesson: 'Keeping promises opens hearts and draws people to truth.' },
    { id: 'ch24', chapter: 24, title: 'The Battle of Mu\'tah', era: 'medina', year: '629 CE', summary: '3,000 Muslims faced 200,000 Romans. Three commanders fell in succession: Zayd, Ja\'far, and Abdullah ibn Rawahah. Khalid ibn al-Waleed salvaged a tactical retreat.', keyLesson: 'True heroism is standing firm even when the odds are impossible.' },
    { id: 'ch25', chapter: 25, title: 'The Conquest of Mecca', era: 'medina', year: '630 CE', summary: '10,000 Muslims entered Mecca virtually without bloodshed. The Prophet ﷺ declared general amnesty: "Go, you are all free." The Ka\'bah was cleansed of 360 idols.', keyLesson: 'True power is shown through mercy, not revenge.' },
    { id: 'ch26', chapter: 26, title: 'The Battle of Hunayn', era: 'medina', year: '630 CE', summary: 'Immediately after Mecca, 12,000 Muslims faced the Hawazin. Initial overconfidence led to chaos, but the Prophet ﷺ stood firm and rallied his forces to victory.', keyLesson: 'Numbers alone don\'t guarantee victory — arrogance is a greater enemy than any army.', quranicRef: 'At-Tawbah 9:25-26' },
    { id: 'ch27', chapter: 27, title: 'The Expedition of Tabuk', era: 'medina', year: '630 CE', summary: 'The Prophet ﷺ marched to the Roman border with 30,000 — the largest Muslim army ever. The journey tested sincerity; those who stayed behind were exposed.', keyLesson: 'Sincerity is tested in moments of difficulty and sacrifice.' },
    { id: 'ch28', chapter: 28, title: 'The Year of Delegations', era: 'medina', year: '631 CE', summary: 'Tribes from across Arabia sent delegations to Medina to embrace Islam. The Arabian Peninsula was unified under the banner of La ilaha illAllah.', keyLesson: 'Truth ultimately prevails when people are given the freedom to choose.' },
    { id: 'ch29', chapter: 29, title: 'The Farewell Hajj', era: 'medina', year: '632 CE', summary: 'Over 100,000 Muslims performed Hajj with the Prophet ﷺ. His sermon at Arafat established human rights, racial equality, and the sanctity of life and property.', keyLesson: '"All mankind is from Adam and Eve. An Arab has no superiority over a non-Arab."' },
    { id: 'ch30', chapter: 30, title: 'The Greatest Calamity', era: 'medina', year: '632 CE', summary: 'The Prophet ﷺ fell ill and passed away in the arms of Aisha RA. Abu Bakr RA declared: "Whoever worshipped Muhammad, know that Muhammad has died. Whoever worshipped Allah, know that Allah is Ever-Living."', keyLesson: 'The message lives on forever — the Messenger was mortal, but his legacy is eternal.', quranicRef: 'Aal-Imran 3:144' },
];

// --- APOLOGETICS (The Armoury) ---

export interface ApologeticsCard {
    id: string;
    category: 'argument' | 'philosopher' | 'response';
    title: string;
    subtitle: string;
    front: string;
    back: string;
    source: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const APOLOGETICS_CARDS: ApologeticsCard[] = [
    { id: 'arg1', category: 'argument', title: 'The Kalam Cosmological Argument', subtitle: 'Why the Universe Needs a Cause', front: 'Everything that begins to exist has a cause. The universe began to exist. Therefore, the universe has a cause.', back: 'This argument, championed by Al-Ghazali, demonstrates that an infinite regress of causes is impossible. The universe must have an uncaused, necessary, eternal First Cause — and this is Allah, the Creator of all things.', source: 'Arguments for God\'s Existence (Erlwein), Ch. 8', difficulty: 'beginner' },
    { id: 'arg2', category: 'argument', title: 'The Contingency Argument', subtitle: 'Ibn Sina\'s Necessary Being', front: 'Everything in the universe is contingent — it could exist or not exist. But the chain of contingent things cannot go on forever. Why?', back: 'Ibn Sina argued that contingent beings require something external to bring them into existence. If everything were contingent, nothing would exist at all. There must be a Necessary Being (Wajib al-Wujud) whose existence is self-sufficient — this is Allah.', source: 'Arguments for God\'s Existence (Erlwein), Ch. 7', difficulty: 'intermediate' },
    { id: 'arg3', category: 'argument', title: 'The Teleological Argument', subtitle: 'Design Points to a Designer', front: 'The universe exhibits extraordinary fine-tuning and design. The fundamental constants of physics are calibrated to extraordinary precision. Coincidence?', back: 'Al-Kindi and Al-Maturidi both argued that the ordered structure of the cosmos — from the orbits of planets to DNA — points to a Wise Designer. The probability of these constants arising by chance is astronomically small. "Indeed, in the creation of the heavens and earth... are signs for those of understanding." (3:190)', source: 'Arguments for God\'s Existence (Erlwein), Ch. 3-4', difficulty: 'beginner' },
    { id: 'arg4', category: 'argument', title: 'The Moral Argument', subtitle: 'Without God, Morality Collapses', front: 'If there is no God, are moral values objective or merely human inventions? Can atheism ground the claim that murder is truly wrong?', back: 'Without a transcendent source of morality, ethical claims become mere preferences — no different from taste in food. Islam grounds objective morality in the nature and command of Allah, the All-Wise, All-Just. This is why moral realism demands theism.', source: 'Islam & Nihilism (Sapience Institute)', difficulty: 'beginner' },
    { id: 'arg5', category: 'argument', title: 'The Problem of Infinite Regress', subtitle: 'Al-Ghazali\'s Demolition', front: 'Can the past be infinite? If an infinite number of events must occur before today, would today ever arrive?', back: 'Al-Ghazali argued that an actual infinite series of past events is impossible. Just as you cannot count to infinity, you cannot traverse an infinite past. Therefore, the series of past events is finite, meaning the universe had a beginning — and whatever begins to exist has a cause.', source: 'Arguments for God\'s Existence (Erlwein), Ch. 8', difficulty: 'advanced' },
    { id: 'phil1', category: 'philosopher', title: 'Al-Kindi (d. 873 CE)', subtitle: 'The First Philosopher', front: 'The first major Islamic philosopher. He harmonized Greek philosophy with Islamic theology and was among the first to formulate arguments for God from the created world.', back: 'Al-Kindi\'s approach in "Fī al-Falsafa al-Ūlā" established that metaphysics\' primary concern is investigating the First Cause — the True One who is the source of all unity and existence in the cosmos.', source: 'Erlwein, Ch. 3', difficulty: 'intermediate' },
    { id: 'phil2', category: 'philosopher', title: 'Al-Ghazali (d. 1111 CE)', subtitle: 'The Proof of Islam', front: 'Perhaps the most influential Muslim intellectual in history. He demolished the philosophers\' claims of an eternal universe and revitalized Sunni theology with rigorous argumentation.', back: 'In "Tahafut al-Falasifa" (The Incoherence of the Philosophers), Al-Ghazali demonstrated 20 fundamental errors of the philosophers, while in "Ihya Ulum al-Din" he revived the spiritual heart of Islam. His Kalam cosmological argument remains powerful today.', source: 'Erlwein, Ch. 8', difficulty: 'beginner' },
    { id: 'phil3', category: 'philosopher', title: 'Ibn Sina (d. 1037 CE)', subtitle: 'The Master of Logic', front: 'The greatest polymath of the Islamic Golden Age. His distinction between necessary and contingent existence became foundational for all subsequent theology and philosophy.', back: 'Ibn Sina\'s argument: Every existent is either necessary or contingent. Contingent beings need an external cause. The chain of causes must terminate in a Necessary Being (Wajib al-Wujud) — whose essence IS existence itself. This is Allah.', source: 'Erlwein, Ch. 7', difficulty: 'advanced' },
    { id: 'resp1', category: 'response', title: 'Nihilism', subtitle: 'The Logical End of Atheism', front: 'If God does not exist, what gives life meaning? Atheistic thinkers from Nietzsche to Camus admitted that without God, life is ultimately absurd and meaningless.', back: 'Islam provides the antidote to nihilism: purpose (worship of Allah), meaning (being His khalifah on earth), hope (the Akhirah), and moral grounding (divine commands).', source: 'Islam & Nihilism (Sapience Institute)', difficulty: 'beginner' },
    { id: 'resp2', category: 'response', title: 'Scientism', subtitle: 'Is Science the Only Truth?', front: '"Only science gives us truth" — Can this claim itself be proven by science? Think carefully.', back: 'The claim "only scientific claims are valid" is itself NOT a scientific claim — it\'s a philosophical one. Therefore, by its own standard, it refutes itself. Science is a powerful tool, but it cannot address meaning, morality, or metaphysics.', source: 'Scientific Deception (Sapience Institute)', difficulty: 'beginner' },
];

// --- FOUNDATIONS & SUPPLICATIONS (The Sanctuary) ---

export interface FoundationTopic {
    id: string;
    pillar: 'tawheed' | 'ethics' | 'spirituality' | 'society';
    title: string;
    subtitle: string;
    content: string;
    quranicRef: string;
}

export const QURANIC_FOUNDATIONS: FoundationTopic[] = [
    { id: 'fw1', pillar: 'tawheed', title: 'Tawheed', subtitle: 'The Oneness of Allah', content: 'Tawheed is not merely believing that God exists — it is affirming that Allah alone deserves worship, that His names and attributes are unique, and that He alone governs the universe.', quranicRef: 'Al-Ikhlas 112:1-4' },
    { id: 'fw2', pillar: 'tawheed', title: 'Risalah', subtitle: 'Prophethood', content: 'Allah did not leave humanity without guidance. From Adam to Muhammad ﷺ, over 124,000 prophets were sent — each carrying the same essential message of Tawheed.', quranicRef: 'An-Nahl 16:36' },
    { id: 'fw3', pillar: 'tawheed', title: 'Akhirah', subtitle: 'The Hereafter', content: 'Belief in the Akhirah gives every action weight and consequence. Without it, justice is incomplete. The Hereafter is where ultimate justice is served.', quranicRef: 'Az-Zalzalah 99:7-8' },
    { id: 'fw4', pillar: 'ethics', title: 'Adl (Justice)', subtitle: 'The Pillar of Society', content: 'The Quran commands justice even if it goes against oneself or one\'s family. Justice in Islam is objective, rooted in divine command.', quranicRef: 'An-Nisa 4:135' },
    { id: 'fw5', pillar: 'ethics', title: 'Ihsan', subtitle: 'Excellence', content: 'Ihsan means worshipping Allah as if you see Him. It extends to doing your work with excellence and treating people with beauty.', quranicRef: 'An-Nahl 16:90' },
    { id: 'fw6', pillar: 'spirituality', title: 'Dhikr', subtitle: 'Remembrance', content: 'The Quran declares that hearts find rest only in the remembrance of Allah. Dhikr is conscious connection with the Divine.', quranicRef: 'Ar-Ra\'d 13:28' },
    { id: 'fw7', pillar: 'spirituality', title: 'Tawbah', subtitle: 'The Return', content: 'Allah\'s mercy encompasses all things. No sin is too great for His forgiveness. Tawbah is a dignified return to one\'s true nature.', quranicRef: 'Az-Zumar 39:53' },
    { id: 'fw8', pillar: 'society', title: 'The Ummah', subtitle: 'A Community of Purpose', content: 'Islam envisions a community united not by race or nation, but by faith. The Ummah is tasked with standing for justice on earth.', quranicRef: 'Aal-Imran 3:110' },
];

export interface Supplication {
    id: string;
    category: 'protection' | 'guidance' | 'gratitude' | 'forgiveness';
    arabic: string;
    transliteration: string;
    translation: string;
    reference: string;
}

export const SUPPLICATIONS: Supplication[] = [
    { id: 'dua1', category: 'guidance', arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', transliteration: 'Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan waqina \'adhaban-nar', translation: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.', reference: 'Al-Baqarah 2:201' },
    { id: 'dua2', category: 'guidance', arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي', transliteration: 'Rabbish-rahli sadri wa yassirli amri', translation: 'My Lord, expand for me my chest and ease for me my task.', reference: 'Ta-Ha 20:25-26' },
    { id: 'dua3', category: 'forgiveness', arabic: 'رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ', transliteration: 'Rabbana zalamna anfusana wa il-lam taghfir lana wa tarhamna lanakunanna minal-khasireen', translation: 'Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.', reference: 'Al-A\'raf 7:23' },
    { id: 'dua4', category: 'protection', arabic: 'رَبِّ أَعُوذُ بِكَ مِنْ هَمَزَاتِ الشَّيَاطِينِ وَأَعُوذُ بِكَ رَبِّ أَن يَحْضُرُونِ', transliteration: 'Rabbi a\'udhu bika min hamazatish-shayateen wa a\'udhu bika rabbi an yahdurun', translation: 'My Lord, I seek refuge in You from the whispers of the devils, and I seek refuge in You lest they be present with me.', reference: 'Al-Mu\'minun 23:97-98' },
    { id: 'dua8', category: 'protection', arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', transliteration: 'Hasbunallahu wa ni\'mal-wakeel', translation: 'Sufficient for us is Allah, and He is the best Disposer of affairs.', reference: 'Aal-Imran 3:173' },
];

// --- TREASURY (Keys to Jannah) ---

export interface TreasureKey {
    id: string;
    time: 'morning' | 'evening' | 'anytime';
    title: string;
    arabic: string;
    transliteration: string;
    translation: string;
    count: number;
    reward: string;
}

export const TREASURE_KEYS: TreasureKey[] = [
    { id: 'tk1', time: 'morning', title: 'Sayyid al-Istighfar', arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ', transliteration: 'Allahumma anta Rabbi la ilaha illa anta...', translation: 'O Allah, You are my Lord, there is no god but You...', count: 1, reward: 'Entering Paradise' },
    { id: 'tk2', time: 'morning', title: 'Protection', arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ', transliteration: 'Bismillahil-ladhi la yadurru...', translation: 'In the name of Allah, with whose name nothing can cause harm.', count: 3, reward: 'Complete Protection' },
    { id: 'tk3', time: 'anytime', title: 'Treasure of Paradise', arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', transliteration: 'La hawla wa la quwwata illa billah', translation: 'There is no power and no strength except with Allah.', count: 100, reward: 'Treasure of Jannah' },
    { id: 'tk4', time: 'anytime', title: 'SubhanAllah wa Bihamdihi', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', transliteration: 'SubhanAllahi wa bihamdihi', translation: 'Glory be to Allah and His is the praise.', count: 100, reward: 'Sins forgiven like foam of the sea' },
];

// --- THE LIBRARY (Ansari & Collection) ---

export interface LibraryBook {
    id: string;
    title: string;
    author: string;
    color: string;
    description: string;
}

export const LIBRARY_COLLECTION: LibraryBook[] = [
    { id: 'bk1', title: 'Quranic Foundations Vol. 1', author: 'Dr. Fazl-Ur-Rahman Ansari', color: '#d4af37', description: 'The absolute principles of Islamic belief and worldview.' },
    { id: 'bk2', title: 'Quranic Foundations Vol. 2', author: 'Dr. Fazl-Ur-Rahman Ansari', color: '#b8860b', description: 'The structure of Muslim society, ethics, and law.' },
    { id: 'bk3', title: 'Islam to the Modern Mind', author: 'Dr. Fazl-Ur-Rahman Ansari', color: '#0891b2', description: 'Presenting Islam rationally to the contemporary intellect.' },
    { id: 'bk4', title: 'The Sīrah of the Prophet ﷺ', author: 'Dr. Yasir Qadhi', color: '#064e3b', description: 'A comprehensive analysis of the Prophetic biography.' },
    { id: 'bk5', title: 'Arguments for God\'s Existence', author: 'Hannah C. Erlwein', color: '#1e40af', description: 'Revisiting classical Islamic theological proofs.' },
];

// --- WAZIFAS (Spiritual Area) ---

export interface Wazifa {
    id: string;
    title: string;
    count: number;
    benefit: string;
}

export const WAZIFAS: Wazifa[] = [
    { id: 'w1', title: 'Ya Hayyu Ya Qayyum', count: 100, benefit: 'For life and sustenance' },
    { id: 'w2', title: 'Hasbunallahu wa Ni\'mal Wakeel', count: 313, benefit: 'For protection against enemies' },
    { id: 'w3', title: 'Salat al-Fatih', count: 100, benefit: 'Opening of doors' },
];
