import React from 'react';
import { X, CalendarDays, CheckCircle2, Award, Moon, Star } from 'lucide-react';
import { JUMUAH_CHECKLIST } from '../constants';
import { User, QuestCategory, Quest } from '../types';

interface JumuahTrackerProps {
    user: User;
    onClose: () => void;
    completeQuest: (quest: Partial<Quest>) => void;
    isCompletedToday: (id: string) => boolean;
    darkMode?: boolean;
}

const JumuahTracker: React.FC<JumuahTrackerProps> = ({ user, onClose, completeQuest, isCompletedToday, darkMode }) => {
    const completedCount = JUMUAH_CHECKLIST.filter(item => isCompletedToday(item.id)).length;
    const totalXP = JUMUAH_CHECKLIST.reduce((acc, item) => isCompletedToday(item.id) ? acc + item.xp : acc, 0);

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in`}>
            <div className={`w-full max-w-lg max-h-[90vh] flex flex-col rounded-[32px] shadow-2xl overflow-hidden relative border ${darkMode ? 'bg-[#121212] border-white/10' : 'bg-[#f9f8f6] border-[#e0dcd3]'}`}>

                {/* Header Section */}
                <div className={`relative p-8 pb-12 overflow-hidden shrink-0 border-b ${darkMode ? 'border-white/5 bg-[#0a0a0a]' : 'border-[#e0dcd3]/50 bg-[#f9f8f6]'}`}>
                    {/* Atmospheric Image Background with Grain */}
                    <div
                        className="absolute inset-0 z-0 bg-cover bg-center opacity-30 mix-blend-overlay filter contrast-125 saturate-50"
                        style={{ backgroundImage: 'url("/images/pexels-mohamedbinzayed-8233715.jpg")' }}
                    />
                    {/* Gradient Fade & Noise Texture Overlay */}
                    <div className={`absolute inset-0 z-0 bg-gradient-to-t ${darkMode ? 'from-[#0a0a0a] to-[#0a0a0a]/80' : 'from-[#f9f8f6] to-[#fffdfa]/80'}`} />
                    <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

                    {/* Subtle star pattern / decorations */}
                    <div className={`absolute top-4 right-6 opacity-5 ${darkMode ? 'text-white' : 'text-[#2c2b29]'}`}>
                        <Star size={120} />
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center mt-2">
                        <div className="flex items-center gap-2 mb-4">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-medium uppercase tracking-widest shadow-sm flex items-center gap-1 border ${darkMode ? 'bg-white/5 border-white/10 text-white/80' : 'bg-white border-[#e0dcd3] text-[#8a8782]'}`}>
                                <CalendarDays size={10} /> WEEKLY BLESSINGS
                            </span>
                        </div>
                        <h2 className={`font-['Playfair_Display',serif] text-4xl italic tracking-wide mb-3 drop-shadow-sm ${darkMode ? 'text-[#e0dcd3]' : 'text-[#2c2b29]'}`}>
                            Jumu'ah Checklist
                        </h2>
                        <p className={`text-[13px] font-medium max-w-[85%] leading-relaxed ${darkMode ? 'text-white/60' : 'text-[#8a8782]'}`}>
                            Sunnah acts for Friday. Complete them before Maghrib to secure full XP for the day.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className={`absolute top-4 right-4 p-2 rounded-full border transition-colors shadow-sm ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white/50' : 'bg-white border-[#e0dcd3] hover:border-[#d4af37] text-[#8a8782]'}`}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Floating Stat Bar */}
                <div className={`relative -mt-6 mx-8 p-4 rounded-[20px] flex items-center justify-around shadow-sm z-20 backdrop-blur-md border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-[#e0dcd3]'}`}>
                    <div className="text-center w-1/2">
                        <p className={`text-[9px] font-bold uppercase tracking-widest ${darkMode ? 'text-white/40' : 'text-[#8a8782]'}`}>Completed</p>
                        <p className={`text-xl font-['Playfair_Display',serif] italic mt-1 ${darkMode ? 'text-[#e0dcd3]' : 'text-[#2c2b29]'}`}>{completedCount} <span className="text-sm not-italic opacity-50">/ {JUMUAH_CHECKLIST.length}</span></p>
                    </div>
                    <div className={`w-px h-10 ${darkMode ? 'bg-white/10' : 'bg-[#e0dcd3]/50'}`}></div>
                    <div className="text-center w-1/2">
                        <p className={`text-[9px] font-bold uppercase tracking-widest ${darkMode ? 'text-[#d4af37]/80' : 'text-[#d4af37]'}`}>XP Earned</p>
                        <p className={`text-xl font-['Playfair_Display',serif] italic mt-1 flex items-center justify-center gap-1.5 ${darkMode ? 'text-[#e0dcd3]' : 'text-[#2c2b29]'}`}>
                            <Award size={16} className={`${darkMode ? 'text-[#d4af37]/80' : 'text-[#d4af37]'}`} />
                            +{totalXP}
                        </p>
                    </div>
                </div>

                {/* Content Section (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 pt-4 pb-12 relative z-10">
                    <div className="space-y-3">
                        {JUMUAH_CHECKLIST.map(item => {
                            const isDone = isCompletedToday(item.id);
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => !isDone && completeQuest({ id: item.id, title: item.title, xp: item.xp, category: QuestCategory.DHIKR, description: '' })}
                                    disabled={isDone}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl text-left transition-all border ${isDone
                                        ? (darkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200 shadow-inner')
                                        : darkMode
                                            ? 'bg-transparent border-white/10 hover:border-white/20 hover:bg-white/5'
                                            : 'bg-transparent border-[#e0dcd3] hover:border-[#d4af37] hover:bg-white/50 shadow-sm'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${isDone ? (darkMode ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-white border-emerald-500 text-emerald-600 shadow-sm') : 'border-slate-300 dark:border-slate-600 text-transparent'}`}>
                                            {isDone && <CheckCircle2 size={16} strokeWidth={2.5} />}
                                        </div>
                                        <div>
                                            <span className={`text-[15px] font-medium ${isDone ? 'opacity-50' : ''} ${darkMode ? 'text-white' : 'text-slate-800'}`}>{item.title}</span>
                                        </div>
                                    </div>
                                    <span className={`text-lg font-['Playfair_Display',serif] italic ${isDone ? 'opacity-50' : ''} ${darkMode ? 'text-[#d4af37]' : 'text-[#8b6914]'}`}>+{item.xp} <span className="text-[9px] uppercase tracking-widest not-italic opacity-70">XP</span></span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JumuahTracker;
