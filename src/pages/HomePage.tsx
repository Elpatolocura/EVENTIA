import React, { useState, useMemo, useCallback, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronRight, Sparkles, Heart, Calendar, Star, Zap, Clock, LayoutGrid } from 'lucide-react';
import EventFilters, { FilterType } from '@/components/EventFilters';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import EventCard from '@/components/EventCard';
import EventCardSkeleton from '@/components/EventCardSkeleton';
import { useTranslation } from 'react-i18next';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES } from '@/lib/queryClient';

const fetchEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

const fetchUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, preferences')
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

const fetchUserFavorites = async (userId: string) => {
  const { data, error } = await supabase
    .from('favorites')
    .select('event_id')
    .eq('user_id', userId);
  if (error) throw error;
  return new Set(data?.map(f => f.event_id) || []);
};

const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState(() => sessionStorage.getItem('home_query') || '');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>(() => (sessionStorage.getItem('home_price') as 'all' | 'free' | 'paid') || 'all');
  const [activeFilter, setActiveFilter] = useState<FilterType>(() => (sessionStorage.getItem('home_filter') as FilterType) || 'all');

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: queryKeys.events.all,
    queryFn: fetchEvents,
    staleTime: STALE_TIMES.events,
    enabled: !authLoading,
  });

  const { data: userFavorites = new Set<string>() } = useQuery({
    queryKey: queryKeys.favorites.all,
    queryFn: () => fetchUserFavorites(user!.id),
    enabled: !!user,
    staleTime: STALE_TIMES.favorites,
  });

  const { data: profile } = useQuery({
    queryKey: queryKeys.profile.me,
    queryFn: () => fetchUserProfile(user!.id),
    enabled: !!user,
    staleTime: STALE_TIMES.profile,
  });

  const userNameDisplay = useMemo(() => {
    const name = profile?.full_name?.split(' ')[0];
    if (!name || name === 'Guest' || name === 'Invitado') return t('common.guest');
    return name;
  }, [profile, t]);

  const userPreferences = useMemo(() => profile?.preferences || [], [profile]);

  const { latitude, longitude, city, loading: locLoading, requestLocation, calculateDistance, permission, setManualLocation } = useLocation();

  const headerInfo = useMemo(() => {
    switch (activeFilter) {
      case 'featured': return { icon: <Star className="w-5 h-5 text-amber-500 fill-amber-500" />, title: t('filters.featured') || 'Destacados' };
      case 'popular': return { icon: <Zap className="w-5 h-5 text-orange-500 fill-orange-500" />, title: t('filters.popular') || 'Populares' };
      case 'today': return { icon: <Calendar className="w-5 h-5 text-blue-500 fill-blue-500" />, title: t('filters.today') || 'Eventos de hoy' };
      case 'tomorrow': return { icon: <Clock className="w-5 h-5 text-indigo-500 fill-indigo-500" />, title: t('filters.tomorrow') || 'Para mañana' };
      case 'nearby': return { icon: <MapPin className="w-5 h-5 text-rose-500 fill-rose-500" />, title: t('filters.nearby') || 'Cerca de ti' };
      default: return { icon: <LayoutGrid className="w-5 h-5 text-primary" />, title: t('filters.all') || 'Todos los eventos' };
    }
  }, [activeFilter, t]);

  const getFilteredEvents = useCallback((events: any[], filter: FilterType, search: string, price: string) => {
    let filtered = [...events];
    switch (filter) {
      case 'featured':
        filtered = filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
        break;
      case 'popular':
        filtered = filtered.filter(event => (event.attendees_count || 0) > 2).sort((a, b) => (b.attendees_count || 0) - (a.attendees_count || 0));
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
            .filter(event => { if (!event.latitude || !event.longitude) return false; return calculateDistance(latitude, longitude, event.latitude, event.longitude) <= 50; })
            .sort((a, b) => calculateDistance(latitude, longitude, a.latitude, a.longitude) - calculateDistance(latitude, longitude, b.latitude, b.longitude));
        }
        break;
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(event => event.title.toLowerCase().includes(q) || event.description?.toLowerCase().includes(q));
    }
    if (price !== 'all') {
      if (price === 'free') filtered = filtered.filter(event => !event.price || Number(event.price) === 0 || event.price === 'Gratis');
      else if (price === 'paid') filtered = filtered.filter(event => event.price && Number(event.price) > 0);
    }
    return filtered;
  }, [latitude, longitude, calculateDistance]);

  const filteredEvents = useMemo(() => getFilteredEvents(events, activeFilter, searchQuery, priceFilter), [events, activeFilter, searchQuery, priceFilter, getFilteredEvents]);

  const favoriteMutation = useMutation({
    mutationFn: async ({ eventId, isFav }: { eventId: string; isFav: boolean }) => {
      if (!user) throw new Error('Not authenticated');
      if (isFav) {
        const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('event_id', eventId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('favorites').insert({ user_id: user.id, event_id: eventId });
        if (error) throw error;
      }
    },
    onMutate: async ({ eventId, isFav }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites.all });
      const previous = queryClient.getQueryData<Set<string>>(queryKeys.favorites.all);
      if (previous) {
        const updated = new Set(previous);
        if (isFav) updated.delete(eventId);
        else updated.add(eventId);
        queryClient.setQueryData(queryKeys.favorites.all, updated);
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.favorites.all, context.previous);
      toast.error(t('common.error'));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all }),
  });

  const toggleFavorite = useCallback((e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    if (!user) { toast.error(t('event_detail.login_to_fav')); return; }
    favoriteMutation.mutate({ eventId, isFav: userFavorites.has(eventId) });
  }, [user, userFavorites, favoriteMutation, t]);

  const handleFilterChange = useCallback((filter: FilterType) => {
    setActiveFilter(filter);
    sessionStorage.setItem('home_filter', filter);
  }, []);

  useEffect(() => { sessionStorage.setItem('home_query', searchQuery); }, [searchQuery]);
  useEffect(() => { sessionStorage.setItem('home_price', priceFilter); }, [priceFilter]);

  const loading = authLoading || eventsLoading;

  const content = loading ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)}
    </div>
  ) : filteredEvents.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredEvents.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          isFavorite={userFavorites.has(event.id)}
          onFavoriteToggle={(e) => toggleFavorite(e, event.id)}
        />
      ))}
    </div>
  ) : (
    <NoResults activeFilter={activeFilter} onFilterChange={handleFilterChange} t={t} />
  );

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
      <header className="px-6 lg:px-12 pt-10 pb-6 flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-[28px] font-black tracking-tight text-foreground leading-tight">
            {t('home.greeting')}<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">{userNameDisplay}</span>
          </h1>
          <LocationButton
            city={city} locLoading={locLoading} permission={permission}
            requestLocation={requestLocation} setManualLocation={setManualLocation} t={t}
          />
        </div>
      </header>

      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} t={t} />

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
        <HeaderInfo loading={loading} headerInfo={headerInfo} />
        {content}
      </div>
    </div>
  );
};

const NoResults = memo(({ activeFilter, onFilterChange, t }: { activeFilter: string; onFilterChange: (f: FilterType) => void; t: any }) => (
  <div className="py-20 text-center space-y-6 px-4">
    <div className="relative w-28 h-28 mx-auto">
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 rounded-[32px] rotate-3 opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-bl from-cyan-400 via-blue-500 to-indigo-600 rounded-[32px] -rotate-3 flex items-center justify-center shadow-xl shadow-blue-500/30">
        <Search className="w-12 h-12 text-white" />
      </div>
    </div>
    <div>
      <h3 className="font-black text-2xl text-foreground tracking-tight mb-2">{t('home.no_results.title') || 'No se encontraron eventos'}</h3>
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
      <button onClick={() => onFilterChange('all')} className="mt-4 px-8 py-4 bg-primary text-primary-foreground rounded-[20px] font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all hover:bg-primary/90">
        Ver todos los eventos
      </button>
    )}
  </div>
));

const LocationButton = memo(({ city, locLoading, permission, requestLocation, setManualLocation, t }: any) => (
  <button
    onClick={() => {
      if (permission === 'denied' || !navigator.geolocation) {
        const manualCity = window.prompt(t('location.prompt_city') || 'Introduce tu ciudad:');
        if (manualCity) setManualLocation(40.4168, -3.7038, manualCity, 'Manual');
      } else requestLocation();
    }}
    className="flex items-center gap-1.5 text-slate-500 hover:text-primary transition-colors active:scale-95 group"
  >
    <MapPin className="w-4 h-4" />
    <span className="text-[13px] font-bold tracking-wide">
      {locLoading ? t('location.locating') : (city ? `${city}` : t('location.current_location'))}
    </span>
    <ChevronRight className="w-3.5 h-3.5 opacity-50" />
  </button>
));

const SearchBar = memo(({ searchQuery, setSearchQuery, t }: any) => (
  <div className="px-6 lg:px-12 mb-8">
    <div className="relative group">
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
      <Input
        placeholder={t('home.search_placeholder')}
        className="pl-14 h-14 rounded-[20px] border-none bg-card shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus-visible:ring-4 focus-visible:ring-primary/10 text-[15px] font-medium transition-all placeholder:text-muted-foreground"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  </div>
));

const HeaderInfo = memo((({ loading, headerInfo }: { loading: boolean; headerInfo: { icon: React.ReactNode; title: string } }) => (
  <div className="flex justify-between items-center">
    <h2 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
      {loading ? <div className="h-6 w-40 bg-muted animate-pulse rounded-md" /> : (
        <div className="flex items-center gap-2">
          {headerInfo.icon}
          <span>{headerInfo.title}</span>
        </div>
      )}
    </h2>
  </div>
)));

export default HomePage;