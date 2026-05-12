import { supabase } from '@/lib/supabase';
import { Loader2, Users, Lock, ArrowRight, MessageCircle, Settings, ArrowLeft, Send, Paperclip, Smile, X, Camera, Pin } from 'lucide-react';
import { useCallback, useRef, useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';

const EMOJIS = ["😀","😂","🥰","😎","🤔","🙌","👍","🔥","🎉","✨","❤️","🚀","💡","🎵","📸","🎫","🍷","🎸","🎨","🎭"];

const fetchChatsData = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, eventRooms: [], lockedEventRooms: [] };

  const [membersRes, ticketsRes] = await Promise.all([
    supabase.from('chat_room_members').select('room_id, unread_count, chat_rooms!inner(*, chat_room_members(user_id), events!event_id(title, image_url))').eq('user_id', user.id),
    supabase.from('tickets').select('event_id').eq('user_id', user.id).eq('status', 'active'),
  ]);

  const memberships = membersRes.data || [];
  const userTickets = ticketsRes.data || [];
  const ticketedEventIds = new Set(userTickets.map((t: any) => t.event_id));
  const joinedRoomIds = new Set(memberships.map((m: any) => m.room_id));

  const { data: allEventRooms } = await supabase
    .from('chat_rooms')
    .select('*, events!event_id(title, image_url, category)')
    .eq('type', 'event')
    .not('event_id', 'is', null);

  const processedRooms = (memberships || []).map((m: any) => {
    const room = m.chat_rooms;
    return { ...room, name: room.events?.title || room.name, avatar: room.events?.image_url, unread: m.unread_count, isJoined: true };
  });

  const ticketedNotJoined = (allEventRooms || [])
    .filter((room: any) => ticketedEventIds.has(room.event_id) && !joinedRoomIds.has(room.id))
    .map((room: any) => ({ ...room, name: room.events?.title || room.name, avatar: room.events?.image_url, unread: 0, isJoined: false }));

  const finalEventRooms = [...processedRooms.filter((r: any) => r.type === 'event'), ...ticketedNotJoined]
    .sort((a: any, b: any) => { if (a.isPinned && !b.isPinned) return -1; if (!a.isPinned && b.isPinned) return 1; return new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime(); });

  const lockedEvents = (allEventRooms || [])
    .filter((room: any) => !ticketedEventIds.has(room.event_id) && !joinedRoomIds.has(room.id))
    .slice(0, 4);

  return { user, eventRooms: finalEventRooms, lockedEventRooms: lockedEvents };
};

const ChatPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.chats.all,
    queryFn: fetchChatsData,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });

  const currentUser = data?.user ?? null;
  const eventRooms = data?.eventRooms ?? [];
  const lockedEventRooms = data?.lockedEventRooms ?? [];

  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pb-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-6 text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px]">{t('chat.updating')}</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center pb-32">
        <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-8 border border-primary/10">
          <MessageCircle className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-3xl font-black text-foreground tracking-tight mb-3">{t('chat.welcome_title')}</h2>
        <p className="text-muted-foreground mb-10 max-w-xs leading-relaxed">{t('chat.welcome_desc')}</p>
        <button onClick={() => navigate('/auth')} className="w-full max-w-xs h-16 rounded-2xl bg-foreground text-background font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-foreground/10 active:scale-95 transition-all">
          {t('chat.start_chatting')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden lg:flex lg:h-screen lg:overflow-hidden">
      <div className={`flex flex-col ${selectedRoom ? 'hidden lg:flex' : 'flex'} lg:w-[400px] lg:border-r lg:border-border lg:min-h-screen`}>
        <header className="pt-8 pb-6 px-6">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-black text-foreground tracking-tight">{t('chat.title')}</h1>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
          <p className="text-muted-foreground text-[11px] font-black uppercase tracking-[0.25em]">{t('chat.subtitle')}</p>
        </header>

        <div className="flex-1 overflow-y-auto px-6 pb-32 lg:pb-6 space-y-6">
          {eventRooms.length > 0 ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1 mb-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{t('chat.your_conversations')}</p>
                {eventRooms.filter((r: any) => r.unread > 0).length > 0 && (
                  <span className="text-[10px] font-black text-primary uppercase tracking-wider">
                    {eventRooms.filter((r: any) => r.unread > 0).length} {t('chat.new_messages')}
                  </span>
                )}
              </div>
              {eventRooms.map((room: any) => (
                <ActiveChatItem key={room.id} room={room} onClick={() => {
                  if (window.innerWidth >= 1024) setSelectedRoom(room);
                  else navigate(`/chat/${room.id}`);
                }} t={t} />
              ))}
            </div>
          ) : !isLoading && lockedEventRooms.length === 0 && (
            <EmptyState type="event" navigate={navigate} t={t} />
          )}

          {lockedEventRooms.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-dashed border-border mt-8">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{t('chat.suggested_for_you')}</p>
                </div>
              </div>
              <div className="space-y-3">
                {lockedEventRooms.map((room: any) => (
                  <LockedEventItem key={room.id} room={room} onNavigate={() => navigate(`/event/${room.event_id}`)} t={t} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`${selectedRoom ? 'flex' : 'hidden'} lg:flex lg:flex-1 lg:flex-col lg:bg-muted/20`}>
        {selectedRoom ? (
          <InlineChatView room={selectedRoom} onBack={() => setSelectedRoom(null)} currentUser={currentUser} navigate={navigate} t={t} />
        ) : (
          <NoChatPlaceholder t={t} />
        )}
      </div>
    </div>
  );
};

const ActiveChatItem = memo(({ room, onClick, t }: { room: any; onClick: () => void; t: any }) => (
  <button onClick={onClick} className="w-full flex items-center gap-4 bg-card rounded-[24px] p-4 border border-border text-left transition-all hover:shadow-xl hover:border-primary/20 active:scale-[0.98] group relative overflow-hidden">
    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border overflow-hidden shrink-0 transition-transform group-hover:scale-105 shadow-sm", room.type === 'event' ? 'bg-primary/5 border-primary/10' : 'bg-secondary border-border')}>
      {room.avatar ? <img src={room.avatar} loading="lazy" alt={room.name} className="w-full h-full object-cover" /> : <Users className="w-6 h-6 text-primary" />}
    </div>
    <div className="flex-1 min-w-0 py-1">
      <div className="flex justify-between items-start gap-2 mb-1">
        <p className="font-black text-foreground text-[14px] truncate leading-tight">{room.name}</p>
        <div className="flex items-center gap-2 shrink-0">
          {room.isPinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />}
          <span className="text-[10px] font-bold text-muted-foreground/60">{formatTime(room.last_message_at)}</span>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <p className={cn("text-[12px] truncate max-w-[85%]", room.unread > 0 ? "text-foreground font-bold" : "text-muted-foreground font-medium")}>
          {!room.isJoined ? <span className="text-primary font-black uppercase text-[9px] tracking-wider">{t('chat.new_access')}</span> : room.last_message || t('chat.start_conversation')}
        </p>
        {room.unread > 0 && <div className="bg-primary text-white text-[9px] font-black rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1.5 shadow-lg border-2 border-background">{room.unread}</div>}
      </div>
    </div>
    {room.unread > 0 && <div className="absolute top-0 right-0 w-1 h-full bg-primary" />}
  </button>
));

const LockedEventItem = memo(({ room, onNavigate, t }: { room: any; onNavigate: () => void; t: any }) => (
  <button onClick={onNavigate} className="w-full flex items-center gap-4 bg-secondary/30 rounded-[24px] p-4 border border-dashed border-border text-left transition-all hover:border-amber-500/50 hover:bg-amber-500/5 active:scale-[0.98] group opacity-80">
    <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center shrink-0 relative shadow-sm">
      {room.events?.image_url ? <img src={room.events.image_url} loading="lazy" alt="" className="w-full h-full object-cover opacity-40 grayscale" /> : <Users className="w-6 h-6 text-muted-foreground/30" />}
      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center border-2 border-background shadow-md"><Lock className="w-2.5 h-2.5 text-white" /></div>
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-black text-[14px] text-muted-foreground truncate mb-1">{room.events?.title || room.name}</p>
      <div className="flex items-center gap-1.5"><TicketIcon /><p className="text-[10px] text-amber-500/80 font-black uppercase tracking-widest">{t('chat.ticket_required')}</p></div>
    </div>
    <div className="h-10 w-10 rounded-xl border border-border flex items-center justify-center text-muted-foreground/30"><ArrowRight className="w-4 h-4" /></div>
  </button>
));

const TicketIcon = () => (
  <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
);

const EmptyState = ({ type, navigate, t }: { type: 'event' | 'private'; navigate: any; t: any }) => (
  <div className="text-center py-20 px-8">
    <div className="w-24 h-24 rounded-[36px] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-6 border border-primary/10">
      <Users className="w-10 h-10 text-primary/40" />
    </div>
    <h3 className="font-black text-2xl text-foreground tracking-tight mb-3">{t('chat.empty.events_title')}</h3>
    <p className="text-muted-foreground text-[14px] font-medium leading-relaxed mb-10 max-w-[240px] mx-auto">{t('chat.empty.events_desc')}</p>
    <button onClick={() => navigate('/')} className="h-14 px-10 rounded-2xl bg-foreground text-background font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-foreground/10 active:scale-95 transition-all">{t('chat.empty.explore_events')}</button>
  </div>
);

const NoChatPlaceholder = memo(({ t }: { t: any }) => (
  <div className="hidden lg:flex flex-col items-center justify-center h-full p-12 text-center">
    <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/10">
      <MessageCircle className="w-16 h-16 text-primary/40" />
    </div>
    <h3 className="text-3xl font-black text-foreground tracking-tight mb-3 mt-8">Selecciona un chat</h3>
    <p className="text-muted-foreground text-[15px] font-medium leading-relaxed max-w-sm">Elige una conversación de la lista para empezar a chatear.</p>
  </div>
));

const InlineChatView = memo(({ room, onBack, currentUser, navigate, t }: { room: any; onBack: () => void; currentUser: any; navigate: any; t: any }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useQuery({
    queryKey: queryKeys.chats.messages(room.id),
    queryFn: async () => {
      const { data } = await supabase.from('chat_messages').select('*').eq('room_id', room.id).order('created_at', { ascending: true });
      if (data) setMessages(data);
      return data || [];
    },
    staleTime: 1000 * 10,
    refetchInterval: 1000 * 30,
  });

  useEffect(() => {
    const channel = supabase.channel(`inline-msg-${room.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${room.id}` },
        (payload) => { setMessages(prev => prev.some(m => m.id === payload.new.id) ? prev : [...prev, payload.new]); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [room.id]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if ((!input.trim()) || !currentUser || sending) return;
    setSending(true);
    await supabase.from('chat_messages').insert({ room_id: room.id, sender_id: currentUser.id, text: input.trim() });
    setInput('');
    setSending(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b border-border shrink-0">
        <button onClick={onBack} className="lg:hidden p-2 rounded-full hover:bg-secondary"><ArrowLeft className="w-5 h-5" /></button>
        <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10 overflow-hidden shrink-0">
          {room.avatar ? <img src={room.avatar} alt="" className="w-full h-full object-cover" /> : <Users className="w-5 h-5 text-primary" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground text-sm truncate">{room.name}</p>
        </div>
        <button onClick={() => navigate(`/chat-settings/${room.id}`)} className="p-2 rounded-xl hover:bg-secondary"><Settings className="w-5 h-5 text-muted-foreground" /></button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.sender_id === currentUser?.id ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-secondary text-secondary-foreground rounded-bl-sm'}`}>
              {msg.text && <p>{msg.text}</p>}
              <p className="text-[9px] mt-1 font-medium opacity-60">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-center py-16"><MessageCircle className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" /><p className="text-muted-foreground font-medium text-sm">{t('chat.start_conversation') || 'Sin mensajes aún'}</p></div>
        )}
      </div>

      <div className="p-4 border-t border-border shrink-0">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Escribe un mensaje..." rows={1} className="w-full rounded-2xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-primary/20 resize-none" style={{ minHeight: '48px', maxHeight: '120px' }} />
            <button onClick={() => setShowEmoji(!showEmoji)} className={`absolute right-3 bottom-3 transition-all ${showEmoji ? 'text-amber-500' : 'text-muted-foreground hover:text-amber-500'}`}>
              <Smile className="w-5 h-5" />
            </button>
            {showEmoji && <div className="absolute right-0 bottom-full mb-2 w-64 p-3 rounded-2xl border border-border bg-card shadow-xl z-50">
              <div className="grid grid-cols-5 gap-1">
                {EMOJIS.map(emoji => <button key={emoji} type="button" onClick={() => { setInput(prev => prev + emoji); inputRef.current?.focus(); }} className="text-xl p-1.5 hover:bg-muted rounded-lg">{emoji}</button>)}
              </div>
            </div>}
          </div>
          <button onClick={handleSend} disabled={!input.trim() || sending} className="p-3 rounded-2xl bg-foreground text-background disabled:opacity-40 transition-all shrink-0">
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
});

function formatTime(timestamp: string) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  if (diffInMins < 1) return 'Ahora';
  if (diffInMins < 60) return `${diffInMins}m`;
  if (date.getDate() === now.getDate()) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
}

export default ChatPage;