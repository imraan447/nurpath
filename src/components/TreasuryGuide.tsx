
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Shield, Clock, CalendarDays, Key, Star, ChevronRight, Moon, Sun, 
  Heart, Zap, Anchor, Eye, X, Scroll, Feather, Library, ArrowLeft, Grid, List, 
  Sparkles, RotateCcw, ChevronDown, CheckCircle2 
} from 'lucide-react';
import { 
  SPECIAL_SURAHS, JUMUAH_ROUTINE, PROPHETIC_TIMELINE, WAZIFA_ITEMS, 
  SEERAH_CHAPTERS, ALL_99_NAMES, LIBRARY_BOOKS 
} from '../constants';

const Citadel: React.FC<{ darkMode?: boolean }> = ({ darkMode }) => {
  const [view, setView] = useState<'home' | 'treasures' | 'names' | 'quran' | 'hadith' | 'library' | 'seerah'>('home');
  const [loading, setLoading] = useState(false);

  // --- SUB-VIEWS ---

  const renderHome = () => (
    <div className="space-y-6 px-6 pt-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="relative p-8 rounded-[40px] bg-gradient-to-br from-[#064e3b] to-[#042f24] shadow-2xl overflow-hidden text-center text-white minaret-shape border-4 border-[#d4af37]">
         <div className="absolute top-0 right-0 p-10 opacity-10"><Shield size={150} /></div>
         <h1 className="text-4xl font-serif font-bold mb-2 tracking-tight">The Citadel</h1>
         <p className="text-[#d4af37] text-xs font-black uppercase tracking-[0.4em]">Fortress of Faith</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <ModuleCard 
           title="Treasures" 
           subtitle="Wazifa & Routine" 
           icon={<Key size={24} />} 
           color="bg-amber-500" 
           onClick={() => setView('treasures')} 
         />
         <ModuleCard 
           title="99 Names" 
           subtitle="Asma-ul-Husna" 
           icon={<Sparkles size={24} />} 
           color="bg-emerald-600" 
           onClick={() => setView('names')} 
         />
         <ModuleCard 
           title="The Quran" 
           subtitle="Divine Speech" 
           icon={<BookOpen size={24} />} 
           color="bg-sky-600" 
           onClick={() => setView('quran')} 
         />
         <ModuleCard 
           title="Hadith" 
           subtitle="Prophetic Wisdom" 
           icon={<Scroll size={24} />} 
           color="bg-rose-500" 
           onClick={() => setView('hadith')} 
         />
         <ModuleCard 
           title="Library" 
           subtitle="Knowledge Base" 
           icon={<Library size={24} />} 
           color="bg-indigo-500" 
           onClick={() => setView('library')} 
         />
         <ModuleCard 
           title="Seerah" 
           subtitle="Timeline of Light" 
           icon={<Feather size={24} />} 
           color="bg-slate-600" 
           onClick={() => setView('seerah')} 
         />
      </div>
    </div>
  );

  const renderTreasures = () => (
    <div className="space-y-6 px-6 pt-4 animate-in fade-in slide-in-from-right-10">
       <div className="space-y-4">
          <h2 className="text-2xl font-bold dark:text-white">Keys to Jannah</h2>
          <p className="text-sm text-slate-500 leading-relaxed">Specific routines and Azkar prescribed for protection and elevation.</p>
       </div>
       
       <div className="space-y-4">
          {WAZIFA_ITEMS.map(item => (
             <WazifaCard key={item.id} item={item} darkMode={darkMode} />
          ))}
       </div>

       <div className="mt-8">
          <h3 className="text-lg font-bold mb-4 dark:text-white">The 5 Keys (Special Surahs)</h3>
          <div className="space-y-3">
             {SPECIAL_SURAHS.map((s, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-[#064e3b]/10 text-[#064e3b] flex items-center justify-center shrink-0">
                      <s.icon size={20} />
                   </div>
                   <div>
                      <h4 className="font-bold text-sm dark:text-white">{s.name}</h4>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{s.time}</p>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );

  const renderNames = () => (
    <div className="space-y-6 px-6 pt-4 animate-in fade-in zoom-in-95">
       <div className="text-center space-y-2 mb-6">
          <h2 className="text-3xl font-serif font-bold text-[#d4af37]">Asma-ul-Husna</h2>
          <p className="text-xs text-slate-400 uppercase tracking-widest">The 99 Beautiful Names</p>
       </div>
       
       <div className="grid grid-cols-2 gap-3">
          {ALL_99_NAMES.map(name => (
             <NameCard key={name.id} name={name} darkMode={darkMode} />
          ))}
       </div>
    </div>
  );

  const renderQuran = () => {
    // Basic implementation using fetch in a useEffect inside a component
    return <QuranModule darkMode={darkMode} />;
  };

  const renderHadith = () => {
    return <HadithModule darkMode={darkMode} />;
  };

  const renderLibrary = () => (
    <div className="space-y-6 px-6 pt-4 animate-in fade-in slide-in-from-bottom-10">
       <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold dark:text-white">The Library</h2>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-white/10 px-3 py-1 rounded-full">Free Resources</span>
       </div>
       
       <div className="grid grid-cols-2 gap-4">
          {LIBRARY_BOOKS.map(book => (
             <div key={book.id} className="group relative aspect-[2/3] rounded-2xl overflow-hidden shadow-md cursor-pointer" onClick={() => window.open(book.readUrl, '_blank')}>
                <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                   <h4 className="text-white font-bold text-sm leading-tight mb-1">{book.title}</h4>
                   <p className="text-white/60 text-[10px]">{book.author}</p>
                </div>
                <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                   <BookOpen size={16} className="text-white" />
                </div>
             </div>
          ))}
       </div>
    </div>
  );

  const renderSeerah = () => (
    <div className="space-y-8 px-6 pt-4 animate-in fade-in slide-in-from-right-10">
       <div className="text-center">
          <h2 className="text-2xl font-bold dark:text-white">The Life of Muhammad ﷺ</h2>
          <p className="text-xs text-[#064e3b] dark:text-[#d4af37] font-bold uppercase tracking-widest mt-1">Timeline of Revelation</p>
       </div>

       <div className="relative pl-4 space-y-12 before:absolute before:left-[27px] before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-[#d4af37] before:via-[#064e3b] before:to-slate-200 dark:before:to-white/5">
          {SEERAH_CHAPTERS.map((chapter, idx) => (
             <div key={chapter.id} className="relative pl-12">
                {/* Connector Dot */}
                <div className="absolute left-[19px] top-6 w-4 h-4 rounded-full bg-[#fdfbf7] dark:bg-[#050a09] border-4 border-[#d4af37] z-10" />
                
                <div className="p-6 bg-white dark:bg-white/5 rounded-[30px] shadow-sm border border-slate-100 dark:border-white/10 hover:shadow-md transition-all">
                   <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 rounded-full bg-[#064e3b]/10 text-[#064e3b] dark:text-[#d4af37] text-[10px] font-black uppercase tracking-widest">
                         {chapter.year}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{chapter.period}</span>
                   </div>
                   <h3 className="text-xl font-bold mb-3 font-serif dark:text-white">{chapter.title}</h3>
                   <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {chapter.content}
                   </p>
                </div>
             </div>
          ))}
       </div>
    </div>
  );

  return (
    <div className={`min-h-screen pb-40 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
      {/* Dynamic Header */}
      {view !== 'home' && (
         <div className="sticky top-0 z-20 bg-[#fdfbf7]/80 dark:bg-[#050a09]/80 backdrop-blur-md border-b border-slate-100 dark:border-white/5 p-4 flex items-center gap-4 animate-in slide-in-from-top-2">
            <button onClick={() => setView('home')} className="p-2 bg-slate-100 dark:bg-white/10 rounded-full hover:bg-slate-200 transition-colors">
               <ArrowLeft size={20} />
            </button>
            <h2 className="text-lg font-bold capitalize">{view}</h2>
         </div>
      )}

      {/* Main Content Area */}
      <div className="pb-10">
         {view === 'home' && renderHome()}
         {view === 'treasures' && renderTreasures()}
         {view === 'names' && renderNames()}
         {view === 'quran' && renderQuran()}
         {view === 'hadith' && renderHadith()}
         {view === 'library' && renderLibrary()}
         {view === 'seerah' && renderSeerah()}
      </div>
    </div>
  );
};

// --- SUB COMPONENTS ---

const ModuleCard = ({ title, subtitle, icon, color, onClick }: any) => (
  <button onClick={onClick} className="relative overflow-hidden p-5 rounded-[30px] bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 shadow-sm text-left group hover:scale-[1.02] transition-transform">
     <div className={`w-10 h-10 rounded-2xl ${color} flex items-center justify-center text-white mb-4 shadow-lg`}>
        {icon}
     </div>
     <h3 className="font-bold text-lg leading-tight dark:text-white">{title}</h3>
     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{subtitle}</p>
     <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${color} opacity-10 group-hover:opacity-20 transition-opacity`} />
  </button>
);

const WazifaCard = ({ item, darkMode }: any) => {
   const [isOpen, setIsOpen] = useState(false);
   const [count, setCount] = useState(0);

   return (
      <div className={`rounded-[30px] border transition-all duration-300 overflow-hidden ${isOpen ? 'bg-white dark:bg-white/5 border-[#064e3b]/20 dark:border-[#d4af37]/20 shadow-md' : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/10'}`}>
         <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
            <div className="flex items-center gap-4">
               <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${count >= item.count ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 dark:border-white/20 text-slate-300'}`}>
                  {count >= item.count ? <CheckCircle2 size={24} /> : <div className="font-black text-xs">{item.count}x</div>}
               </div>
               <div>
                  <h3 className="font-bold text-lg dark:text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400">{item.time}</p>
               </div>
            </div>
            <ChevronDown className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} size={20} />
         </div>
         
         {isOpen && (
            <div className="px-5 pb-5 animate-in slide-in-from-top-2">
               <div className="p-6 bg-slate-50 dark:bg-black/20 rounded-3xl mb-4 border border-slate-100 dark:border-white/5">
                  <p className="quran-font text-3xl text-center leading-[2.2] mb-4 dark:text-white" dir="rtl">{item.arabic}</p>
                  <p className="text-sm text-center text-slate-500 italic">{item.translation}</p>
               </div>
               <div className="flex justify-center">
                  <button 
                    onClick={() => setCount(prev => prev + 1)}
                    className="w-full py-4 bg-[#064e3b] active:bg-[#053c2e] text-white rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                     <RotateCcw size={16} /> Tap to Count ({count})
                  </button>
               </div>
            </div>
         )}
      </div>
   );
};

const NameCard = ({ name, darkMode }: { name: any, darkMode?: boolean }) => {
   const [flipped, setFlipped] = useState(false);
   return (
      <div 
        onClick={() => setFlipped(!flipped)}
        className="aspect-square relative perspective cursor-pointer group"
      >
         <div className={`w-full h-full duration-500 preserve-3d absolute inset-0 transition-transform ${flipped ? 'rotate-y-180' : ''}`}>
            {/* Front */}
            <div className="backface-hidden absolute inset-0 bg-gradient-to-br from-emerald-500 to-[#064e3b] rounded-[30px] flex flex-col items-center justify-center text-white p-4 shadow-lg border border-white/10">
               <span className="text-[10px] font-black opacity-60 absolute top-4 right-4">#{name.id}</span>
               <h3 className="quran-font text-4xl mb-2">{name.arabic}</h3>
               <p className="font-bold text-xs uppercase tracking-widest text-[#d4af37]">{name.transliteration}</p>
            </div>
            {/* Back */}
            <div className="backface-hidden absolute inset-0 bg-white dark:bg-slate-800 rounded-[30px] rotate-y-180 flex flex-col items-center justify-center p-4 text-center border-2 border-[#d4af37] shadow-xl">
               <h4 className="font-bold text-sm text-[#064e3b] dark:text-[#d4af37] mb-2">{name.meaning}</h4>
               <p className="text-[10px] text-slate-500 dark:text-slate-300 leading-relaxed overflow-y-auto max-h-[80px] scrollbar-hide">{name.explanation}</p>
            </div>
         </div>
      </div>
   );
};

// --- API BASED MODULES ---

const QuranModule = ({ darkMode }: { darkMode?: boolean }) => {
   const [surahs, setSurahs] = useState<any[]>([]);
   const [selectedSurah, setSelectedSurah] = useState<any | null>(null);
   const [ayahs, setAyahs] = useState<any[]>([]);
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      fetch('https://api.alquran.cloud/v1/surah')
         .then(res => res.json())
         .then(data => setSurahs(data.data));
   }, []);

   const loadSurah = async (surah: any) => {
      setLoading(true);
      setSelectedSurah(surah);
      try {
         const res = await fetch(`https://api.alquran.cloud/v1/surah/${surah.number}`);
         const data = await res.json();
         setAyahs(data.data.ayahs);
      } catch (e) { console.error(e); }
      setLoading(false);
   };

   if (selectedSurah) {
      return (
         <div className="px-4 pt-4 h-full flex flex-col animate-in slide-in-from-right-10">
            <button onClick={() => setSelectedSurah(null)} className="mb-4 flex items-center gap-2 text-xs font-bold text-slate-400">
               <ArrowLeft size={16} /> Back to Index
            </button>
            <div className="text-center mb-8 bg-[#064e3b]/5 dark:bg-white/5 p-6 rounded-[30px]">
               <h2 className="quran-font text-4xl mb-2 dark:text-white">{selectedSurah.name}</h2>
               <p className="text-sm font-bold text-[#d4af37]">{selectedSurah.englishName}</p>
               <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{selectedSurah.englishNameTranslation}</p>
            </div>
            {loading ? <div className="text-center p-10"><Clock className="animate-spin mx-auto text-[#d4af37]" /></div> : (
               <div className="space-y-6 pb-20">
                  {ayahs.map((ayah: any) => (
                     <div key={ayah.number} className="p-4 border-b border-slate-100 dark:border-white/5 last:border-0">
                        <div className="flex justify-between items-start gap-4 mb-4">
                           <span className="w-8 h-8 rounded-full border border-[#d4af37] text-[#d4af37] flex items-center justify-center text-[10px] font-bold shrink-0">{ayah.numberInSurah}</span>
                           <p className="quran-font text-2xl text-right leading-[2.5] dark:text-white" dir="rtl">{ayah.text}</p>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      );
   }

   return (
      <div className="px-4 pt-4 space-y-3 pb-20 animate-in fade-in">
         {surahs.map((s: any) => (
            <div key={s.number} onClick={() => loadSurah(s)} className="p-4 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-white/10">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-white/10 rounded-xl flex items-center justify-center font-black text-sm text-slate-400">{s.number}</div>
                  <div>
                     <h4 className="font-bold text-sm dark:text-white">{s.englishName}</h4>
                     <p className="text-[10px] text-slate-400">{s.englishNameTranslation} • {s.numberOfAyahs} Ayahs</p>
                  </div>
               </div>
               <span className="quran-font text-xl dark:text-white">{s.name.replace('سُورَةُ', '')}</span>
            </div>
         ))}
      </div>
   );
};

const HadithModule = ({ darkMode }: { darkMode?: boolean }) => {
   // Hardcoded "Gems" simulation since full API implementation is complex for this demo
   const [activeTab, setActiveTab] = useState<'bukhari' | 'muslim'>('bukhari');
   const gems = [
      { text: "Actions are but by intentions, and every man shall have that which he intended.", source: "Sahih Bukhari 1" },
      { text: "None of you truly believes until he loves for his brother what he loves for himself.", source: "Sahih Bukhari 13" },
      { text: "The strong believer is better and more beloved to Allah than the weak believer, while there is good in both.", source: "Sahih Muslim 2664" },
      { text: "Be in this world as if you were a stranger or a traveler.", source: "Sahih Bukhari 6416" }
   ];

   return (
      <div className="px-6 pt-4 space-y-6 animate-in fade-in">
         <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl">
            <button onClick={() => setActiveTab('bukhari')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'bukhari' ? 'bg-white dark:bg-white/10 shadow text-[#064e3b] dark:text-white' : 'text-slate-400'}`}>Bukhari</button>
            <button onClick={() => setActiveTab('muslim')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'muslim' ? 'bg-white dark:bg-white/10 shadow text-[#064e3b] dark:text-white' : 'text-slate-400'}`}>Muslim</button>
         </div>

         <div className="bg-[#d4af37]/10 p-6 rounded-[30px] border border-[#d4af37]/20 text-center">
            <Star className="mx-auto text-[#d4af37] mb-3" fill="currentColor" />
            <h3 className="font-bold text-lg mb-2 dark:text-white">Gem of the Day</h3>
            <p className="font-serif text-xl leading-relaxed text-slate-700 dark:text-slate-200 mb-4">"{gems[Math.floor(Math.random() * gems.length)].text}"</p>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#064e3b] dark:text-[#d4af37]">{gems[0].source}</span>
         </div>

         <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest">Chapters</h3>
            {[1, 2, 3, 4, 5].map(i => (
               <div key={i} className="p-5 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div>
                     <h4 className="font-bold dark:text-white">Book {i}</h4>
                     <p className="text-xs text-slate-400">Faith, Knowledge, Prayer...</p>
                  </div>
                  <button className="px-4 py-2 bg-slate-100 dark:bg-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest">Read</button>
               </div>
            ))}
         </div>
      </div>
   );
};

export default Citadel;
