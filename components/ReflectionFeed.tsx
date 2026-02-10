import React, { useEffect, useState, useRef } from 'react';
import { ReflectionItem } from '../types';
import { ChevronDown, BookOpen, Loader2, Sparkles, Star } from 'lucide-react';

interface ReflectionFeedProps {
  items: ReflectionItem[];
  loading: boolean;
  onLoadMore: () => void;
}

const ReflectionFeed: React.FC<ReflectionFeedProps> = ({ items, loading, onLoadMore }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Monitor visible index to trigger load-more when reaching card total-2 (e.g. 8/10, 14/16)
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          // If we reach the 2nd to last card, trigger loading 6 more
          if (index >= items.length - 2 && !loading) {
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
  }, [items.length, loading, onLoadMore]);

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

              <p className="text-sm font-black uppercase tracking-[0.4em] text-[#d4af37]">
                {item.praise}
              </p>

              <button 
                onClick={() => setExpandedId(item.id)}
                className={`flex items-center gap-4 mx-auto px-12 py-6 rounded-[40px] transition-all active:scale-95 shadow-2xl ${
                  hasMedia ? 'bg-[#d4af37] text-white shadow-[#d4af37]/40' : 'bg-[#064e3b] text-white'
                }`}
              >
                <BookOpen size={24} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Deep Revelation</span>
              </button>
            </div>

            {expandedId === item.id && (
              <div className="fixed inset-0 z-[200] bg-[#fdfbf7] p-8 overflow-y-auto animate-in slide-in-from-bottom-10 duration-700 scrollbar-hide">
                <div className="max-w-2xl mx-auto space-y-12 py-10">
                  <div className="flex justify-between items-center sticky top-0 bg-[#fdfbf7]/95 backdrop-blur-md py-4 z-20 border-b border-slate-100">
                    <button onClick={() => setExpandedId(null)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#064e3b] bg-[#064e3b]/5 px-8 py-4 rounded-full">
                      <ChevronDown size={20} /> Close
                    </button>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Spiritual Growth</span>
                  </div>
                  
                  <div className="space-y-6 pt-10 text-left">
                    <div className="flex items-center gap-2 text-[#d4af37]">
                      <Sparkles size={24} />
                      <span className="text-[11px] font-black uppercase tracking-[0.5em]">{item.type}</span>
                    </div>
                    <h3 className="text-5xl font-extrabold text-slate-900 leading-tight tracking-tighter">{item.content}</h3>
                    {item.source && <p className="text-sm font-bold text-[#064e3b] uppercase tracking-widest border-l-4 border-[#d4af37] pl-6 py-2 bg-[#064e3b]/5 rounded-r-lg">{item.source}</p>}
                  </div>

                  <div className="space-y-10 text-slate-700 text-xl leading-relaxed text-left pb-40 whitespace-pre-wrap selection:bg-[#d4af37]/20">
                    {item.details}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
      
      {/* Scroll Sentinel / Bottom Loader */}
      <div className="snap-start h-screen w-full flex flex-col items-center justify-center bg-[#fdfbf7] gap-4">
        <div className="relative">
          <Loader2 className={`animate-spin text-[#064e3b] ${loading ? 'opacity-100' : 'opacity-20'}`} size={64} />
          <Star className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#d4af37]" size={24} />
        </div>
        <span className="text-[12px] font-black uppercase tracking-[0.6em] text-[#d4af37]">
          {loading ? 'Seeking Illumination...' : 'End of Path'}
        </span>
      </div>
    </div>
  );
};

export default ReflectionFeed;