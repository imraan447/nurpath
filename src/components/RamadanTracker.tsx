import React from 'react';
import { Moon, Star, Check, X, CalendarDays, Award } from 'lucide-react';
import { User } from '../types';

interface RamadanTrackerProps {
    user: User;
    onClose: () => void;
    onToggleDay: (day: number) => void;
    darkMode?: boolean;
}

const RamadanTracker: React.FC<RamadanTrackerProps> = ({ user, onClose, onToggleDay, darkMode }) => {
    const completedDays = user.settings?.ramadan_tracker || [];
    const totalDays = 30;

    // Create an array 1 to 30
    const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

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
                        <Moon size={120} />
                    </div>

                    <div className="relative z-10 flex flex-col items-center text-center mt-2">
                        <div className="flex items-center gap-2 mb-4">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-medium uppercase tracking-widest shadow-sm flex items-center gap-1 border ${darkMode ? 'bg-white/5 border-white/10 text-white/80' : 'bg-white border-[#e0dcd3] text-[#8a8782]'}`}>
                                <CalendarDays size={10} /> HOLY MONTH
                            </span>
                        </div>
                        <h2 className={`font-['Playfair_Display',serif] text-4xl italic tracking-wide mb-3 drop-shadow-sm ${darkMode ? 'text-[#e0dcd3]' : 'text-[#2c2b29]'}`}>
                            Ramadan Tracker
                        </h2>
                        <p className={`text-[13px] font-medium max-w-[85%] leading-relaxed ${darkMode ? 'text-white/60' : 'text-[#8a8782]'}`}>
                            Mark off your daily fasts. Each completed day secures 200 XP to your journey.
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
                        <p className={`text-xl font-['Playfair_Display',serif] italic mt-1 ${darkMode ? 'text-[#e0dcd3]' : 'text-[#2c2b29]'}`}>{completedDays.length} <span className="text-sm not-italic opacity-50">/ 30</span></p>
                    </div>
                    <div className={`w-px h-10 ${darkMode ? 'bg-white/10' : 'bg-[#e0dcd3]/50'}`}></div>
                    <div className="text-center w-1/2">
                        <p className={`text-[9px] font-bold uppercase tracking-widest ${darkMode ? 'text-[#d4af37]/80' : 'text-[#d4af37]'}`}>XP Earned</p>
                        <p className={`text-xl font-['Playfair_Display',serif] italic mt-1 flex items-center justify-center gap-1.5 ${darkMode ? 'text-[#e0dcd3]' : 'text-[#2c2b29]'}`}>
                            <Award size={16} className={`${darkMode ? 'text-[#d4af37]/80' : 'text-[#d4af37]'}`} />
                            +{completedDays.length * 200}
                        </p>
                    </div>
                </div>

                {/* Scrollable Calendar Grid */}
                <div className="flex-1 overflow-y-auto p-6 pt-8 scrollbar-hide">
                    <div className="grid grid-cols-5 gap-3 sm:gap-4">
                        {daysArray.map((day) => {
                            const isCompleted = completedDays.includes(day);

                            return (
                                <button
                                    key={day}
                                    onClick={() => onToggleDay(day)}
                                    className={`relative aspect-square rounded-[20px] flex flex-col items-center justify-center transition-all duration-300 transform hover:-translate-y-0.5 border ${isCompleted
                                        ? (darkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200 shadow-inner')
                                        : darkMode
                                            ? 'bg-transparent border-white/10 hover:border-white/20 hover:bg-white/5'
                                            : 'bg-transparent border-[#e0dcd3] hover:border-[#d4af37] hover:bg-white/50 shadow-sm'
                                        }`}
                                >
                                    <span className={`text-[17px] font-medium ${isCompleted
                                        ? (darkMode ? 'text-emerald-400' : 'text-emerald-600')
                                        : darkMode ? 'text-white/60' : 'text-[#8a8782]'
                                        }`}>
                                        {day}
                                    </span>

                                    <div className={`mt-1 flex items-center justify-center w-5 h-5 rounded-full border transition-all ${isCompleted ? (darkMode ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-white border-emerald-500 text-emerald-600 shadow-sm') : 'border-transparent text-transparent'
                                        }`}>
                                        {isCompleted && <Check size={12} strokeWidth={2.5} />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RamadanTracker;
