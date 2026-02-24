const fs = require('fs');

let content = fs.readFileSync('src/constants.ts', 'utf8');

// The new items we want to inject per prayer
const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

// Let's create the boilerplate quest objects
let extraQuests = ``;
prayers.forEach(p => {
  extraQuests += `  { id: '${p}-miswak', title: 'Use Miswak', description: 'Sunnah of oral hygiene before prayer.', category: QuestCategory.SUNNAH, xp: 50, isPackage: true },\n`;
  extraQuests += `  { id: '${p}-wudhu', title: 'Make Wudhu', description: 'Purify yourself for prayer.', category: QuestCategory.MAIN, xp: 50, isPackage: true },\n`;
  extraQuests += `  { id: '${p}-tahiyyatul_wudhu', title: 'Tahiyyatul Wudhu', description: 'Pray 2 Rakaats after Wudhu.', category: QuestCategory.SUNNAH, xp: 100, isPackage: true },\n`;
  extraQuests += `  { id: '${p}-tahiyyatul_masjid', title: 'Tahiyyatul Masjid', description: 'Pray 2 Rakaats upon entering Masjid.', category: QuestCategory.SUNNAH, xp: 100, isPackage: true },\n`;
  extraQuests += `  { id: '${p}-tasbeeh_fatimi', title: 'Tasbeeh Fatimi', description: '33x SubhanAllah, 33x Alhamdulillah, 34x Allahu Akbar', category: QuestCategory.DHIKR, xp: 100, isPackage: true },\n`;
});

// We need to insert extraQuests before "];\n\nexport const PRAYER_PACKAGES"
content = content.replace(/];\n\nexport const PRAYER_PACKAGES/g, extraQuests + `];\n\nexport const PRAYER_PACKAGES`);

// Now update PRAYER_PACKAGES mapping
const newPackages = {
  'tahajjud': ['tahajjud-istighfar', 'tahajjud-surah_sajdah', 'tahajjud-witr'],
  'fajr': ['fajr-miswak', 'fajr-wudhu', 'fajr-tahiyyatul_wudhu', 'fajr-tahiyyatul_masjid', 'fajr-sunnah', 'fajr-ayatul_kursi', 'fajr-adhkar', 'fajr-surah', 'fajr-tasbeeh_fatimi'],
  'dhuhr': ['dhuhr-miswak', 'dhuhr-wudhu', 'dhuhr-tahiyyatul_wudhu', 'dhuhr-tahiyyatul_masjid', 'dhuhr-sunnah-pre', 'dhuhr-sunnah-post', 'dhuhr-ayatul_kursi', 'dhuhr-adhkar', 'dhuhr-surah', 'dhuhr-tasbeeh_fatimi'],
  'asr': ['asr-miswak', 'asr-wudhu', 'asr-tahiyyatul_wudhu', 'asr-tahiyyatul_masjid', 'asr-sunnah', 'asr-ayatul_kursi', 'asr-adhkar', 'asr-surah', 'asr-tasbeeh_fatimi'],
  'maghrib': ['maghrib-miswak', 'maghrib-wudhu', 'maghrib-tahiyyatul_wudhu', 'maghrib-tahiyyatul_masjid', 'maghrib-sunnah', 'maghrib-ayatul_kursi', 'maghrib-adhkar', 'maghrib-surah', 'maghrib-tasbeeh_fatimi'],
  'isha': ['isha-miswak', 'isha-wudhu', 'isha-tahiyyatul_wudhu', 'isha-tahiyyatul_masjid', 'isha-sunnah', 'isha-ayatul_kursi', 'isha-adhkar', 'isha-surah', 'isha-witr', 'isha-tasbeeh_fatimi']
};

content = content.replace(/export const PRAYER_PACKAGES: Record<string, string\[\]> = \{[^}]+\};/m, 
  `export const PRAYER_PACKAGES: Record<string, string[]> = ` + JSON.stringify(newPackages, null, 2).replace(/"/g, "'") + `;`
);

fs.writeFileSync('src/constants.ts', content);
