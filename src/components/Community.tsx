import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, Group, GroupMember, Friend, FriendRequest, Quest, GroupQuest, GroupInvite, GroupQuestItem, Dua } from '../types';
import { ALL_QUESTS } from '../constants';
import { Users, UserPlus, Search, Trophy, Crown, Globe, MapPin, Loader2, Plus, Check, X, Shield, Star, Sparkles, ChevronRight, ChevronDown, Heart, Send, Trash2, LogOut, Settings, Mail } from 'lucide-react';
import QuestCard from './QuestCard';
import Leaderboard from './Leaderboard';

interface CommunityProps {
  currentUser: User;
  darkMode?: boolean;
  onCompleteGroupQuest: (quest: Quest) => void;
}

const Community: React.FC<CommunityProps> = ({ currentUser, darkMode, onCompleteGroupQuest }) => {
  const [tab, setTab] = useState<'duas' | 'leaderboard' | 'friends' | 'groups'>('duas');
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
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [groupTab, setGroupTab] = useState<'leaderboard' | 'quests'>('quests');
  const [groupInvites, setGroupInvites] = useState<GroupInvite[]>([]);
  const [groupQuests, setGroupQuests] = useState<GroupQuestItem[]>([]);
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [showAddQuest, setShowAddQuest] = useState(false);
  const [inviteFriendSearch, setInviteFriendSearch] = useState('');
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [myRole, setMyRole] = useState<'admin' | 'member'>('member');

  // Duas State
  const [duas, setDuas] = useState<Dua[]>([]);
  const [newDuaText, setNewDuaText] = useState('');
  const [duaLoading, setDuaLoading] = useState(false);

  useEffect(() => {
    if (tab === 'friends') fetchFriendsAndRequests();
    else if (tab === 'groups') { fetchGroups(); fetchGroupInvites(); }
    else if (tab === 'duas') fetchDuas();
  }, [tab, currentUser.id]);

  // ==================== DUAS LOGIC ====================

  const fetchDuas = async () => {
    setDuaLoading(true);
    try {
      const { data: duasData } = await supabase
        .from('duas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!duasData) { setDuas([]); return; }

      // Get usernames
      const userIds = [...new Set(duasData.map(d => d.user_id))];
      const { data: profiles } = await supabase.from('profiles').select('id, username').in('id', userIds);

      // Check which ones I said ameen to
      const { data: myAmeens } = await supabase
        .from('dua_ameens')
        .select('dua_id')
        .eq('user_id', currentUser.id);
      const myAmeenIds = new Set(myAmeens?.map(a => a.dua_id) || []);

      const enriched: Dua[] = duasData.map(d => ({
        ...d,
        username: profiles?.find(p => p.id === d.user_id)?.username || 'Unknown',
        has_said_ameen: myAmeenIds.has(d.id)
      }));

      setDuas(enriched);
    } catch (e) {
      console.error(e);
    } finally {
      setDuaLoading(false);
    }
  };

  const postDua = async () => {
    if (!newDuaText.trim() || newDuaText.length > 500) return;
    try {
      const { error } = await supabase.from('duas').insert({ user_id: currentUser.id, text: newDuaText.trim() });
      if (error) throw error;
      setNewDuaText('');
      fetchDuas();
    } catch (e) {
      console.error(e);
    }
  };

  const sayAmeen = async (duaId: string) => {
    try {
      const { error } = await supabase.from('dua_ameens').insert({ dua_id: duaId, user_id: currentUser.id });
      if (error) throw error;
      setDuas(prev => prev.map(d => d.id === duaId ? { ...d, ameen_count: d.ameen_count + 1, has_said_ameen: true } : d));
    } catch (e) {
      console.error('Already said ameen or error:', e);
    }
  };

  const deleteDua = async (duaId: string) => {
    try {
      await supabase.from('duas').delete().eq('id', duaId);
      setDuas(prev => prev.filter(d => d.id !== duaId));
    } catch (e) {
      console.error(e);
    }
  };

  // ==================== FRIEND LOGIC ====================

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, xp, country')
        .ilike('username', `%${searchQuery}%`)
        .neq('id', currentUser.id)
        .limit(5);
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
      const { data: reqs } = await supabase
        .from('friendships')
        .select('id, sender_id:user_id_1, status, created_at')
        .eq('user_id_2', currentUser.id)
        .eq('status', 'pending');

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

  // ==================== GROUP LOGIC ====================

  const createGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      const { data: group, error } = await supabase
        .from('groups')
        .insert({ name: newGroupName, created_by: currentUser.id })
        .select()
        .single();

      if (error) throw error;

      // Add self as admin
      await supabase.from('group_members').insert({ group_id: group.id, user_id: currentUser.id, role: 'admin' });

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
      } else {
        setGroups([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupInvites = async () => {
    try {
      const { data: invites } = await supabase
        .from('group_invites')
        .select('*')
        .eq('invited_user', currentUser.id)
        .eq('status', 'pending');

      if (!invites || invites.length === 0) { setGroupInvites([]); return; }

      // Get group names and inviter names
      const groupIds = [...new Set(invites.map(i => i.group_id))];
      const inviterIds = [...new Set(invites.map(i => i.invited_by))];

      const [{ data: groupsData }, { data: profiles }] = await Promise.all([
        supabase.from('groups').select('id, name').in('id', groupIds),
        supabase.from('profiles').select('id, username').in('id', inviterIds)
      ]);

      const enriched: GroupInvite[] = invites.map(i => ({
        ...i,
        group_name: groupsData?.find(g => g.id === i.group_id)?.name || 'Unknown',
        inviter_name: profiles?.find(p => p.id === i.invited_by)?.username || 'Unknown'
      }));
      setGroupInvites(enriched);
    } catch (e) {
      console.error(e);
    }
  };

  const respondToGroupInvite = async (inviteId: string, groupId: string, accept: boolean) => {
    try {
      if (accept) {
        await supabase.from('group_invites').update({ status: 'accepted' }).eq('id', inviteId);
        await supabase.from('group_members').insert({ group_id: groupId, user_id: currentUser.id, role: 'member' });
      } else {
        await supabase.from('group_invites').update({ status: 'declined' }).eq('id', inviteId);
      }
      fetchGroupInvites();
      fetchGroups();
    } catch (e) {
      console.error(e);
    }
  };

  const openGroup = async (group: Group) => {
    setLoading(true);
    try {
      const { data: members } = await supabase
        .from('group_members')
        .select('user_id, role')
        .eq('group_id', group.id);

      const userIds = members?.map(m => m.user_id) || [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, xp, country, active_quests')
        .in('id', userIds);

      const membersWithRole: GroupMember[] = (profiles || []).map(p => ({
        ...p,
        role: members?.find(m => m.user_id === p.id)?.role || 'member'
      }));

      setActiveGroup({ ...group, members: membersWithRole });

      // Determine my role
      const me = members?.find(m => m.user_id === currentUser.id);
      setMyRole(me?.role || 'member');

      // Fetch group custom quests
      const { data: gQuests } = await supabase.from('group_quests').select('*').eq('group_id', group.id);
      setGroupQuests(gQuests || []);

      setGroupTab('quests');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const sendGroupInvite = async (friendId: string) => {
    if (!activeGroup) return;
    try {
      const { error } = await supabase.from('group_invites').insert({
        group_id: activeGroup.id,
        invited_by: currentUser.id,
        invited_user: friendId
      });
      if (error) throw error;
      alert('Invite sent!');
    } catch (e: any) {
      alert('Error (maybe already invited?)');
    }
  };

  const createGroupQuest = async () => {
    if (!activeGroup || !newQuestTitle.trim()) return;
    try {
      const { data, error } = await supabase.from('group_quests').insert({
        group_id: activeGroup.id,
        title: newQuestTitle.trim(),
        created_by: currentUser.id
      }).select().single();
      if (error) throw error;
      setGroupQuests(prev => [...prev, data]);
      setNewQuestTitle('');
      setShowAddQuest(false);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteGroupQuest = async (questId: string) => {
    try {
      await supabase.from('group_quests').delete().eq('id', questId);
      setGroupQuests(prev => prev.filter(q => q.id !== questId));
    } catch (e) {
      console.error(e);
    }
  };

  const promoteMember = async (memberId: string) => {
    if (!activeGroup) return;
    try {
      await supabase.from('group_members').update({ role: 'admin' }).eq('group_id', activeGroup.id).eq('user_id', memberId);
      openGroup(activeGroup);
    } catch (e) {
      console.error(e);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!activeGroup) return;
    try {
      await supabase.from('group_members').delete().eq('group_id', activeGroup.id).eq('user_id', memberId);
      openGroup(activeGroup);
    } catch (e) {
      console.error(e);
    }
  };

  const leaveGroup = async () => {
    if (!activeGroup) return;
    try {
      await supabase.from('group_members').delete().eq('group_id', activeGroup.id).eq('user_id', currentUser.id);
      setActiveGroup(null);
      fetchGroups();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteGroup = async () => {
    if (!activeGroup || !confirm('Are you sure you want to delete this group? This cannot be undone.')) return;
    try {
      await supabase.from('groups').delete().eq('id', activeGroup.id);
      setActiveGroup(null);
      fetchGroups();
    } catch (e) {
      console.error(e);
    }
  };

  // Check if a quest was completed today
  const isQuestCompletedToday = (questId: string): boolean => {
    const todayStr = new Date().toISOString().split('T')[0];
    return currentUser.completedDailyQuests?.[questId] === todayStr;
  };

  // Filtered groups for search
  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(groupSearchQuery.toLowerCase())
  );

  // Friends not in active group (for invite)
  const invitableFriends = friends.filter(f => {
    if (!activeGroup?.members) return true;
    return !activeGroup.members.some(m => m.id === f.id);
  }).filter(f => f.username.toLowerCase().includes(inviteFriendSearch.toLowerCase()));

  // Time ago helper
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className={`h-full flex flex-col ${darkMode ? 'bg-[#050a09]' : 'bg-[#fdfbf7]'}`}>
      {/* Header */}
      <div className={`p-6 pb-2 border-b ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-[#064e3b] rounded-2xl flex items-center justify-center shadow-lg text-white minaret-shape">
            <Users size={24} />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Community</h2>
            <p className="text-[10px] text-[#d4af37] font-black uppercase tracking-widest">Connect & Compete</p>
          </div>
        </div>

        <div className={`flex p-1 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
          <button onClick={() => setTab('duas')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${tab === 'duas' ? `bg-white ${darkMode ? 'bg-white/10 text-white' : 'shadow-md text-[#064e3b]'}` : 'text-slate-400'}`}>Duas</button>
          <button onClick={() => setTab('leaderboard')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${tab === 'leaderboard' ? `bg-white ${darkMode ? 'bg-white/10 text-white' : 'shadow-md text-[#064e3b]'}` : 'text-slate-400'}`}>Leaderboard</button>
          <button onClick={() => setTab('friends')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${tab === 'friends' ? `bg-white ${darkMode ? 'bg-white/10 text-white' : 'shadow-md text-[#064e3b]'}` : 'text-slate-400'}`}>Friends</button>
          <button onClick={() => setTab('groups')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${tab === 'groups' ? `bg-white ${darkMode ? 'bg-white/10 text-white' : 'shadow-md text-[#064e3b]'}` : 'text-slate-400'}`}>Groups</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">

        {/* ==================== DUAS TAB ==================== */}
        {tab === 'duas' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
            {/* Post Dua */}
            <div className={`p-5 rounded-3xl border-2 ${darkMode ? 'bg-[#1a1500] border-[#d4af37]/30' : 'bg-[#fffbeb] border-[#d4af37]/20'}`}>
              <p className={`text-xs font-bold mb-3 ${darkMode ? 'text-[#d4af37]' : 'text-[#92780c]'}`}>🤲 Share your Dua with the Ummah</p>
              <textarea
                placeholder="Ya Allah, I ask You for..."
                className={`w-full p-3 rounded-2xl text-sm resize-none outline-none min-h-[80px] ${darkMode ? 'bg-black/30 text-white placeholder:text-white/30 border border-white/10' : 'bg-white border border-slate-200 placeholder:text-slate-300'}`}
                value={newDuaText}
                onChange={e => setNewDuaText(e.target.value)}
                maxLength={500}
              />
              <div className="flex items-center justify-between mt-2">
                <span className={`text-[10px] ${darkMode ? 'text-white/30' : 'text-slate-400'}`}>{newDuaText.length}/500</span>
                <button
                  onClick={postDua}
                  disabled={!newDuaText.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#064e3b] text-white rounded-xl font-bold text-xs uppercase tracking-widest disabled:opacity-30 transition-all hover:bg-[#053d2e] active:scale-95"
                >
                  <Send size={14} /> Post Dua
                </button>
              </div>
            </div>

            {/* Dua Feed */}
            {duaLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#064e3b]" size={32} /></div>
            ) : duas.length === 0 ? (
              <div className="text-center py-10 opacity-40">
                <Heart size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-sm font-bold text-slate-400">No duas yet. Be the first!</p>
              </div>
            ) : (
              duas.map(dua => (
                <div key={dua.id} className={`p-5 rounded-3xl border transition-all ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${darkMode ? 'bg-[#064e3b]/30 text-emerald-400' : 'bg-[#064e3b]/10 text-[#064e3b]'}`}>
                        {dua.username?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{dua.username}</p>
                        <p className={`text-[10px] ${darkMode ? 'text-white/30' : 'text-slate-400'}`}>{timeAgo(dua.created_at)}</p>
                      </div>
                    </div>
                    {dua.user_id === currentUser.id && (
                      <button onClick={() => deleteDua(dua.id)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <p className={`text-sm leading-relaxed mb-4 ${darkMode ? 'text-white/80' : 'text-slate-700'}`}>{dua.text}</p>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => !dua.has_said_ameen && sayAmeen(dua.id)}
                      disabled={dua.has_said_ameen || dua.user_id === currentUser.id}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 ${dua.has_said_ameen
                          ? 'bg-[#d4af37]/20 text-[#d4af37] cursor-default'
                          : dua.user_id === currentUser.id
                            ? 'bg-slate-100 text-slate-300 cursor-default dark:bg-white/5 dark:text-white/20'
                            : `border-2 ${darkMode ? 'border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/10' : 'border-[#d4af37]/20 text-[#92780c] hover:bg-[#d4af37]/10'}`
                        }`}
                    >
                      {dua.has_said_ameen ? '✓ Ameen' : '🤲 Ameen'}
                    </button>
                    <span className={`text-xs font-bold ${darkMode ? 'text-white/40' : 'text-slate-400'}`}>
                      {dua.ameen_count} {dua.ameen_count === 1 ? 'Ameen' : 'Ameens'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ==================== LEADERBOARD TAB ==================== */}
        {tab === 'leaderboard' && (
          <Leaderboard
            currentUserId={currentUser.id!}
            currentUserCountry={currentUser.country}
            onClose={() => { }}
            darkMode={darkMode}
            embedded={true}
          />
        )}

        {/* ==================== FRIENDS TAB ==================== */}
        {tab === 'friends' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Find seekers by username..."
                className={`w-full p-4 pl-12 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-[#064e3b]/20 ${darkMode ? 'bg-white/5 text-white' : 'bg-white'}`}
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
                  <div key={res.id} className={`p-4 rounded-2xl flex justify-between items-center shadow-sm ${darkMode ? 'bg-white/5' : 'bg-white'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${darkMode ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{res.username[0].toUpperCase()}</div>
                      <div>
                        <p className={`font-bold text-sm ${darkMode ? 'text-white' : ''}`}>{res.username}</p>
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
                        <p className={`font-bold text-sm ${darkMode ? 'text-white' : ''}`}>{req.sender?.username}</p>
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
                  <div key={f.id} className={`p-4 rounded-2xl flex items-center justify-between shadow-sm ${darkMode ? 'bg-white/5' : 'bg-white'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#064e3b]/10 text-[#064e3b] rounded-full flex items-center justify-center font-bold">{f.username[0].toUpperCase()}</div>
                      <div>
                        <p className={`font-bold text-sm ${darkMode ? 'text-white' : ''}`}>{f.username}</p>
                        <p className="text-[10px] text-slate-400">{f.xp.toLocaleString()} XP • {f.country}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================== GROUPS TAB ==================== */}
        {tab === 'groups' && !activeGroup && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
            {/* Group Invites */}
            {groupInvites.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[#d4af37] uppercase tracking-widest pl-2 flex items-center gap-2">
                  <Mail size={14} /> Group Invites
                </h3>
                {groupInvites.map(inv => (
                  <div key={inv.id} className={`p-4 rounded-2xl border-2 flex justify-between items-center ${darkMode ? 'bg-[#1a1500] border-[#d4af37]/20' : 'bg-[#fffbeb] border-[#d4af37]/20'}`}>
                    <div>
                      <p className={`font-bold text-sm ${darkMode ? 'text-white' : ''}`}>{inv.group_name}</p>
                      <p className="text-[10px] text-slate-400">Invited by {inv.inviter_name}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => respondToGroupInvite(inv.id, inv.group_id, true)} className="p-2 bg-[#064e3b] text-white rounded-full"><Check size={16} /></button>
                      <button onClick={() => respondToGroupInvite(inv.id, inv.group_id, false)} className="p-2 bg-rose-500 text-white rounded-full"><X size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Create Group */}
            <button
              onClick={() => setShowCreateGroup(!showCreateGroup)}
              className={`w-full py-4 border-2 border-dashed rounded-3xl flex items-center justify-center gap-2 font-bold hover:bg-slate-50 transition-colors ${darkMode ? 'border-white/10 text-slate-400 hover:bg-white/5' : 'border-slate-200 text-slate-400 dark:hover:bg-white/5'}`}
            >
              <Plus size={20} /> Create New Group
            </button>

            {showCreateGroup && (
              <div className={`p-4 rounded-3xl shadow-lg space-y-3 ${darkMode ? 'bg-white/5' : 'bg-white'}`}>
                <input
                  type="text"
                  placeholder="Group Name (e.g. Fajr Warriors)"
                  className={`w-full p-3 rounded-xl outline-none border border-transparent focus:border-[#064e3b] ${darkMode ? 'bg-black/20 text-white' : 'bg-slate-50'}`}
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                />
                <button onClick={createGroup} className="w-full py-3 bg-[#064e3b] text-white rounded-xl font-bold text-xs uppercase tracking-widest">Create</button>
              </div>
            )}

            {/* Search Groups */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search your groups..."
                className={`w-full p-3 pl-11 rounded-2xl text-sm outline-none ${darkMode ? 'bg-white/5 text-white placeholder:text-white/30' : 'bg-white shadow-sm'}`}
                value={groupSearchQuery}
                onChange={e => setGroupSearchQuery(e.target.value)}
              />
            </div>

            {/* Group List */}
            <div className="space-y-3">
              {filteredGroups.length === 0 ? (
                <div className="text-center py-10 opacity-40">
                  <Users size={48} className="mx-auto mb-4 text-slate-300" />
                  <p className="text-sm font-bold text-slate-400">{groupSearchQuery ? 'No groups match' : 'No groups yet.'}</p>
                </div>
              ) : (
                filteredGroups.map(g => (
                  <div key={g.id} onClick={() => openGroup(g)} className={`p-6 rounded-3xl shadow-sm border flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-transform ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100'}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
                        <Shield size={24} />
                      </div>
                      <div>
                        <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : ''}`}>{g.name}</h3>
                        <p className="text-xs text-slate-400">Tap to enter</p>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-300" />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================== ACTIVE GROUP VIEW ==================== */}
        {tab === 'groups' && activeGroup && (
          <div className="space-y-6 animate-in zoom-in-95">
            {/* Back Button */}
            <button onClick={() => { setActiveGroup(null); setShowInvitePanel(false); }} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#064e3b]">
              <ChevronRight className="rotate-180" size={14} /> Back to Groups
            </button>

            {/* Group Header */}
            <div className="text-center space-y-3">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : ''}`}>{activeGroup.name}</h2>
              <div className="flex justify-center -space-x-2">
                {activeGroup.members?.map((m, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${darkMode ? 'bg-white/10 border-[#050a09] text-white/60' : 'bg-slate-200 border-white text-slate-500'} ${m.role === 'admin' ? 'ring-2 ring-[#d4af37]' : ''}`} title={`${m.username}${m.role === 'admin' ? ' (Admin)' : ''}`}>
                    {m.username[0].toUpperCase()}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400">{activeGroup.members?.length} members • {myRole === 'admin' ? '⭐ Admin' : 'Member'}</p>
            </div>

            {/* Admin Actions */}
            <div className="flex gap-2 justify-center flex-wrap">
              <button onClick={() => setShowInvitePanel(!showInvitePanel)} className={`px-4 py-2 rounded-full text-[10px] font-bold flex items-center gap-1.5 transition-all ${darkMode ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                <UserPlus size={12} /> Invite
              </button>
              <button onClick={leaveGroup} className={`px-4 py-2 rounded-full text-[10px] font-bold flex items-center gap-1.5 transition-all ${darkMode ? 'bg-white/5 text-rose-400 hover:bg-rose-500/10' : 'bg-slate-100 text-rose-500 hover:bg-rose-50'}`}>
                <LogOut size={12} /> Leave
              </button>
              {myRole === 'admin' && (
                <button onClick={deleteGroup} className={`px-4 py-2 rounded-full text-[10px] font-bold flex items-center gap-1.5 transition-all ${darkMode ? 'bg-white/5 text-rose-400 hover:bg-rose-500/10' : 'bg-slate-100 text-rose-500 hover:bg-rose-50'}`}>
                  <Trash2 size={12} /> Delete Group
                </button>
              )}
            </div>

            {/* Invite Panel */}
            {showInvitePanel && (
              <div className={`p-4 rounded-3xl space-y-3 ${darkMode ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
                <input
                  type="text"
                  placeholder="Search friends to invite..."
                  className={`w-full p-3 rounded-xl text-sm outline-none ${darkMode ? 'bg-black/20 text-white' : 'bg-slate-50'}`}
                  value={inviteFriendSearch}
                  onChange={e => setInviteFriendSearch(e.target.value)}
                />
                {invitableFriends.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-2">No friends to invite</p>
                ) : (
                  invitableFriends.slice(0, 5).map(f => (
                    <div key={f.id} className={`flex items-center justify-between p-3 rounded-xl ${darkMode ? 'bg-black/20' : 'bg-slate-50'}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#064e3b]/10 text-[#064e3b] flex items-center justify-center text-xs font-bold">{f.username[0].toUpperCase()}</div>
                        <span className={`text-sm font-medium ${darkMode ? 'text-white' : ''}`}>{f.username}</span>
                      </div>
                      <button onClick={() => sendGroupInvite(f.id)} className="p-2 bg-[#064e3b] text-white rounded-full text-xs"><Send size={12} /></button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Group Tabs: Leaderboard / Quests */}
            <div className={`flex p-1 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
              <button onClick={() => setGroupTab('quests')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${groupTab === 'quests' ? `${darkMode ? 'bg-white/10 text-white' : 'bg-white shadow text-[#064e3b]'}` : 'text-slate-400'}`}>Quests</button>
              <button onClick={() => setGroupTab('leaderboard')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${groupTab === 'leaderboard' ? `${darkMode ? 'bg-white/10 text-white' : 'bg-white shadow text-[#064e3b]'}` : 'text-slate-400'}`}>Leaderboard</button>
            </div>

            {/* GROUP LEADERBOARD */}
            {groupTab === 'leaderboard' && (
              <div className="space-y-2">
                {activeGroup.members
                  ?.sort((a, b) => b.xp - a.xp)
                  .map((m, i) => (
                    <div key={m.id} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${i === 0 ? (darkMode ? 'bg-[#d4af37]/10 border border-[#d4af37]/20' : 'bg-[#fffbeb] border border-[#d4af37]/20') : (darkMode ? 'bg-white/5' : 'bg-white shadow-sm')}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-[#d4af37] text-white' : i === 1 ? 'bg-slate-300 text-white' : i === 2 ? 'bg-amber-700 text-white' : (darkMode ? 'bg-white/10 text-white/40' : 'bg-slate-100 text-slate-400')}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold text-sm ${darkMode ? 'text-white' : ''}`}>
                          {m.username}
                          {m.role === 'admin' && <span className="text-[#d4af37] ml-1">⭐</span>}
                          {m.id === currentUser.id && <span className="text-[10px] ml-2 text-slate-400">(You)</span>}
                        </p>
                      </div>
                      <p className={`font-bold text-sm ${darkMode ? 'text-[#d4af37]' : 'text-[#064e3b]'}`}>{m.xp.toLocaleString()} XP</p>
                      {myRole === 'admin' && m.id !== currentUser.id && (
                        <div className="flex gap-1">
                          {m.role !== 'admin' && (
                            <button onClick={() => promoteMember(m.id)} title="Make Admin" className="p-1 rounded text-slate-400 hover:text-[#d4af37]"><Crown size={14} /></button>
                          )}
                          <button onClick={() => removeMember(m.id)} title="Remove" className="p-1 rounded text-slate-400 hover:text-rose-500"><X size={14} /></button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}

            {/* GROUP QUESTS */}
            {groupTab === 'quests' && (
              <div className="space-y-4">
                {/* Admin: Add Quest */}
                {myRole === 'admin' && (
                  <div>
                    {showAddQuest ? (
                      <div className={`p-4 rounded-2xl space-y-3 ${darkMode ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
                        <input
                          type="text"
                          placeholder="Quest title (e.g. Read 1 page of Quran)"
                          className={`w-full p-3 rounded-xl text-sm outline-none ${darkMode ? 'bg-black/20 text-white' : 'bg-slate-50'}`}
                          value={newQuestTitle}
                          onChange={e => setNewQuestTitle(e.target.value)}
                          maxLength={100}
                        />
                        <div className="flex gap-2">
                          <button onClick={createGroupQuest} className="flex-1 py-2.5 bg-[#064e3b] text-white rounded-xl font-bold text-xs uppercase tracking-widest">Create (50 XP)</button>
                          <button onClick={() => { setShowAddQuest(false); setNewQuestTitle(''); }} className={`px-4 py-2.5 rounded-xl text-xs font-bold ${darkMode ? 'bg-white/5 text-white/60' : 'bg-slate-100 text-slate-500'}`}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setShowAddQuest(true)} className={`w-full py-3 border-2 border-dashed rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-colors ${darkMode ? 'border-white/10 text-slate-400 hover:bg-white/5' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
                        <Plus size={16} /> Add Group Quest
                      </button>
                    )}
                  </div>
                )}

                {/* Custom Group Quests */}
                {groupQuests.length > 0 && (
                  <div className="space-y-2">
                    <h4 className={`text-[10px] font-black uppercase tracking-widest pl-2 ${darkMode ? 'text-[#d4af37]' : 'text-[#92780c]'}`}>Group Commitments</h4>
                    {groupQuests.map(gq => {
                      const completed = isQuestCompletedToday(`gq_${gq.id}`);
                      return (
                        <div key={gq.id} className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${completed ? 'opacity-40' : ''} ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${completed ? 'bg-emerald-500/20 text-emerald-500' : (darkMode ? 'bg-[#d4af37]/10 text-[#d4af37]' : 'bg-[#d4af37]/10 text-[#d4af37]')}`}>
                              {completed ? <Check size={16} /> : <Star size={16} />}
                            </div>
                            <div>
                              <p className={`text-sm font-bold ${darkMode ? 'text-white' : ''}`}>{gq.title}</p>
                              <p className="text-[10px] text-slate-400">50 XP • Complete in My Quests</p>
                            </div>
                          </div>
                          {myRole === 'admin' && (
                            <button onClick={() => deleteGroupQuest(gq.id)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Shared Standard Quests (from ALL_QUESTS that members have in common) */}
                {(() => {
                  if (!activeGroup.members) return null;
                  const myQuests = currentUser.activeQuests || [];
                  const sharedQuests: { quest: Quest; sharedBy: string[] }[] = [];

                  myQuests.forEach(questId => {
                    const others = activeGroup.members!.filter(m => m.id !== currentUser.id && m.active_quests?.includes(questId));
                    if (others.length > 0) {
                      const questDef = ALL_QUESTS.find(q => q.id === questId);
                      if (questDef && !questDef.isPackage) {
                        sharedQuests.push({ quest: questDef, sharedBy: others.map(o => o.username) });
                      }
                    }
                  });

                  if (sharedQuests.length === 0) return null;

                  return (
                    <div className="space-y-2">
                      <h4 className={`text-[10px] font-black uppercase tracking-widest pl-2 ${darkMode ? 'text-emerald-400' : 'text-[#064e3b]'}`}>Shared Active Quests</h4>
                      {sharedQuests.map(({ quest, sharedBy }) => {
                        const completed = isQuestCompletedToday(quest.id);
                        return (
                          <div key={quest.id} className={`p-4 rounded-2xl border transition-all ${completed ? 'opacity-40' : ''} ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${completed ? 'bg-emerald-500/20 text-emerald-500' : (darkMode ? 'bg-[#064e3b]/30 text-emerald-400' : 'bg-[#064e3b]/10 text-[#064e3b]')}`}>
                                {completed ? <Check size={16} /> : <Sparkles size={16} />}
                              </div>
                              <div className="flex-1">
                                <p className={`text-sm font-bold ${darkMode ? 'text-white' : ''}`}>{quest.title}</p>
                                <p className="text-[10px] text-slate-400">
                                  Also doing: <span className={`font-bold ${darkMode ? 'text-emerald-400' : 'text-[#064e3b]'}`}>{sharedBy.join(', ')}</span>
                                </p>
                              </div>
                              {completed && <span className="text-[10px] font-bold text-emerald-500">Done ✓</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {groupQuests.length === 0 && (() => {
                  const myQuests = currentUser.activeQuests || [];
                  let hasShared = false;
                  myQuests.forEach(questId => {
                    const others = activeGroup?.members?.filter(m => m.id !== currentUser.id && m.active_quests?.includes(questId));
                    if (others && others.length > 0) hasShared = true;
                  });
                  if (hasShared) return null;
                  return (
                    <div className={`p-6 rounded-3xl text-center border border-dashed ${darkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        No group quests yet.<br />
                        {myRole === 'admin' ? 'Create a quest above to get started!' : 'Ask an admin to create quests.'}
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Community;