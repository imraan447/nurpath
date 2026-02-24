import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, Group, GroupMember, Friend, FriendRequest, Quest, GroupQuest, GroupInvite, GroupQuestItem, Dua } from '../types';
import { ALL_QUESTS } from '../constants';
import { HeartHandshake, Users, UserPlus, Search, Trophy, Crown, Globe, MapPin, Loader2, Plus, Check, X, Shield, Star, Sparkles, ChevronRight, ChevronDown, Heart, Send, Trash2, LogOut, Settings, Mail, Pin, CheckCircle2, Clock, Lock, Pencil, Save } from 'lucide-react';
import QuestCard from './QuestCard';
import Leaderboard from './Leaderboard';

interface CommunityProps {
  currentUser: User;
  darkMode?: boolean;
  onCompleteGroupQuest: (quest: Quest) => void;
  onClose: () => void;
  hasFriendRequests?: boolean;
  hasGroupInvites?: boolean;
  onTrackQuest?: (quest: Quest) => void;
}

const Community: React.FC<CommunityProps> = ({ currentUser, darkMode, onCompleteGroupQuest, onClose, hasFriendRequests, hasGroupInvites, onTrackQuest }) => {
  const [tab, setTab] = useState<'duas' | 'leaderboard' | 'friends' | 'groups'>('duas');
  const [loading, setLoading] = useState(false);

  // Friends State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [sentRequestIds, setSentRequestIds] = useState<string[]>([]);

  // Groups State
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [groupTab, setGroupTab] = useState<'leaderboard' | 'quests'>('quests');
  const [newGroupQuestTitle, setNewGroupQuestTitle] = useState('');
  const [newGroupQuestDeadline, setNewGroupQuestDeadline] = useState('');
  const [groupQuests, setGroupQuests] = useState<GroupQuestItem[]>([]);
  const [groupQuestCompletions, setGroupQuestCompletions] = useState<{ [questId: string]: number }>({});
  const [inviteFriendSearch, setInviteFriendSearch] = useState('');
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [myRole, setMyRole] = useState<'admin' | 'member'>('member');
  const [groupInvites, setGroupInvites] = useState<GroupInvite[]>([]);
  const [groupOutgoingInvites, setGroupOutgoingInvites] = useState<string[]>([]);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameText, setRenameText] = useState('');
  const [declinedQuests, setDeclinedQuests] = useState<string[]>([]);
  const [hiddenQuests, setHiddenQuests] = useState<string[]>([]);

  useEffect(() => {
    const savedDeclined = localStorage.getItem('nurpath_declined_group_quests');
    if (savedDeclined) setDeclinedQuests(JSON.parse(savedDeclined));

    const savedHidden = localStorage.getItem('nurpath_hidden_group_quests');
    if (savedHidden) setHiddenQuests(JSON.parse(savedHidden));
  }, []);

  const handleDeclineQuest = (questId: string) => {
    const updated = [...declinedQuests, questId];
    setDeclinedQuests(updated);
    localStorage.setItem('nurpath_declined_group_quests', JSON.stringify(updated));
  };

  const handleHideQuest = (questId: string) => {
    const updated = [...hiddenQuests, questId];
    setHiddenQuests(updated);
    localStorage.setItem('nurpath_hidden_group_quests', JSON.stringify(updated));
  };

  // Duas State
  const [duas, setDuas] = useState<Dua[]>([]);
  const [newDuaText, setNewDuaText] = useState('');
  const [duaLoading, setDuaLoading] = useState(false);
  const [myDuaCountToday, setMyDuaCountToday] = useState(0);

  useEffect(() => {
    const loadTab = async () => {
      // Force token refresh if expired (fixes issue where tab goes to sleep)
      await supabase.auth.getSession();
      if (tab === 'friends') fetchFriendsAndRequests();
      else if (tab === 'groups') { fetchGroups(); fetchGroupInvites(); }
      else if (tab === 'duas') fetchDuas();
    };
    loadTab();
  }, [tab, currentUser.id]);

  useEffect(() => {
    if (activeGroup) {
      const fetchOutgoing = async () => {
        const { data } = await supabase.from('group_invites').select('invited_user').eq('group_id', activeGroup.id).eq('status', 'pending');
        setGroupOutgoingInvites(data?.map(i => i.invited_user) || []);
      };
      fetchOutgoing();
    } else {
      setGroupOutgoingInvites([]);
    }
  }, [activeGroup?.id]);

  // ==================== DUAS LOGIC ====================

  const fetchDuas = async () => {
    // Load from cache first to prevent blank screen
    const cachedDuas = localStorage.getItem('nurpath_cached_duas');
    if (cachedDuas && duas.length === 0) {
      try { setDuas(JSON.parse(cachedDuas)); } catch (e) { }
    }

    setDuaLoading(true);
    try {
      // Only fetch duas from last 60 days
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
      const { data: duasData } = await supabase
        .from('duas')
        .select('*')
        .gte('created_at', sixtyDaysAgo)
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
      // Cache the result
      localStorage.setItem('nurpath_cached_duas', JSON.stringify(enriched));

      // Count my duas in last 24h for rate limiting
      const twentyFourAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: myCount } = await supabase
        .from('duas')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', currentUser.id)
        .gte('created_at', twentyFourAgo);
      setMyDuaCountToday(myCount || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setDuaLoading(false);
    }
  };

  const postDua = async () => {
    if (!newDuaText.trim() || newDuaText.length > 500) return;
    if (myDuaCountToday >= 2) {
      alert('You can only post 2 duas every 24 hours.');
      return;
    }
    try {
      const { error } = await supabase.from('duas').insert({ user_id: currentUser.id, text: newDuaText.trim() });
      if (error) throw error;
      setNewDuaText('');
      setMyDuaCountToday(prev => prev + 1);
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

      // Fetch outgoing pending requests
      const { data: sent } = await supabase
        .from('friendships')
        .select('user_id_2')
        .eq('user_id_1', currentUser.id)
        .eq('status', 'pending');
      setSentRequestIds(sent?.map(s => s.user_id_2) || []);
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

  const sendGroupInvite = async (friendId: string) => {
    if (!activeGroup) return;
    try {
      const { error } = await supabase.from('group_invites').insert({
        group_id: activeGroup.id,
        invited_user: friendId,
        invited_by: currentUser.id
      });
      if (error) {
        if (error.code === '23505') alert('Already invited!');
        else throw error;
      } else {
        alert('Invite sent!');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to send invite.');
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
      const { data: quests } = await supabase
        .from('group_quests')
        .select('*')
        .eq('group_id', group.id)
        .order('created_at', { ascending: false });

      if (quests && quests.length > 0) {
        setGroupQuests(quests);
        // Fetch completions for these quests
        const qIds = quests.map(q => q.id);
        const { data: completions } = await supabase.from('group_quest_completions').select('group_quest_id').in('group_quest_id', qIds);

        const counts: { [id: string]: number } = {};
        if (completions) {
          completions.forEach(c => {
            counts[c.group_quest_id] = (counts[c.group_quest_id] || 0) + 1;
          });
        }
        setGroupQuestCompletions(counts);
      } else {
        setGroupQuests([]);
        setGroupQuestCompletions({});
      }

      setGroupTab('quests');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };


  const renameGroup = async () => {
    if (!activeGroup || !renameText.trim()) return;
    try {
      const { error } = await supabase.from('groups').update({ name: renameText.trim() }).eq('id', activeGroup.id);
      if (error) throw error;

      const newName = renameText.trim();
      setActiveGroup(prev => prev ? { ...prev, name: newName } : null);
      setGroups(prev => prev.map(g => g.id === activeGroup.id ? { ...g, name: newName } : g));
      setIsRenaming(false);
    } catch (e) {
      console.error(e);
      alert('Failed to rename group');
    }
  };

  const addGroupQuest = async () => {
    if (!newGroupQuestTitle.trim() || !activeGroup) return;
    if ((activeGroup.members?.length || 0) < 2) {
      alert('You need at least 2 group members to create a challenge.');
      return;
    }
    try {
      const { error } = await supabase.from('group_quests').insert({
        group_id: activeGroup.id,
        title: newGroupQuestTitle.trim(),
        created_by: currentUser.id,
        xp: 50,
        deadline: newGroupQuestDeadline || null
      });

      if (error) throw error;
      setNewGroupQuestTitle('');
      setNewGroupQuestDeadline('');

      // Refresh quests
      const { data: quests } = await supabase
        .from('group_quests')
        .select('*')
        .eq('group_id', activeGroup.id)
        .order('created_at', { ascending: false });

      setGroupQuests(quests || []);
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
    if (!confirm('Are you sure you want to leave this group?')) return;
    try {
      await supabase.from('group_members').delete().eq('group_id', activeGroup.id).eq('user_id', currentUser.id);
      setActiveGroup(null);
      fetchGroups();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteGroup = async () => {
    if (!activeGroup || !confirm('Are you sure you want to delete this group? You can\'t undo this.')) return;
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
    <div className={`h-full flex flex-col ${darkMode ? 'bg-[#050a09]' : 'bg-[#fdfbf7]'} overflow-hidden`}>
      {/* Premium Header */}
      <div className={`relative overflow-hidden shrink-0`}>
        {/* Animated gradient background */}
        <div className={`absolute inset-0 ${darkMode
          ? 'bg-gradient-to-br from-[#064e3b] via-[#0a3d2f] to-[#001a12]'
          : 'bg-gradient-to-br from-teal-500 via-cyan-500 to-emerald-600'
          }`} />
        {/* Floating orb decorations */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5 blur-xl" />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/5 blur-lg" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-[#d4af37]/10 blur-md" />

        <div className="relative z-10 p-6 pb-3">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/10">
                <HeartHandshake size={22} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white tracking-tight">Nur-Connect</h2>
                <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">Community Hub</p>
              </div>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all active:scale-90 border border-white/10">
              <X size={18} />
            </button>
          </div>

          {/* Premium Tab Bar */}
          <div className="flex gap-1.5 p-1 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/5">
            {([
              { key: 'duas', label: 'Duas', icon: <Heart size={14} />, badge: false },
              { key: 'leaderboard', label: 'Ranks', icon: <Trophy size={14} />, badge: false },
              { key: 'friends', label: 'Friends', icon: <Users size={14} />, badge: hasFriendRequests },
              { key: 'groups', label: 'Groups', icon: <Shield size={14} />, badge: hasGroupInvites },
            ] as const).map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as any)}
                className={`relative flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-300 ${tab === t.key
                  ? 'bg-white text-[#064e3b] shadow-lg shadow-white/20 scale-[1.02]'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
              >
                {t.icon}
                {t.label}
                {t.badge && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full shadow-lg shadow-rose-500/50 animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24 scrollbar-hide">

        {/* ==================== DUAS TAB ==================== */}
        {tab === 'duas' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Post Dua - Premium Card */}
            <div className={`relative overflow-hidden p-5 rounded-[28px] ${darkMode ? 'bg-gradient-to-br from-[#1a1500] to-[#0f0d00] border border-[#d4af37]/20' : 'bg-gradient-to-br from-[#fffdf5] to-[#fff8e1] border border-[#d4af37]/15 shadow-lg shadow-[#d4af37]/5'}`}>
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-[#d4af37]/5 blur-xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">🤲</span>
                  <p className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-[#d4af37]' : 'text-[#92780c]'}`}>Share your Dua</p>
                </div>
                <textarea
                  placeholder="Ya Allah, I ask You for..."
                  className={`w-full p-4 rounded-2xl text-sm resize-none outline-none min-h-[80px] transition-all focus:ring-2 focus:ring-[#d4af37]/30 ${darkMode ? 'bg-black/40 text-white placeholder:text-white/25 border border-white/5' : 'bg-white/80 border border-[#d4af37]/10 placeholder:text-slate-300'}`}
                  value={newDuaText}
                  onChange={e => setNewDuaText(e.target.value)}
                  maxLength={500}
                />
                <div className="flex items-center justify-between mt-3">
                  <span className={`text-[10px] font-bold tabular-nums ${darkMode ? 'text-white/20' : 'text-slate-300'}`}>{newDuaText.length}/500</span>
                  <button
                    onClick={postDua}
                    disabled={!newDuaText.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#064e3b] to-[#0a6b52] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] disabled:opacity-20 transition-all hover:shadow-lg hover:shadow-[#064e3b]/30 active:scale-95"
                  >
                    <Send size={12} /> Post Dua
                  </button>
                </div>
              </div>
            </div>

            {/* Dua Feed */}
            {duaLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${darkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <Loader2 className="animate-spin text-[#064e3b] dark:text-emerald-400" size={24} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${darkMode ? 'text-white/30' : 'text-slate-300'}`}>Loading Duas...</span>
              </div>
            ) : duas.length === 0 ? (
              <div className="text-center py-16">
                <div className={`w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center ${darkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <Heart size={28} className={darkMode ? 'text-white/20' : 'text-slate-200'} />
                </div>
                <p className={`text-sm font-bold ${darkMode ? 'text-white/30' : 'text-slate-300'}`}>No duas yet. Be the first!</p>
              </div>
            ) : (
              duas.map((dua, i) => (
                <div
                  key={dua.id}
                  className={`group p-5 rounded-[24px] border transition-all duration-300 hover:scale-[1.01] ${darkMode ? 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10' : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200'}`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${darkMode ? 'bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 text-emerald-400 border border-emerald-500/20' : 'bg-gradient-to-br from-[#064e3b]/10 to-[#064e3b]/5 text-[#064e3b]'}`}>
                        {dua.username?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{dua.username}</p>
                        <p className={`text-[10px] font-medium ${darkMode ? 'text-white/25' : 'text-slate-400'}`}>{timeAgo(dua.created_at)}</p>
                      </div>
                    </div>
                    {dua.user_id === currentUser.id && (
                      <button onClick={() => deleteDua(dua.id)} className="p-2 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  <p className={`text-[13px] leading-relaxed mb-4 ${darkMode ? 'text-white/70' : 'text-slate-600'}`}>{dua.text}</p>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => !dua.has_said_ameen && sayAmeen(dua.id)}
                      disabled={dua.has_said_ameen || dua.user_id === currentUser.id}
                      className={`flex items-center gap-2 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300 active:scale-90 ${dua.has_said_ameen
                        ? 'bg-[#d4af37]/15 text-[#d4af37] shadow-inner'
                        : dua.user_id === currentUser.id
                          ? `${darkMode ? 'bg-white/3 text-white/15' : 'bg-slate-50 text-slate-200'} cursor-default`
                          : `border ${darkMode ? 'border-[#d4af37]/20 text-[#d4af37]/80 hover:bg-[#d4af37]/10 hover:border-[#d4af37]/40' : 'border-[#d4af37]/20 text-[#b8960b] hover:bg-[#d4af37]/5 hover:border-[#d4af37]/30'}`
                        }`}
                    >
                      {dua.has_said_ameen ? '✓ Ameen' : '🤲 Ameen'}
                    </button>
                    <span className={`text-[10px] font-bold tabular-nums ${darkMode ? 'text-white/25' : 'text-slate-300'}`}>
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
            leaderboardEnabled={currentUser.settings?.leaderboardEnabled}
          />
        )}

        {/* ==================== FRIENDS TAB ==================== */}
        {tab === 'friends' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
            {/* Search - Premium */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Find seekers by username..."
                className={`w-full p-4 pl-11 rounded-2xl outline-none transition-all focus:ring-2 text-sm font-medium ${darkMode ? 'bg-white/5 text-white focus:ring-emerald-500/20 border border-white/5 placeholder:text-white/20' : 'bg-white shadow-sm focus:ring-[#064e3b]/10 border border-slate-100 placeholder:text-slate-300'}`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchUsers()}
              />
              <button onClick={searchUsers} className="absolute right-2 top-2 p-2.5 bg-gradient-to-r from-[#064e3b] to-[#0a6b52] text-white rounded-xl shadow-lg shadow-[#064e3b]/20 hover:shadow-[#064e3b]/40 transition-all active:scale-90">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] pl-2 ${darkMode ? 'text-white/30' : 'text-slate-400'}`}>Results</h3>
                {searchResults.map(res => (
                  <div key={res.id} className={`p-4 rounded-[20px] flex justify-between items-center transition-all hover:scale-[1.01] ${darkMode ? 'bg-white/[0.03] border border-white/5' : 'bg-white border border-slate-100 shadow-sm'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${darkMode ? 'bg-gradient-to-br from-white/10 to-white/5 text-slate-300 border border-white/10' : 'bg-gradient-to-br from-slate-100 to-slate-50 text-slate-600'}`}>{res.username[0].toUpperCase()}</div>
                      <div>
                        <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-800'}`}>{res.username}</p>
                        <p className={`text-[10px] font-medium ${darkMode ? 'text-white/25' : 'text-slate-400'}`}>{res.country}</p>
                      </div>
                    </div>
                    {(() => {
                      const isFriend = friends.some(f => f.id === res.id);
                      const isPendingOutgoing = sentRequestIds.includes(res.id);
                      const isPendingIncoming = requests.some(r => r.sender?.id === res.id);

                      if (isFriend) return <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${darkMode ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-400'}`}>Friend</span>;
                      if (isPendingIncoming) return <span className="text-[9px] font-black uppercase tracking-widest text-[#d4af37] bg-[#d4af37]/10 px-3 py-1.5 rounded-xl">Pending</span>;
                      if (isPendingOutgoing) return <button disabled className={`p-2.5 rounded-xl cursor-not-allowed ${darkMode ? 'bg-white/5 text-white/20' : 'bg-slate-100 text-slate-300'}`}><Clock size={14} /></button>;

                      return (
                        <button onClick={() => sendFriendRequest(res.id)} className="p-2.5 bg-[#064e3b]/10 text-[#064e3b] rounded-xl hover:bg-[#064e3b] hover:text-white transition-all active:scale-90">
                          <UserPlus size={16} />
                        </button>
                      );
                    })()}
                  </div>
                ))}
              </div>
            )}

            {/* Friend Requests - Premium */}
            {requests.length > 0 && (
              <div className="space-y-2">
                <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] pl-2 flex items-center gap-2 ${darkMode ? 'text-[#d4af37]/80' : 'text-[#d4af37]'}`}>
                  <span className="w-2 h-2 bg-[#d4af37] rounded-full animate-pulse" /> Pending Requests
                </h3>
                {requests.map(req => (
                  <div key={req.id} className={`p-4 rounded-[20px] flex justify-between items-center ${darkMode ? 'bg-gradient-to-r from-[#1a1500]/50 to-transparent border border-[#d4af37]/15' : 'bg-gradient-to-r from-[#fffbeb] to-white border border-[#d4af37]/15 shadow-sm'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37] to-[#b8960b] rounded-xl flex items-center justify-center font-black text-sm text-white shadow-lg shadow-[#d4af37]/20">{req.sender?.username[0].toUpperCase()}</div>
                      <div>
                        <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-800'}`}>{req.sender?.username}</p>
                        <p className={`text-[10px] font-medium ${darkMode ? 'text-white/30' : 'text-slate-400'}`}>Wants to connect</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => respondToRequest(req.id, true)} className="p-2.5 bg-[#064e3b] text-white rounded-xl shadow-lg shadow-[#064e3b]/20 hover:shadow-[#064e3b]/40 transition-all active:scale-90"><Check size={14} /></button>
                      <button onClick={() => respondToRequest(req.id, false)} className="p-2.5 bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 transition-all active:scale-90"><X size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* My Friends - Premium */}
            <div className="space-y-2">
              <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] pl-2 ${darkMode ? 'text-white/30' : 'text-slate-400'}`}>Your Circle</h3>
              {friends.length === 0 ? (
                <div className="text-center py-10">
                  <div className={`w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center ${darkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <Users size={24} className={darkMode ? 'text-white/15' : 'text-slate-200'} />
                  </div>
                  <p className={`text-xs font-bold ${darkMode ? 'text-white/25' : 'text-slate-300'}`}>You haven't added any seekers yet.</p>
                </div>
              ) : (
                friends.map((f, i) => (
                  <div key={f.id} className={`p-4 rounded-[20px] flex items-center justify-between transition-all duration-300 hover:scale-[1.01] ${darkMode ? 'bg-white/[0.03] border border-white/5 hover:bg-white/[0.06]' : 'bg-white border border-slate-100 shadow-sm hover:shadow-md'}`} style={{ animationDelay: `${i * 40}ms` }}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${darkMode ? 'bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 text-emerald-400 border border-emerald-500/20' : 'bg-gradient-to-br from-[#064e3b]/10 to-[#064e3b]/5 text-[#064e3b]'}`}>{f.username[0].toUpperCase()}</div>
                      <div>
                        <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-800'}`}>{f.username}</p>
                        <p className={`text-[10px] font-medium ${darkMode ? 'text-white/25' : 'text-slate-400'}`}>
                          <span className="text-[#d4af37] font-bold">{f.xp.toLocaleString()} XP</span> • {f.country}
                        </p>
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
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Group Invites - Premium */}
            {groupInvites.length > 0 && (
              <div className="space-y-2">
                <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] pl-2 flex items-center gap-2 ${darkMode ? 'text-[#d4af37]/80' : 'text-[#d4af37]'}`}>
                  <span className="w-2 h-2 bg-[#d4af37] rounded-full animate-pulse" />
                  <Mail size={12} /> Group Invites
                </h3>
                {groupInvites.map(inv => (
                  <div key={inv.id} className={`p-4 rounded-[20px] flex justify-between items-center ${darkMode ? 'bg-gradient-to-r from-[#1a1500]/50 to-transparent border border-[#d4af37]/15' : 'bg-gradient-to-r from-[#fffbeb] to-white border border-[#d4af37]/15 shadow-sm'}`}>
                    <div>
                      <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-800'}`}>{inv.group_name}</p>
                      <p className={`text-[10px] font-medium ${darkMode ? 'text-white/30' : 'text-slate-400'}`}>Invited by {inv.inviter_name}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => respondToGroupInvite(inv.id, inv.group_id, true)} className="p-2.5 bg-[#064e3b] text-white rounded-xl shadow-lg shadow-[#064e3b]/20 transition-all active:scale-90"><Check size={14} /></button>
                      <button onClick={() => respondToGroupInvite(inv.id, inv.group_id, false)} className="p-2.5 bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-500/20 transition-all active:scale-90"><X size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Create Group - Premium */}
            <button
              onClick={() => setShowCreateGroup(!showCreateGroup)}
              className={`w-full py-4 rounded-[20px] flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-[0.15em] transition-all active:scale-95 ${darkMode ? 'border border-dashed border-white/10 text-white/40 hover:bg-white/5 hover:text-white/60' : 'border border-dashed border-slate-200 text-slate-400 hover:bg-[#064e3b]/5 hover:text-[#064e3b] hover:border-[#064e3b]/20'}`}
            >
              <Plus size={16} /> Create New Group
            </button>

            {showCreateGroup && (
              <div className={`p-5 rounded-[24px] space-y-3 ${darkMode ? 'bg-white/[0.03] border border-white/5' : 'bg-white shadow-lg border border-slate-100'}`}>
                <input
                  type="text"
                  placeholder="Group Name (e.g. Fajr Warriors)"
                  className={`w-full p-4 rounded-2xl outline-none text-sm font-medium transition-all focus:ring-2 ${darkMode ? 'bg-black/30 text-white border border-white/5 focus:ring-emerald-500/20 placeholder:text-white/20' : 'bg-slate-50 focus:ring-[#064e3b]/10 placeholder:text-slate-300'}`}
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                />
                <button onClick={createGroup} className="w-full py-3 bg-gradient-to-r from-[#064e3b] to-[#0a6b52] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] shadow-lg shadow-[#064e3b]/20 hover:shadow-[#064e3b]/40 transition-all active:scale-[0.98]">Create</button>
              </div>
            )}

            {/* Search Groups */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search your groups..."
                className={`w-full p-3.5 pl-11 rounded-2xl text-sm font-medium outline-none transition-all focus:ring-2 ${darkMode ? 'bg-white/5 text-white border border-white/5 focus:ring-emerald-500/20 placeholder:text-white/20' : 'bg-white shadow-sm border border-slate-100 focus:ring-[#064e3b]/10 placeholder:text-slate-300'}`}
                value={groupSearchQuery}
                onChange={e => setGroupSearchQuery(e.target.value)}
              />
            </div>

            {/* Group List - Premium */}
            <div className="space-y-3">
              {filteredGroups.length === 0 ? (
                <div className="text-center py-14">
                  <div className={`w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center ${darkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <Shield size={28} className={darkMode ? 'text-white/15' : 'text-slate-200'} />
                  </div>
                  <p className={`text-sm font-bold ${darkMode ? 'text-white/25' : 'text-slate-300'}`}>{groupSearchQuery ? 'No groups match' : 'No groups yet.'}</p>
                </div>
              ) : (
                filteredGroups.map((g, i) => (
                  <div
                    key={g.id}
                    onClick={() => openGroup(g)}
                    className={`group p-5 rounded-[24px] flex items-center justify-between cursor-pointer transition-all duration-300 hover:scale-[1.01] ${darkMode ? 'bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10' : 'bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200'}`}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${darkMode ? 'bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 border border-[#d4af37]/20' : 'bg-gradient-to-br from-[#d4af37]/15 to-[#d4af37]/5'}`}>
                        <Shield size={22} className="text-[#d4af37]" />
                      </div>
                      <div>
                        <h3 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-800'}`}>{g.name}</h3>
                        <p className={`text-[10px] font-medium ${darkMode ? 'text-white/25' : 'text-slate-400'}`}>Tap to enter</p>
                      </div>
                    </div>
                    <ChevronRight className={`transition-all group-hover:translate-x-1 ${darkMode ? 'text-white/20' : 'text-slate-300'}`} size={18} />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================== ACTIVE GROUP VIEW ==================== */}
        {tab === 'groups' && activeGroup && (
          <div className="space-y-6 animate-in zoom-in-95 duration-500">
            {/* Back Button */}
            <button onClick={() => { setActiveGroup(null); setShowInvitePanel(false); }} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all hover:gap-3 ${darkMode ? 'text-white/40 hover:text-white/70' : 'text-slate-400 hover:text-[#064e3b]'}`}>
              <ChevronRight className="rotate-180" size={12} /> Back to Groups
            </button>

            {/* Group Header - Premium */}
            <div className={`relative overflow-hidden p-6 rounded-[28px] text-center ${darkMode ? 'bg-gradient-to-br from-white/[0.04] to-transparent border border-white/5' : 'bg-gradient-to-br from-white to-slate-50 border border-slate-100 shadow-lg'}`}>
              <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#d4af37]/5 blur-2xl" />
              <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-[#064e3b]/5 blur-xl" />
              <div className="relative z-10 space-y-4">
                {isRenaming ? (
                  <div className="flex items-center justify-center gap-2">
                    <input
                      value={renameText}
                      onChange={e => setRenameText(e.target.value)}
                      className={`text-xl font-bold text-center bg-transparent border-b-2 outline-none w-2/3 ${darkMode ? 'text-white border-white/20' : 'text-slate-900 border-slate-200'}`}
                      autoFocus
                    />
                    <button onClick={renameGroup} className="p-2.5 bg-[#064e3b] text-white rounded-xl shadow-lg shadow-[#064e3b]/20 transition-all active:scale-90"><Save size={14} /></button>
                    <button onClick={() => setIsRenaming(false)} className="p-2.5 bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-500/20 transition-all active:scale-90"><X size={14} /></button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 group/title">
                    <h2 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{activeGroup.name}</h2>
                    {myRole === 'admin' && (
                      <button
                        onClick={() => { setRenameText(activeGroup.name); setIsRenaming(true); }}
                        className={`opacity-0 group-hover/title:opacity-100 transition-all p-1.5 rounded-xl ${darkMode ? 'text-white/30 hover:bg-white/10 hover:text-white' : 'text-slate-300 hover:bg-slate-100 hover:text-slate-600'}`}
                      >
                        <Pencil size={12} />
                      </button>
                    )}
                  </div>
                )}
                <div className="flex justify-center -space-x-2">
                  {activeGroup.members?.map((m, i) => (
                    <div
                      key={i}
                      className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center text-[10px] font-black transition-all hover:scale-110 hover:z-10 ${darkMode ? 'bg-gradient-to-br from-white/10 to-white/5 border-[#050a09] text-white/60' : 'bg-gradient-to-br from-slate-100 to-white border-white text-slate-500'} ${m.role === 'admin' ? 'ring-2 ring-[#d4af37] ring-offset-1' : ''}`}
                      title={`${m.username}${m.role === 'admin' ? ' (Admin)' : ''}`}
                    >
                      {m.username[0].toUpperCase()}
                    </div>
                  ))}
                </div>
                <p className={`text-[10px] font-bold tabular-nums ${darkMode ? 'text-white/30' : 'text-slate-400'}`}>{activeGroup.members?.length} members • {myRole === 'admin' ? '⭐ Admin' : 'Member'}</p>
              </div>
            </div>

            {/* Admin Actions - Premium */}
            <div className="flex gap-2 justify-center flex-wrap">
              <button onClick={() => setShowInvitePanel(!showInvitePanel)} className={`px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.1em] flex items-center gap-1.5 transition-all active:scale-90 ${darkMode ? 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/5' : 'bg-slate-50 text-slate-500 hover:bg-[#064e3b]/5 hover:text-[#064e3b] border border-slate-100'}`}>
                <UserPlus size={11} /> Invite
              </button>
              <button onClick={leaveGroup} className={`px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.1em] flex items-center gap-1.5 transition-all active:scale-90 ${darkMode ? 'bg-white/5 text-rose-400 hover:bg-rose-500/10 border border-white/5' : 'bg-slate-50 text-rose-500 hover:bg-rose-50 border border-slate-100'}`}>
                <LogOut size={11} /> Leave
              </button>
              {myRole === 'admin' && (
                <button onClick={deleteGroup} className={`px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.1em] flex items-center gap-1.5 transition-all active:scale-90 ${darkMode ? 'bg-white/5 text-rose-400 hover:bg-rose-500/10 border border-white/5' : 'bg-slate-50 text-rose-500 hover:bg-rose-50 border border-slate-100'}`}>
                  <Trash2 size={11} /> Delete
                </button>
              )}
            </div>

            {/* Invite Panel - Premium */}
            {showInvitePanel && (
              <div className={`p-5 rounded-[24px] space-y-3 animate-in fade-in slide-in-from-top-2 ${darkMode ? 'bg-white/[0.03] border border-white/5' : 'bg-white shadow-lg border border-slate-100'}`}>
                <input
                  type="text"
                  placeholder="Search friends to invite..."
                  className={`w-full p-3.5 rounded-2xl text-sm font-medium outline-none transition-all focus:ring-2 ${darkMode ? 'bg-black/30 text-white border border-white/5 focus:ring-emerald-500/20 placeholder:text-white/20' : 'bg-slate-50 focus:ring-[#064e3b]/10 placeholder:text-slate-300'}`}
                  value={inviteFriendSearch}
                  onChange={e => setInviteFriendSearch(e.target.value)}
                />
                {invitableFriends.length === 0 ? (
                  <p className={`text-xs font-medium text-center py-3 ${darkMode ? 'text-white/25' : 'text-slate-300'}`}>No friends to invite</p>
                ) : (
                  invitableFriends.slice(0, 5).map(f => (
                    <div key={f.id} className={`flex items-center justify-between p-3.5 rounded-2xl ${darkMode ? 'bg-black/20 border border-white/5' : 'bg-slate-50'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${darkMode ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/20' : 'bg-[#064e3b]/10 text-[#064e3b]'}`}>{f.username[0].toUpperCase()}</div>
                        <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-700'}`}>{f.username}</span>
                      </div>
                      {groupOutgoingInvites.includes(f.id) ? (
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#d4af37] bg-[#d4af37]/10 px-3 py-1.5 rounded-xl">Invited</span>
                      ) : (
                        <button onClick={() => sendGroupInvite(f.id)} className="p-2.5 bg-gradient-to-r from-[#064e3b] to-[#0a6b52] text-white rounded-xl shadow-lg shadow-[#064e3b]/20 transition-all active:scale-90">
                          <Send size={11} />
                        </button>
                      )}
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

            {/* GROUP CHALLENGES */}
            {groupTab === 'quests' && (
              <div className="space-y-6">
                {/* Admin: Create Challenge */}
                {myRole === 'admin' && (
                  <div className={`p-4 rounded-2xl space-y-3 ${darkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
                    <h3 className="text-xs font-bold uppercase tracking-wider opacity-60">Create Group Challenge</h3>
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        placeholder="Challenge Title (e.g. Read Surah Kahf)"
                        className={`w-full p-3 rounded-xl text-sm outline-none ${darkMode ? 'bg-black/20 text-white placeholder-white/30' : 'bg-white text-slate-900'}`}
                        value={newGroupQuestTitle}
                        onChange={e => setNewGroupQuestTitle(e.target.value)}
                        maxLength={100}
                      />
                      <input
                        type="date"
                        value={newGroupQuestDeadline}
                        onChange={(e) => setNewGroupQuestDeadline(e.target.value)}
                        className={`w-full p-3 rounded-xl outline-none text-sm ${darkMode ? 'bg-black/20 text-white' : 'bg-white text-slate-900'}`}
                      />
                      <button
                        onClick={addGroupQuest}
                        disabled={!newGroupQuestTitle.trim()}
                        className="w-full py-3 bg-[#d4af37] text-white rounded-xl font-bold text-xs uppercase tracking-widest disabled:opacity-50"
                      >
                        Create Challenge (50 XP)
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {groupQuests.filter(q => !hiddenQuests.includes(q.id)).length > 0 && <h4 className={`text-[10px] font-black uppercase tracking-widest pl-2 ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>Active Challenges</h4>}
                  {groupQuests.filter(q => !hiddenQuests.includes(q.id)).map(quest => {
                    const trackingId = `gq_${quest.id}`;
                    const isTracking = currentUser.activeQuests?.includes(trackingId);
                    const completedCount = groupQuestCompletions[quest.id] || 0;
                    const totalMembers = activeGroup.members?.length || 0;
                    const isLocked = completedCount < totalMembers;
                    const iUserCompleted = currentUser.completedDailyQuests?.[trackingId] || false;
                    const isFullyComplete = !isLocked; // All members completed
                    const isDeclined = declinedQuests.includes(quest.id);

                    // Calculations for Greyed Out
                    // Gray out if: User completed BUT group not finished
                    const isGreyedOut = iUserCompleted && !isFullyComplete;

                    return (
                      <div key={quest.id} className={`p-4 rounded-2xl border flex flex-col gap-3 transition-all duration-200 ${isGreyedOut ? 'opacity-50 grayscale' : ''} ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${darkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>Group Challenge</span>
                              {quest.deadline && <span className="text-[9px] font-bold text-rose-400 flex items-center gap-1"><Clock size={10} /> Ends {new Date(quest.deadline).toLocaleDateString()}</span>}
                            </div>
                            <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{quest.title}</h4>
                            {isGreyedOut && <p className="text-[10px] text-slate-400 font-bold mt-1">Waiting for other members to complete...</p>}
                            {isFullyComplete && <p className="text-[10px] text-emerald-500 font-bold mt-1">Challenge Completed! All members done.</p>}
                            {isDeclined && <p className="text-[10px] text-rose-400 font-bold mt-1">Declined</p>}
                          </div>

                          {/* Actions */}
                          <div className={`flex items-center gap-2 ${isGreyedOut ? 'pointer-events-none' : ''}`}>

                            {/* Track Button (Show if not completed, not declined, not fully complete) */}
                            {!iUserCompleted && !isFullyComplete && !isDeclined && (
                              <button
                                onClick={() => onTrackQuest?.({
                                  id: trackingId,
                                  title: quest.title,
                                  description: `Group Challenge • ${quest.xp} XP`,
                                  category: 'COMMUNITY',
                                  xp: quest.xp,
                                  isGroupQuest: true,
                                  groupId: quest.group_id,
                                  deadline: quest.deadline
                                } as any)}
                                className={`px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-200 ${isTracking
                                  ? 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                                  : 'bg-orange-500 text-white hover:bg-orange-600'}`}
                                title={isTracking ? "Untrack" : "Track"}
                              >
                                {isTracking ? 'Untrack' : 'Track'}
                              </button>
                            )}

                            {/* Decline Button (Removes from view) */}
                            {!isTracking && !iUserCompleted && !isFullyComplete && !isDeclined && (
                              <button
                                onClick={() => { if (confirm('Decline and remove this challenge?')) handleHideQuest(quest.id); }}
                                className="px-3 py-1.5 rounded-xl bg-orange-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all duration-200"
                                style={{ backgroundColor: '#f43f5e' }} // Force Rose-500
                                title="Decline"
                              >
                                Decline
                              </button>
                            )}

                            {/* User Delete (Unlock if Declined OR Fully Complete) */}
                            {(isDeclined || isFullyComplete) && (
                              <button
                                onClick={() => { if (confirm('Remove this card from your view?')) handleHideQuest(quest.id); }}
                                className={`p-2 rounded-xl text-slate-400 hover:text-rose-500 ${darkMode ? 'bg-white/10' : 'bg-slate-100'}`}
                                title="Remove Card"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}

                            {/* Admin Delete (Only for Admin, separate from local hide) */}
                            {myRole === 'admin' && !isFullyComplete && !isDeclined && (
                              <button onClick={async () => {
                                if (confirm('Delete this challenge for EVERYONE?')) {
                                  try {
                                    await supabase.from('group_quest_completions').delete().eq('group_quest_id', quest.id);
                                    const { error } = await supabase.from('group_quests').delete().eq('id', quest.id);
                                    if (error) throw error;
                                    setGroupQuests(prev => prev.filter(q => q.id !== quest.id));
                                  } catch (e) {
                                    console.error('Delete failed:', e);
                                    alert('Could not delete challenge.');
                                  }
                                }
                              }} className="p-2 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all duration-200" title="Admin Delete">
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar (Always Show) */}
                        <div className="text-xs opacity-70">
                          <div className="flex justify-between mb-1 text-[9px] font-bold uppercase tracking-wider">
                            <span>Group Progress</span>
                            <span>{completedCount}/{totalMembers} Members Completed</span>
                          </div>
                          <div className={`h-1.5 w-full rounded-full overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-slate-200'}`}>
                            <div className={`h-full transition-all duration-500 ${isLocked ? 'bg-slate-400' : 'bg-indigo-500'}`} style={{ width: `${(completedCount / totalMembers) * 100}%` }}></div>
                          </div>
                          {isLocked && iUserCompleted && (
                            <div className="flex items-center gap-1 mt-1 text-slate-400 italic text-[10px]">
                              Waiting for others to finish to unlock XP...
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
