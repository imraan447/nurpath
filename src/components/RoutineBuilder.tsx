
import React, { useState } from 'react';
import { Quest, QuestCategory } from '../types';
import { X, Check, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { ALL_QUESTS, PRAYER_PACKAGES } from '../constants';

interface RoutineBuilderProps {
    currentRoutine: string[];
    onSave: (selectedIds: string[]) => void;
    onClose: () => void;
    darkMode?: boolean;
}

const RoutineBuilder: React.FC<RoutineBuilderProps> = ({ currentRoutine, onSave, onClose, darkMode }) => {
    const [selectedIds, setSelectedIds] = useState<string[]>(currentRoutine);
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [expandedPackages, setExpandedPackages] = useState<string[]>(Object.keys(PRAYER_PACKAGES));

    // Quests to exclude from Routine Builder (Non-Daily / Seasonal + Package sub-quests)
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

    const filteredQuests = (activeCategory === 'All'
        ? ALL_QUESTS
        : ALL_QUESTS.filter(q => q.category === activeCategory))
        .filter(q => q.category !== QuestCategory.CORRECTION)
        .filter(q => !q.isPackage)
        .filter(q => !EXCLUDED_IDS.includes(q.id));

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
                        {isPackageParent && (
                            <button
                                onClick={(e) => togglePackage(q.id, e)}
                                className={`p-1 rounded-full ${darkMode ? 'hover:bg-white/10' : 'hover:bg-slate-200'}`}
                            >
                                {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                            </button>
                        )}
                    </div>
                </div>

                {/* Render Package Sub-Items */}
                {isPackageParent && isExpanded && (
                    <div className="mt-1">
                        {packageSubIds.map(subId => {
                            const subQuest = ALL_QUESTS.find(sq => sq.id === subId);
                            if (!subQuest) return null;
                            return renderQuestItem(subQuest, true);
                        })}
                    </div>
                )}
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
                        onClick={() => onSave(selectedIds)}
                        className="w-full py-4 bg-[#064e3b] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-[#059669] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Save size={18} /> Save Routine
                    </button>
                </div>

            </div>
        </div>
    );
};

export default RoutineBuilder;
