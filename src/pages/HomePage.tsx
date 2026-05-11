import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, ChevronRight,
  Sparkles, Heart, Calendar, Star, Zap, Clock, LayoutGrid
} from 'lucide-react';
import EventFilters, { FilterType } from '@/components/EventFilters';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import EventCard from '@/components/EventCard';
import EventCardSkeleton from '@/components/EventCardSkeleton';
import { useTranslation } from 'react-i18next';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/contexts/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();

  const [searchQuery, setSearchQuery] = useState(() => sessionStorage.getItem('home_query') || '');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>(() => (sessionStorage.getItem('home_price') as 'all' | 'free' | 'paid') || 'all');
  const [activeFilter, setActiveFilter] = useState<FilterType>(() => (sessionStorage.getItem('home_filter') as FilterType) || 'all');
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

  const { latitude, longitude, city, loading: locLoading, requestLocation, calculateDistance, permission, setManualLocation } = useLocation();

  // Helper to get header info based on filter
  const headerInfo = useMemo(() => {
    switch (activeFilter) {
      case 'featured':
        return { icon: <Star className="w-5 h-5 text-amber-500 fill-amber-500" />, title: t('filters.featured') || 'Destacados' };
      case 'popular':
        return { icon: <Zap className="w-5 h-5 text-orange-500 fill-orange-500" />, title: t('filters.popular') || 'Populares' };
      case 'today':
        return { icon: <Calendar className="w-5 h-5 text-blue-500 fill-blue-500" />, title: t('filters.today') || 'Eventos de hoy' };
      case 'tomorrow':
        return { icon: <Clock className="w-5 h-5 text-indigo-500 fill-indigo-500" />, title: t('filters.tomorrow') || 'Para mañana' };
      case 'nearby':
        return { icon: <MapPin className="w-5 h-5 text-rose-500 fill-rose-500" />, title: t('filters.nearby') || 'Cerca de ti' };
      case 'all':
      default:
        return { icon: <LayoutGrid className="w-5 h-5 text-primary" />, title: t('filters.all') || 'Todos los eventos' };
    }
  }, [activeFilter, t]);

  const fetchEventsWithRetry = async (retryCount = 0): Promise<any[]> => {
    const maxRetries = 3;
    const delays = [500, 1000, 2000];

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      const isRecoverable = error?.message?.includes('Failed to fetch') ||
        error?.message?.includes('ERR_CONNECTION');

      if (isRecoverable && retryCount < maxRetries) {
        console.log(`⚠️ Error de red al cargar eventos, reintentando ${retryCount + 1}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, delays[retryCount]));
        return fetchEventsWithRetry(retryCount + 1);
      }
      throw error;
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const fetchInitialData = async () => {
      if (!user) {
        setUserName('');
        setUserPreferences([]);
        setUserFavorites(new Set());
        const eventsData = await fetchEventsWithRetry();
        if (isMounted) {
          setEvents(eventsData);
          setLoading(false);
        }
        return;
      }

      try {
        if (!userName) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, preferences')
            .eq('id', user.id)
            .single();

          if (!profileError && isMounted) {
            if (profile?.full_name) {
              setUserName(profile.full_name.split(' ')[0]);
            } else {
              setUserName(t('profile.profile'));
            }

            if (profile?.preferences) {
              setUserPreferences(profile.preferences);
            }
          }
        }

        const { data: favs } = await supabase
          .from('favorites')
          .select('event_id')
          .eq('user_id', user.id);

        if (favs && isMounted) {
          setUserFavorites(new Set(favs.map(f => f.event_id)));
        }

        const eventsData = await fetchEventsWithRetry();
        if (isMounted) {
          setEvents(eventsData);
        }
      } catch (error) {
        console.error('Error in fetchInitialData:', error);
        if (isMounted) setEvents([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (!authLoading) {
      fetchInitialData();
    }

    return () => { isMounted = false; };
  }, [user?.id, authLoading, t]);

  useEffect(() => {
    const eventsSubscription = supabase
      .channel('home-events-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setEvents(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setEvents(prev => prev.map(e => e.id === payload.new.id ? { ...e, ...payload.new } : e));
          } else if (payload.eventType === 'DELETE') {
            setEvents(prev => prev.filter(e => e.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(eventsSubscription);
    };
  }, []);

  useEffect(() => {
    sessionStorage.setItem('home_query', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    sessionStorage.setItem('home_price', priceFilter);
  }, [priceFilter]);

  useEffect(() => {
    sessionStorage.setItem('home_filter', activeFilter);
  }, [activeFilter]);

  useEffect(() => {
    const savedScroll = sessionStorage.getItem('home_scroll');
    if (savedScroll && !loading && events.length > 0) {
      setTimeout(() => window.scrollTo(0, parseInt(savedScroll, 10)), 100);
    }
  }, [loading, events]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          sessionStorage.setItem('home_scroll', window.scrollY.toString());
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getFilteredEvents = useCallback((events: any[], filter: FilterType, search: string, price: string) => {
    let filtered = [...events];

    switch (filter) {
      case 'featured':
        filtered = filtered
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);
        break;
      case 'popular':
        filtered = filtered
          .filter(event => (event.attendees_count || 0) > 2)
          .sort((a, b) => (b.attendees_count || 0) - (a.attendees_count || 0));
        break;
      case 'today':
        const today = new Date().toISOString().split('T')[0];
        filtered = filtered.filter(event => event.event_date === today);
        break;
      case 'tomorrow':
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        filtered = filtered.filter(event => event.event_date === tomorrow);
        break;
      case 'nearby':
        if (latitude && longitude) {
          filtered = filtered
            .filter(event => {
              if (!event.latitude || !event.longitude) return false;
              const distance = calculateDistance(latitude, longitude, event.latitude, event.longitude);
              return distance <= 50;
            })
            .sort((a, b) => {
              const distA = calculateDistance(latitude, longitude, a.latitude, a.longitude);
              const distB = calculateDistance(latitude, longitude, b.latitude, b.longitude);
              return distA - distB;
            });
        }
        break;
      case 'all':
      default:
        break;
    }

    if (search) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (price !== 'all') {
      if (price === 'free') {
        filtered = filtered.filter(event => !event.price || Number(event.price) === 0 || event.price === 'Gratis');
      } else if (price === 'paid') {
        filtered = filtered.filter(event => event.price && Number(event.price) > 0);
      }
    }

    return filtered;
  }, [latitude, longitude, calculateDistance]);

  const filteredEvents = useMemo(() => {
    return getFilteredEvents(events, activeFilter, searchQuery, priceFilter);
  }, [events, activeFilter, searchQuery, priceFilter, getFilteredEvents]);

  const handleFilterChange = useCallback((filter: FilterType) => {
    setActiveFilter(filter);
    sessionStorage.setItem('home_filter', filter);
  }, []);

  const toggleFavorite = useCallback(async (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    if (!user) {
      toast.error(t('event_detail.login_to_fav'));
      return;
    }

    try {
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

        if (event?.category && !userPreferences.includes(event.category)) {
          const newPrefs = [...userPreferences, event.category].slice(-10);
          await supabase.from('profiles').update({ preferences: newPrefs }).eq('id', user.id);
          setUserPreferences(newPrefs);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(t('common.error'));
    }
  }, [user, events, userFavorites, userPreferences, t]);

  const handleEventClick = useCallback((id: string) => {
    navigate(`/event/${id}`);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-br from-primary/10 via-indigo-500/5 to-pink-500/10 pointer-events-none -z-10 blur-3xl rounded-b-[100px]" />
      <div className="absolute top-[-100px] right-[-50px] w-[300px] h-[300px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <header className="px-6 lg:px-12 pt-10 pb-6 flex justify-between items-start animate-fade-in-custom">
        <div className="space-y-2">
          <h1 className="text-[28px] font-black tracking-tight text-foreground leading-tight">
            {t('home.greeting')}<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">{userNameDisplay}</span> 👋
          </h1>
          <button
            onClick={() => {
              if (permission === 'denied' || !navigator.geolocation) {
                const manualCity = window.prompt(t('location.prompt_city') || 'Introduce tu ciudad:');
                if (manualCity) {
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
      </header>

      <div className="px-6 lg:px-12 mb-8 relative z-10">
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

      <EventFilters
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        priceFilter={priceFilter}
        onPriceFilterChange={setPriceFilter}
        eventCount={filteredEvents.length}
        isLoading={loading}
        userLocation={latitude && longitude ? { latitude, longitude, city } : undefined}
      />

      <div className="px-6 lg:px-12 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
            {loading ? (
              <div className="h-6 w-40 bg-muted animate-pulse rounded-md" />
            ) : (
              <div className="flex items-center gap-2">
                {headerInfo.icon}
                <span>{headerInfo.title}</span>
              </div>
            )}
          </h2>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3].map((i) => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEvents.map((event, idx) => (
                <div
                  key={event.id}
                  className="animate-fade-in-custom"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <EventCard
                    event={event}
                    isFavorite={userFavorites.has(event.id)}
                    onFavoriteToggle={(e) => toggleFavorite(e, event.id)}
                  />
                </div>
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
                <h3 className="font-black text-2xl text-foreground tracking-tight mb-2">
                  {t('home.no_results.title') || 'No se encontraron eventos'}
                </h3>
                <p className="text-muted-foreground text-[15px] font-medium leading-relaxed max-w-[280px] mx-auto">
                  {activeFilter === 'featured' && 'No hay eventos destacados disponibles.'}
                  {activeFilter === 'popular' && 'No hay eventos con asistentes registrados.'}
                  {activeFilter === 'today' && 'No hay eventos programados para hoy.'}
                  {activeFilter === 'tomorrow' && 'No hay eventos programados para mañana.'}
                  {activeFilter === 'nearby' && 'No hay eventos con ubicación definida.'}
                  {activeFilter === 'all' && 'No se encontraron eventos que coincidan con tu búsqueda.'}
                </p>
              </div>
              {activeFilter !== 'all' && (
                <button
                  onClick={() => handleFilterChange('all')}
                  className="mt-4 px-8 py-4 bg-primary text-primary-foreground rounded-[20px] font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all hover:bg-primary/90 hover:shadow-primary/30"
                >
                  Ver todos los eventos
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;