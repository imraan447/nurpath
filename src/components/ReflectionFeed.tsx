
import React, { useEffect, useState, useRef } from 'react';
import { ReflectionItem } from '../types';
import { ChevronDown, BookOpen, Loader2, Sparkles, Star, AlignLeft } from 'lucide-react';
import { generateReflectionDeepDive } from '../services/geminiService';

interface ReflectionFeedProps {
  items: ReflectionItem[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onUpdateItem: (id: string, updates: Partial<ReflectionItem>) => void;
}

const ReflectionFeed: React.FC<ReflectionFeedProps> = ({ items, loading, hasMore, onLoadMore, onUpdateItem }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [generatingDetails, setGeneratingDetails] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Monitor visible index to trigger load-more
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          // Only trigger if we are near the end AND we are allowed to load more
          if (index >= items.length - 2 && !loading && hasMore) {
            onLoadMore();
          }
        }
      });
    }, {
      threshold: 0.5,
      root: containerRef.current
    });

    const cardElements = document.querySelectorAll('.reflection-card');
    cardElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [items.length, loading, onLoadMore, hasMore]);

  const handleExpand = async (item: ReflectionItem) => {
    setExpandedId(item.id);
    
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
            className="reflection-card snap-start h-screen w-full relative flex flex-col items-center justify-center p-10 text-center"
          >
            {hasMedia ? (
              <div className="absolute inset-0 z-0">
                <img src={item.mediaUrl} className="w-full h-full object-cover brightness-[0.25]" alt="" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/90" />
              </div>
            ) : (
              <div className="absolute inset-0 z-0 bg-gradient-to-tr from-[#064e3b]/10 to-white arabian-pattern opacity-40" />
            )}

            <div className="relative z-10 max-w-lg space-y-10 animate-in fade-in zoom-in-95 duration-1000">
              <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.5em] border ${
                hasMedia ? 'bg-white/10 backdrop-blur-md text-white border-white/20' : 'bg-[#064e3b] text-white border-[#064e3b]'
              }`}>
                {item.type}
              </span>

              <h2 className={`text-4xl font-extrabold leading-tight tracking-tight ${
                hasMedia ? 'text-white' : 'text-slate-900'
              } ${['verse', 'hadith'].includes(item.type) ? 'quran-font italic' : ''}`}>
                {item.content}
              </h2>

              {item.summary && (
                <p className={`text-sm font-medium leading-relaxed opacity-80 max-w-md mx-auto ${hasMedia ? 'text-white' : 'text-slate-600'}`}>
                  {item.summary}
                </p>
              )}

              <p className="text-sm font-black uppercase tracking-[0.4em] text-[#d4af37]">
                {item.praise}
              </p>

              <button 
                onClick={() => handleExpand(item)}
                className={`flex items-center gap-4 mx-auto px-12 py-6 rounded-[40px] transition-all active:scale-95 shadow-2xl ${
                  hasMedia ? 'bg-[#d4af37] text-white shadow-[#d4af37]/40' : 'bg-[#064e3b] text-white'
                }`}
              >
                <BookOpen size={24} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Deep Revelation</span>
              </button>
            </div>
          </div>
        );
      })}

      {/* EXPANDED MODAL */}
      {expandedItem && (
        <div className="fixed inset-0 z-[200] bg-[#fdfbf7] animate-in slide-in-from-bottom-10 duration-500">
           {/* Header */}
           <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center bg-[#fdfbf7]/95 backdrop-blur-md z-20 border-b border-slate-100">
              <button onClick={() => setExpandedId(null)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#064e3b] bg-[#064e3b]/5 px-6 py-3 rounded-full hover:bg-[#064e3b]/10 transition-colors">
                <ChevronDown size={18} /> Close
              </button>
              <div className="flex items-center gap-2 text-[#d4af37]">
                 <Sparkles size={16} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Spiritual Depth</span>
              </div>
           </div>

           {/* Content */}
           <div className="h-full overflow-y-auto p-8 pt-32 scrollbar-hide">
              <div className="max-w-2xl mx-auto space-y-12 pb-40">
                <div className="space-y-6">
                  <span className="inline-block px-4 py-2 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    {expandedItem.type}
                  </span>
                  <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tighter">
                    {expandedItem.content}
                  </h3>
                  {expandedItem.source && (
                    <div className="border-l-4 border-[#d4af37] pl-6 py-2">
                       <p className="text-sm font-bold text-[#064e3b] uppercase tracking-widest">{expandedItem.source}</p>
                    </div>
                  )}
                </div>

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
                  <div className="prose prose-lg prose-slate max-w-none">
                     <div className="text-xl text-slate-700 leading-loose whitespace-pre-wrap font-serif">
                       {expandedItem.details || expandedItem.summary}
                     </div>
                     <div className="flex justify-center pt-16 opacity-30">
                       <Star size={24} className="text-[#d4af37]" />
                     </div>
                  </div>
                )}
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
            {loading ? 'Seeking Wisdom...' : 'End of Path'}
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
