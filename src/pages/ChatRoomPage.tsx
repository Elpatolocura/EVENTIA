import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSmartBack } from '@/hooks/useSmartBack';
import { 
  ArrowLeft, Send, MoreVertical, Paperclip, 
  Smile, Heart, User, MapPin, Calendar, 
  Star, MessageCircle, X, ShieldCheck, Instagram,
  Image as ImageIcon, Camera, FileText, Download, Share2,
  ChevronLeft, ChevronRight, Search, BellOff,
  Reply, Copy, Forward, ShieldAlert, Trash2, MoreHorizontal,
  Sparkles, MessageSquareHeart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { Loader2, Ticket, UserPlus, Lock, ShieldOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import ChatMessageBubble from '@/components/ChatMessageBubble';

const ChatRoomPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const goBack = useSmartBack('/chat');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<{url: string, type: string}[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [viewerData, setViewerData] = useState<{ images: string[], index: number } | null>(null);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  // Click outside listener for emoji picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isEmojiPickerOpen && 
        emojiPickerRef.current && 
        !emojiPickerRef.current.contains(event.target as Node) &&
        emojiTriggerRef.current &&
        !emojiTriggerRef.current.contains(event.target as Node)
      ) {
        setIsEmojiPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEmojiPickerOpen]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiTriggerRef = useRef<HTMLButtonElement>(null);
  const currentUserIdRef = useRef<string | null>(null);

  const [appearance, setAppearance] = useState({
    myBubbleColor: '#00c853',
    otherBubbleColor: '#f1f5f9',
    textColor: '#ffffff',
    otherTextColor: '#0f172a',
    backgroundColor: '#ffffff'
  });

  useEffect(() => {
    if (id) {
      const loadAppearance = () => {
        const saved = localStorage.getItem(`chat_appearance_${id}`);
        if (saved) {
          setAppearance(JSON.parse(saved));
        }
      };
      loadAppearance();
      window.addEventListener('chatAppearanceUpdate', loadAppearance);
      return () => window.removeEventListener('chatAppearanceUpdate', loadAppearance);
    }
  }, [id]);

  useEffect(() => {
    if (selectedUser) {
      setIsFollowingUser(false); // Reset when opening a new user profile
    }
  }, [selectedUser]);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      navigateImage(1);
    } else if (isRightSwipe) {
      navigateImage(-1);
    }
  };

  const navigateImage = (direction: number) => {
    if (!viewerData) return;
    const newIndex = viewerData.index + direction;
    if (newIndex >= 0 && newIndex < viewerData.images.length) {
      setViewerData({ ...viewerData, index: newIndex });
    }
  };

  const EMOJIS = ["😀","😂","🥰","😎","🤔","🙌","👍","🔥","🎉","✨","❤️","🚀","💡","🎵","📸","🎫","🍷","🎸","🎨","🎭"];

  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [accessStatus, setAccessStatus] = useState<'checking' | 'granted' | 'denied_ticket'>('checking');
  const [deniedEventId, setDeniedEventId] = useState<string | null>(null);
  const [recentFollowers, setRecentFollowers] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchInitialData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return;
        // Store in ref so the Realtime listener always has access
        currentUserIdRef.current = authUser.id;

        // Ensure user has a profile record to satisfy foreign key constraints for messages
        const { data: profileCheck } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', authUser.id)
          .maybeSingle();
        
        if (!profileCheck) {
          console.log("Profile missing, creating basic profile...");
          await supabase.from('profiles').insert({
            id: authUser.id,
            full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Usuario',
            avatar_url: authUser.user_metadata?.avatar_url || `https://i.pravatar.cc/150?u=${authUser.id}`,
            role: 'user'
          });
        }

        // Fetch room info with members and event details
        const { data: room, error: roomError } = await supabase
          .from('chat_rooms')
          .select(`
            *,
            chat_room_members (user_id),
            events (*)
          `)
          .eq('id', id)
          .single();

        if (roomError) throw roomError;

        if (room.type === 'event' && room.events) {
          // Use event details for the room info
          room.name = room.events.title;
          room.avatar = room.events.image_url;
          room.event_date = room.events.event_date;
        }
        
        setRoomInfo(room);

        // ── ACCESS CONTROL GATE ──────────────────────────────────────
        if (room.type === 'event') {
          // Check if user has a valid ticket for the event
          if (room.event_id) {
            const { data: ticket } = await supabase
              .from('tickets')
              .select('id')
              .eq('user_id', authUser.id)
              .eq('event_id', room.event_id)
              .eq('status', 'active')
              .maybeSingle();

            if (!ticket) {
              setDeniedEventId(room.event_id);
              setAccessStatus('denied_ticket');
              setLoading(false);
              return;
            }
          }
        }

        setAccessStatus('granted');

        // Fetch recent followers for event rooms
        if (room.type === 'event' && room.event_id) {
          const { data: favs } = await supabase
            .from('favorites')
            .select('user_id, created_at')
            .eq('event_id', room.event_id)
            .order('created_at', { ascending: false })
            .limit(20);

          if (favs && favs.length > 0) {
            const userIds = favs.map((f: any) => f.user_id);
            const { data: profilesData } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url')
              .in('id', userIds);

            const profileMap = Object.fromEntries((profilesData || []).map((p: any) => [p.id, p]));
            setRecentFollowers(favs.map((f: any) => ({
              id: f.user_id,
              name: profileMap[f.user_id]?.full_name || 'Usuario',
              avatar: profileMap[f.user_id]?.avatar_url || null,
              joined_at: f.created_at
            })));
          }
        }


        // Ensure user is in chat_room_members to pass RLS for sending messages
        const isMember = room.chat_room_members?.some((m: any) => m.user_id === authUser.id);
        if (!isMember) {
          await supabase
            .from('chat_room_members')
            .upsert({ room_id: id, user_id: authUser.id }, { onConflict: 'room_id,user_id' });
        }

        // Fetch initial messages
        const clearTimestamp = localStorage.getItem(`chat_clear_timestamp_${id}`);
        
        let query = supabase
          .from('chat_messages')
          .select(`
            *,
            sender:sender_id (full_name, avatar_url, role)
          `)
          .eq('room_id', id);

        if (clearTimestamp) {
          query = query.gt('created_at', clearTimestamp);
        }

        const { data: messages, error: msgsError } = await query.order('created_at', { ascending: true });

        if (msgsError) throw msgsError;

        const formattedMessages = (messages || []).map(m => ({
          id: m.id,
          user: m.sender?.full_name || 'Usuario',
          avatar: m.sender?.avatar_url || 'https://i.pravatar.cc/150',
          role: m.sender?.role || 'Asistente',
          text: m.text,
          images: m.images || [],
          video: m.video_url,
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: m.sender_id === authUser.id,
          sender_id: m.sender_id,
          replyTo: null as any
        }));

        // Link replyTo after all messages are formatted
        formattedMessages.forEach(m => {
          const raw = (messages || []).find(r => r.id === m.id);
          if (raw?.reply_to_id) {
            m.replyTo = formattedMessages.find(fm => fm.id === raw.reply_to_id) || null;
          }
        });

        setChatMessages(formattedMessages);
      } catch (error) {
        console.error("Error fetching chat data", error);
        toast.error(t('chat_room.error_loading'));
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Subscribe to new messages
    const channel = supabase
      .channel(`room-${id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages',
        filter: `room_id=eq.${id}`
      }, async (payload) => {
        // Fetch sender profile and add to state — deduplication happens via id check
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, role')
          .eq('id', payload.new.sender_id)
          .single();

        setChatMessages(prev => {
          // Prevent duplicate
          if (prev.some(m => m.id === payload.new.id)) return prev;

          const newMessage = {
            id: payload.new.id,
            user: profile?.full_name || 'Usuario',
            avatar: profile?.avatar_url || 'https://i.pravatar.cc/150',
            role: profile?.role || 'Asistente',
            text: payload.new.text,
            images: payload.new.images || [],
            video: payload.new.video_url,
            time: new Date(payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            // Use the ref — always correct even after async operations
            isMe: payload.new.sender_id === currentUserIdRef.current,
            sender_id: payload.new.sender_id,
            replyTo: payload.new.reply_to_id ? prev.find(m => m.id === payload.new.reply_to_id) || null : null
          };

          return [...prev, newMessage];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim() && attachments.length === 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error(t('chat_room.login_to_send'));
        return;
      }

      const { error } = await supabase.from('chat_messages').insert({
        room_id: id,
        sender_id: user.id,
        text: message.trim(),
        images: attachments.filter(a => a.type.startsWith('image/')).map(a => a.url),
        video_url: attachments.find(a => a.type.startsWith('video/'))?.url,
        reply_to_id: replyingTo?.id
      });

      if (error) throw error;

      setMessage('');
      setAttachments([]);
      setReplyingTo(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = '56px';
      }
    } catch (error) {
      console.error("Error sending message", error);
      toast.error(t('chat_room.error_send'));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsAttachmentMenuOpen(false); // Cierra el menú al subir
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    let imagesCount = attachments.filter(a => a.type.startsWith('image/')).length;
    let videosCount = attachments.filter(a => a.type.startsWith('video/')).length;

    for (const file of files) {
      if (file.type.startsWith('video/')) {
        if (videosCount >= 1) {
          toast.error('Solo puedes enviar 1 video a la vez.');
          continue;
        }
        videosCount++;
      } else if (file.type.startsWith('image/')) {
        if (imagesCount >= 4) {
          toast.error('Solo puedes enviar hasta 4 fotos a la vez.');
          continue;
        }
        imagesCount++;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachments(prev => [...prev, { url: reader.result as string, type: file.type }]);
      };
      reader.readAsDataURL(file);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteMessage = (id: number) => {
    setChatMessages(prev => prev.filter(m => m.id !== id));
    toast.success(t('chat_room.deleted'));
  };

  const openUserProfile = (user: any) => {
    if (user.isMe) return;
    navigate(`/profile/u/${user.sender_id}`);
  };

  const scrollToMessage = (msgId: number) => {
    const element = document.getElementById(`message-${msgId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Añadimos un efecto de resaltado temporal
      element.classList.add('bg-primary/10', 'scale-[1.02]', 'rounded-3xl');
      setTimeout(() => {
        element.classList.remove('bg-primary/10', 'scale-[1.02]', 'rounded-3xl');
      }, 2000);
    } else {
      toast.error('No se pudo encontrar el mensaje original');
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">{t('chat_room.loading')}</p>
      </div>
    );
  }

  // ── ACCESS DENIED: No ticket ────────────────────────────────────────
  if (accessStatus === 'denied_ticket') {
    return (
      <div className="h-screen bg-background flex flex-col">
        <header className="px-6 py-5 bg-background border-b border-border flex items-center gap-4 shadow-sm shrink-0">
          <button onClick={goBack} className="lg:hidden p-2.5 rounded-2xl hover:bg-secondary transition-all">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-[15px] font-black text-foreground">{t('chat_room.event_chat')}</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-24 h-24 rounded-[32px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 shadow-inner">
            <Ticket className="w-12 h-12 text-amber-500" />
          </div>
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: `repeating-linear-gradient(45deg, #f59e0b 0, #f59e0b 1px, transparent 0, transparent 50%)`, backgroundSize: '20px 20px' }}
          />
          <h2 className="text-2xl font-black text-foreground tracking-tight mb-3">{t('chat_room.access_blocked')}</h2>
          <p className="text-muted-foreground text-[14px] font-medium leading-relaxed mb-2 max-w-xs">
            {t('chat_room.ticket_access_desc')}
          </p>
          <p className="text-muted-foreground/60 text-[11px] font-bold uppercase tracking-widest mb-10">
            {t('chat_room.ticket_access_hint')}
          </p>
          <div className="w-full max-w-xs space-y-3">
            <Button
              onClick={() => navigate(deniedEventId ? `/event/${deniedEventId}` : '/')}
              className="w-full h-14 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-amber-500/20"
            >
              <Ticket className="w-4 h-4 mr-2" /> {t('chat_room.get_ticket')}
            </Button>
            <Button
              variant="outline"
              onClick={goBack}
              className="w-full h-12 rounded-2xl border-border font-bold text-foreground text-[12px] bg-background hover:bg-secondary"
            >
              {t('common.back')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // DENIED FOLLOW REMOVED

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden animate-fade-in">
      {/* Chat Header */}
      <header className="px-6 py-5 bg-background border-b border-border flex items-center justify-between shadow-sm z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={goBack} className="lg:hidden p-2.5 rounded-2xl hover:bg-secondary transition-all active:scale-90">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-foreground flex items-center justify-center text-background font-black shadow-lg shadow-black/10 overflow-hidden">
                {roomInfo?.avatar ? (
                  <img src={roomInfo.avatar} loading="lazy" alt={roomInfo.name} className="w-full h-full object-cover" />
                ) : (
                  (roomInfo?.name || 'C').charAt(0).toUpperCase()
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full"></div>
            </div>
            <div>
              <h1 className="text-[15px] font-black text-foreground leading-none mb-1.5 truncate max-w-[150px] sm:max-w-[200px]">
                {roomInfo?.name || 'Chat'}
              </h1>
              <div className="flex items-center gap-2">
                {roomInfo?.event_date ? (
                  <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/10">
                    <Calendar className="w-3 h-3 text-primary" />
                    <span className="text-[9px] text-primary font-black uppercase tracking-widest">{roomInfo.event_date}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">{t('chat_room.online')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <button 
          onClick={() => navigate(`/chat-settings/${id}`)}
          className="p-2.5 rounded-2xl hover:bg-secondary transition-all active:scale-95"
        >
          <MoreVertical className="w-5 h-5 text-muted-foreground" />
        </button>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 relative transition-colors duration-500"
        style={{ backgroundColor: appearance.backgroundColor }}
      >
        {/* Subtle Chat Pattern to make transparency noticeable */}
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none z-0 bg-repeat" 
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
        />

        <div className="flex justify-center my-4 relative z-10">
          <span className="px-5 py-2 bg-secondary/50 backdrop-blur-sm border border-border rounded-full text-[9px] font-black text-muted-foreground uppercase tracking-[0.25em] shadow-sm">
            Conversación de hoy
          </span>
        </div>

        {/* Recent Followers Strip — only for event rooms */}
        {roomInfo?.type === 'event' && recentFollowers.length > 0 && (
          <div className="relative z-10 -mx-6 px-6">
            <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-3xl p-4 mb-2 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-300" />
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Siguiendo este evento</p>
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {recentFollowers.map((follower) => (
                  <button
                    key={follower.id}
                    onClick={() => navigate(`/profile/u/${follower.id}`)}
                    className="flex flex-col items-center gap-1.5 shrink-0 group"
                  >
                    <div className="w-11 h-11 rounded-[16px] overflow-hidden border-2 border-background shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all bg-primary/10">
                      {follower.avatar ? (
                        <img src={follower.avatar} loading="lazy" alt={follower.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                      )}
                    </div>
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-wide max-w-[52px] text-center leading-tight truncate group-hover:text-primary transition-colors">
                      {follower.name.split(' ')[0]}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {chatMessages.map((msg) => (
          <ChatMessageBubble
            key={msg.id}
            msg={msg}
            appearance={appearance}
            openUserProfile={openUserProfile}
            openImageViewer={(imgs, idx) => setViewerData({ images: imgs, index: idx })}
            onDelete={handleDeleteMessage}
            onReply={setReplyingTo}
            onScrollToMessage={scrollToMessage}
            onProfileLongPress={(userId) => navigate(`/profile/u/${userId}`)}
          />
        ))}

        {chatMessages.length === 0 && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-700 relative z-10 my-auto">
            <div className="w-24 h-24 rounded-[40px] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent flex items-center justify-center mb-8 relative group">
              <div className="absolute inset-0 bg-primary/10 rounded-[40px] blur-2xl group-hover:bg-primary/20 transition-all duration-500" />
              <div className="relative animate-bounce-slow">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse delay-75" />
                </div>
              </div>
            </div>
            <h3 className="text-xl font-black text-foreground tracking-tight mb-3">
              No hay mensajes aún
            </h3>
            <p className="text-muted-foreground text-[14px] font-medium leading-relaxed max-w-[240px]">
              Sé el primero en enviar uno. <br/>
              <span className="text-primary font-bold">¡Rompe el hielo!</span> 🧊🔥
            </p>
            
            <div className="mt-10 grid grid-cols-2 gap-3 w-full max-w-xs">
               <button 
                onClick={() => setMessage('¡Hola a todos! 👋')}
                className="p-3 rounded-2xl bg-secondary/50 border border-border text-[11px] font-bold text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
               >
                 ¡Hola a todos! 👋
               </button>
               <button 
                onClick={() => setMessage('¿Qué tal el evento? ✨')}
                className="p-3 rounded-2xl bg-secondary/50 border border-border text-[11px] font-bold text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
               >
                 ¿Qué tal el evento? ✨
               </button>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <footer className="bg-background p-4 pb-6 sm:p-6 sm:pb-8 flex flex-col gap-3 shrink-0 z-20 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] border-t border-border">
        
        {/* Reply Preview */}
        {replyingTo && (
          <div className="flex items-center justify-between bg-secondary p-3 rounded-2xl border border-border animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col min-w-0 border-l-[3px] border-primary pl-3 flex-1">
              <span className="text-[11px] font-black text-primary uppercase tracking-widest mb-0.5">
                Respondiendo a {replyingTo.isMe ? 'ti' : replyingTo.user || 'Usuario'}
              </span>
              <span className="text-[13px] text-muted-foreground truncate font-medium">
                {replyingTo.text || 'Archivo multimedia'}
              </span>
            </div>
            <button 
              onClick={() => setReplyingTo(null)}
              className="p-2 ml-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((att, idx) => (
              <div key={`attachment-${idx}`} className="relative inline-block animate-in zoom-in duration-200">
                {att.type.startsWith('video/') ? (
                  <div className="h-20 w-20 bg-black rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden">
                    <video src={att.url} className="h-full w-full object-cover opacity-50" />
                    <Camera className="w-6 h-6 text-white absolute" />
                  </div>
                ) : (
                  <img src={att.url} loading="lazy" alt="Preview" className="h-20 w-20 object-cover rounded-xl border border-slate-200" />
                )}
                <button 
                  onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                  className="absolute -top-2 -right-2 bg-slate-900 text-white p-1 rounded-full hover:bg-slate-800 transition-all shadow-md z-10"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
          />
          <Popover open={isAttachmentMenuOpen} onOpenChange={setIsAttachmentMenuOpen}>
            <PopoverTrigger asChild>
              <div className="flex h-[56px] items-center shrink-0">
                <button 
                  type="button" 
                  className="p-3.5 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all active:scale-95"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-3 rounded-[28px] mb-2 border-slate-100 shadow-xl" side="top" align="start">
              <div className="flex flex-col gap-1">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-100 transition-colors">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <span className="text-[13px] font-bold text-slate-700">Fotos y Videos</span>
                </button>
                <button type="button" className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 transition-colors text-left group">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 group-hover:bg-rose-100 transition-colors">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-[13px] font-bold text-slate-700">Cámara</span>
                </button>
                <button type="button" className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 transition-colors text-left group">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-100 transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[13px] font-bold text-slate-700">Documento</span>
                </button>
              </div>
            </PopoverContent>
          </Popover>
          
          <div className="flex-1 relative flex items-end">
            <textarea 
              ref={textareaRef}
              placeholder="Escribe un mensaje..." 
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                e.target.style.height = '56px';
                e.target.style.height = Math.min(e.target.scrollHeight, 116) + 'px';
              }}
              onKeyDown={handleKeyDown}
              rows={1}
              style={{ minHeight: '56px', maxHeight: '116px' }}
              className="w-full rounded-[22px] border-slate-100 bg-slate-50/50 focus-visible:ring-primary/20 text-[14px] font-medium pr-12 py-[18px] pl-5 shadow-none transition-all resize-none outline-none overflow-y-auto no-scrollbar"
            />
            
            {/* Emoji Picker Button */}
            <button 
              ref={emojiTriggerRef}
              type="button" 
              onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
              className={`absolute right-4 bottom-[18px] transition-all z-20 ${isEmojiPickerOpen ? 'text-amber-500 scale-110' : 'text-slate-300 hover:text-amber-500'}`}
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Custom Emoji Picker Panel */}
            {isEmojiPickerOpen && (
              <div 
                ref={emojiPickerRef}
                className="absolute right-0 bottom-full mb-3 w-64 p-0 rounded-3xl border border-slate-100 bg-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 z-[100]"
              >
                <div className="bg-slate-50/50 px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emojis</span>
                  <button 
                    onClick={() => setIsEmojiPickerOpen(false)}
                    className="p-1 hover:bg-slate-200 rounded-lg transition-colors group"
                  >
                    <X className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2 p-3 max-h-[220px] overflow-y-auto no-scrollbar">
                  {EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.preventDefault();
                        const start = textareaRef.current?.selectionStart ?? message.length;
                        const end = textareaRef.current?.selectionEnd ?? message.length;
                        const newMessage = message.substring(0, start) + emoji + message.substring(end);
                        setMessage(newMessage);
                        
                        setTimeout(() => {
                          if (textareaRef.current) {
                            textareaRef.current.focus();
                            const newPos = start + emoji.length;
                            textareaRef.current.setSelectionRange(newPos, newPos);
                          }
                        }, 0);
                      }}
                      className="text-2xl hover:bg-slate-100 p-2 rounded-xl transition-all flex items-center justify-center active:scale-125"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="p-2 bg-slate-50/50 border-t border-slate-100">
                  <button 
                    onClick={() => setIsEmojiPickerOpen(false)}
                    className="w-full py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    Listo
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex h-[56px] items-center shrink-0">
            <button 
              type="submit"
              disabled={!message.trim() && attachments.length === 0}
              className="w-14 h-14 bg-slate-900 rounded-[22px] flex items-center justify-center text-white shadow-xl shadow-slate-900/20 active:scale-90 transition-all disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </footer>

      {/* Profile Modal */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="sm:max-w-[320px] rounded-[40px] p-0 overflow-hidden border-none shadow-2xl focus:outline-none">
          <DialogTitle className="sr-only">Perfil de {selectedUser?.user || 'Usuario'}</DialogTitle>
          <div className="relative">
            <div className="h-32 bg-slate-900 relative">
              <DialogClose className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-white/20 transition-all">
                <X className="w-4 h-4" />
              </DialogClose>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="absolute top-4 left-4 p-2 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-white/20 transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 rounded-2xl">
                  <DropdownMenuItem className="gap-2 cursor-pointer font-medium" onClick={() => {
                    navigator.clipboard.writeText(window.location.origin + '/user/' + selectedUser?.id);
                    toast.success('Enlace de perfil copiado');
                  }}>
                    <Forward className="w-4 h-4 text-slate-400" /> Compartir Perfil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-50" />
                  <DropdownMenuItem className="gap-2 cursor-pointer font-medium text-rose-500 hover:text-rose-600 focus:text-rose-600 focus:bg-rose-50" onClick={(e) => {
                    e.preventDefault();
                    toast.success('Usuario reportado correctamente');
                    // Pequeño delay para que el dropdown cierre antes de desmontar el modal
                    setTimeout(() => setSelectedUser(null), 100);
                  }}>
                    <ShieldAlert className="w-4 h-4" /> Reportar Usuario
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="px-6 pb-8 -mt-12 relative z-10 bg-white rounded-t-[40px]">
              <div className="flex justify-center">
                <div 
                  className="w-24 h-24 rounded-[32px] border-4 border-white shadow-xl overflow-hidden bg-slate-100 -mt-12 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => {
                    if (selectedUser?.avatar) {
                      setViewerData({ images: [selectedUser.avatar], index: 0 });
                    }
                  }}
                >
                  <img src={selectedUser?.avatar} loading="lazy" alt={selectedUser?.user} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="text-center mt-4 space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">{selectedUser?.user}</h2>
                  <ShieldCheck className="w-4 h-4 text-primary fill-primary/10" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{selectedUser?.role}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6 py-4 border-y border-slate-50">
                <div className="text-center">
                  <p className="text-lg font-black text-slate-900 leading-none">{selectedUser?.stats?.events}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Eventos</p>
                </div>
                <div className="text-center border-l border-slate-50">
                  <p className="text-lg font-black text-slate-900 leading-none">{selectedUser?.stats?.followers}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Seguidores</p>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.15em]">Acerca de</h4>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{selectedUser?.bio}</p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {selectedUser?.tags?.map((tag: string, i: number) => (
                  <span key={`tag-${i}`} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest">{tag}</span>
                ))}
              </div>
              <div className="mt-8 flex gap-3">
                <Button 
                  onClick={() => {
                    setIsFollowingUser(!isFollowingUser);
                    toast.success(isFollowingUser ? 'Dejaste de seguir a este usuario' : '¡Ahora sigues a este usuario!');
                  }}
                  className={`flex-1 rounded-2xl font-black uppercase text-[10px] tracking-widest h-12 shadow-lg transition-all ${
                    isFollowingUser 
                      ? 'bg-slate-100 text-slate-600 shadow-none hover:bg-slate-200' 
                      : 'bg-slate-900 text-white shadow-slate-900/20 hover:bg-slate-800'
                  }`}
                >
                  {isFollowingUser ? 'Siguiendo' : 'Seguir'}
                </Button>
                {/* Message Button Removed */}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Image Viewer (Lightbox) */}
      <Dialog open={!!viewerData} onOpenChange={() => setViewerData(null)}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full m-0 p-0 rounded-none bg-black/95 border-none flex flex-col z-[100]">
          <div 
            className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden relative w-full h-full" 
            onClick={() => setViewerData(null)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {viewerData && viewerData.images.length > 1 && (
              <>
                {viewerData.index > 0 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigateImage(-1); }} 
                    className="absolute left-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-md z-50 hidden sm:flex"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}
                {viewerData.index < viewerData.images.length - 1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigateImage(1); }} 
                    className="absolute right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-md z-50 hidden sm:flex"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </>
            )}

            {/* Image Wrapper that perfectly hugs the image size */}
            <div className="relative inline-flex max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
              
              {/* Overlaid Top Bar (Inside the Photo) */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-50">
                <button 
                  onClick={() => setViewerData(null)}
                  className="p-2.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all backdrop-blur-md active:scale-90 shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex gap-2">
                  <span className="px-3 py-1.5 rounded-full bg-black/40 text-white backdrop-blur-md text-xs font-bold flex items-center justify-center shadow-lg">
                    {viewerData ? `${viewerData.index + 1} / ${viewerData.images.length}` : ''}
                  </span>
                  <button 
                    onClick={() => toast.success('Enlace de la imagen copiado')}
                    className="p-2.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all backdrop-blur-md active:scale-90 shadow-lg"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => toast.success('Imagen guardada en tu galería')}
                    className="p-2.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all backdrop-blur-md active:scale-90 shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <img 
                key={viewerData?.index}
                src={viewerData?.images[viewerData.index] || ''} 
                loading="lazy"
                alt="Fullscreen Viewer" 
                className="max-w-full max-h-[90vh] sm:max-h-[85vh] w-auto h-auto object-contain rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-300" 
              />

              {/* Overlaid Bottom Dots (Inside the Photo) */}
              {viewerData && viewerData.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-3 py-2 rounded-full bg-black/40 backdrop-blur-md shadow-lg">
                  {viewerData.images.map((_, i) => (
                    <div key={`image-dot-${i}`} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === viewerData.index ? 'bg-white w-4' : 'bg-white/50'}`} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatRoomPage;
