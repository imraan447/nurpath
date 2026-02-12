
import React from 'react';
import { Quest, QuestCategory } from '../types';
import { CheckCircle2, Lock, MapPin, BookOpen, X, Pin, PinOff, Plus, Check, Clock, AlertCircle } from 'lucide-react';

interface QuestCardProps {
  quest: Quest;
  onAction?: (quest: Quest) => void;
  onComplete?: (quest: Quest) => void;
  onRemove?: (quest: Quest) => void;
  onPin?: (quest: Quest) => void;
  isActive?: boolean;
  isCompleted?: boolean;
  isPinned?: boolean;
  darkMode?: boolean;
  onShowTasbeehGuide?: () => void;
  isGreyed?: boolean;
  relatedQuests?: Quest[]; // For Bundles
  onCompleteRelated?: (q: Quest) => void;
  isBundle?: boolean;
  timeDisplay?: {
    time: string;
    status: 'now' | 'future' | 'past' | 'upcoming';
    timeLeft?: string;
  };
}

const QuestCard: React.FC<QuestCardProps> = ({ 
  quest, onAction, onComplete, onRemove, onPin, 
  isActive, isCompleted, isPinned, darkMode, 
  onShowTasbeehGuide, isGreyed, relatedQuests, 
  onCompleteRelated, isBundle, timeDisplay 
}) => {

  const getCategoryStyles = () => {
    switch(quest.category) {
      case QuestCategory.MAIN: 
        return darkMode ? 'bg-white/10 text-white' : 'bg-[#064e3b]/10 text-[#064e3b]';
      case QuestCategory.SUNNAH: 
        // Sunnah is now Light Green
        return darkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'; 
      case QuestCategory.CHARITY: 
        // Charity is now Light Gold
        return darkMode ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700';
      case QuestCategory.CORRECTION: 
        // Correction is highlighted Red
        return darkMode ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-rose-100 text-rose-700 border border-rose-200';
      default: 
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getCardBaseStyles = () => {
    if (effectiveIsGreyed) {
      return darkMode ? 'bg-white/5 border-white/5 opacity-50 grayscale' : 'bg-slate-50 border-slate-100 opacity-60 grayscale';
    }
    if (isCompleted) {
      return darkMode ? 'bg-emerald-900/20 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100';
    }
    // Specific styles for categories when active
    if (quest.category === QuestCategory.CORRECTION) {
       return darkMode ? 'bg-rose-900/10 border-rose-500/30 hover:border-rose-500/50' : 'bg-rose-50 border-rose-200 hover:border-rose-300';
    }
    
    return darkMode ? 'bg-white/5 border-transparent hover:border-white/10' : 'bg-white border-transparent hover:border-[#064e3b]/10';
  };
  
  const effectiveIsGreyed = isGreyed ?? quest.isGreyed;

  return (
    <div 
      className={`relative p-5 rounded-[30px] border-2 transition-all duration-300 ${getCardBaseStyles()} ${!effectiveIsGreyed && !isCompleted ? 'shadow-sm hover:shadow-md cursor-pointer' : ''}`}
      onClick={(e) => {
        if (effectiveIsGreyed) return;
        if (!isBundle && onAction) onAction(quest);
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${getCategoryStyles()}`}>
              {quest.category}
            </span>
            {/* Time Badge - Enhanced Visibility */}
            {timeDisplay && (
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full flex items-center gap-1 ${
                timeDisplay.status === 'now' 
                  ? 'bg-rose-500 text-white animate-pulse' 
                  : timeDisplay.status === 'future' 
                    ? 'bg-slate-900/10 text-slate-600 dark:bg-white/10 dark:text-slate-300'
                    : 'bg-orange-100 text-orange-600'
              }`}>
                {timeDisplay.status === 'now' ? <Clock size={10} /> : <Clock size={10} />}
                {timeDisplay.status === 'now' ? `NOW • ${timeDisplay.time}` : timeDisplay.time}
              </span>
            )}
          </div>
          <h3 className={`font-bold text-lg transition-colors ${darkMode ? 'text-white' : 'text-slate-900'}`}>{quest.title}</h3>
        </div>
        <div className="flex flex-col items-end gap-2">
           <div className="text-[#d4af37] font-black text-sm transition-colors">+{quest.xp} XP</div>
           {!isCompleted && !isBundle && onPin && !effectiveIsGreyed && (
             <button 
               onClick={(e) => { e.stopPropagation(); onPin(quest); }} 
               className={`p-1.5 rounded-full transition-colors ${isPinned ? 'bg-[#d4af37] text-white' : 'text-slate-300 hover:text-[#d4af37]'}`}
             >
               {isPinned ? <PinOff size={14} /> : <Pin size={14} />}
             </button>
           )}
        </div>
      </div>

      <p className={`text-xs mb-4 leading-relaxed line-clamp-2 ${quest.category === QuestCategory.CORRECTION ? (darkMode ? 'text-rose-200/70' : 'text-rose-700/70') : 'text-slate-500'}`}>{quest.description}</p>
      
      {/* Time Remaining Indicator for Future/Upcoming */}
      {timeDisplay && timeDisplay.timeLeft && effectiveIsGreyed && (
        <div className="mb-4 flex items-center gap-2 text-xs font-bold text-[#d4af37] bg-[#d4af37]/10 p-2 rounded-lg w-fit">
           <Clock size={14} />
           <span>Starts in {timeDisplay.timeLeft}</span>
        </div>
      )}

      {/* Bundle Checklist View */}
      {isBundle && relatedQuests && relatedQuests.length > 0 && (
         <div className="space-y-2 mt-4 bg-black/5 dark:bg-white/5 rounded-2xl p-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Related Actions</h4>
            {relatedQuests.map(rq => (
              <div key={rq.id} className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-black/20">
                 <div className="flex items-center gap-2">
                   <div className={`w-4 h-4 rounded border flex items-center justify-center ${rq.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-white/20'}`}>
                     {rq.completed && <Check size={10} />}
                   </div>
                   <span className={`text-xs font-bold ${rq.completed ? 'text-emerald-600 line-through opacity-60' : darkMode ? 'text-white' : 'text-slate-700'}`}>{rq.title}</span>
                 </div>
                 <button 
                   onClick={(e) => { e.stopPropagation(); onCompleteRelated?.(rq); }}
                   disabled={!!rq.completed}
                   className="text-[9px] font-bold px-2 py-1 bg-slate-100 dark:bg-white/10 rounded-lg hover:bg-emerald-100 hover:text-emerald-700 disabled:opacity-50"
                 >
                   {rq.completed ? 'Done' : `+${rq.xp} XP`}
                 </button>
              </div>
            ))}
         </div>
      )}

      {isActive && !isBundle && !effectiveIsGreyed && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onComplete?.(quest); }}
              className="flex-1 py-3 bg-[#064e3b] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
            >
              Complete
            </button>
            {quest.id === 'salatul_tasbeeh' && (
              <button 
                onClick={(e) => { e.stopPropagation(); onShowTasbeehGuide?.(); }}
                className={`p-3 border rounded-2xl transition-colors ${darkMode ? 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'}`}
                title="How to Pray Salatul Tasbeeh"
              >
                <BookOpen size={18} />
              </button>
            )}
            {quest.locationType && (
              <button 
                onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(quest.locationType || quest.title)}`, '_blank'); }}
                className={`p-3 border rounded-2xl transition-colors ${darkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'}`}
                title="View on Google Maps"
              >
                <MapPin size={18} />
              </button>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); onRemove?.(quest); }}
              className={`p-3 border rounded-2xl transition-colors ${darkMode ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20' : 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100'}`}
              title="Remove Quest"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {isCompleted && <div className="absolute top-4 right-4 text-emerald-500"><CheckCircle2 size={24} /></div>}
      {effectiveIsGreyed && (
        <div className="absolute top-4 right-4 text-slate-400 flex flex-col items-end gap-1">
          <Lock size={20} />
        </div>
      )}
    </div>
  );
};

export default QuestCard;
