import React, { useState, useEffect, useRef } from 'react';
import { SEERAH_TIMELINE } from '../data/citadelData';
import { ChevronLeft, Compass, Target, Lock, Map, Search, BookOpen, Clock, Shield, Key, Sparkles, Scroll, MapPin } from 'lucide-react';
import { User } from '../types';

type ViewState = 'aerial' | 'map' | 'world' | 'room';
type LibrarySubView = 'hub' | 'seerah';
type WingId = 'seerah' | 'apologetics' | 'sanctuary' | 'treasury' | 'library' | 'wazifa' | 'kitchen' | 'barracks' | 'retreat' | null;

interface CitadelProps {
    user: User | null;
}

const Citadel: React.FC<CitadelProps> = ({ user }) => {
    const [view, setView] = useState<ViewState>('aerial');
    const [activeWing, setActiveWing] = useState<WingId>(null);
    const [transitionStage, setTransitionStage] = useState(0);
    const [librarySubView, setLibrarySubView] = useState<LibrarySubView>('hub');
    const mapContainerRef = useRef<HTMLDivElement>(null);

    // Preload
    useEffect(() => {
        const images = [
            '/images/citadel.png',
            '/images/mini-map2.png',
            '/images/citadel4.png',
        ];
        images.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }, []);

    // Center map on enter
    useEffect(() => {
        if (view === 'map' && mapContainerRef.current) {
            const el = mapContainerRef.current;
            // Center horizontal scroll
            el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
            // Center vertical scroll (offset slightly to show library better)
            el.scrollTop = (el.scrollHeight - el.clientHeight) / 2 - 150;
        }
    }, [view]);

    const enterCitadel = () => {
        setView('map');
    };

    const handleEnterWing = (wing: WingId) => {
        if (!wing) return;
        setActiveWing(wing);

        // COSMIC ZOOM SEQUENCE
        setView('world');
        setTransitionStage(0);

        setTimeout(() => setTransitionStage(1), 100);

        setTimeout(() => {
            setView('room');
            setTransitionStage(0);
        }, 2000);
    };

    const handleReturnToMap = () => {
        setView('map');
        setActiveWing(null);
        setTransitionStage(0);
        setLibrarySubView('hub');
    };

    // --- AERIAL VIEW (Cinematic Start) ---
    if (view === 'aerial') {
        return (
            <div className="relative w-full h-full min-h-screen bg-black overflow-hidden animate-in fade-in duration-1000">
                <div
                    className="absolute inset-0 bg-cover bg-[center_top] bg-no-repeat transition-transform duration-[20s] scale-110 hover:scale-100 ease-linear"
                    style={{ backgroundImage: 'url("/images/citadel.png")' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />

                <div className="absolute inset-0 bottom-24 flex flex-col items-center justify-center z-20 text-center p-6">
                    <div className="mb-8">
                        <h1 className="text-5xl md:text-7xl font-serif text-[#fbbf24] drop-shadow-[0_0_30px_rgba(251,191,36,0.3)] tracking-widest uppercase mb-2">The Citadel</h1>
                        <div className="h-[1px] w-32 bg-[#fbbf24]/50 mx-auto my-4" />
                        <p className="text-white/80 font-serif italic text-xl tracking-wide">Knowledge, featured quests and more!</p>
                    </div>

                    <button
                        onClick={enterCitadel}
                        className="group relative px-12 py-4 rounded-full bg-[#fbbf24] text-[#0c0a09] uppercase tracking-[0.3em] font-black text-sm transition-all duration-500 hover:bg-[#fbbf24]/90 cursor-pointer shadow-[0_0_40px_rgba(251,191,36,0.3)]"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            <span>Enter</span>
                            <Map className="w-4 h-4" />
                        </span>
                    </button>
                </div>
            </div>
        );
    }

    // --- MAP VIEW (Scrollable + Mobile Lock) ---
    if (view === 'map' || view === 'world') {
        return (
            <div className="relative h-full w-full bg-[#050a09] overflow-hidden flex justify-center">

                {/* Mobile Constraint Container */}
                <div className="relative w-full max-w-[440px] h-full shadow-[0_0_50px_rgba(0,0,0,0.8)] border-x border-[#ffffff10] overflow-hidden bg-[#1a1a1a]">

                    {/* Scrollable Map Container */}
                    <div
                        ref={mapContainerRef}
                        className="absolute inset-0 overflow-auto scrollbar-hide overscroll-contain"
                    >
                        {/* Map Image Wrapper - NATIVE ASPECT RATIO */}
                        {/* Native is 1536 x 2752 (0.558) */}
                        {/* Using half-scale: 768 x 1376 to manage scroll area size */}
                        <div className="relative w-[768px] h-[1376px]">

                            {/* The Image - No Distortion */}
                            <div className={`absolute inset-0 transition-transform duration-[1500ms] ease-in-out ${view === 'world' ? 'scale-[3] opacity-0' : 'scale-100 opacity-100'}`}>
                                <img
                                    src="/images/mini-map2.png"
                                    alt="Citadel Map"
                                    className="w-full h-full object-fill"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#050a09] via-transparent to-[#050a09]/30 mix-blend-multiply pointer-events-none" />
                            </div>

                            {/* Icons (Calibrated to Target ILLUSTRATIONS, not labels) */}
                            {/* Library: Open Book (Top Left) */}
                            {/* Treasury: Chest (Center) */}
                            {/* Armoury: Shield/Swords (Bottom Left) */}
                            {/* Retreat: Tree/Building (Top Right) */}
                            {/* Kitchen: Cauldron (Bottom Right) */}

                            <div className={`absolute inset-0 z-20 transition-all duration-500 ${view === 'world' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>

                                {/* GRAND LIBRARY BUTTON - Gold Map Pin */}
                                <button
                                    onClick={() => handleEnterWing('library')}
                                    className="absolute top-[29%] left-[36%] -translate-x-1/2 -translate-y-[100%] group"
                                >
                                    <div className="relative flex flex-col items-center">
                                        <div className="absolute inset-0 -m-4 rounded-full cursor-pointer z-0" /> {/* Hitbox */}
                                        {/* Pin Icon */}
                                        <div className="relative z-10 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] group-hover:-translate-y-2 transition-transform duration-300">
                                            <MapPin
                                                size={48}
                                                className="text-[#d4af37] fill-[#d4af37] stroke-[1.5px] stroke-black"
                                            />
                                            {/* Inner Icon */}
                                            <div className="absolute top-[10px] left-1/2 -translate-x-1/2 text-black">
                                                <BookOpen size={14} strokeWidth={3} />
                                            </div>
                                        </div>
                                        {/* Pulse Effect */}
                                        <div className="absolute bottom-0 w-4 h-1 bg-[#d4af37] rounded-[100%] blur-[2px] opacity-50 animate-pulse" />
                                    </div>
                                </button>

                                {/* TREASURY (LOCKED) - on the chest illustration */}
                                <div className="absolute top-[38%] left-[53%] -translate-x-1/2 -translate-y-[100%] opacity-90 group cursor-not-allowed">
                                    <div className="relative z-10 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] grayscale brightness-75 hover:grayscale-0 hover:brightness-100 transition-all">
                                        <MapPin
                                            size={40}
                                            className="text-[#d4af37] fill-[#d4af37] stroke-[1.5px] stroke-black"
                                        />
                                        <div className="absolute top-[8px] left-1/2 -translate-x-1/2 text-black">
                                            <Key size={12} strokeWidth={3} />
                                        </div>
                                    </div>
                                </div>

                                {/* ARMOURY (LOCKED) - on the crossed swords illustration */}
                                <div className="absolute top-[49%] left-[32%] -translate-x-1/2 -translate-y-[100%] opacity-90 group cursor-not-allowed">
                                    <div className="relative z-10 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] grayscale brightness-75 hover:grayscale-0 hover:brightness-100 transition-all">
                                        <MapPin
                                            size={40}
                                            className="text-[#d4af37] fill-[#d4af37] stroke-[1.5px] stroke-black"
                                        />
                                        <div className="absolute top-[8px] left-1/2 -translate-x-1/2 text-black">
                                            <Shield size={12} strokeWidth={3} />
                                        </div>
                                    </div>
                                </div>

                                {/* SPIRITUAL RETREAT (LOCKED) */}
                                <div className="absolute top-[26%] left-[74%] -translate-x-1/2 -translate-y-[100%] opacity-90 group cursor-not-allowed">
                                    <div className="relative z-10 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] grayscale brightness-75 hover:grayscale-0 hover:brightness-100 transition-all">
                                        <MapPin
                                            size={40}
                                            className="text-[#d4af37] fill-[#d4af37] stroke-[1.5px] stroke-black"
                                        />
                                        <div className="absolute top-[8px] left-1/2 -translate-x-1/2 text-black">
                                            <Compass size={12} strokeWidth={3} />
                                        </div>
                                    </div>
                                </div>

                                {/* GRAND KITCHEN (LOCKED) - on the cauldron illustration */}
                                <div className="absolute top-[55%] left-[72%] -translate-x-1/2 -translate-y-[100%] opacity-90 group cursor-not-allowed">
                                    <div className="relative z-10 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] grayscale brightness-75 hover:grayscale-0 hover:brightness-100 transition-all">
                                        <MapPin
                                            size={40}
                                            className="text-[#d4af37] fill-[#d4af37] stroke-[1.5px] stroke-black"
                                        />
                                        <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border-2 border-black bg-transparent" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Banner - overlaps map edge for seamless transition */}
                        <div className="w-[768px] -mt-24 relative z-10 px-8 pt-32 pb-40 bg-gradient-to-b from-[#050a09]/0 via-[#050a09]/90 to-[#050a09]">
                            <div className="max-w-sm mx-auto text-center space-y-4">
                                <div className="w-12 h-12 mx-auto rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center">
                                    <Lock size={20} className="text-[#d4af37]/60" />
                                </div>
                                <p className="text-sm text-[#d4af37]/70 font-medium leading-relaxed">
                                    Continue your journey and level up to unlock new areas of the Citadel and collect featured quests.
                                </p>
                                <div className="h-px w-24 bg-[#d4af37]/20 mx-auto" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // (World view is handled within the map view block above via view === 'world' checks)

    // --- ROOM VIEW (Internal Content) ---
    if (view === 'room' && activeWing === 'library') {

        // SUB-VIEW: Seerah Timeline (full timeline content)
        if (librarySubView === 'seerah') {
            return (
                <div className="relative h-full bg-[#050a09] text-slate-300 overflow-hidden flex justify-center">
                    <div className="w-full max-w-[440px] h-full bg-[#050a09] flex flex-col animate-in fade-in duration-500 shadow-2xl border-x border-[#ffffff10]">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-[#d4af37]/20 bg-[#050a09]/90 backdrop-blur z-20">
                            <button onClick={() => setLibrarySubView('hub')} className="flex items-center gap-2 text-[#d4af37] hover:text-[#d4af37]/80 transition-colors group">
                                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                                <span className="text-xs font-black uppercase tracking-widest">Library</span>
                            </button>
                            <div className="flex flex-col items-center">
                                <h2 className="text-lg font-black text-[#d4af37] uppercase tracking-[0.2em]">Seerah</h2>
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">The Prophetic Biography</span>
                            </div>
                            <div className="w-8" />
                        </div>

                        {/* Seerah Timeline Content */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 pb-32">
                            <div className="relative border-l-2 border-[#d4af37]/20 ml-4 space-y-12 py-4">
                                {SEERAH_TIMELINE.map((event, index) => (
                                    <div key={event.id} className="relative pl-8 group">
                                        <div className={`absolute -left-[9px] top-6 w-4 h-4 rounded-full border-2 transition-all bg-[#050a09] border-[#d4af37] group-hover:bg-[#d4af37] group-hover:scale-125 shadow-[0_0_10px_rgba(212,175,55,0.4)]`} />

                                        <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#d4af37]/50 transition-all hover:bg-white/10">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest bg-[#d4af37]/10 px-2 py-1 rounded">{event.era}</span>
                                                <span className="text-[10px] font-bold text-slate-500">{event.year}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#d4af37] transition-colors">{event.title}</h3>
                                            <p className="text-sm text-slate-400 mb-4 leading-relaxed">{event.summary}</p>

                                            {event.quranicRef && (
                                                <div className="flex items-center gap-2 p-3 rounded-xl bg-black/40 border border-[#d4af37]/10">
                                                    <Scroll size={14} className="text-[#d4af37]" />
                                                    <span className="text-xs text-[#d4af37]/80 italic">"{event.quranicRef}"</span>
                                                </div>
                                            )}

                                            <div className="mt-4 pt-4 border-t border-white/5">
                                                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Key Lesson</p>
                                                <p className="text-xs text-slate-300 mt-1">{event.keyLesson}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // SUB-VIEW: Library Hub (default - featured card + placeholders)
        return (
            <div className="relative h-full bg-[#050a09] text-slate-300 overflow-hidden flex justify-center">
                <div className="w-full max-w-[440px] h-full bg-[#050a09] flex flex-col animate-in fade-in zoom-in duration-700 shadow-2xl border-x border-[#ffffff10]">
                    {/* Header / Nav */}
                    <div className="flex items-center justify-between p-6 border-b border-[#d4af37]/20 bg-[#050a09]/90 backdrop-blur z-20">
                        <button onClick={handleReturnToMap} className="flex items-center gap-2 text-[#d4af37] hover:text-[#d4af37]/80 transition-colors group">
                            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-xs font-black uppercase tracking-widest">Map</span>
                        </button>
                        <div className="flex flex-col items-center">
                            <h2 className="text-lg font-black text-[#d4af37] uppercase tracking-[0.2em]">Grand Library</h2>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Knowledge Awaits</span>
                        </div>
                        <div className="w-8" />
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 pb-32">
                        <div className="max-w-2xl mx-auto space-y-8">
                            {/* Featured Seerah Card - CLICKABLE */}
                            <button
                                onClick={() => setLibrarySubView('seerah')}
                                className="w-full text-left relative p-8 rounded-[30px] border border-[#d4af37]/30 bg-gradient-to-br from-[#d4af37]/10 to-transparent overflow-hidden group hover:border-[#d4af37]/60 transition-all active:scale-[0.98]"
                            >
                                <div className="text-center">
                                    <BookOpen size={48} className="text-[#d4af37] mx-auto mb-4 opacity-80 group-hover:scale-110 transition-transform" />
                                    <h3 className="text-2xl font-bold text-white mb-2">The Prophetic Biography</h3>
                                    <p className="text-sm text-[#d4af37]/80 max-w-xs mx-auto mb-6">Study the life of the Messenger ﷺ. This is the primary collection available at this time.</p>

                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#d4af37] text-[10px] font-black uppercase tracking-widest">
                                        <Sparkles size={12} /> Featured Collection
                                    </div>
                                </div>
                                {/* Hover arrow hint */}
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[#d4af37]/30 group-hover:text-[#d4af37]/70 group-hover:translate-x-1 transition-all">
                                    <ChevronLeft size={20} className="rotate-180" />
                                </div>
                            </button>

                            {/* Sections Grid (Future Proofing) */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="group relative p-6 rounded-3xl border border-white/10 bg-white/5 overflow-hidden text-center opacity-70 hover:opacity-100 transition-opacity">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Lock size={20} className="text-slate-500 mx-auto mb-2" />
                                    <h4 className="text-sm font-bold text-slate-300">Fiqh of Worship</h4>
                                    <span className="text-[10px] text-[#d4af37] font-bold uppercase tracking-widest mt-2 block">Coming Soon</span>
                                </div>
                                <div className="group relative p-6 rounded-3xl border border-white/10 bg-white/5 overflow-hidden text-center opacity-70 hover:opacity-100 transition-opacity">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Lock size={20} className="text-slate-500 mx-auto mb-2" />
                                    <h4 className="text-sm font-bold text-slate-300">Aqeedah</h4>
                                    <span className="text-[10px] text-[#d4af37] font-bold uppercase tracking-widest mt-2 block">Coming Soon</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null; // Fallback
};

export default Citadel;
