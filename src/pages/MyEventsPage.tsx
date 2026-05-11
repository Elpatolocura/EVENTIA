import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartBack } from '@/hooks/useSmartBack';
import { ArrowLeft, Plus, Users, Calendar, MoreVertical, Edit2, Trash2, ExternalLink, Rocket, Lock, Loader2, MapPin, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const MyEventsPage = () => {
  const navigate = useNavigate();
  const goBack = useSmartBack('/profile');
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAllAccess, setIsAllAccess] = useState(false);

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Check subscription
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('plan_id, status')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle();
          
          setIsAllAccess(sub?.plan_id === 'Acceso Total');

          // Fetch events created by user
          const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('organizer_id', user.id)
            .order('created_at', { ascending: false });

          if (error) {
            console.error("Supabase error fetching events:", error);
            throw error;
          }
          
          console.log("Fetched events for user:", user.id, data);
          setMyEvents(data || []);
        }
      } catch (error) {
        console.error("Error fetching my events", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pb-24 lg:pb-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium text-sm">Cargando tus eventos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8 animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={goBack} className="lg:hidden p-2 rounded-full hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Mis Eventos</h1>
        </div>
        {isAllAccess && (
          <Button size="sm" className="rounded-full gap-1.5 h-8 px-4" onClick={() => navigate('/create')}>
            <Plus className="w-4 h-4" /> Nuevo
          </Button>
        )}
      </div>

      <div className="p-4 lg:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {myEvents.length > 0 ? (
          myEvents.map((event) => {
            const priceDisplay = event.price && event.price !== '0' && event.price !== 'Gratis' ? `$${event.price}` : 'Gratis';
            return (
              <div key={event.id} className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm transition-shadow hover:shadow-md relative group">
                <button
                  onClick={() => navigate(`/event/${event.id}`)}
                  className="w-full text-left"
                >
                  <div className="h-40 bg-secondary flex items-center justify-center text-5xl relative overflow-hidden">
                    {event.image_url ? (
                      <img src={event.image_url} loading="lazy" alt={event.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-foreground/80 to-foreground/40 text-white">
                        {event.emoji || '📅'}
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <div className="bg-background/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-wider shadow-sm">
                        {event.category}
                      </div>
                    </div>
                  </div>
                </button>

                <div className="absolute top-3 right-3 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-9 h-9 rounded-xl bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-background transition-all">
                        <MoreVertical className="w-4 h-4 text-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-xl">
                      <DropdownMenuItem className="gap-2 text-xs font-medium" onClick={() => navigate(`/event/${event.id}`)}>
                        <ExternalLink className="w-3.5 h-3.5" /> Ver Página
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-xs font-medium">
                        <Edit2 className="w-3.5 h-3.5" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-xs font-medium text-destructive">
                        <Trash2 className="w-3.5 h-3.5" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-base leading-tight truncate">{event.title}</h3>
                      <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>{event.event_date}</span>
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
                      <span className="text-xs text-muted-foreground">{event.attendees_count || 0} asistentes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="text-[11px] font-bold text-muted-foreground">5.0</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex gap-2 items-center">
                      <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min(100, ((event.attendees_count || 0) / (event.max_attendees || 100)) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-bold text-primary shrink-0">
                        {Math.round(((event.attendees_count || 0) / (event.max_attendees || 100)) * 100)}% lleno
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : isAllAccess ? (
          <div className="text-center py-20 px-6 animate-in fade-in zoom-in-95 duration-500 col-span-full">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-black text-2xl text-foreground tracking-tight mb-2">No hay eventos todavía</h3>
            <p className="text-muted-foreground text-[15px] font-medium leading-relaxed max-w-[280px] mx-auto mb-8">
              ¡Ya tienes Acceso Total! Es hora de crear tu primer evento y compartirlo con el mundo.
            </p>
            <Button
              onClick={() => navigate('/create')}
              className="w-full h-14 rounded-2xl bg-primary text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20"
            >
              Crear mi primer evento
            </Button>
          </div>
        ) : (
          <div className="text-center py-20 px-6 animate-in fade-in zoom-in-95 duration-500 col-span-full">
            <div className="relative w-28 h-28 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-[32px] rotate-6 opacity-20 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-bl from-indigo-500 via-purple-500 to-pink-500 rounded-[32px] -rotate-3 flex items-center justify-center shadow-2xl shadow-purple-500/30">
                <Rocket className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-3 -right-3 bg-foreground text-background rounded-full p-2.5 shadow-lg animate-bounce">
                <Lock className="w-5 h-5" />
              </div>
            </div>

            <h3 className="font-black text-2xl text-foreground tracking-tight mb-2">Conviértete en Organizador</h3>
            <p className="text-muted-foreground text-[15px] font-medium leading-relaxed max-w-[280px] mx-auto mb-8">
              Para poder crear y administrar tus propios eventos, necesitas tener la membresía <span className="font-bold text-primary">Acceso Total</span>.
            </p>

            <Button
              onClick={() => navigate('/premium')}
              className="w-full h-14 rounded-2xl bg-foreground text-background font-black text-sm uppercase tracking-widest shadow-xl shadow-foreground/10 active:scale-95 transition-all hover:opacity-90"
            >
              Ver Planes de Membresía
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEventsPage;
