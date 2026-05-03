import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Bell, MapPin, Calendar, Users, 
  Music, Utensils, Palette, ChevronRight, 
  Star, Heart, LayoutGrid, Sparkles, Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import EventCard from '@/components/EventCard';
import EventCardSkeleton from '@/components/EventCardSkeleton';
import { useTranslation } from 'react-i18next';
import { useLocation } from '@/hooks/useLocation';
import { motion, AnimatePresence } from 'framer-motion';

const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState(() => sessionStorage.getItem('home_category') || 'all');
  const [searchQuery, setSearchQuery] = useState(() => sessionStorage.getItem('home_query') || '');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>(() => (sessionStorage.getItem('home_price') as 'all' | 'free' | 'paid') || 'all');
  const [events, setEvents] = useState<any[]>([]);
  const [userFavorites, setUserFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userPreferences, setUserPreferences] = useState<string[]>([]);
  const userNameDisplay = useMemo(() => {
    if (!userName || userName === 'Guest' || userName === 'Invitado') {
      return t('common.guest');
    }
    return userName;
  }, [userName, t]);
  
  const { latitude, longitude, city, loading: locLoading, requestLocation, calculateDistance, permission } = useLocation();

  const categories = [
    { id: 'all', name: t('home.categories.all'), icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'música', name: t('home.categories.music'), icon: <Music className="w-4 h-4" /> },
    { id: 'arte', name: t('home.categories.art'), icon: <Palette className="w-4 h-4" /> },
    { id: 'gastronomía', name: t('home.categories.food'), icon: <Utensils className="w-4 h-4" /> },
    { id: 'deportes', name: t('home.categories.sports'), icon: <Sparkles className="w-4 h-4" /> },
    { id: 'tech', name: t('home.categories.tech'), icon: <Sparkles className="w-4 h-4" /> },
    { id: 'bienestar', name: t('home.categories.wellness'), icon: <Sparkles className="w-4 h-4" /> },
  ];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch user profile
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();
          
          if (profile?.full_name) {
            setUserName(profile.full_name.split(' ')[0]);
          } else {
            setUserName(t('profile.profile'));
          }

          // Fetch preferences for smart feed
          const { data: prefData } = await supabase
            .from('profiles')
            .select('preferences')
            .eq('id', user.id)
            .single();
          
          if (prefData?.preferences) {
            setUserPreferences(prefData.preferences);
          }
        } else {
          // If no user is logged in, show welcome screen
          navigate('/welcome');
          return;
        }

        // Fetch events
        const { data: eventsData, error } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Fetch favorites if user logged in
        if (user) {
          const { data: favs } = await supabase
            .from('favorites')
            .select('event_id')
            .eq('user_id', user.id);
          
          if (favs) {
            setUserFavorites(new Set(favs.map(f => f.event_id)));
          }
        }

        if (eventsData) setEvents(eventsData);
      } catch (error: any) {
        toast.error(t('chat_room.error_loading'));
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Realtime subscription for ALL events in the home page
    const eventsSubscription = supabase
      .channel('home-events-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        (payload) => {
          console.log('Realtime update on HomePage:', payload);
          
          if (payload.eventType === 'INSERT') {
            setEvents(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setEvents(prev => prev.map(e => e.id === payload.new.id ? { ...e, ...payload.new } : e));
          } else if (payload.eventType === 'DELETE') {
            setEvents(prev => prev.filter(e => e.id === payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(eventsSubscription);
    };
  }, [navigate]);

  // Save states
  useEffect(() => {
    sessionStorage.setItem('home_category', selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    sessionStorage.setItem('home_query', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    sessionStorage.setItem('home_price', priceFilter);
  }, [priceFilter]);

  // Restore scroll
  useEffect(() => {
    const savedScroll = sessionStorage.getItem('home_scroll');
    if (savedScroll && !loading && events.length > 0) {
      setTimeout(() => window.scrollTo(0, parseInt(savedScroll, 10)), 100);
    }
  }, [loading, events]);

  // Save scroll on change
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        sessionStorage.setItem('home_scroll', window.scrollY.toString());
      }, 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeout);
    };
  }, []);

  const filteredEvents = useMemo(() => {
    let result = events.map(event => {
      let score = 0;
      
      // 1. Interest Match (High Priority)
      const matchesCategory = event.category && event.category.toLowerCase();
      if (userPreferences.some(p => p.toLowerCase() === matchesCategory)) {
        score += 50;
      }

      // 2. Proximity
      let distance_km = 999999;
      if (latitude && longitude && event.latitude && event.longitude) {
        distance_km = calculateDistance(latitude, longitude, event.latitude, event.longitude);
        // Bonus for being within 10km
        if (distance_km < 10) score += 40;
        else if (distance_km < 30) score += 20;
        else if (distance_km < 100) score += 10;
      }

      // 3. Popularity
      if (event.attendees_count) {
        score += Math.min(event.attendees_count * 2, 30);
      }

      // 4. Featured
      if (event.is_featured) score += 25;

      return { ...event, recommendation_score: score, distance_km };
    });

    // Apply Filters
    result = result.filter(event => {
      const matchesCategory = selectedCategory === 'all' || 
        (event.category && event.category.toLowerCase() === selectedCategory.toLowerCase());
      
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      const isFree = !event.price || Number(event.price) === 0 || event.price === 'Gratis';
      const matchesPrice = priceFilter === 'all' || 
        (priceFilter === 'free' && isFree) || 
        (priceFilter === 'paid' && !isFree);

      return matchesCategory && matchesSearch && matchesPrice;
    });

    // Sort by Score (or just distance if no preferences)
    if (userPreferences.length > 0 || (latitude && longitude)) {
      result.sort((a, b) => b.recommendation_score - a.recommendation_score);
    } else {
      // Default: Most recent
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [selectedCategory, searchQuery, priceFilter, events, latitude, longitude, userPreferences]);

  const toggleFavorite = async (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error(t('event_detail.login_to_fav'));
        return;
      }

      const event = events.find(ev => ev.id === eventId);

      if (userFavorites.has(eventId)) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('event_id', eventId);
        
        if (error) throw error;
        
        const newFavs = new Set(userFavorites);
        newFavs.delete(eventId);
        setUserFavorites(newFavs);
        toast.success(t('event_detail.fav_removed'));
      } else {
        const { error } = await supabase.from('favorites').insert({
          user_id: user.id,
          event_id: eventId
        });
        
        if (error) throw error;
        
        const newFavs = new Set(userFavorites);
        newFavs.add(eventId);
        setUserFavorites(newFavs);
        toast.success(t('event_detail.fav_added'));

        // Intelligent learning: Add category to preferences if not already there
        if (event?.category && !userPreferences.includes(event.category)) {
          const newPrefs = [...userPreferences, event.category].slice(-10); // Keep last 10 interests
          await supabase.from('profiles').update({ preferences: newPrefs }).eq('id', user.id);
          setUserPreferences(newPrefs);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(t('common.error'));
    }
  };

  const handleEventClick = (id: string) => {
    navigate(`/event/${id}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in relative overflow-hidden">
      {/* Background Mesh Gradient */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-br from-primary/10 via-indigo-500/5 to-pink-500/10 pointer-events-none -z-10 blur-3xl rounded-b-[100px]" />
      <div className="absolute top-[-100px] right-[-50px] w-[300px] h-[300px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-10 pb-6 flex justify-between items-start"
      >
        <div className="space-y-2">
          <h1 className="text-[28px] font-black tracking-tight text-foreground leading-tight">
            {t('home.greeting')}<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">{userNameDisplay}</span> 👋
          </h1>
          <button 
            onClick={() => {
              if (permission === 'denied' || !navigator.geolocation) {
                const manualCity = window.prompt(t('location.prompt_city') || 'Introduce tu ciudad:');
                if (manualCity) {
                  // Basic fallback coordinates
                  setManualLocation(40.4168, -3.7038, manualCity, 'Manual');
                }
              } else {
                requestLocation();
              }
            }}
            className="flex items-center gap-1.5 text-slate-500 hover:text-primary transition-colors active:scale-95 group"
          >
            <MapPin className="w-4 h-4 group-hover:animate-bounce" />
            <span className="text-[13px] font-bold tracking-wide">
              {locLoading ? t('location.locating') : (city ? `${city}` : t('location.current_location'))}
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
          </button>
        </div>
        <button 
          onClick={() => navigate('/notifications')}
          className="p-3.5 rounded-[20px] bg-card shadow-sm border border-border relative hover:shadow-md active:scale-95 transition-all"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 border-2 border-card rounded-full animate-pulse"></span>
        </button>
      </motion.header>

      {/* Search Bar */}
      <div className="px-6 mb-8 relative z-10">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
          <Input 
            placeholder={t('home.search_placeholder')}
            className="pl-14 h-14 rounded-[20px] border-none bg-card shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus-visible:ring-4 focus-visible:ring-primary/10 text-[15px] font-medium transition-all group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] placeholder:text-muted-foreground"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="px-6 mb-4 overflow-x-auto flex gap-3 no-scrollbar py-2 relative z-10">
        {categories.map((cat, idx) => (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2.5 px-5 py-3.5 rounded-[20px] text-[13px] font-black transition-all whitespace-nowrap active:scale-95 ${
              selectedCategory === cat.id 
                ? 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg shadow-primary/25 border-none' 
                : 'bg-card text-muted-foreground border border-border hover:border-border/80 shadow-sm hover:shadow-md'
            }`}
          >
            <div className={`${selectedCategory === cat.id ? 'text-white' : 'text-slate-400'}`}>
              {cat.icon}
            </div>
            {cat.name}
          </motion.button>
        ))}
      </div>

      {/* Entry Type Filter */}
      <div className="px-6 mb-8 flex gap-2 relative z-10">
        {[
          { id: 'all', label: t('common.any_price') },
          { id: 'free', label: t('common.free') },
          { id: 'paid', label: t('common.paid') }
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setPriceFilter(filter.id as any)}
            className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border ${
              priceFilter === filter.id
                ? 'bg-foreground text-background border-foreground shadow-lg shadow-foreground/10'
                : 'bg-card text-muted-foreground border-border hover:border-border/80'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Featured Events */}
      <div className="px-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary fill-primary" />
            {loading ? (
              <div className="h-6 w-40 bg-muted animate-pulse rounded-md" />
            ) : (
              userPreferences.length > 0 ? t('home.recommended') || 'Recomendado para ti' : (latitude && longitude ? t('location.near_you') : t('home.popular_today'))
            )}
          </h2>
          {!loading && (
            <Button variant="ghost" className="text-xs font-black text-primary uppercase tracking-widest p-0 h-auto hover:bg-transparent">
              {t('home.view_all')}
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 gap-6">
              {[1, 2, 3].map((i) => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {filteredEvents.map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <EventCard
                    event={event}
                    isFavorite={userFavorites.has(event.id)}
                    onFavoriteToggle={(e) => toggleFavorite(e, event.id)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-6 px-4 animate-in fade-in zoom-in-95 duration-500">
              <div className="relative w-28 h-28 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 rounded-[32px] rotate-3 opacity-20 animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-bl from-cyan-400 via-blue-500 to-indigo-600 rounded-[32px] -rotate-3 flex items-center justify-center shadow-xl shadow-blue-500/30">
                  <Search className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-3 -right-3 bg-white text-blue-500 rounded-full p-2 shadow-lg animate-bounce">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="font-black text-2xl text-foreground tracking-tight mb-2">{t('home.no_results.title')}</h3>
                <p className="text-muted-foreground text-[15px] font-medium leading-relaxed max-w-[260px] mx-auto">
                  {searchQuery 
                    ? t('home.no_results.desc_query', { query: searchQuery })
                    : t('home.no_results.desc_category', { category: selectedCategory !== 'all' ? categories.find(c => c.id === selectedCategory)?.name : '' })}
                </p>
              </div>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-4 px-8 py-4 bg-foreground text-background rounded-[20px] font-black text-sm uppercase tracking-widest shadow-xl shadow-black/10 active:scale-95 transition-all hover:bg-primary hover:text-white hover:shadow-primary/30"
              >
                {t('home.no_results.view_all')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
