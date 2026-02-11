
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Trophy, Globe, MapPin, Loader2, Crown } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  username: string;
  xp: number;
  country: string;
  rank?: number;
}

interface LeaderboardProps {
  currentUserCountry?: string;
  currentUserId?: string;
  onClose: () => void;
  darkMode?: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ currentUserCountry, currentUserId, onClose, darkMode }) => {
  const [activeTab, setActiveTab] = useState<'global' | 'country'>('global');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('id, username, xp, country')
        .order('xp', { ascending: false })
        .limit(50);

      if (activeTab === 'country' && currentUserCountry) {
        query = query.eq('country', currentUserCountry);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        setEntries(data as LeaderboardEntry[]);
      }
    } catch (e) {
      console.error("Leaderboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[80] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in`}>
      <div className={`w-full max-w-md h-[80vh] flex flex-col rounded-[40px] shadow-2xl relative overflow-hidden ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
        
        {/* Header */}
        <div className="p-6 pb-2 shrink-0 z-10 bg-inherit">
           <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-[#d4af37] rounded-2xl flex items-center justify-center shadow-lg text-white">
                    <Trophy size={24} />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold">Leaderboard</h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Top Seekers</p>
                 </div>
              </div>
              <button onClick={onClose} className="px-4 py-2 bg-slate-100 dark:bg-white/10 rounded-full text-xs font-bold text-slate-500 dark:text-slate-300">Close</button>
           </div>

           <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl">
              <button 
                onClick={() => setActiveTab('global')}
                className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'global' ? 'bg-white dark:bg-white/10 shadow-md text-[#064e3b] dark:text-white' : 'text-slate-400'}`}
              >
                <Globe size={14} /> Global
              </button>
              <button 
                onClick={() => setActiveTab('country')}
                className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'country' ? 'bg-white dark:bg-white/10 shadow-md text-[#064e3b] dark:text-white' : 'text-slate-400'}`}
              >
                <MapPin size={14} /> {currentUserCountry || 'National'}
              </button>
           </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-3 scrollbar-hide">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3 opacity-50">
                    <Loader2 className="animate-spin text-[#064e3b] dark:text-emerald-400" size={32} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Loading Ranks...</span>
                </div>
            ) : entries.length === 0 ? (
                <div className="text-center py-10 opacity-50">
                    <p>No seekers found in this region yet.</p>
                </div>
            ) : (
                entries.map((entry, index) => {
                    const isMe = entry.id === currentUserId;
                    const rank = index + 1;
                    return (
                        <div 
                            key={entry.id}
                            className={`flex items-center gap-4 p-4 rounded-[24px] border transition-all ${
                                isMe 
                                    ? 'bg-[#064e3b]/5 border-[#064e3b]/20 dark:bg-emerald-900/20 dark:border-emerald-500/30' 
                                    : 'bg-slate-50 border-slate-100 dark:bg-white/5 dark:border-white/5'
                            }`}
                        >
                            <div className={`w-10 h-10 flex items-center justify-center rounded-full font-black text-sm ${
                                rank === 1 ? 'bg-[#d4af37] text-white shadow-lg shadow-[#d4af37]/40' :
                                rank === 2 ? 'bg-slate-300 text-slate-600' :
                                rank === 3 ? 'bg-orange-300 text-orange-800' :
                                'bg-slate-200 text-slate-400 dark:bg-white/10'
                            }`}>
                                {rank <= 3 ? <Crown size={16} /> : rank}
                            </div>
                            
                            <div className="flex-1">
                                <h3 className={`font-bold text-sm ${isMe ? 'text-[#064e3b] dark:text-emerald-400' : ''}`}>
                                    {entry.username} {isMe && '(You)'}
                                </h3>
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{entry.country}</p>
                            </div>

                            <div className="text-right">
                                <span className="block font-black text-[#d4af37]">{entry.xp.toLocaleString()}</span>
                                <span className="text-[8px] uppercase tracking-widest text-slate-400">XP</span>
                            </div>
                        </div>
                    );
                })
            )}
        </div>

        {/* Footer info */}
        <div className="p-4 text-center bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/10">
            <p className="text-[10px] text-slate-400">Ranks updated in real-time</p>
        </div>

      </div>
    </div>
  );
};

export default Leaderboard;
