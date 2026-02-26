
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
  onShowInfo?: () => void;
  isGreyed?: boolean;
  relatedQuests?: Quest[]; // For Bundles
  isTracked?: boolean;
  onCompleteRelated?: (q: Quest) => void;
  isBundle?: boolean;
  timeDisplay?: {
    time: string;
    status: 'now' | 'future' | 'past' | 'upcoming';
    timeLeft?: string;
  };
  isGroupQuest?: boolean;
  groupProgress?: { current: number; total: number };
  isLocked?: boolean;
  deadline?: string;
}

const QuestCard: React.FC<QuestCardProps> = ({
  quest, onAction, onComplete, onRemove, onPin,
  isActive, isCompleted, isPinned, darkMode,
  onShowInfo, isGreyed, relatedQuests,
  onCompleteRelated, isBundle, timeDisplay, isTracked,
  isGroupQuest, groupProgress, isLocked, deadline
}) => {
  const getCategoryStyles = () => {
    switch (quest.category) {
      case QuestCategory.MAIN:
        return darkMode ? 'bg-white/5 text-[#d4af37]' : 'bg-[#064e3b]/5 text-[#064e3b]';
      case QuestCategory.SUNNAH:
        return darkMode ? 'bg-white/5 text-[#d4af37]' : 'bg-[#064e3b]/5 text-[#064e3b]';
      case QuestCategory.VOLUNTARY:
        return darkMode ? 'bg-white/5 text-[#d4af37]' : 'bg-[#064e3b]/5 text-[#064e3b]';
      case QuestCategory.CHARITY:
        return darkMode ? 'bg-white/5 text-[#d4af37]' : 'bg-[#d4af37]/10 text-[#a1811a]';
      case QuestCategory.CORRECTION:
        return darkMode ? 'bg-rose-500/10 text-rose-300' : 'bg-rose-500/10 text-rose-600';
      case QuestCategory.COMMUNITY:
        return darkMode ? 'bg-white/5 text-[#d4af37]' : 'bg-indigo-500/10 text-indigo-600';
      default:
        return darkMode ? 'bg-white/5 text-[#e0dcd3]' : 'bg-[#2c2b29]/5 text-[#2c2b29]';
    }
  };

  const effectiveIsGreyed = isGreyed ?? quest.isGreyed;

  // Map to atmospheric background based on category OR specific quest title
  const getAtmosphericBackground = () => {
    if (quest.title.toLowerCase().includes('maghrib')) return 'url("/images/pexels-grisentig-4215100.jpg")';
    if (quest.title.toLowerCase().includes('isha')) return 'url("/images/pexels-samrana3003-1883409.jpg")';
    if (quest.title.toLowerCase().includes('fajr')) return 'url("/images/pexels-mohamedbinzayed-8233715.jpg")';
    if (quest.title.toLowerCase().includes('dhuhr')) return 'url("/images/pexels-ikbalphoto-7469648.jpg")';
    if (quest.title.toLowerCase().includes('asr')) return 'url("/images/pexels-taryn-elliott-3889659.jpg")';

    switch (quest.category) {
      case QuestCategory.MAIN: return 'url("/images/pexels-mohamedbinzayed-8233715.jpg")';
      case QuestCategory.SUNNAH: return 'url("/images/pexels-samrana3003-1883409.jpg")';
      case QuestCategory.VOLUNTARY: return 'url("/images/pexels-taryn-elliott-3889659.jpg")';
      case QuestCategory.CHARITY: return 'url("/images/pexels-ikbalphoto-7469648.jpg")';
      default: return 'url("/images/routine.jpeg")';
    }
  };

  const bgImage = getAtmosphericBackground();

  return (
    <div
      className={`relative p-6 rounded-[24px] border transition-all duration-500 overflow-hidden group ${darkMode ? 'border-white/10 bg-[#121212]' : 'border-[#e0dcd3] bg-[#f9f8f6]'} ${!effectiveIsGreyed && !isCompleted && !isTracked ? 'shadow-sm hover:-translate-y-0.5 cursor-pointer' : 'cursor-default opacity-80'}`}
      style={{ boxShadow: darkMode ? 'inset 0 2px 10px rgba(255,255,255,0.02)' : 'inset 0 2px 10px rgba(0,0,0,0.02)' }}
      onClick={(e) => {
        if (effectiveIsGreyed || isTracked || isCompleted) return;
        if (!isBundle && onAction) onAction(quest);
      }}
    >
      {/* Atmospheric Image Background with Grain */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-700 mix-blend-overlay filter contrast-125"
        style={{ backgroundImage: bgImage }}
      />
      {/* Gradient Fade & Noise Texture Overlay */}
      <div className={`absolute inset-0 z-0 bg-gradient-to-r ${darkMode ? 'from-[#0a0a0a]/95 to-[#0a0a0a]/80' : 'from-[#fffdfa]/95 to-[#fffdfa]/85'}`} />
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

      <div className="relative z-10 flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-[9px] font-medium uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm ${darkMode ? 'border-white/5' : 'border-[#e0dcd3]/50'} ${getCategoryStyles()}`}>
              {quest.category === QuestCategory.MAIN ? 'MAIN PRIORITY' : quest.category}
            </span>
            {/* Time Badge - Enhanced Visibility */}
            {timeDisplay && (
              <span className={`text-[9px] font-medium uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm flex items-center gap-1.5 ${timeDisplay.status === 'now'
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 animate-pulse'
                : timeDisplay.status === 'future'
                  ? darkMode ? 'bg-white/5 border-white/5 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
                  : darkMode ? 'bg-[#d4af37]/10 border-[#d4af37]/20 text-[#d4af37]' : 'bg-[#d4af37]/10 border-[#d4af37]/30 text-[#a1811a]'
                }`}>
                {timeDisplay.status === 'now' ? <Clock size={10} /> : <Clock size={10} />}
                {timeDisplay.status === 'now' ? `NOW • ${timeDisplay.time}` : timeDisplay.time}
              </span>
            )}
            {isTracked && !isCompleted && (
              <span className={`text-[9px] font-medium uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm flex items-center gap-1.5 ${darkMode ? 'bg-white/5 border-white/10 text-white/50' : 'bg-white border-[#e0dcd3] text-[#8a8782]'}`}>
                Tracking <CheckCircle2 size={10} />
              </span>
            )}
            <span className={`text-[9px] font-medium uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm flex items-center gap-1.5 ${darkMode ? 'bg-[#d4af37]/10 border-[#d4af37]/20 text-[#d4af37]' : 'bg-white border-[#e0dcd3] text-[#a1811a]'}`}>
              +{(quest.category === QuestCategory.MAIN && relatedQuests) ? relatedQuests.reduce((acc, q) => acc + q.xp, quest.xp) : quest.xp} XP
            </span>
          </div>
          <h3 className={`font-['Playfair_Display',serif] text-2xl italic tracking-wide drop-shadow-sm flex items-center gap-2 ${darkMode ? 'text-[#e0dcd3]' : 'text-[#2c2b29]'}`}>
            {quest.title}
            {isCompleted && (
              <span className={`ml-2 text-[9px] not-italic font-medium uppercase tracking-widest px-2 py-1 rounded-full border shadow-sm flex items-center gap-1 inline-flex align-middle ${darkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
                Done <CheckCircle2 size={10} /> {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </h3>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {isCompleted && (
            <div className={`p-1 mt-1 ${darkMode ? 'text-emerald-400' : 'text-emerald-500'}`}>
              <CheckCircle2 size={24} strokeWidth={1.5} />
            </div>
          )}
          {!isCompleted && !isBundle && onPin && !effectiveIsGreyed && (
            <button
              onClick={(e) => { e.stopPropagation(); onPin(quest); }}
              className={`p-2 rounded-full border shadow-sm transition-all duration-300 ${isPinned ? (darkMode ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600') : (darkMode ? 'bg-white/5 border-white/10 text-white/40 hover:text-white' : 'bg-white border-[#e0dcd3] text-[#8a8782] hover:text-[#2c2b29]')}`}
            >
              <CheckCircle2 size={16} strokeWidth={isPinned ? 2 : 1.5} />
            </button>
          )}
        </div>
      </div>

      <p className={`relative z-10 text-[13px] mb-5 leading-relaxed font-medium ${quest.category === QuestCategory.CORRECTION ? (darkMode ? 'text-rose-300' : 'text-rose-600') : (darkMode ? 'text-white/60' : 'text-[#8a8782]')}`}>{quest.description}</p>

      {/* Time Remaining Indicator & Lock for Greyed Quests */}
      {effectiveIsGreyed && (
        <div className="mb-4 flex items-center justify-between w-full">
          {timeDisplay && timeDisplay.timeLeft ? (
            <div className="flex items-center gap-2 text-xs font-bold text-[#d4af37] bg-[#d4af37]/10 p-2 rounded-lg w-fit">
              <Clock size={14} />
              <span>Starts in {timeDisplay.timeLeft}</span>
            </div>
          ) : (
            <div />
          )}
          <Lock size={16} className="text-slate-300 dark:text-white/20" />
        </div>
      )}

      {/* Group Challenge Progress */}
      {isGroupQuest && groupProgress && (
        <div className="mb-4 space-y-1">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider opacity-70">
            <span>Group Progress</span>
            <span>{groupProgress.current}/{groupProgress.total} Members</span>
          </div>
          <div className={`h-2.5 w-full rounded-full overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-slate-100'}`}>
            <div
              className={`h-full transition-all duration-500 ${isLocked ? 'bg-slate-400' : 'bg-indigo-500'}`}
              style={{ width: `${(groupProgress.current / groupProgress.total) * 100}%` }}
            ></div>
          </div>
          {isLocked && <p className="text-[10px] text-slate-400 mt-1 italic">XP locked until all members complete.</p>}
          {deadline && <p className="text-[10px] text-rose-400 font-bold mt-1">Deadline: {new Date(deadline).toLocaleDateString()}</p>}
        </div>
      )}

      {/* Bundle Checklist View */}
      {isBundle && relatedQuests && relatedQuests.length > 0 && (
        <div className={`relative z-10 space-y-3 mt-6 p-5 rounded-[20px] border shadow-sm ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white/60 border-[#e0dcd3]'} backdrop-blur-sm`}>
          <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${darkMode ? 'text-white/60' : 'text-[#8a8782]'}`}>
            <BookOpen size={12} /> Related Actions
          </h4>
          {relatedQuests.map(rq => (
            <div key={rq.id} className="flex items-center justify-between group/rq">
              <button
                onClick={(e) => { e.stopPropagation(); onCompleteRelated?.(rq); }}
                disabled={!!rq.completed}
                className="flex items-center gap-3 flex-1 text-left outline-none"
              >
                <div className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-all duration-300 ${rq.completed ? (darkMode ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600') : (darkMode ? 'border-white/20 group-hover/rq:border-white/40' : 'border-[#d4af37]/30 group-hover/rq:border-[#d4af37]/60 bg-white')}`}>
                  {rq.completed && <Check size={12} strokeWidth={2.5} />}
                </div>
                <span className={`text-[13px] font-medium transition-colors ${rq.completed ? (darkMode ? 'text-white/40 line-through' : 'text-[#8a8782] line-through') : (darkMode ? 'text-[#e0dcd3] group-hover/rq:text-white' : 'text-[#2c2b29]')}`}>{rq.title}</span>
              </button>
              <span className={`text-[10px] font-bold transition-colors ${rq.completed ? (darkMode ? 'text-white/20' : 'text-[#e0dcd3]') : (darkMode ? 'text-[#d4af37]/80' : 'text-[#d4af37]')}`}>
                {rq.completed ? 'Done' : `+${rq.xp}`}
              </span>
            </div>
          ))}
        </div>
      )}

      {isActive && !isBundle && !effectiveIsGreyed && (
        <div className="relative z-10 space-y-4 animate-in fade-in slide-in-from-top-2 mt-2">
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onComplete?.(quest); }}
              className={`flex-1 py-3.5 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all duration-300 border flex items-center justify-center gap-2 ${darkMode ? 'bg-white/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' : 'bg-white border-[#064e3b]/30 text-[#064e3b] hover:bg-[#064e3b]/5'}`}
              style={{ boxShadow: darkMode ? 'inset 0 2px 10px rgba(255,255,255,0.05)' : 'inset 0 2px 10px rgba(0,0,0,0.02)' }}
            >
              Complete Mission <Check size={14} strokeWidth={2.5} />
            </button>
            {['salatul_tasbeeh', 'ishraq_salah', 'duha'].includes(quest.id) && (
              <button
                onClick={(e) => { e.stopPropagation(); onShowInfo?.(); }}
                className={`p-3.5 border rounded-2xl transition-colors shadow-sm ${darkMode ? 'bg-white/5 border-white/10 text-white/60 hover:text-white' : 'bg-white border-[#e0dcd3] text-[#8a8782] hover:text-[#2c2b29] hover:border-[#d4af37]'}`}
                title="View Info / How to Pray"
              >
                <BookOpen size={16} />
              </button>
            )}
            {quest.locationType && (
              <button
                onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(quest.locationType || quest.title)}`, '_blank'); }}
                className={`p-3.5 border rounded-2xl transition-colors shadow-sm ${darkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' : 'bg-white border-[#e0dcd3] text-[#8a8782] hover:text-[#064e3b] hover:border-[#064e3b]/30'}`}
                title="View on Google Maps"
              >
                <MapPin size={16} />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onRemove?.(quest); }}
              className={`p-3.5 border rounded-2xl transition-colors shadow-sm ${darkMode ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20' : 'bg-white border-[#e0dcd3] text-[#8a8782] hover:text-[#c0392b] hover:border-[#c0392b]/30'}`}
              title="Remove Quest"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default QuestCard;
