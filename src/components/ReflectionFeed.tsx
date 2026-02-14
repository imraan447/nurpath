
import React, { useEffect, useState, useRef } from 'react';
import { ReflectionItem } from '../types';
import { ChevronDown, BookOpen, Loader2, Sparkles, Star, AlignLeft, Bot, User, Clock, Tag } from 'lucide-react';
import { generateReflectionDeepDive } from '../services/geminiService';
import { CURATED_REFLECTIONS } from '../data/reflections';

interface ReflectionFeedProps {
  items: ReflectionItem[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onUpdateItem: (id: string, updates: Partial<ReflectionItem>) => void;
  onMarkAsRead: (id: string) => void;
}

const ReflectionFeed: React.FC<ReflectionFeedProps> = ({ items, loading, hasMore, onLoadMore, onUpdateItem, onMarkAsRead }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [generatingDetails, setGeneratingDetails] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const readTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (readTimerRef.current) clearTimeout(readTimerRef.current);
    };
  }, []);

  // Monitor visible index to trigger load-more
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          // Trigger earlier (4-5 items before end) for smoother infinite scroll preloading
          if (items && index >= items.length - 5 && !loading && hasMore) {
            onLoadMore();
          }
        }
      });
    }, {
      threshold: 0.5,
      root: containerRef.current
    });

    const cardElements = containerRef.current.querySelectorAll('.reflection-card');
    cardElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [items.length, loading, onLoadMore, hasMore]);

  const handleExpand = async (item: ReflectionItem) => {
    setExpandedId(item.id);

    // Start 30s timer to mark as read
    if (readTimerRef.current) clearTimeout(readTimerRef.current);
    readTimerRef.current = setTimeout(() => {
      console.log(`Marking ${item.id} as read after 30s`);
      onMarkAsRead(item.id);
    }, 30000);

    // If we already have the full essay, don't re-generate
    if (item.details && item.details.length > 200) {
      return;
    }

    // Otherwise, generate it now
    setGeneratingDetails(true);
    try {
      const fullText = await generateReflectionDeepDive(item);
      onUpdateItem(item.id, { details: fullText });
    } catch (e) {
      console.error("Failed to expand", e);
    } finally {
      setGeneratingDetails(false);
    }
  };

  const handleClose = () => {
    setExpandedId(null);
    if (readTimerRef.current) {
      clearTimeout(readTimerRef.current);
      readTimerRef.current = null;
    }
  };

  const expandedItem = items.find(i => i.id === expandedId);

  return (
    <div
      ref={containerRef}
      className="h-screen w-full bg-[#fdfbf7] snap-y snap-mandatory overflow-y-scroll scrollbar-hide"
    >
      {items.map((item, index) => {
        const hasMedia = !!item.mediaUrl;
        return (
          <div
            key={`${item.id}-${index}`}
            data-index={index}
            className="reflection-card snap-start h-screen w-full relative flex flex-col items-center justify-center p-6 sm:p-10 text-center"
          >
            {hasMedia ? (
              <div className="absolute inset-0 z-0">
                <img src={item.mediaUrl} className="w-full h-full object-cover brightness-[0.3]" alt="" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
              </div>
            ) : (
              <div className="absolute inset-0 z-0 bg-gradient-to-tr from-[#064e3b]/5 to-transparent" />
            )}

            <div className="relative z-10 max-w-lg space-y-6 md:space-y-8 flex flex-col items-center">

              {/* META BADGES */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border flex items-center gap-1 ${hasMedia ? 'bg-black/40 text-white border-white/20' : 'bg-[#064e3b] text-white border-[#064e3b]'
                  }`}>
                  {item.type}
                </span>

                {item.readTime && (
                  <span className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 ${hasMedia ? 'text-white/70 bg-black/20' : 'text-slate-400 bg-slate-100'
                    }`}>
                    <Clock size={10} /> {item.readTime}
                  </span>
                )}
              </div>

              {/* MAIN CONTENT */}
              <h2 className={`text-3xl md:text-5xl font-extrabold leading-tight tracking-tight ${hasMedia ? 'text-white' : 'text-slate-900'
                } ${['verse', 'hadith'].includes(item.type) ? 'quran-font italic' : ''}`}>
                {item.content}
              </h2>

              {/* Logic: If short/inline content, show DETAILS directly. Else show SUMMARY + Button */}
              {(['hadith', 'verse'].includes(item.type) || (item.details && item.details.length < 400)) && item.details ? (
                <div className={`text-lg md:text-xl font-medium leading-relaxed opacity-90 max-w-2xl mx-auto whitespace-pre-wrap ${hasMedia ? 'text-slate-100' : 'text-slate-700'}`}>
                  {item.details}
                </div>
              ) : (
                <>
                  {item.summary && (
                    <p className={`text-sm md:text-base font-medium leading-relaxed opacity-90 max-w-md mx-auto ${hasMedia ? 'text-slate-100' : 'text-slate-600'}`}>
                      {item.summary}
                    </p>
                  )}

                  <p className="text-xs font-black uppercase tracking-[0.4em] text-[#d4af37]">
                    {item.praise}
                  </p>

                  <button
                    onClick={() => handleExpand(item)}
                    className={`group flex items-center gap-3 mx-auto px-10 py-5 rounded-[40px] transition-all active:scale-95 shadow-2xl hover:shadow-3xl ${hasMedia ? 'bg-[#d4af37] text-white shadow-[#d4af37]/20' : 'bg-[#064e3b] text-white'
                      }`}
                  >
                    <BookOpen size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Read Article</span>
                  </button>
                </>
              )}

              {/* AUTHOR / FOOTER */}
              <div className={`pt-4 flex items-center gap-4 ${hasMedia ? 'text-white/60' : 'text-slate-400'}`}>
                {item.isAiGenerated ? (
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold opacity-70" title="Generated by AI, verified by NurPath">
                    <Bot size={12} /> AI Assisted Reflection
                  </div>
                ) : item.author ? (
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold opacity-70">
                    <User size={12} /> {item.author}
                  </div>
                ) : null}
              </div>

            </div>
          </div>
        );
      })}

      {/* EXPANDED MODAL */}
      {expandedItem && (
        <div className="fixed inset-0 z-[200] bg-[#fdfbf7] transition-all duration-300">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center bg-[#fdfbf7]/95 backdrop-blur-sm z-20 border-b border-slate-100">
            <button onClick={handleClose} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#064e3b] bg-[#064e3b]/5 px-6 py-3 rounded-full hover:bg-[#064e3b]/10 transition-colors">
              <ChevronDown size={18} /> Close
            </button>
            <div className="flex items-center gap-2 text-[#d4af37]">
              <Sparkles size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">{expandedItem.praise}</span>
            </div>
          </div>

          {/* Content */}
          <div className="h-full overflow-y-auto p-6 pt-32 pb-40 scrollbar-hide">
            <div className="max-w-2xl mx-auto space-y-8 md:space-y-12">

              {/* Article Header */}
              <div className="space-y-6 text-center">
                <div className="flex justify-center gap-2">
                  <span className="inline-block px-4 py-2 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    {expandedItem.type}
                  </span>
                  {expandedItem.tags?.map(tag => (
                    <span key={tag} className="inline-block px-3 py-2 rounded-lg bg-[#064e3b]/5 text-[#064e3b] text-[10px] font-bold uppercase tracking-widest">
                      #{tag}
                    </span>
                  ))}
                </div>

                <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tighter">
                  {expandedItem.content}
                </h3>

                <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-y border-slate-100 py-4">
                  {expandedItem.author && <span>By {expandedItem.author}</span>}
                  <span>•</span>
                  {expandedItem.readTime && <span>{expandedItem.readTime}</span>}
                  {expandedItem.isAiGenerated && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded">AI Generated</span>}
                </div>
              </div>

              {/* Article Body */}
              <div className="prose prose-lg prose-slate max-w-none">
                {/* Quote Block if source exists */}
                {expandedItem.source && (
                  <blockquote className="border-l-4 border-[#d4af37] pl-6 py-2 my-8 bg-[#d4af37]/5 rounded-r-xl italic text-xl text-slate-700 font-serif">
                    "{expandedItem.source}"
                  </blockquote>
                )}

                {/* Loading State or Content */}
                {generatingDetails ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-pulse opacity-50">
                    <AlignLeft size={64} className="text-slate-300" />
                    <div className="space-y-3 w-full max-w-md">
                      <div className="h-2 bg-slate-200 rounded-full w-full"></div>
                      <div className="h-2 bg-slate-200 rounded-full w-5/6"></div>
                      <div className="h-2 bg-slate-200 rounded-full w-full"></div>
                      <div className="h-2 bg-slate-200 rounded-full w-4/6"></div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]">Contemplating...</span>
                  </div>
                ) : (
                  <div className="text-lg md:text-xl text-slate-700 leading-loose whitespace-pre-wrap font-serif">
                    {expandedItem.details || expandedItem.summary}
                  </div>
                )}

                <div className="flex justify-center pt-16 opacity-30">
                  <Star size={24} className="text-[#d4af37]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scroll Sentinel / Bottom Loader */}
      {hasMore ? (
        <div className="snap-start h-screen w-full flex flex-col items-center justify-center bg-[#fdfbf7] gap-4">
          <div className="relative">
            <Loader2 className={`animate-spin text-[#064e3b] ${loading ? 'opacity-100' : 'opacity-20'}`} size={48} />
            {loading && <div className="absolute inset-0 flex items-center justify-center"><div className="w-2 h-2 bg-[#d4af37] rounded-full" /></div>}
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
            {loading ? 'Seeking Wisdom...' : 'Scroll for More'}
          </span>
        </div>
      ) : (
        <div className="snap-start h-screen w-full flex flex-col items-center justify-center bg-[#fdfbf7] gap-4 opacity-50">
          <Star size={24} className="text-slate-300" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
            End of Reflections
          </span>
        </div>
      )}
    </div>
  );
};

export default ReflectionFeed;
