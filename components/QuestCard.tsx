import React, { useState, useEffect } from 'react';
import { Quest, QuestCategory } from '../types';
import { MapPin, CheckCircle2, Lock, Navigation } from 'lucide-react';
import { findNearbyPlace } from '../services/geminiService';

interface QuestCardProps {
  quest: Quest;
  onAction?: (quest: Quest) => void;
  onComplete?: (quest: Quest) => void;
  isActive?: boolean;
  isCompleted?: boolean;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, onAction, onComplete, isActive, isCompleted }) => {
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [distance, setDistance] = useState<string | null>(null);

  useEffect(() => {
    if (isActive && quest.locationType) {
      handleFindLocation();
    }
  }, [isActive]);

  const handleFindLocation = async () => {
    if (!navigator.geolocation) return;
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { distance: d } = await findNearbyPlace(
          quest.locationType || 'place',
          pos.coords.latitude,
          pos.coords.longitude
        );
        if (d) setDistance(d);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingLocation(false);
      }
    });
  };

  const getCategoryStyles = () => {
    switch(quest.category) {
      case QuestCategory.MAIN: return 'bg-[#064e3b]/10 text-[#064e3b]';
      case QuestCategory.SUNNAH: return 'bg-[#d4af37]/10 text-[#d4af37]';
      case QuestCategory.CHARITY: return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-rose-100 text-rose-700';
    }
  };

  return (
    <div 
      className={`relative p-5 rounded-[30px] border-2 transition-all duration-300 ${
        quest.isGreyed ? 'bg-slate-50 border-slate-100 opacity-60 pointer-events-none' : 
        isCompleted ? 'bg-emerald-50 border-emerald-100' :
        'bg-white border-transparent hover:border-[#064e3b]/10 shadow-sm hover:shadow-md cursor-pointer'
      }`}
      onClick={() => onAction?.(quest)}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${getCategoryStyles()}`}>
            {quest.category}
          </span>
          <h3 className="font-bold text-slate-900 mt-2 text-lg">{quest.title}</h3>
        </div>
        <div className="text-right">
          <div className="text-[#064e3b] font-black text-sm">+{quest.xp} XP</div>
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-4 leading-relaxed">{quest.description}</p>

      {isActive && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
          {quest.locationType && (
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#d4af37] bg-[#d4af37]/5 px-3 py-2 rounded-xl">
              <MapPin size={14} />
              {loadingLocation ? 'Locating...' : (distance ? `Objective in ${distance}` : 'Calculating distance...')}
            </div>
          )}
          
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
                className="p-3 bg-white border border-[#064e3b]/10 text-[#064e3b] rounded-2xl hover:bg-[#064e3b]/5 transition-colors"
              >
                <Navigation size={18} />
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