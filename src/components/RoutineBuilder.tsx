
import React, { useState } from 'react';
import { Quest, QuestCategory } from '../types';
import { X, Check, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { ALL_QUESTS, PRAYER_PACKAGES } from '../constants';

interface RoutineBuilderProps {
    currentRoutine: string[];
    onSave: (selectedIds: string[], removedIds: string[]) => void;
    onClose: () => void;
    darkMode?: boolean;
}

const RoutineBuilder: React.FC<RoutineBuilderProps> = ({ currentRoutine, onSave, onClose, darkMode }) => {
    const [selectedIds, setSelectedIds] = useState<string[]>(currentRoutine);
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [expandedPackages, setExpandedPackages] = useState<string[]>(Object.keys(PRAYER_PACKAGES));
    const [showConfirm, setShowConfirm] = useState(false);

    // Quests to exclude from Routine Builder
    const EXCLUDED_IDS = [
        'hajj', 'zakaat', 'fasting_ramadan',                            // Non-daily / Seasonal
    ];

    const categories = ['All', ...Object.values(QuestCategory).filter(c => c !== QuestCategory.CORRECTION)];

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const togglePackage = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedPackages(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const fardSalahOrder = ['tahajjud', 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

    const filteredQuests = (activeCategory === 'All'
        ? ALL_QUESTS
        : ALL_QUESTS.filter(q => q.category === activeCategory))
        .filter(q => q.category !== QuestCategory.CORRECTION)
        .filter(q => !q.isPackage)
        .filter(q => !EXCLUDED_IDS.includes(q.id))
        .sort((a, b) => {
            const indexA = fardSalahOrder.indexOf(a.id);
            const indexB = fardSalahOrder.indexOf(b.id);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return 0;
        });

    const renderQuestItem = (q: Quest, isSubItem = false) => {
        const isSelected = selectedIds.includes(q.id);
        const packageSubIds = PRAYER_PACKAGES[q.id];
        const isPackageParent = !!packageSubIds;
        const isExpanded = expandedPackages.includes(q.id);

        return (
            <div key={q.id} className={`${isSubItem ? 'mt-2 pl-4 border-l-2 border-slate-100 dark:border-white/5 ml-4' : ''}`}>
                <div
                    onClick={() => toggleSelection(q.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${isSelected
                        ? (darkMode ? 'bg-[#064e3b]/20 border-[#064e3b]/50' : 'bg-emerald-50 border-emerald-500/50')
                        : (darkMode ? 'bg-white/5 border-transparent hover:border-white/10' : 'bg-slate-50 border-slate-100 hover:border-slate-200')
                        } ${isSubItem ? 'py-3' : ''}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${isSelected
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : (darkMode ? 'border-white/20' : 'border-slate-300')
                            }`}>
                            {isSelected && <Check size={12} strokeWidth={4} />}
                        </div>
                        <div>
                            <h3 className={`font-bold ${isSubItem ? 'text-xs' : 'text-sm'} ${darkMode ? 'text-white' : 'text-slate-900'}`}>{q.title}</h3>
                            {!isSubItem && <p className={`text-[10px] uppercase tracking-widest ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{q.category}</p>}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-[10px] font-bold text-[#d4af37]">+{q.xp} XP</div>
                    </div>
                </div>

                {/* Render Package Sub-Items - REMOVED per user request */}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm" style={{ zIndex: 9999 }}>
            <div className={`w-full max-w-lg h-[85vh] flex flex-col rounded-[40px] shadow-2xl overflow-hidden ${darkMode ? 'bg-[#050a09] border border-white/10' : 'bg-white'}`}>

                {/* Header */}
                <div className={`p-6 border-b shrink-0 ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Build Your Routine</h2>
                        <button onClick={onClose} className={`p-2 rounded-full ${darkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                            <X size={20} />
                        </button>
                    </div>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Select the quests you want to do every day. These will be automatically added to your list.</p>
                </div>

                {/* Categories */}
                <div className={`px-6 py-3 border-b flex gap-2 overflow-x-auto shrink-0 ${darkMode ? 'border-white/5' : 'border-slate-50'}`} style={{ scrollbarWidth: 'none' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors flex-shrink-0 ${activeCategory === cat
                                ? (darkMode ? 'bg-white text-black' : 'bg-slate-900 text-white')
                                : (darkMode ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-2">
                    {filteredQuests.map(q => renderQuestItem(q))}
                </div>

                {/* Footer */}
                <div className={`p-6 border-t shrink-0 ${darkMode ? 'border-white/5 bg-black/20' : 'border-slate-100 bg-slate-50'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <span className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{selectedIds.length} quests selected</span>
                    </div>
                    <button
                        onClick={() => {
                            const removedIds = currentRoutine.filter(id => !selectedIds.includes(id));
                            if (removedIds.length > 0) {
                                setShowConfirm(true);
                            } else {
                                onSave(selectedIds, []);
                            }
                        }}
                        className="w-full py-4 bg-[#064e3b] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-[#059669] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Save size={18} /> Save Routine
                    </button>
                </div>

            </div>

            {/* CONFIRMATION MODAL */}
            {showConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className={`w-full max-w-sm p-6 rounded-[30px] space-y-6 shadow-2xl ${darkMode ? 'bg-slate-900 border border-white/10 text-white' : 'bg-white text-slate-900'}`}>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold text-rose-500">Remove Quests?</h3>
                            <p className="text-sm opacity-80 leading-relaxed font-medium">
                                You are removing quests from your routine. Any active tracking for those quests will be canceled. Are you sure you want to proceed?
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setShowConfirm(false)} className={`py-3 rounded-2xl font-bold text-sm ${darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Cancel</button>
                            <button onClick={() => {
                                const removedIds = currentRoutine.filter(id => !selectedIds.includes(id));
                                onSave(selectedIds, removedIds);
                                setShowConfirm(false);
                            }} className="py-3 rounded-2xl font-bold text-sm bg-rose-500 text-white hover:bg-rose-600 shadow-xl shadow-rose-500/20">Yes, Remove</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoutineBuilder;
