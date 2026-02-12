import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, Group, Friend, FriendRequest, Quest, GroupQuest } from '../types';
import { ALL_QUESTS } from '../constants';
import { Users, UserPlus, Search, Trophy, Crown, Globe, MapPin, Loader2, Plus, Check, X, Shield, Star, Sparkles, ChevronRight } from 'lucide-react';
import QuestCard from './QuestCard';
import Leaderboard from './Leaderboard';

interface CommunityProps {
  currentUser: User;
  darkMode?: boolean;
  onCompleteGroupQuest: (quest: Quest) => void;
}

const Community: React.FC<CommunityProps> = ({ currentUser, darkMode, onCompleteGroupQuest }) => {
  const [tab, setTab] = useState<'groups' | 'friends' | 'leaderboard'>('groups');
  const [loading, setLoading] = useState(false);
  
  // Friends State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  
  // Groups State
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  useEffect(() => {
    if (tab === 'friends') {
      fetchFriendsAndRequests();
    } else if (tab === 'groups') {
      fetchGroups();
    }
  }, [tab, currentUser.id]);

  // --- FRIEND LOGIC ---

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, xp, country')
        .ilike('username', `%${searchQuery}%`)
        .neq('id', currentUser.id) // Don't show self
        .limit(5);
      
      if (error) throw error;
      setSearchResults(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (targetId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .insert({ user_id_1: currentUser.id, user_id_2: targetId });
      if (error) throw error;
      alert('Request sent!');
      setSearchResults(prev => prev.filter(p => p.id !== targetId));
    } catch (e: any) {
      alert('Error sending request (maybe already sent?)');
    }
  };

  const fetchFriendsAndRequests = async () => {
    setLoading(true);
    try {
      // Fetch Requests (where I am user_id_2 and status is pending)
      const { data: reqs } = await supabase
        .from('friendships')
        .select(`
          id, sender_id:user_id_1, status, created_at
        `)
        .eq('user_id_2', currentUser.id)
        .eq('status', 'pending');

      // Expand sender details
      if (reqs && reqs.length > 0) {
        const senderIds = reqs.map(r => r.sender_id);
        const { data: profiles } = await supabase.from('profiles').select('id, username, xp, country').in('id', senderIds);
        const enrichedReqs = reqs.map(r => ({
          ...r,
          sender: profiles?.find(p => p.id === r.sender_id)
        })) as unknown as FriendRequest[];
        setRequests(enrichedReqs);
      } else {
        setRequests([]);
      }

      // Fetch Friends (accepted)
      const { data: friendData } = await supabase
        .from('friendships')
        .select('user_id_1, user_id_2')
        .or(`user_id_1.eq.${currentUser.id},user_id_2.eq.${currentUser.id}`)
        .eq('status', 'accepted');
      
      const friendIds = friendData?.map(f => f.user_id_1 === currentUser.id ? f.user_id_2 : f.user_id_1) || [];
      
      if (friendIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, xp, country, active_quests')
          .in('id', friendIds);
        setFriends(profiles || []);
      } else {
        setFriends([]);
      }

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const respondToRequest = async (reqId: string, accept: boolean) => {
    try {
      if (accept) {
        await supabase.from('friendships').update({ status: 'accepted' }).eq('id', reqId);
      } else {
        await supabase.from('friendships').delete().eq('id', reqId);
      }
      fetchFriendsAndRequests();
    } catch (e) {
      console.error(e);
    }
  };

  // --- GROUP LOGIC ---

  const createGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      const { data: group, error } = await supabase
        .from('groups')
        .insert({ name: newGroupName, created_by: currentUser.id })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add self as member
      await supabase.from('group_members').insert({ group_id: group.id, user_id: currentUser.id });
      
      setGroups(prev => [...prev, group]);
      setNewGroupName('');
      setShowCreateGroup(false);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const { data: members } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', currentUser.id);
      
      const groupIds = members?.map(m => m.group_id) || [];
      
      if (groupIds.length > 0) {
        const { data: groupsData } = await supabase.from('groups').select('*').in('id', groupIds);
        setGroups(groupsData || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openGroup = async (group: Group) => {
    setLoading(true);
    try {
      // Fetch members
      const { data: members } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', group.id);
        
      const userIds = members?.map(m => m.user_id) || [];
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, xp, country, active_quests')
        .in('id', userIds);
      
      setActiveGroup({ ...group, members: profiles || [] });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addFriendToGroup = async (friendId: string) => {
    if (!activeGroup) return;
    try {
      await supabase.from('group_members').insert({ group_id: activeGroup.id, user_id: friendId });
      alert('Added to group!');
      openGroup(activeGroup); // refresh
    } catch (e) {
      console.error(e);
    }
  };

  // --- GROUP QUEST CALCULATION ---
  const getGroupQuests = (): GroupQuest[] => {
    if (!activeGroup || !activeGroup.members) return [];
    
    // Find quests that I have active
    const myQuests = currentUser.activeQuests || [];
    const sharedQuests: GroupQuest[] = [];

    myQuests.forEach(questId => {
      // Find other members who have this quest active
      const others = activeGroup.members!.filter(m => m.id !== currentUser.id && m.active_quests?.includes(questId));
      
      if (others.length > 0) {
        const questDef = ALL_QUESTS.find(q => q.id === questId);
        if (questDef) {
          sharedQuests.push({
            ...questDef,
            sharedBy: others.map(o => o.username)
          });
        }
      }
    });

    return sharedQuests;
  };

  return (
    <div className="h-full flex flex-col bg-[#fdfbf7] dark:bg-[#050a09]">
      {/* Header */}
      <div className={`p-6 pb-2 border-b border-slate-100 dark:border-white/5`}>
        <div className="flex items-center gap-3 mb-6">
           <div className="w-12 h-12 bg-[#064e3b] rounded-2xl flex items-center justify-center shadow-lg text-white minaret-shape">
              <Users size={24} />
           </div>
           <div>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Community</h2>
              <p className="text-[10px] text-[#d4af37] font-black uppercase tracking-widest">Connect & Compete</p>
           </div>
        </div>

        <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl">
           <button onClick={() => setTab('groups')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${tab === 'groups' ? 'bg-white dark:bg-white/10 shadow-md text-[#064e3b] dark:text-white' : 'text-slate-400'}`}>Groups</button>
           <button onClick={() => setTab('friends')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${tab === 'friends' ? 'bg-white dark:bg-white/10 shadow-md text-[#064e3b] dark:text-white' : 'text-slate-400'}`}>Friends</button>
           <button onClick={() => setTab('leaderboard')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${tab === 'leaderboard' ? 'bg-white dark:bg-white/10 shadow-md text-[#064e3b] dark:text-white' : 'text-slate-400'}`}>Rankings</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
         
         {/* --- GROUPS TAB --- */}
         {tab === 'groups' && !activeGroup && (
           <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
             <button 
                onClick={() => setShowCreateGroup(!showCreateGroup)}
                className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl flex items-center justify-center gap-2 text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
             >
               <Plus size={20} /> Create New Group
             </button>
             
             {showCreateGroup && (
               <div className="p-4 bg-white dark:bg-white/5 rounded-3xl shadow-lg space-y-3">
                 <input 
                   type="text" 
                   placeholder="Group Name (e.g. Fajr Warriors)" 
                   className="w-full p-3 bg-slate-50 dark:bg-black/20 rounded-xl outline-none border border-transparent focus:border-[#064e3b]"
                   value={newGroupName}
                   onChange={e => setNewGroupName(e.target.value)}
                 />
                 <button onClick={createGroup} className="w-full py-3 bg-[#064e3b] text-white rounded-xl font-bold text-xs uppercase tracking-widest">Create</button>
               </div>
             )}

             <div className="space-y-3">
               {groups.length === 0 ? (
                 <div className="text-center py-10 opacity-40">
                   <Users size={48} className="mx-auto mb-4 text-slate-300" />
                   <p className="text-sm font-bold text-slate-400">No groups yet.</p>
                 </div>
               ) : (
                 groups.map(g => (
                   <div key={g.id} onClick={() => openGroup(g)} className="p-6 bg-white dark:bg-white/5 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-transform">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
                          <Shield size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg dark:text-white">{g.name}</h3>
                          <p className="text-xs text-slate-400">Click to enter</p>
                        </div>
                     </div>
                     <ChevronRight className="text-slate-300" />
                   </div>
                 ))
               )}
             </div>
           </div>
         )}

         {/* --- ACTIVE GROUP VIEW --- */}
         {tab === 'groups' && activeGroup && (
            <div className="space-y-8 animate-in zoom-in-95">
               <button onClick={() => setActiveGroup(null)} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#064e3b]">
                  <ChevronRight className="rotate-180" size={14} /> Back to Groups
               </button>

               <div className="text-center">
                  <h2 className="text-3xl font-bold dark:text-white mb-2">{activeGroup.name}</h2>
                  <div className="flex justify-center -space-x-2">
                     {activeGroup.members?.map((m, i) => (
                       <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white dark:border-[#050a09] flex items-center justify-center text-[10px] font-bold text-slate-500" title={m.username}>
                         {m.username[0].toUpperCase()}
                       </div>
                     ))}
                     <button 
                       onClick={() => {
                         const friendName = prompt("Enter Friend's Username to add:");
                         const friend = friends.find(f => f.username === friendName);
                         if (friend) addFriendToGroup(friend.id);
                         else if (friendName) alert("Friend not found or not in your friend list.");
                       }}
                       className="w-8 h-8 rounded-full bg-[#064e3b] text-white border-2 border-white dark:border-[#050a09] flex items-center justify-center"
                     >
                       <Plus size={14} />
                     </button>
                  </div>
               </div>
               
               {/* GROUP QUESTS SECTION */}
               <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="text-[#d4af37]" size={20} />
                    <h3 className="font-black uppercase tracking-widest text-sm text-[#064e3b] dark:text-[#d4af37]">Group Quests (2x XP)</h3>
                  </div>
                  
                  {getGroupQuests().length === 0 ? (
                    <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl text-center border border-dashed border-slate-200 dark:border-white/10">
                      <p className="text-xs text-slate-400 leading-relaxed">
                        No shared active quests.<br/>
                        When you and a group member accept the same quest (e.g. Tahajjud), it appears here with <strong>Double XP</strong>.
                      </p>
                    </div>
                  ) : (
                    getGroupQuests().map(q => (
                       <div key={q.id} className="relative">
                          <div className="absolute -top-3 -right-2 z-10 bg-[#d4af37] text-white text-[9px] font-black px-2 py-1 rounded-full shadow-md animate-bounce">
                            2x XP ACTIVE
                          </div>
                          <div className="mb-2 text-[10px] text-slate-400 pl-4">
                            Also active for: <span className="text-[#064e3b] dark:text-emerald-400 font-bold">{q.sharedBy.join(', ')}</span>
                          </div>
                          <QuestCard 
                            quest={q} 
                            isActive={true} 
                            onComplete={() => onCompleteGroupQuest(q)} // Parent handles 2x logic
                            darkMode={darkMode}
                          />
                       </div>
                    ))
                  )}
               </div>
            </div>
         )}

         {/* --- FRIENDS TAB --- */}
         {tab === 'friends' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
             {/* Search */}
             <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                 type="text" 
                 placeholder="Find seekers by username..." 
                 className="w-full p-4 pl-12 bg-white dark:bg-white/5 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-[#064e3b]/20 dark:text-white"
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && searchUsers()}
               />
               <button onClick={searchUsers} className="absolute right-2 top-2 p-2 bg-[#064e3b] text-white rounded-xl">
                 {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
               </button>
             </div>

             {/* Search Results */}
             {searchResults.length > 0 && (
               <div className="space-y-2">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Results</h3>
                 {searchResults.map(res => (
                   <div key={res.id} className="p-4 bg-white dark:bg-white/5 rounded-2xl flex justify-between items-center shadow-sm">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">{res.username[0].toUpperCase()}</div>
                       <div>
                         <p className="font-bold text-sm dark:text-white">{res.username}</p>
                         <p className="text-[10px] text-slate-400">{res.country}</p>
                       </div>
                     </div>
                     <button onClick={() => sendFriendRequest(res.id)} className="p-2 bg-[#064e3b]/10 text-[#064e3b] rounded-full hover:bg-[#064e3b] hover:text-white transition-colors">
                       <UserPlus size={18} />
                     </button>
                   </div>
                 ))}
               </div>
             )}

             {/* Friend Requests */}
             {requests.length > 0 && (
               <div className="space-y-2">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Requests</h3>
                 {requests.map(req => (
                   <div key={req.id} className="p-4 bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-2xl flex justify-between items-center">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-[#d4af37] shadow-sm">{req.sender?.username[0].toUpperCase()}</div>
                         <div>
                            <p className="font-bold text-sm dark:text-white">{req.sender?.username}</p>
                            <p className="text-[10px] text-slate-500">Wants to connect</p>
                         </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => respondToRequest(req.id, true)} className="p-2 bg-[#064e3b] text-white rounded-full"><Check size={16} /></button>
                        <button onClick={() => respondToRequest(req.id, false)} className="p-2 bg-rose-500 text-white rounded-full"><X size={16} /></button>
                      </div>
                   </div>
                 ))}
               </div>
             )}

             {/* My Friends */}
             <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Your Circle</h3>
                {friends.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-4">You haven't added any seekers yet.</p>
                ) : (
                  friends.map(f => (
                    <div key={f.id} className="p-4 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-between shadow-sm">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#064e3b]/10 text-[#064e3b] rounded-full flex items-center justify-center font-bold">{f.username[0].toUpperCase()}</div>
                          <div>
                             <p className="font-bold text-sm dark:text-white">{f.username}</p>
                             <p className="text-[10px] text-slate-400">{f.xp.toLocaleString()} XP • {f.country}</p>
                          </div>
                       </div>
                    </div>
                  ))
                )}
             </div>
           </div>
         )}

         {/* --- LEADERBOARD TAB --- */}
         {tab === 'leaderboard' && (
           <Leaderboard 
             currentUserId={currentUser.id} 
             currentUserCountry={currentUser.country} 
             onClose={() => {}} // No-op since it's embedded
             darkMode={darkMode}
             embedded={true}
           />
         )}

      </div>
    </div>
  );
};

export default Community;