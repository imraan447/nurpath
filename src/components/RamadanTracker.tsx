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
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in`}>
            <div className={`w-full max-w-lg max-h-[90vh] flex flex-col rounded-[40px] shadow-2xl overflow-hidden relative ${darkMode ? 'bg-[#0a0f0d] text-white border border-[#d4af37]/20' : 'bg-[#fdfbf7] text-slate-900 border border-[#d4af37]/30'}`}>

                {/* Header Section */}
                <div className={`relative p-8 pb-10 bg-gradient-to-br ${darkMode ? 'from-[#064e3b] to-[#043327]' : 'from-[#0f766e] to-[#042f2e]'} overflow-hidden shrink-0`}>
                    {/* Subtle star pattern / decorations */}
                    <div className="absolute top-4 right-6 opacity-10">
                        <Moon size={120} />
                    </div>
                    <div className="absolute bottom-4 left-6 opacity-20">
                        <Star size={60} />
                    </div>
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/20 text-white shadow-sm flex items-center gap-1`}>
                                <CalendarDays size={12} /> Holy Month
                            </span>
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                            Ramadan Tracker
                        </h2>
                        <p className="text-white/80 text-sm mt-3 font-medium max-w-[80%]">
                            Mark off your daily fasts. Each completed day secures 200 XP to your journey.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 text-white rounded-full hover:bg-black/40 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Floating Stat Bar */}
                <div className={`relative -mt-6 mx-8 p-4 rounded-2xl flex items-center justify-around shadow-lg z-20 ${darkMode ? 'bg-slate-900 border border-white/5' : 'bg-white border border-slate-100'}`}>
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Completed</p>
                        <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{completedDays.length}</p>
                    </div>
                    <div className={`w-px h-8 ${darkMode ? 'bg-white/10' : 'bg-slate-200'}`}></div>
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#d4af37]">XP Earned</p>
                        <p className={`text-xl font-bold flex items-center justify-center gap-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                            <Award size={16} className="text-[#d4af37]" />
                            {completedDays.length * 200}
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
                                    className={`relative aspect-square rounded-[20px] flex flex-col items-center justify-center transition-all duration-300 transform hover:scale-[1.02] active:scale-95 border-2 ${isCompleted
                                            ? `bg-[#064e3b] border-[#064e3b] shadow-lg shadow-[#064e3b]/30`
                                            : darkMode
                                                ? 'bg-white/5 border-white/10 hover:border-white/20'
                                                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <span className={`text-lg font-black ${isCompleted
                                            ? 'text-white'
                                            : darkMode ? 'text-slate-300' : 'text-slate-500'
                                        }`}>
                                        {day}
                                    </span>

                                    <div className={`mt-1 flex items-center justify-center w-5 h-5 rounded-full ${isCompleted ? 'bg-emerald-400 text-[#064e3b]' : 'bg-transparent text-transparent'
                                        }`}>
                                        {isCompleted && <Check size={12} strokeWidth={4} />}
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
