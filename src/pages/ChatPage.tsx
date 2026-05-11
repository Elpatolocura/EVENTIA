import { supabase } from '@/lib/supabase';
import {
  Loader2, Users, User, Lock, Ticket, ArrowRight, MessageCircle,
  Pin, Send, ArrowLeft, Settings, Paperclip, Image as ImageIcon,
  Camera, FileText, Smile, X
} from 'lucide-react';
import React, { useEffect, useState, useCallback, useRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const EMOJIS = ["😀","😂","🥰","😎","🤔","🙌","👍","🔥","🎉","✨","❤️","🚀","💡","🎵","📸","🎫","🍷","🎸","🎨","🎭"];

const ChatPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [eventRooms, setEventRooms] = useState<any[]>([]);
  const [lockedEventRooms, setLockedEventRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  const fetchChats = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setCurrentUser(user);

      // ── 1. Fetch user memberships and ticketed event IDs ──────────────────
      const [
        { data: memberships, error: memberError },
        { data: userTickets }
      ] = await Promise.all([
        supabase
          .from('chat_room_members')
          .select(`
            room_id,
            unread_count,
            chat_rooms!inner (
              *,
              chat_room_members (user_id),
              events!event_id (title, image_url)
            )
          `)
          .eq('user_id', user.id),
        supabase
          .from('tickets')
          .select('event_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
      ]);

      if (memberError) throw memberError;

      const ticketedEventIds = new Set(userTickets?.map(t => t.event_id) || []);
      const joinedRoomIds = new Set(memberships?.map(m => m.room_id) || []);

      // ── 2. Fetch all event rooms user has access to or could join ──────────
      const { data: allEventRooms } = await supabase
        .from('chat_rooms')
        .select('*, events!event_id(title, image_url, category)')
        .eq('type', 'event')
        .not('event_id', 'is', null);

      // ── 3. Resolve profiles for private chats (REMOVED) ─────────────────────────────

      // ── 4. Process Active Chats (Joined OR Ticketed) ───────────────────────
      const processedRooms = memberships?.map(m => {
        const room = m.chat_rooms;
        let displayName = room.name || 'Chat';
        let displayAvatar = null;

        if (room.type === 'event') {
          displayName = room.events?.title || room.name;
          displayAvatar = room.events?.image_url;
        }

        return {
          ...room,
          name: displayName,
          avatar: displayAvatar,
          unread: m.unread_count,
          isJoined: true
        };
      }) || [];

      // Add rooms where user has a ticket but hasn't joined yet
      const ticketedNotJoined = (allEventRooms || [])
        .filter(room => ticketedEventIds.has(room.event_id) && !joinedRoomIds.has(room.id))
        .map(room => ({
          ...room,
          name: room.events?.title || room.name,
          avatar: room.events?.image_url,
          unread: 0,
          isJoined: false
        }));

      const finalEventRooms = [...processedRooms.filter(r => r.type === 'event'), ...ticketedNotJoined]
        .map(room => {
          const settings = JSON.parse(localStorage.getItem(`chat_settings_${room.id}`) || '{}');
          return { ...room, ...settings };
        })
        .filter(room => !room.isHidden)
        .sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime();
        });

      setEventRooms(finalEventRooms);

      // ── 5. Locked Rooms ───────────────────────────────────────────────────
      const lockedEvents = (allEventRooms || [])
        .filter(room => !ticketedEventIds.has(room.event_id) && !joinedRoomIds.has(room.id))
        .slice(0, 4);
      setLockedEventRooms(lockedEvents);

      // Locked private users (REMOVED)

    } catch (error) {
      console.error('Error fetching chats', error);
      toast.error(t('chat.error_update'));
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchChats();

    // Subscribe to changes in chat_rooms and chat_room_members
    const roomChannel = supabase
      .channel('chat_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_rooms' }, () => fetchChats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_room_members' }, () => fetchChats())
      .subscribe();

    window.addEventListener('chatSettingsUpdate', fetchChats);

    return () => {
      supabase.removeChannel(roomChannel);
      window.removeEventListener('chatSettingsUpdate', fetchChats);
    };
  }, [fetchChats]);

  const handleJoinEventChat = async (room: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/auth'); return; }

    // Check if user has a ticket
    const { data: ticket } = await supabase
      .from('tickets')
      .select('id')
      .eq('user_id', user.id)
      .eq('event_id', room.event_id)
      .eq('status', 'active')
      .maybeSingle();

    if (!ticket) {
      toast.error(t('chat.restricted_access'), { description: t('chat.ticket_required') });
      navigate(`/event/${room.event_id}`);
      return;
    }

    // Join room
    const { error } = await supabase
      .from('chat_room_members')
      .upsert({ room_id: room.id, user_id: user.id }, { onConflict: 'room_id,user_id' });

    if (!error) {
      navigate(`/chat/${room.id}`);
    } else {
      toast.error(t('chat.join_error'));
    }
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInMins < 1) return t('chat.time.now');
    if (diffInMins < 60) return `${diffInMins}m`;
    
    const dayDiff = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    if (dayDiff === 0 && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (dayDiff <= 1) {
      return t('chat.time.yesterday');
    }
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pb-24">
        <div className="relative">
          <div className="w-16 h-16 rounded-3xl border-4 border-primary/20 animate-pulse"></div>
          <Loader2 className="w-8 h-8 animate-spin text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="mt-6 text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px]">{t('chat.updating')}</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center pb-32 animate-fade-in">
        <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-8 border border-primary/10 shadow-2xl shadow-primary/5">
          <MessageCircle className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-3xl font-black text-foreground tracking-tight mb-3">{t('chat.welcome_title')}</h2>
        <p className="text-muted-foreground mb-10 max-w-xs leading-relaxed">{t('chat.welcome_desc')}</p>
        <button 
          onClick={() => navigate('/auth')} 
          className="w-full max-w-xs h-16 rounded-2xl bg-foreground text-background font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-foreground/10 active:scale-95 transition-all"
        >
          {t('chat.start_chatting')}
        </button>
      </div>
    );
  }

  const ActiveChatItem = ({ room, type }: { room: any, type: 'event' | 'private' }) => (
    <button
      className="w-full flex items-center gap-4 bg-card rounded-[24px] p-4 border border-border text-left transition-all hover:shadow-xl hover:shadow-black/5 hover:border-primary/20 active:scale-[0.98] group relative overflow-hidden"
    >
      <div className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center border overflow-hidden shrink-0 transition-transform group-hover:scale-105 shadow-sm",
        type === 'event' ? 'bg-primary/5 border-primary/10' : 'bg-secondary border-border'
      )}>
        {room.avatar ? (
          <img src={room.avatar} loading="lazy" alt={room.name} className="w-full h-full object-cover" />
        ) : type === 'event' ? (
          <Users className="w-6 h-6 text-primary" />
        ) : (
          <User className="w-6 h-6 text-muted-foreground" />
        )}
      </div>
      
      <div className="flex-1 min-w-0 py-1">
        <div className="flex justify-between items-start gap-2 mb-1">
          <p className="font-black text-foreground text-[14px] truncate leading-tight group-hover:text-primary transition-colors">
            {room.name}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            {room.isPinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />}
            <span className="text-[10px] font-bold text-muted-foreground/60">
              {formatTime(room.last_message_at)}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <p className={cn(
            "text-[12px] truncate max-w-[85%]",
            room.unread > 0 ? "text-foreground font-bold" : "text-muted-foreground font-medium"
          )}>
            {!room.isJoined && type === 'event' ? (
              <span className="text-primary font-black uppercase text-[9px] tracking-wider">{t('chat.new_access')}</span>
            ) : room.last_message || t('chat.start_conversation')}
          </p>
          
          {room.unread > 0 && (
            <div className="bg-primary text-white text-[9px] font-black rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1.5 shadow-lg shadow-primary/20 border-2 border-background">
              {room.unread}
            </div>
          )}
          
          {!room.isJoined && type === 'event' && (
            <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
          )}
        </div>
      </div>
      
      {room.unread > 0 && (
        <div className="absolute top-0 right-0 w-1 h-full bg-primary" />
      )}
    </button>
  );

  const LockedEventItem = ({ room }: { room: any }) => (
    <button
      className="w-full flex items-center gap-4 bg-secondary/30 rounded-[24px] p-4 border border-dashed border-border text-left transition-all hover:border-amber-500/50 hover:bg-amber-500/5 active:scale-[0.98] group opacity-80"
    >
      <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center shrink-0 relative shadow-sm group-hover:border-amber-500/50">
        {room.events?.image_url ? (
           <img src={room.events.image_url} loading="lazy" alt="" className="w-full h-full object-cover opacity-40 grayscale" />
        ) : (
          <Users className="w-6 h-6 text-muted-foreground/30" />
        )}
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center border-2 border-background shadow-md">
          <Lock className="w-2.5 h-2.5 text-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-black text-[14px] text-muted-foreground truncate mb-1">{room.events?.title || room.name}</p>
        <div className="flex items-center gap-1.5">
          <Ticket className="w-3.5 h-3.5 text-amber-500" />
          <p className="text-[10px] text-amber-500/80 font-black uppercase tracking-widest">{t('chat.ticket_required')}</p>
        </div>
      </div>
      <div className="h-10 w-10 rounded-xl border border-border flex items-center justify-center text-muted-foreground/30 group-hover:border-amber-500/50 group-hover:text-amber-500 transition-colors">
        <ArrowRight className="w-4 h-4" />
      </div>
    </button>
  );

  // LockedPrivateItem REMOVED

  const EmptyState = ({ type }: { type: 'event' | 'private' }) => (
    <div className="text-center py-20 px-8 animate-in fade-in zoom-in-95 duration-700">
      <div className="w-24 h-24 rounded-[36px] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-6 border border-primary/10 shadow-inner">
        {type === 'event' ? <Users className="w-10 h-10 text-primary/40" /> : <User className="w-10 h-10 text-primary/40" />}
      </div>
      <h3 className="font-black text-2xl text-foreground tracking-tight mb-3">
        {type === 'event' ? t('chat.empty.events_title') : t('chat.empty.private_title')}
      </h3>
      <p className="text-muted-foreground text-[14px] font-medium leading-relaxed mb-10 max-w-[240px] mx-auto">
        {type === 'event'
          ? t('chat.empty.events_desc')
          : t('chat.empty.private_desc')}
      </p>
      <button
        onClick={() => navigate(type === 'event' ? '/' : '/explore')}
        className="h-14 px-10 rounded-2xl bg-foreground text-background font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-foreground/10 active:scale-95 transition-all"
      >
        {t('chat.empty.explore_events')}
      </button>
    </div>
  );

  const InlineChatView = () => {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [attachments, setAttachments] = useState<{url: string, type: string}[]>([]);
    const [showEmoji, setShowEmoji] = useState(false);
    const [appearance, setAppearance] = useState({
      myBubbleColor: '#00c853',
      otherBubbleColor: '#f1f5f9',
      textColor: '#ffffff',
      otherTextColor: '#0f172a',
      backgroundColor: '#ffffff'
    });
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emojiRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      if (!selectedRoom?.id) return;
      const saved = localStorage.getItem(`chat_appearance_${selectedRoom.id}`);
      if (saved) setAppearance(JSON.parse(saved));
    }, [selectedRoom?.id]);

    useEffect(() => {
      if (!selectedRoom?.id) return;
      const handler = () => {
        const saved = localStorage.getItem(`chat_appearance_${selectedRoom.id}`);
        if (saved) setAppearance(JSON.parse(saved));
      };
      window.addEventListener('chatAppearanceUpdate', handler);
      return () => window.removeEventListener('chatAppearanceUpdate', handler);
    }, [selectedRoom?.id]);

    useEffect(() => {
      if (!selectedRoom) return;
      let cancelled = false;
      const fetchMessages = async () => {
        const { data } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('room_id', selectedRoom.id)
          .order('created_at', { ascending: true });
        if (data && !cancelled) setMessages(data);
      };
      fetchMessages();

      const channel = supabase
        .channel(`inline-chat-${selectedRoom.id}`)
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${selectedRoom.id}` },
          () => { if (!cancelled) fetchMessages(); }
        )
        .subscribe();

      return () => { cancelled = true; supabase.removeChannel(channel); };
    }, [selectedRoom?.id]);

    useEffect(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
      if (!showEmoji) return;
      const handleClick = (e: MouseEvent) => {
        if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
          setShowEmoji(false);
        }
      };
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }, [showEmoji]);

    const handleSend = async () => {
      if ((!input.trim() && attachments.length === 0) || !currentUser || sending) return;
      setSending(true);
      await supabase.from('chat_messages').insert({
        room_id: selectedRoom.id,
        sender_id: currentUser.id,
        text: input.trim() || null,
        images: attachments.filter(a => a.type.startsWith('image/')).map(a => a.url),
        video_url: attachments.find(a => a.type.startsWith('video/'))?.url || null,
      });
      setInput('');
      setAttachments([]);
      setSending(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      for (const file of files) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachments(prev => [...prev, { url: reader.result as string, type: file.type }]);
        };
        reader.readAsDataURL(file);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const formatMsgTime = (ts: string) => {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const removeAttachment = (idx: number) => {
      setAttachments(prev => prev.filter((_, i) => i !== idx));
    };

    return (
      <div className="flex flex-col h-full">
        {/* Room header */}
        <div className="flex items-center gap-3 p-4 border-b border-border shrink-0">
          <button onClick={() => setSelectedRoom(null)} className="lg:hidden p-2 rounded-full hover:bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10 overflow-hidden shrink-0">
            {selectedRoom.avatar ? (
              <img src={selectedRoom.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <Users className="w-5 h-5 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground text-sm truncate">{selectedRoom.name}</p>
            <p className="text-[10px] text-muted-foreground font-medium">En línea</p>
          </div>
          <button
            onClick={() => navigate(`/chat-settings/${selectedRoom.id}`)}
            className="p-2 rounded-xl hover:bg-secondary transition-colors"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 transition-colors duration-500" style={{ backgroundColor: appearance.backgroundColor }}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed transition-colors duration-500"
                style={{
                  backgroundColor: msg.sender_id === currentUser?.id ? appearance.myBubbleColor : appearance.otherBubbleColor,
                  color: msg.sender_id === currentUser?.id ? appearance.textColor : appearance.otherTextColor,
                  borderRadius: msg.sender_id === currentUser?.id ? '18px 18px 4px 18px' : '18px 18px 18px 4px'
                }}
              >
                {msg.images?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {msg.images.map((img: string, i: number) => (
                      <img key={i} src={img} alt="" className="w-40 h-32 object-cover rounded-xl" loading="lazy" />
                    ))}
                  </div>
                )}
                {msg.text && <p>{msg.text}</p>}
                <p className="text-[9px] mt-1 font-medium" style={{ opacity: 0.6, color: 'inherit' }}>
                  {formatMsgTime(msg.created_at)}
                </p>
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-center py-16">
              <MessageCircle className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium text-sm">{t('chat.start_conversation') || 'Sin mensajes aún'}</p>
            </div>
          )}
        </div>

        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t border-border">
            {attachments.map((att, idx) => (
              <div key={idx} className="relative shrink-0">
                {att.type.startsWith('video/') ? (
                  <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center overflow-hidden">
                    <video src={att.url} className="w-full h-full object-cover opacity-50" />
                    <Camera className="w-5 h-5 text-white absolute" />
                  </div>
                ) : (
                  <img src={att.url} alt="" className="w-16 h-16 object-cover rounded-xl border border-border" loading="lazy" />
                )}
                <button onClick={() => removeAttachment(idx)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-foreground text-background rounded-full flex items-center justify-center shadow">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-border shrink-0">
          <div className="flex items-end gap-2">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" multiple onChange={handleFileChange} />
            <button onClick={() => fileInputRef.current?.click()} className="p-3 rounded-2xl bg-muted text-muted-foreground hover:bg-secondary transition-all shrink-0">
              <Paperclip className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="Escribe un mensaje..."
                rows={1}
                className="w-full rounded-2xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              <button
                onClick={() => setShowEmoji(!showEmoji)}
                className={`absolute right-3 bottom-3 transition-all ${showEmoji ? 'text-amber-500' : 'text-muted-foreground hover:text-amber-500'}`}
              >
                <Smile className="w-5 h-5" />
              </button>
              {showEmoji && (
                <div ref={emojiRef} className="absolute right-0 bottom-full mb-2 w-64 p-3 rounded-2xl border border-border bg-card shadow-xl animate-in slide-in-from-bottom-2 z-50">
                  <div className="grid grid-cols-5 gap-1 max-h-48 overflow-y-auto">
                    {EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setInput(prev => prev + emoji);
                          inputRef.current?.focus();
                        }}
                        className="text-xl p-1.5 hover:bg-muted rounded-lg transition-all active:scale-125"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleSend}
              disabled={(!input.trim() && attachments.length === 0) || sending}
              className="p-3 rounded-2xl bg-foreground text-background disabled:opacity-40 transition-all shrink-0"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const NoChatPlaceholder = () => (
    <div className="hidden lg:flex flex-col items-center justify-center h-full p-12 text-center animate-fade-in">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="relative w-32 h-32 rounded-[40px] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/10 shadow-2xl shadow-primary/5">
          <MessageCircle className="w-16 h-16 text-primary/40" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-green-500/30">
          <div className="w-3 h-3 bg-white rounded-full" />
        </div>
      </div>
      <h3 className="text-3xl font-black text-foreground tracking-tight mb-3">Selecciona un chat</h3>
      <p className="text-muted-foreground text-[15px] font-medium leading-relaxed max-w-sm">
        Elige una conversación de la lista para empezar a chatear con la comunidad del evento.
      </p>
      <div className="flex gap-3 mt-10">
        <div className="w-3 h-3 bg-primary/20 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-3 h-3 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-3 h-3 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );

  const handleRoomClick = (room: any) => {
    if (!room.isJoined) {
      handleJoinEventChat(room);
      return;
    }
    if (window.innerWidth >= 1024) {
      setSelectedRoom(room);
    } else {
      navigate(`/chat/${room.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden lg:flex lg:h-screen lg:overflow-hidden">
      {/* Background Decor - mobile only */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none lg:hidden" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none lg:hidden" />

      {/* ═══ Left Panel: Chat List ═══ */}
      <div className={`flex flex-col ${selectedRoom ? 'hidden lg:flex' : 'flex'} lg:w-[400px] lg:border-r lg:border-border lg:min-h-screen`}>
        {/* Header */}
        <header className="pt-8 pb-6 px-6 lg:px-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-black text-foreground tracking-tight">{t('chat.title')}</h1>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500/50" />
            </div>
            <p className="text-muted-foreground text-[11px] font-black uppercase tracking-[0.25em]">{t('chat.subtitle')}</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 pb-32 lg:pb-6 space-y-6">
          {eventRooms.length > 0 ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1 mb-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{t('chat.your_conversations')}</p>
                {eventRooms.filter(r => r.unread > 0).length > 0 && (
                  <span className="text-[10px] font-black text-primary uppercase tracking-wider">
                    {eventRooms.filter(r => r.unread > 0).length} {t('chat.new_messages')}
                  </span>
                )}
              </div>
              {eventRooms.map(room => (
                <div key={room.id} onClick={() => handleRoomClick(room)}>
                  <ActiveChatItem room={room} type="event" />
                </div>
              ))}
            </div>
          ) : (
            !loading && lockedEventRooms.length === 0 && <EmptyState type="event" />
          )}

          {lockedEventRooms.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-dashed border-border mt-8">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{t('chat.suggested_for_you')}</p>
                </div>
                <button className="text-[10px] font-black text-primary uppercase tracking-wider hover:underline" onClick={() => navigate('/')}>{t('home.view_all')}</button>
              </div>
              <div className="space-y-3">
                {lockedEventRooms.map(room => (
                  <div key={room.id} onClick={() => handleRoomClick(room)}>
                    <LockedEventItem room={room} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Right Panel: Selected Chat or Placeholder ═══ */}
      <div className={`${selectedRoom ? 'flex' : 'hidden'} lg:flex lg:flex-1 lg:flex-col lg:bg-muted/20`}>
        {selectedRoom ? (
          <InlineChatView />
        ) : (
          <NoChatPlaceholder />
        )}
      </div>
    </div>
  );
};

export default ChatPage;

