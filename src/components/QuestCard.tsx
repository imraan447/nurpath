import React from 'react';
import { Quest, QuestCategory } from '../types';
import { CheckCircle2, Lock, MapPin } from 'lucide-react';

interface QuestCardProps {
  quest: Quest;
  onAction?: (quest: Quest) => void;
  onComplete?: (quest: Quest) => void;
  isActive?: boolean;
  isCompleted?: boolean;
  darkMode?: boolean;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, onAction, onComplete, isActive, isCompleted, darkMode }) => {

  const getCategoryStyles = () => {
    switch(quest.category) {
      case QuestCategory.MAIN: return darkMode ? 'bg-white/10 text-white' : 'bg-[#064e3b]/10 text-[#064e3b]';
      case QuestCategory.SUNNAH: return 'bg-[#d4af37]/10 text-[#d4af37]';
      case QuestCategory.CHARITY: return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-rose-100 text-rose-700';
    }
  };

  return (
    <div 
      className={`relative p-5 rounded-[30px] border-2 transition-all duration-300 ${
        quest.isGreyed ? (darkMode ? 'bg-white/5 border-white/5 opacity-40 pointer-events-none' : 'bg-slate-50 border-slate-100 opacity-60 pointer-events-none') : 
        isCompleted ? (darkMode ? 'bg-emerald-900/20 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100') :
        (darkMode ? 'bg-white/5 border-transparent hover:border-white/10' : 'bg-white border-transparent hover:border-[#064e3b]/10')
      } ${!quest.isGreyed && !isCompleted ? 'shadow-sm hover:shadow-md cursor-pointer' : ''}`}
      onClick={() => onAction?.(quest)}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${getCategoryStyles()}`}>
            {quest.category}
          </span>
          <h3 className={`font-bold mt-2 text-lg transition-colors ${darkMode ? 'text-white' : 'text-slate-900'}`}>{quest.title}</h3>
        </div>
        <div className="text-right">
          <div className="text-[#d4af37] font-black text-sm transition-colors">+{quest.xp} XP</div>
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-4 leading-relaxed line-clamp-2">{quest.description}</p>

      {isActive && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onComplete?.(quest); }}
              className="flex-1 py-3 bg-[#064e3b] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
            >
              Complete
            </button>
            {quest.locationType && (
              <button 
                onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(quest.locationType || quest.title)}`, '_blank'); }}
                className={`p-3 border rounded-2xl transition-colors bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100`}
                title="View on Google Maps"
              >
                <MapPin size={18} />
              </button>
            )}
          </div>
        </div>
      )}

      {isCompleted && <div className="absolute top-4 right-4 text-emerald-500"><CheckCircle2 size={24} /></div>}
      {quest.isGreyed && <div className="absolute top-4 right-4 text-slate-300"><Lock size={20} /></div>}
    </div>
  );
};

export default QuestCard;