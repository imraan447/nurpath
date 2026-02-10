import React, { useEffect, useState, useRef, useCallback } from 'react';
import { generateReflections } from '../services/geminiService';
import { ReflectionItem } from '../types';
import { SEED_REFLECTIONS } from '../constants';
import { ChevronDown, BookOpen, Loader2, Clock, Sparkles, RefreshCcw } from 'lucide-react';

const ReflectionFeed: React.FC = () => {
  const [items, setItems] = useState<ReflectionItem[]>(SEED_REFLECTIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchBatch = useCallback(async (count: number) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const newItems = await generateReflections(count);
      if (newItems.length > 0) {
        setItems(prev => [...prev, ...newItems]);
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message === 'QUOTA_EXCEEDED' ? 'QUOTA' : 'GENERAL');
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || error) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        fetchBatch(10);
      }
    }, { threshold: 0.1 });

    if (node) observer.current.observe(node);
  }, [loading, error, fetchBatch]);

  return (
    <div className="h-screen w-full bg-[#fdfbf7] snap-y snap-mandatory overflow-y-scroll scrollbar-hide">
      {items.map((item, index) => {
        const hasMedia = !!item.mediaUrl;
        const isTrigger = index === items.length - 2;

        return (
          <div 
            key={item.id + index}
            ref={isTrigger ? lastElementRef : null}
            className="snap-start h-screen w-full relative flex flex-col items-center justify-center p-10 text-center"
          >
            {hasMedia ? (
              <div className="absolute inset-0 z-0">
                <img src={item.mediaUrl} className="w-full h-full object-cover brightness-[0.4]" alt="" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90" />
              </div>
            ) : (
              <div className="absolute inset-0 z-0 bg-gradient-to-tr from-[#064e3b]/10 to-white arabian-pattern opacity-40" />
            )}

            <div className="relative z-10 max-w-lg space-y-10">
              <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.5em] shadow-2xl ${
                hasMedia ? 'bg-white/10 backdrop-blur-md text-white border border-white/20' : 'bg-[#064e3b] text-white'
              }`}>
                {item.type}
              </span>

              <h2 className={`text-5xl font-bold leading-tight tracking-tight ${
                hasMedia ? 'text-white drop-shadow-2xl' : 'text-slate-900'
              } ${['verse', 'hadith'].includes(item.type) ? 'quran-font' : ''}`}>
                {item.content}
              </h2>

              <button 
                onClick={() => setExpandedId(item.id)}
                className={`flex items-center gap-5 mx-auto px-16 py-7 rounded-[40px] transition-all active:scale-95 shadow-2xl ${
                  hasMedia ? 'bg-[#d4af37] text-white' : 'bg-[#064e3b] text-white'
                }`}
              >
                <BookOpen size={28} />
                <span className="text-sm font-black uppercase tracking-[0.3em]">Read Article</span>
              </button>
            </div>

            {expandedId === item.id && (
              <div className="fixed inset-0 z-[100] bg-[#fdfbf7] p-8 overflow-y-auto animate-in slide-in-from-bottom-10 duration-500 scrollbar-hide">
                <div className="max-w-2xl mx-auto space-y-12 py-12">
                  <div className="flex justify-between items-center sticky top-0 bg-[#fdfbf7]/98 backdrop-blur-lg py-5 z-20 border-b border-[#064e3b]/5">
                    <button onClick={() => setExpandedId(null)} className="text-xs font-black text-[#064e3b] flex items-center gap-3 uppercase tracking-widest bg-[#064e3b]/5 px-8 py-4 rounded-full">
                      <ChevronDown size={24} /> Close
                    </button>
                  </div>
                  
                  <div className="space-y-8 pt-10 text-left">
                    <div className="flex items-center gap-3 text-[#064e3b]/30">
                      <Sparkles size={24} />
                      <span className="text-[11px] font-black uppercase tracking-[0.6em]">{item.type}</span>
                    </div>
                    <h3 className="text-6xl font-bold text-slate-900 tracking-tighter leading-tight">{item.content}</h3>
                    {item.source && <p className="text-base font-bold text-[#d4af37] uppercase tracking-widest border-l-4 border-[#d4af37] pl-8 py-2">{item.source}</p>}
                  </div>

                  <div className="space-y-12 text-slate-700 text-left">
                    {item.details?.split('\n\n').map((paragraph, i) => (
                      <p key={i} className="text-2xl leading-[1.7] font-normal">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
      
      {loading && (
        <div className="snap-start h-screen w-full flex flex-col items-center justify-center bg-[#fdfbf7] gap-5 text-[#064e3b]">
          <Loader2 className="animate-spin" size={48} />
          <span className="text-[10px] font-black uppercase tracking-[0.5em]">Gathering Light...</span>
        </div>
      )}
    </div>
  );
};

export default ReflectionFeed;