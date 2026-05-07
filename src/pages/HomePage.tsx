import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Bell, MapPin, ChevronRight,
  Sparkles, Heart, Calendar
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

const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
          // If no user is logged in, allow access to home page
          console.log('No user found, but allowing access to home page');
        }

        // Fetch events FIRST
        const { data: eventsData, error } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // NOW check if eventsData exists and has data
        if (!eventsData || eventsData.length === 0) {
          console.log('🔄 Usando datos de ejemplo porque no se pudieron cargar eventos de Supabase');
          const mockEvents = [
            {
              id: 'mock-1',
              title: 'Concierto de Rock Mexicano',
              description: 'El mejor concierto de rock nacional',
              category: 'música',
              event_date: '2026-05-06',
              event_time: '20:00:00',
              attendees_count: 150,
              price: 250,
              currency: 'MXN',
              latitude: 19.4326,
              longitude: -99.1332,
              created_at: new Date().toISOString(),
              organizer_name: 'Rock MX',
              is_featured: true
            },
            {
              id: 'mock-2',
              title: 'Festival Gastronómico',
              description: 'Degusta los mejores platillos de la ciudad',
              category: 'gastronomía',
              event_date: '2026-05-07',
              event_time: '12:00:00',
              attendees_count: 200,
              price: 150,
              currency: 'MXN',
              latitude: 19.4242,
              longitude: -99.1956,
              created_at: new Date().toISOString(),
              organizer_name: 'Food Festival',
              is_featured: false
            },
            {
              id: 'mock-3',
              title: 'Exposición de Arte Moderno',
              description: 'Descubre las últimas tendencias artísticas',
              category: 'arte',
              event_date: '2026-05-06',
              event_time: '10:00:00',
              attendees_count: 80,
              price: 0,
              currency: 'MXN',
              latitude: 19.4133,
              longitude: -99.1767,
              created_at: new Date().toISOString(),
              organizer_name: 'Museo Moderno',
              is_featured: true
            },
            {
              id: 'mock-4',
              title: 'Torneo de eSports',
              description: 'Compite en el torneo más grande de videojuegos',
              category: 'tech',
              event_date: '2026-05-08',
              event_time: '14:00:00',
              attendees_count: 300,
              price: 100,
              currency: 'MXN',
              latitude: 19.4200,
              longitude: -99.1600,
              created_at: new Date().toISOString(),
              organizer_name: 'Gaming Pro',
              is_featured: false
            },
            {
              id: 'mock-5',
              title: 'Yoga en el Parque',
              description: 'Sesión matutina de yoga al aire libre',
              category: 'bienestar',
              event_date: '2026-05-06',
              event_time: '08:00:00',
              attendees_count: 25,
              price: 0,
              currency: 'MXN',
              latitude: 19.4167,
              longitude: -99.1833,
              created_at: new Date().toISOString(),
              organizer_name: 'Zen Studio',
              is_featured: false
            },
            {
              id: 'mock-6',
              title: 'Maratón CDMX',
              description: 'La carrera atlética más importante de la ciudad',
              category: 'deportes',
              event_date: '2026-05-09',
              event_time: '07:00:00',
              attendees_count: 500,
              price: 120,
              currency: 'MXN',
              latitude: 19.3742,
              longitude: -99.1733,
              created_at: new Date().toISOString(),
              organizer_name: 'Instituto del Deporte',
              is_featured: true
            }
          ];
          setEvents(mockEvents);
          console.log('✅ Datos de ejemplo cargados:', mockEvents.length, 'eventos');
        } else {
          // TEMPORAL: Modificar algunos eventos para mostrar las secciones de demo
          const eventsToUpdate = eventsData.slice(0, Math.min(10, eventsData.length));
          const today = new Date().toISOString().split('T')[0];
          const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

          for (let i = 0; i < eventsToUpdate.length; i++) {
            const event = eventsToUpdate[i];
            const updates: any = {};

            // Configurar ubicación (cerca de CDMX para demo)
            if (!event.latitude || !event.longitude) {
              updates.latitude = 19.4326 + (Math.random() - 0.5) * 0.1;
              updates.longitude = -99.1332 + (Math.random() - 0.5) * 0.1;
            }

            // Primeros 2: destacados
            if (i < 2) {
              updates.is_featured = true;
              updates.attendees_count = Math.floor(Math.random() * 100) + 200;
            }
            // Siguientes 3: populares
            else if (i < 5) {
              updates.attendees_count = Math.floor(Math.random() * 150) + 100;
            }
            // Distribuir fechas
            if (i < 3) {
              updates.event_date = today;
            } else if (i < 6) {
              updates.event_date = tomorrow;
            }

            if (Object.keys(updates).length > 0) {
              try {
                await supabase
                  .from('events')
                  .update(updates)
                  .eq('id', event.id);
                console.log(`Updated event ${i + 1}: ${event.title}`, updates);
              } catch (updateError) {
                console.log('Error updating event:', updateError);
              }
            }
          }

          setEvents(eventsData);
        }

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
      } catch (error) {
        console.error('Error in fetchInitialData:', error);
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
  }, [navigate, t]);

  // Save states
  useEffect(() => {
    sessionStorage.setItem('home_query', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    sessionStorage.setItem('home_price', priceFilter);
  }, [priceFilter]);

  useEffect(() => {
    sessionStorage.setItem('home_filter', activeFilter);
  }, [activeFilter]);

  // Restore scroll
  useEffect(() => {
    const savedScroll = sessionStorage.getItem('home_scroll');
    if (savedScroll && !loading && events.length > 0) {
      setTimeout(() => window.scrollTo(0, parseInt(savedScroll, 10)), 100);
    }
  }, [loading, events]);

  // Save scroll on change (throttled)
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

  // Create separate sections for different types of events
  const featuredEvents = useMemo(() => {
    return events.filter(event => event.is_featured === true).slice(0, 6);
  }, [events]);

  const popularEvents = useMemo(() => {
    return [...events]
      .filter(event => event.attendees_count > 0)
      .sort((a, b) => (b.attendees_count || 0) - (a.attendees_count || 0))
      .slice(0, 6);
  }, [events]);

  const todayEvents = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return events
      .filter(event => event.event_date === today || event.event_date === tomorrow)
      .slice(0, 8);
  }, [events]);

  const nearbyEvents = useMemo(() => {
    if (!latitude || !longitude) return [];

    return events
      .filter(event => {
        if (!event.latitude || !event.longitude) return false;
        const distance = calculateDistance(latitude, longitude, event.latitude, event.longitude);
        return distance <= 50;
      })
      .sort((a, b) => {
        const distA = calculateDistance(latitude, longitude, a.latitude, a.longitude);
        const distB = calculateDistance(latitude, longitude, b.latitude, b.longitude);
        return distA - distB;
      })
      .slice(0, 6);
  }, [events, latitude, longitude, calculateDistance]);

  // Función principal de filtrado
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
        if (filtered.length === 0) {
          filtered = events
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 3);
        }
        break;
      case 'tomorrow':
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        filtered = filtered.filter(event => event.event_date === tomorrow);
        if (filtered.length === 0) {
          filtered = events
            .filter(event => event.event_date && new Date(event.event_date) > new Date())
            .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
            .slice(0, 3);
        }
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
        } else {
          filtered = filtered.filter(event => event.latitude && event.longitude);
        }
        if (filtered.length === 0) {
          filtered = events
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 4);
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
  }, [events, userFavorites, userPreferences, t]);

  const handleEventClick = useCallback((id: string) => {
    navigate(`/event/${id}`);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-br from-primary/10 via-indigo-500/5 to-pink-500/10 pointer-events-none -z-10 blur-3xl rounded-b-[100px]" />
      <div className="absolute top-[-100px] right-[-50px] w-[300px] h-[300px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <header className="px-6 pt-10 pb-6 flex justify-between items-start animate-fade-in-custom">
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
        <button
          onClick={() => navigate('/notifications')}
          className="p-3.5 rounded-[20px] bg-card shadow-sm border border-border relative hover:shadow-md active:scale-95 transition-all"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 border-2 border-card rounded-full animate-pulse"></span>
        </button>
      </header>

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

      <EventFilters
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        priceFilter={priceFilter}
        onPriceFilterChange={setPriceFilter}
        eventCount={filteredEvents.length}
        isLoading={loading}
        userLocation={latitude && longitude ? { latitude, longitude, city } : undefined}
      />

      {/* Entry Type Filter */}
      <div className="px-6 mb-8 flex gap-2 relative z-10">
        {[
          { id: 'all', label: t('common.any_price') },
          { id: 'free', label: t('common.free') },
          { id: 'paid', label: t('common.paid') }
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setPriceFilter(filter.id as 'all' | 'free' | 'paid')}
            className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border ${priceFilter === filter.id
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