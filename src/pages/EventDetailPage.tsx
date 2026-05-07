import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSmartBack } from '@/hooks/useSmartBack';
import {
  ArrowLeft, Calendar, MapPin, Users, User, Share2,
  Heart, MessageSquare, Info, Lock, Star, Send,
  Clock, Map as MapIcon,
  Wifi, Snowflake, Tv, Car, Accessibility,
  GlassWater, Music, Sparkles, Utensils, Loader2, MessageCircle, Ticket,
  X, ChevronLeft, ChevronRight, Maximize2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@/components/ui/drawer';

const AMENITY_ICONS: Record<string, any> = {
  wifi: { icon: <Wifi className="w-5 h-5 text-blue-600" />, key: 'wifi' },
  parking: { icon: <Car className="w-5 h-5 text-amber-600" />, key: 'parking' },
  food: { icon: <Utensils className="w-5 h-5 text-red-500" />, key: 'food' },
  music: { icon: <Music className="w-5 h-5 text-indigo-600" />, key: 'music' },
  ac: { icon: <Snowflake className="w-5 h-5 text-sky-500" />, key: 'ac' },
  drinks: { icon: <GlassWater className="w-5 h-5 text-pink-500" />, key: 'drinks' },
  tv: { icon: <Tv className="w-5 h-5 text-purple-600" />, key: 'tv' },
  access: { icon: <Accessibility className="w-5 h-5 text-emerald-600" />, key: 'access' },
};

const EventDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const goBack = useSmartBack('/');
  const [selectedAmenity, setSelectedAmenity] = useState<number | null>(null);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasMembership, setHasMembership] = useState(false);
  const [isReviewsDrawerOpen, setIsReviewsDrawerOpen] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const [organizerProfile, setOrganizerProfile] = useState<any>(null);
  const [isOrganizerDrawerOpen, setIsOrganizerDrawerOpen] = useState(false);
  const [hasTicket, setHasTicket] = useState(false);
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [eventImages, setEventImages] = useState<string[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const fetchSecondaryData = async () => {
    if (!id) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check favorites
        const { data: favData } = await supabase
          .from('favorites')
          .select('id')
          .eq('event_id', id)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (favData) {
          setIsFavorite(true);
          setFavoriteId(favData.id);
        }

        // Following functionality disabled - table event_followers doesn't exist
        setIsFollowing(false);

        // Check if user has ticket
        const { data: ticketData } = await supabase
          .from('tickets')
          .select('id')
          .eq('event_id', id)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();
        
        if (ticketData) {
          setHasTicket(true);
          setTicketId(ticketData.id);
        } else {
          setHasTicket(false);
          setTicketId(null);
        }

        // Check for event chat room
        const { data: roomData } = await supabase
          .from('chat_rooms')
          .select('id')
          .eq('event_id', id)
          .eq('type', 'event')
          .maybeSingle();
        
        if (roomData) {
          setChatRoomId(roomData.id);
        }

        // Check membership status (any active subscription)
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('id, plan_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .gt('expires_at', new Date().toISOString())
          .maybeSingle();
        
        setHasMembership(!!subscription);
      }

      // Followers functionality disabled - table event_followers doesn't exist
      setFollowers([]);

      // Fetch reviews
      const { data: reviewsData } = await supabase
        .from('event_reviews')
        .select('*, profiles!user_id(full_name, avatar_url)')
        .eq('event_id', id)
        .order('created_at', { ascending: false });
      
      if (reviewsData) {
        setReviews(reviewsData);
      }
    } catch (e) {
      console.error("Secondary data fetch failed:", e);
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();

        if (eventError) throw eventError;
        setEvent(eventData);

        // Fetch organizer profile separately
        if (eventData.organizer_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', eventData.organizer_id)
            .maybeSingle();

          if (profileData) {
            setOrganizerProfile(profileData);
          }
        }

        // Fetch event images
        const { data: imagesData } = await supabase
          .from('event_images')
          .select('image_url')
          .eq('event_id', id);
        
        if (imagesData && imagesData.length > 0) {
          const urls = imagesData.map(img => img.image_url);
          // Combine main image with secondary images, avoiding duplicates
          const allImages = Array.from(new Set([eventData.image_url, ...urls].filter(Boolean)));
          setEventImages(allImages);
        } else {
          setEventImages(eventData.image_url ? [eventData.image_url] : []);
        }

        fetchSecondaryData();

      } catch (error) {
        console.error("Main event fetch failed:", error);
        toast.error(t('explore.no_events'));
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();

    // Realtime subscription for event updates
    const eventSubscription = supabase
      .channel(`event-updates-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events', filter: `id=eq.${id}` },
        (payload) => {
          console.log('Event updated in real-time:', payload.new);
          setEvent((prev: any) => ({ ...prev, ...payload.new }));
        }
      )
      .subscribe();

    // Followers realtime subscription disabled - table event_followers doesn't exist

    return () => {
      supabase.removeChannel(eventSubscription);
    };
  }, [id, navigate]);

  const toggleFavorite = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error(t('event_detail.login_to_fav'));
        return;
      }

      if (isFavorite && favoriteId) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('id', favoriteId);

        if (error) throw error;
        setIsFavorite(false);
        setFavoriteId(null);
        toast.success(t('event_detail.fav_removed'));
      } else {
        const { data, error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            event_id: id
          })
          .select()
          .single();

        if (error) throw error;
        setIsFavorite(true);
        setFavoriteId(data.id);
        toast.success(t('event_detail.fav_added'));
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar favoritos');
    }
  };

  const toggleFollow = async () => {
    // Following functionality disabled - table event_followers doesn't exist
    toast.info('Funcionalidad de seguir eventos próximamente disponible');
  };

  const handleJoinEventChat = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error(t('event_detail.login_to_chat'));
        return;
      }

      setLoading(true);

      // 1. Try to find existing room
      const { data: existingRoom } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('event_id', id)
        .eq('type', 'event')
        .maybeSingle();

      let targetRoomId = existingRoom?.id;

      // 2. If no room, create it
      if (!targetRoomId) {
        const { data: newRoom, error: createError } = await supabase
          .from('chat_rooms')
          .insert({
            name: `${event.title} — Chat`,
            event_id: id,
            type: 'event',
            participants_count: 0
          })
          .select()
          .single();

        if (createError) throw createError;
        targetRoomId = newRoom.id;
      }

      // 3. Ensure user is a member
      await supabase
        .from('chat_room_members')
        .upsert({ 
          room_id: targetRoomId, 
          user_id: user.id 
        }, { onConflict: 'room_id,user_id' });

      // 4. Navigate
      navigate(`/chat/${targetRoomId}`);
    } catch (error: any) {
      console.error("Join chat error:", error);
      toast.error(t('chat_room.error_loading'));
    } finally {
      setLoading(false);
    }
  };

  const handleOrganizerChat = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error(t('event_detail.login_to_contact'));
        navigate('/auth');
        return;
      }

      if (!hasMembership) {
        toast.error(t('event_detail.membership_required'), {
          description: t('event_detail.membership_desc'),
          action: {
            label: t('event_detail.membership_buy'),
            onClick: () => handleBuyMembership()
          }
        });
        return;
      }

      if (user.id === event.organizer_id) {
        toast.error(t('event_detail.self_chat_error'));
        return;
      }

      setLoading(true);

      const { data: myMemberships, error: membersError } = await supabase
        .from('chat_room_members')
        .select('room_id')
        .eq('user_id', user.id);

      if (membersError) throw membersError;

      let targetRoomId = null;

      if (myMemberships && myMemberships.length > 0) {
        const roomIds = myMemberships.map(m => m.room_id);
        const { data: existingRoom, error: lookupError } = await supabase
          .from('chat_room_members')
          .select(`
            room_id,
            chat_rooms!inner (
              type
            )
          `)
          .in('room_id', roomIds)
          .eq('user_id', event.organizer_id)
          .eq('chat_rooms.type', 'private')
          .maybeSingle();

        if (lookupError) throw lookupError;
        if (existingRoom) targetRoomId = existingRoom.room_id;
      }

      if (!targetRoomId) {
        const { data: newRoom, error: roomError } = await supabase
          .from('chat_rooms')
          .insert({
            type: 'private',
            name: `Chat Privado`,
            participants_count: 2
          })
          .select()
          .single();

        if (roomError) throw roomError;
        targetRoomId = newRoom.id;

        await supabase
          .from('chat_room_members')
          .insert([
            { room_id: targetRoomId, user_id: user.id },
            { room_id: targetRoomId, user_id: event.organizer_id }
          ]);
      }

      navigate(`/chat/${targetRoomId}`);
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error(`Error: ${error.message || 'No se pudo iniciar el chat'}`);
    } finally {
      setLoading(false);
    }
  };



  const handleAmenityClick = (idx: number, info: string) => {
    setSelectedAmenity(idx);
    toast.info(info, {
      icon: <Info className="w-4 h-4 text-primary" />,
      duration: 3000
    });
  };

  const handleFreeTicket = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error(t('event_detail.get_ticket'));
        navigate('/auth');
        return;
      }

      setLoading(true);

      // Check if user already has a ticket
      const { data: existing } = await supabase
        .from('tickets')
        .select('id')
        .eq('user_id', user.id)
        .eq('event_id', id)
        .maybeSingle();

      if (existing) {
        toast.info(t('event_detail.ticket_owned'));
        navigate('/tickets');
        return;
      }

      // Create ticket with correct column names
      const { error } = await supabase
        .from('tickets')
        .insert({
          user_id: user.id,
          event_id: id,
          status: 'active',
          quantity: 1,
          unit_price: 0,
          total_price: 0
        });

      if (error) throw error;

      // Ensure event chat room exists and user is a member
      let targetRoomId;
      const { data: chatRoom } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('event_id', id)
        .eq('type', 'event')
        .maybeSingle();

      if (chatRoom) {
        targetRoomId = chatRoom.id;
      } else {
        const { data: newRoom } = await supabase
          .from('chat_rooms')
          .insert({
            name: `${event.title} — Chat`,
            event_id: id,
            type: 'event',
            participants_count: 0
          })
          .select()
          .single();
        if (newRoom) targetRoomId = newRoom.id;
      }

      if (targetRoomId) {
        await supabase
          .from('chat_room_members')
          .upsert({ room_id: targetRoomId, user_id: user.id }, { onConflict: 'room_id,user_id' });
      }

      toast.success(t('event_detail.ticket_success'));
      setHasTicket(true);
      fetchSecondaryData(); // Refresh state to show reviews form and change button action
    } catch (error: any) {
      console.error("Error getting free ticket:", error);
      toast.error(`Error: ${error.message || 'No se pudo obtener la entrada'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyMembership = () => {
    navigate('/premium');
  };

  const handleSubmitReview = async () => {
    if (!hasTicket) {
      toast.error('Solo los asistentes con entrada pueden dejar reseñas');
      return;
    }

    if (!newReview.comment.trim()) {
      toast.error('Escribe un comentario para tu reseña');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Inicia sesión para dejar una reseña');
        return;
      }

      setIsSubmittingReview(true);
      const { error } = await supabase
        .from('event_reviews')
        .insert({
          event_id: id,
          user_id: user.id,
          rating: newReview.rating,
          comment: newReview.comment.trim()
        });

      if (error) throw error;

      toast.success('¡Gracias por tu reseña!');
      setNewReview({ rating: 5, comment: '' });

      // Refresh reviews
      const { data: reviewsData } = await supabase
        .from('event_reviews')
        .select(`
          *,
          profiles (full_name, avatar_url)
        `)
        .eq('event_id', id)
        .order('created_at', { ascending: false });

      if (reviewsData) setReviews(reviewsData);
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error('Error al enviar la reseña');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) return null;

  const isFree = !event.price || event.price === 0 || event.price === '0' || event.price === 'Gratis';

  // Process amenities
  let eventAmenities = [];
  if (Array.isArray(event.amenities)) {
    eventAmenities = event.amenities.map((key: string) => AMENITY_ICONS[key]).filter(Boolean);
  } else if (typeof event.amenities === 'string') {
    try {
      const parsed = JSON.parse(event.amenities);
      if (Array.isArray(parsed)) {
        eventAmenities = parsed.map((key: string) => AMENITY_ICONS[key]).filter(Boolean);
      }
    } catch (e) { }
  }

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in">
      {/* Sticky Top Navbar */}
      <div className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center transition-all duration-300 pointer-events-none ${
        isScrolled ? 'bg-background/90 backdrop-blur-xl border-b border-border shadow-sm py-3' : 'bg-transparent pt-10'
      }`}>
        <button 
          onClick={goBack} 
          className={`p-3 rounded-2xl transition-all pointer-events-auto shadow-lg border ${
            isScrolled 
              ? 'bg-secondary border-border text-foreground hover:bg-secondary/80' 
              : 'bg-white/20 border-white/20 text-white hover:bg-white/30 backdrop-blur-xl'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-3 pointer-events-auto">
          <button 
            className={`p-3 rounded-2xl transition-all shadow-lg border ${
              isScrolled 
                ? 'bg-secondary border-border text-foreground hover:bg-secondary/80' 
                : 'bg-white/20 border-white/20 text-white hover:bg-white/30 backdrop-blur-xl'
            }`}
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success('¡Enlace copiado!');
            }}
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button 
            onClick={toggleFollow}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all active:scale-95 shadow-lg ${
              isScrolled
                ? (isFollowing ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-secondary border-border text-foreground hover:bg-secondary/80')
                : (isFollowing ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white/20 border-white/20 text-white hover:bg-white/30 backdrop-blur-xl')
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">{isFollowing ? t('common.following') : t('common.follow')}</span>
          </button>
          <button 
            onClick={toggleFavorite}
            className={`p-3 rounded-2xl border transition-all shadow-lg ${
              isScrolled
                ? (isFavorite ? 'bg-red-500 border-red-500 text-white' : 'bg-secondary border-border text-foreground hover:bg-secondary/80')
                : (isFavorite ? 'bg-red-500 border-red-500 text-white' : 'bg-white/20 border-white/20 text-white hover:bg-white/30 backdrop-blur-xl')
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Hero Image Section */}
      <div 
        className="relative h-[400px] cursor-pointer group"
        onClick={() => setIsGalleryOpen(true)}
      >
        <img 
          src={event.image_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800'} 
          alt={event.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        {/* Gallery Hint */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 flex items-center justify-center">
          <Maximize2 className="w-6 h-6 text-white" />
        </div>

        <div className="absolute bottom-12 left-6 right-6">
          <div className="flex gap-2 items-center mb-4">
            <Badge className="bg-primary text-white border-none px-4 py-1.5 font-black text-[10px] uppercase tracking-widest">{event.category}</Badge>
            {isFree && (
              <Badge className="bg-emerald-500 text-white border-none px-4 py-1.5 font-black text-[10px] uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {t('event_detail.free')}
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight leading-tight">{event.title}</h1>
        </div>
        
        {/* Photo Count Indicator */}
        {eventImages.length > 1 && (
          <div className="absolute bottom-20 right-6 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
            <Users className="w-3 h-3 text-white/70" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">{t('event_detail.photos_count', { count: eventImages.length })}</span>
          </div>
        )}
      </div>

      {/* Image Gallery Dialog */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-none h-[80vh] sm:h-auto flex flex-col justify-center">
          <DialogTitle className="sr-only">{t('event_detail.gallery_title')}</DialogTitle>
          <div className="relative w-full aspect-video sm:aspect-[16/9] bg-black group/gallery">
            <img 
              src={eventImages[currentImageIndex]} 
              alt={`Foto ${currentImageIndex + 1}`} 
              className="w-full h-full object-contain"
            />
            
            {/* Close Button */}
            <button 
              onClick={() => setIsGalleryOpen(false)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md transition-all z-50"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Navigation Controls */}
            {eventImages.length > 1 && (
              <>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : eventImages.length - 1));
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md transition-all opacity-0 group-hover/gallery:opacity-100"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => (prev < eventImages.length - 1 ? prev + 1 : 0));
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md transition-all opacity-0 group-hover/gallery:opacity-100"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Pagination / Thumbnails Indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
              {eventImages.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'bg-primary w-4' : 'bg-white/40'}`}
                />
              ))}
            </div>
            
            {/* Index Display */}
            <div className="absolute top-4 left-6 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
              <p className="text-[10px] font-black text-white/90 uppercase tracking-[0.2em]">
                {currentImageIndex + 1} / {eventImages.length}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="px-5 -mt-6 relative z-10 bg-background rounded-t-[40px] pt-8 space-y-8">

        {/* Quick Info Grid */}
        <div className="flex flex-col gap-3">
          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col justify-center p-5 bg-card rounded-[28px] border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Calendar className="w-4 h-4" /></div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{t('common.date')}</p>
              </div>
              <p className="text-[13px] font-black text-foreground leading-tight">{event.event_date}</p>
            </div>

            <div className="flex flex-col justify-center p-5 bg-card rounded-[28px] border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500"><Clock className="w-4 h-4" /></div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{t('common.time')}</p>
              </div>
              <p className="text-[13px] font-black text-foreground leading-tight">{event.event_time}</p>
            </div>
          </div>

          {/* Location Full Width */}
          <div className="flex items-center justify-between p-5 bg-slate-900 rounded-[28px] text-white shadow-xl shadow-slate-900/10">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shrink-0"><MapPin className="w-6 h-6 text-emerald-400" /></div>
              <div className="min-w-0 pr-4">
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider mb-1">{t('event_detail.location')}</p>
                <h3 className="text-[13px] font-black text-white truncate">{event.location}</h3>
              </div>
            </div>
            <button className="w-12 h-12 shrink-0 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/20 transition-all flex items-center justify-center"><MapIcon className="w-5 h-5" /></button>
          </div>

          {/* Attendees circles */}
          <div className="flex items-center justify-between px-2 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {followers.length > 0 ? (
                  followers.map((avatar, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-4 border-background overflow-hidden bg-muted shadow-sm">
                      <img src={avatar} alt="Follower" className="w-full h-full object-cover" />
                    </div>
                  ))
                ) : (
                  [1, 2, 3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-4 border-background bg-muted flex items-center justify-center">
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))
                )}
              </div>
              <div>
                <p className="text-[13px] font-black text-foreground">+{event.attendees_count || 0} {t('event_detail.attendees')}</p>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{t('event_detail.friends_attending')}</p>
              </div>
            </div>
          </div>
        </div>



        {/* Description */}
        <div className="px-1">
          <h2 className="text-lg font-black text-foreground tracking-tight mb-3">{t('event_detail.about')}</h2>
          <p className="text-muted-foreground text-[13px] leading-relaxed font-medium">{event.description}</p>
        </div>

        {/* Organizer Section */}
        <div className="flex items-center justify-between p-6 bg-secondary/30 rounded-[40px] border border-border">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-card border border-border p-1">
              <img src={organizerProfile?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'} alt="Organizer" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">{t('event_detail.organizer')}</p>
              <h3 className="text-sm font-black text-foreground leading-tight">{organizerProfile?.full_name || 'Organizador'}</h3>
            </div>
          </div>
        </div>

        {/* Organizer Info Drawer */}
        <Drawer open={isOrganizerDrawerOpen} onOpenChange={setIsOrganizerDrawerOpen}>
          <DrawerContent className="max-h-[85vh] p-0 overflow-hidden rounded-t-[40px] border-none shadow-2xl bg-background">
            <div className="p-8 pb-10 space-y-8 bg-background">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-4 border-background shadow-xl overflow-hidden relative group">
                  <img
                    src={event.organizer_avatar || organizerProfile?.avatar_url || `https://i.pravatar.cc/150?u=${event.organizer_id}`}
                    alt={event.organizer_name || organizerProfile?.full_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {organizerProfile?.role === 'premium' && (
                    <div className="absolute -top-1 -right-1 bg-amber-400 p-1.5 rounded-full shadow-lg border-2 border-white">
                      <Sparkles className="w-3 h-3 text-white fill-current" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-foreground tracking-tight">{event.organizer_name || organizerProfile?.full_name || 'Organizador'}</h3>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <Badge variant="secondary" className="bg-secondary text-muted-foreground border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1">
                      {organizerProfile?.role || 'Organizador'}
                    </Badge>
                    {organizerProfile?.location && (
                      <span className="text-muted-foreground text-[11px] font-bold flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {organizerProfile.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-card rounded-3xl p-4 text-center border border-border">
                  <p className="text-xl font-black text-foreground leading-none mb-1">{organizerProfile?.followers_count || 0}</p>
                  <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">{t('common.followers')}</p>
                </div>
                <div className="bg-card rounded-3xl p-4 text-center border border-border">
                  <p className="text-xl font-black text-foreground leading-none mb-1">{organizerProfile?.events_count || 0}</p>
                  <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">{t('profile.my_events')}</p>
                </div>
                <div className="bg-card rounded-3xl p-4 text-center border border-border">
                  <p className="text-xl font-black text-foreground leading-none mb-1">4.9</p>
                  <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Rating</p>
                </div>
              </div>

              {organizerProfile?.bio && (
                <div className="bg-secondary/30 rounded-3xl p-6 border border-border">
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-2">{t('event_detail.about_me')}</p>
                  <p className="text-foreground text-[13px] leading-relaxed font-medium">
                    {organizerProfile.bio}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => navigate(`/profile/u/${event.organizer_id}`)}
                  className="flex-1 h-14 rounded-2xl bg-foreground hover:bg-foreground/90 text-background font-black uppercase tracking-widest text-[11px] shadow-xl shadow-black/10"
                >
                  <User className="w-4 h-4 mr-2" /> Ver Perfil Completo
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        {/* Amenities Section */}
        {eventAmenities.length > 0 && (
          <div className="px-1 pb-4">
            <h2 className="text-lg font-black text-foreground tracking-tight mb-4">Servicios Incluidos</h2>
            <div className="flex flex-wrap gap-2.5">
              {eventAmenities.map((item: any, idx: number) => {
                const textColorClass = item.icon.props.className?.split(' ').find((c: string) => c.startsWith('text-')) || '';

                return (
                  <button
                    key={idx}
                    onClick={() => handleAmenityClick(idx, item.info)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all active:scale-95 ${selectedAmenity === idx
                        ? 'bg-foreground border-foreground text-background shadow-md'
                        : 'bg-card border-border hover:border-primary/50 hover:bg-secondary'
                      }`}
                  >
                    <div className={`flex items-center justify-center ${selectedAmenity === idx ? 'text-white' : textColorClass}`}>
                      {React.cloneElement(item.icon, { className: 'w-4 h-4' })}
                    </div>
                    <span className={`text-[11px] font-black uppercase tracking-wider ${selectedAmenity === idx ? 'text-background' : 'text-foreground/80'}`}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Discrete Reviews Summary */}
        <div 
          onClick={() => setIsReviewsDrawerOpen(true)}
          className="mx-1 p-5 bg-secondary/20 rounded-[32px] border border-border flex items-center justify-between cursor-pointer hover:bg-secondary/40 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-card flex items-center justify-center text-amber-500 shadow-sm border border-border">
              <Star className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-black text-foreground">
                  {reviews.length > 0 
                    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
                    : '0.0'}
                </span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-3 h-3 ${s <= Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                {reviews.length} {reviews.length === 1 ? 'Reseña' : 'Reseñas'} de la comunidad
              </p>
            </div>
          </div>
          <ArrowLeft className="w-5 h-5 text-muted-foreground rotate-180" />
        </div>

        {/* Reviews Drawer */}
        <Drawer open={isReviewsDrawerOpen} onOpenChange={setIsReviewsDrawerOpen}>
          <DrawerContent className="max-h-[90vh] rounded-t-[40px] border-none shadow-2xl">
            <div className="p-8 pb-12 overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-foreground tracking-tight">Reseñas</h2>
                  <p className="text-[12px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Qué dicen los asistentes</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-3xl font-black text-foreground">
                    {reviews.length > 0 
                      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
                      : '0.0'}
                  </span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3 h-3 ${s <= Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Add Review Form (Inside Drawer) */}
              {hasTicket && (
                <div className="mb-10 p-6 bg-secondary/30 rounded-[32px] border border-border space-y-4">
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] text-center">Danos tu opinión</p>
                  <div className="flex justify-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setNewReview({ ...newReview, rating: star })} className="transition-transform active:scale-90">
                        <Star className={`w-8 h-8 ${star <= newReview.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground hover:text-amber-200'}`} />
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <textarea 
                      placeholder="Comparte tu experiencia en este evento..." 
                      className="w-full min-h-[100px] p-5 rounded-2xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-[13px] font-medium resize-none shadow-sm text-foreground"
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    />
                    <Button 
                      onClick={handleSubmitReview}
                      disabled={isSubmittingReview}
                      className="absolute bottom-3 right-3 w-10 h-10 rounded-xl bg-foreground hover:bg-foreground/90 text-background p-0 shadow-lg"
                    >
                      {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              )}

              {/* Review List (Inside Drawer) */}
              <div className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="pb-6 border-b border-border/50 last:border-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <img src={review.profiles?.avatar_url || 'https://i.pravatar.cc/100'} alt={review.profiles?.full_name} className="w-10 h-10 rounded-xl object-cover border border-border" />
                          <div>
                            <h4 className="text-[13px] font-black text-foreground leading-tight">{review.profiles?.full_name || 'Usuario'}</h4>
                            <div className="flex gap-0.5 mt-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={`w-2.5 h-2.5 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-bold">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[13px] leading-relaxed font-medium pl-1">
                        {review.comment}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">No hay reseñas todavía</p>
                  </div>
                )}
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        {/* Floating Bottom Bar (Spacing buffer) */}
        <div className="h-4"></div>

        {/* Floating Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-background/95 backdrop-blur-xl border-t border-border z-50 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none mb-1">Precio</p>
            <p className="text-xl font-black text-foreground leading-none">
              {isFree ? 'Gratis' : `$${event.price}`}
            </p>
          </div>
          
          <div className="flex gap-2 flex-1 max-w-md">
            {/* Chat Button */}
            <Button
              onClick={() => {
                if (!hasTicket) {
                  toast.error('Debes tener una entrada para entrar al chat');
                  return;
                }
                handleJoinEventChat();
              }}
              className={`flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all flex flex-col items-center justify-center gap-1 ${hasTicket ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20' : 'bg-slate-50 text-slate-400 border border-slate-100 shadow-none'
                }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-[8px]">Chat</span>
            </Button>

            {/* View Tickets Button */}
            <Button
              onClick={() => {
                if (hasTicket && ticketId) {
                  navigate(`/ticket/${ticketId}`);
                } else {
                  navigate('/tickets');
                }
              }}
              className={`flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border transition-all flex flex-col items-center justify-center gap-1 ${
                hasTicket ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-secondary border-border text-muted-foreground shadow-none'
              }`}
            >
              <Ticket className="w-5 h-5" />
              <span className="text-[8px]">Mis Tickets</span>
            </Button>

            {/* Buy Button */}
            <Button
              onClick={() => isFree ? handleFreeTicket() : navigate(`/checkout/${id}`)}
              className={`flex-[2] h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl transition-all ${isFree
                  ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 text-white'
                  : 'bg-foreground hover:opacity-90 shadow-black/20 text-background'
                }`}
            >
              {isFree ? (hasTicket ? 'Adquirida' : 'Obtener') : 'Comprar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;

