import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartBack } from '@/hooks/useSmartBack';
import { ArrowLeft, Heart, Calendar, MapPin, Star, Loader2, Users, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const goBack = useSmartBack('/');
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('favorites')
          .select(`
            id,
            event_id,
            events (*)
          `)
          .eq('user_id', userData.user.id);

        if (error) throw error;
        
        // Filter out null events in case an event was deleted
        const validFavorites = data?.filter(f => f.events) || [];
        setFavorites(validFavorites);
      } catch (error) {
        console.error(error);
        toast.error('Error al cargar favoritos');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (e: React.MouseEvent, favoriteId: string) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;
      
      setFavorites(prev => prev.filter(f => f.id !== favoriteId));
      toast.success('Eliminado de favoritos');
    } catch (error) {
      console.error(error);
      toast.error('No se pudo eliminar');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pb-24 lg:pb-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium">Cargando tus favoritos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8 animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center gap-4">
        <button onClick={goBack} className="lg:hidden p-2 rounded-full hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Favoritos</h1>
      </div>

      <div className="p-4 lg:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {favorites.length > 0 ? (
          favorites.map((favorite) => {
            const event = favorite.events;
            const priceDisplay = event.price && event.price !== '0' && event.price !== 'Gratis' ? `$${event.price}` : 'Gratis';

            return (
              <button
                key={favorite.id}
                onClick={() => navigate(`/event/${event.id}`)}
                className="bg-card rounded-2xl overflow-hidden border border-border text-left w-full transition-shadow hover:shadow-md will-change-transform"
              >
                <div className="h-40 bg-secondary flex items-center justify-center text-5xl relative overflow-hidden">
                  {event.image_url || event.image ? (
                    <img
                      src={event.image_url || event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-foreground/80 to-foreground/40 text-white">
                      🎫
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <div className="bg-background/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-wider shadow-sm">
                      {event.category}
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={(e) => handleRemoveFavorite(e, favorite.id)}
                      className="w-10 h-10 rounded-xl bg-red-500/80 backdrop-blur-md flex items-center justify-center border border-red-400 text-white hover:bg-red-600 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-base leading-tight truncate">{event.title}</h3>
                      <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>{(event.event_date || event.date)}</span>
                        {event.event_time && <><span>·</span><span>{event.event_time}</span></>}
                      </p>
                      {event.location && (
                        <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{event.location.split(',')[0]}</span>
                        </p>
                      )}
                    </div>
                    <div className="bg-accent/10 text-accent px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 ml-2">
                      {priceDisplay}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{event.attendees_count || event.attendees || 0} asistentes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="text-[11px] font-bold text-muted-foreground">5.0</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="text-center py-32 space-y-5 px-6 col-span-full">
            <div className="w-24 h-24 rounded-[32px] bg-gradient-to-tr from-primary via-indigo-500 to-pink-500 flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 animate-pulse">
              <Heart className="w-12 h-12 text-white fill-white" />
            </div>
            <div className="space-y-2">
              <h3 className="font-black text-2xl text-foreground tracking-tight">¡Aún no hay favoritos!</h3>
              <p className="text-muted-foreground text-[15px] font-medium leading-relaxed">
                Descubre un mundo lleno de eventos increíbles y guarda aquí los que más te llamen la atención.
              </p>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="mt-6 px-8 py-4 bg-foreground text-background rounded-[20px] font-black text-sm uppercase tracking-widest shadow-xl shadow-foreground/10 active:scale-95 transition-all w-full hover:opacity-90"
            >
              ¡Comenzar a explorar!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
