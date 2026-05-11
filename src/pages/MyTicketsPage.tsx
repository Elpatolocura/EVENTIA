import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartBack } from '@/hooks/useSmartBack';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Ticket, Calendar, MapPin, QrCode, MoreVertical, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const MyTicketsPage = () => {
  const navigate = useNavigate();
  const goBack = useSmartBack('/profile');
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventGroup, setSelectedEventGroup] = useState<any[] | null>(null);

  const activeTickets = tickets.filter(t => t.status === 'active');
  const pastTickets = tickets.filter(t => t.status !== 'active');

  const groupedActiveTickets = useMemo(() => {
    const groups: Record<string, any[]> = {};
    activeTickets.forEach(ticket => {
      const eventId = ticket.event_id;
      if (!groups[eventId]) {
        groups[eventId] = [];
      }
      groups[eventId].push(ticket);
    });
    return Object.values(groups);
  }, [activeTickets]);

  const groupedPastTickets = useMemo(() => {
    const groups: Record<string, any[]> = {};
    pastTickets.forEach(ticket => {
      const eventId = ticket.event_id;
      if (!groups[eventId]) {
        groups[eventId] = [];
      }
      groups[eventId].push(ticket);
    });
    return Object.values(groups);
  }, [pastTickets]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('tickets')
            .select('*, events (*)')
            .eq('user_id', user.id)
            .order('purchase_date', { ascending: false });

          if (error) throw error;
          setTickets(data || []);
        }
      } catch (e) {
        console.error("Error fetching tickets", e);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const clearAllTickets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from('tickets').delete().eq('user_id', user.id);
        if (error) throw error;
        setTickets([]);
        toast.success(t('tickets.cleared_toast'));
      }
    } catch (e) {
      toast.error(t('common.error'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pb-24 lg:pb-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium">{t('tickets.loading')}</p>
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
          <h1 className="text-xl font-bold">{t('tickets.title')}</h1>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-xl hover:bg-secondary transition-all active:scale-90">
              <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-border bg-card">
            <DropdownMenuItem
              onClick={clearAllTickets}
              className="gap-3 px-4 py-3 rounded-xl cursor-pointer font-bold text-[13px] text-rose-500 hover:bg-rose-500/10 focus:bg-rose-500/10 focus:text-rose-600"
            >
              <Trash2 className="w-4 h-4" /> {t('tickets.clear_all')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="p-4 lg:px-12">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary/50">
            <TabsTrigger value="active">{t('tickets.tabs.active')}</TabsTrigger>
            <TabsTrigger value="past">{t('tickets.tabs.past')}</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {groupedActiveTickets.length > 0 ? (
              groupedActiveTickets.map((group) => {
                const firstTicket = group[0];
                const { events } = firstTicket;
                const isGroup = group.length > 1;

                return (
                  <button
                    key={events.id}
                    onClick={() => {
                      if (isGroup) {
                        setSelectedEventGroup(group);
                      } else {
                        navigate(`/ticket/${firstTicket.id}`);
                      }
                    }}
                    className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm text-left w-full transition-all hover:shadow-md active:scale-[0.98] group"
                  >
                    <div className="h-36 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary relative overflow-hidden">
                      {events.image_url ? (
                        <img src={events.image_url} alt={events.title} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Ticket className="w-16 h-16 text-primary/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="bg-foreground/90 text-background px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm">
                          {isGroup ? `${group.length} entradas` : `x${firstTicket.quantity}`}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="font-bold text-sm text-white truncate drop-shadow-lg">{events.title}</h3>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-xs">{new Date(events.event_date || events.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-xs truncate">{events.location}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className="text-[10px] text-muted-foreground">{new Date(firstTicket.purchase_date).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-primary">
                          <QrCode className="w-3.5 h-3.5" />
                          {isGroup ? 'Ver todas' : 'Ver QR'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-24 px-10 text-center animate-in fade-in zoom-in-95 duration-500 col-span-full">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-tr from-violet-400 via-fuchsia-500 to-rose-500 rounded-[32px] blur-2xl opacity-30 animate-pulse"></div>
                  <div className="relative w-28 h-28 bg-gradient-to-br from-violet-500 via-fuchsia-600 to-rose-500 rounded-[35px] shadow-2xl shadow-fuchsia-500/40 flex items-center justify-center rotate-6 hover:rotate-0 transition-transform duration-700 group cursor-pointer">
                    <Ticket className="w-14 h-14 text-white animate-bounce drop-shadow-lg" />
                    <Sparkles className="absolute -top-3 -right-3 w-10 h-10 text-yellow-300 animate-spin-slow" />
                    <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 rotate-12 group-hover:rotate-0 transition-transform">
                      <QrCode className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <h3 className="text-3xl font-black text-foreground tracking-tight mb-3">{t('tickets.empty.active.title')}</h3>
                <p className="text-muted-foreground text-[16px] font-medium leading-relaxed max-w-[280px] mx-auto mb-10">
                  {t('tickets.empty.active.desc')}
                </p>

                <Button
                  onClick={() => navigate('/')}
                  className="w-full max-w-xs h-16 rounded-[24px] bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 text-white font-black text-sm uppercase tracking-widest shadow-2xl shadow-fuchsia-500/30 active:scale-95 transition-all hover:shadow-fuchsia-500/50 group border-none"
                >
                  {t('tickets.empty.active.button')}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {groupedPastTickets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {groupedPastTickets.map((group) => {
                  const firstTicket = group[0];
                  const { events } = firstTicket;
                  const isGroup = group.length > 1;

                  return (
                    <button
                      key={events.id}
                      onClick={() => isGroup ? setSelectedEventGroup(group) : navigate(`/ticket/${firstTicket.id}`)}
                      className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm text-left w-full transition-all hover:shadow-md opacity-70 grayscale-[0.4] group"
                    >
                      <div className="h-28 bg-muted relative overflow-hidden">
                        {events.image_url ? (
                          <img src={events.image_url} alt={events.title} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Ticket className="w-10 h-10 text-muted-foreground/20" />
                          </div>
                        )}
                        <div className="absolute top-2 left-2">
                          <span className="bg-muted-foreground/80 text-background px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                            {t('tickets.expired') || 'Finalizado'}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 space-y-1">
                        <h3 className="font-bold text-xs text-foreground/70 truncate">{events.title}</h3>
                        <p className="text-[10px] text-muted-foreground/50">{new Date(events.event_date || events.date).toLocaleDateString()}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 px-10 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 via-orange-500 to-red-500 rounded-[32px] blur-2xl opacity-20"></div>
                  <div className="relative w-24 h-24 bg-secondary rounded-[32px] flex items-center justify-center shadow-inner overflow-hidden border border-border">
                    <Ticket className="w-10 h-10 text-muted-foreground/30 -rotate-12" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 to-orange-500/20 mix-blend-overlay"></div>
                    <Sparkles className="absolute top-2 right-2 w-6 h-6 text-amber-400/40" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-foreground tracking-tight">{t('tickets.empty.past.title')}</h3>
                <p className="text-muted-foreground text-[15px] mt-3 font-medium max-w-[220px] leading-relaxed">{t('tickets.empty.past.desc')}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      {/* Multi-Ticket Selection Drawer */}
      <Drawer open={!!selectedEventGroup} onOpenChange={(open) => !open && setSelectedEventGroup(null)}>
        <DrawerContent className="max-h-[85vh] rounded-t-[40px] border-none shadow-2xl bg-background">
          <div className="p-8 pb-10 space-y-6">
            <DrawerHeader className="p-0 text-center">
              <DrawerTitle className="text-2xl font-black text-foreground tracking-tight">
                {selectedEventGroup?.[0]?.events?.title}
              </DrawerTitle>
              <DrawerDescription className="text-muted-foreground font-medium mt-1">
                Selecciona una de tus {selectedEventGroup?.length} entradas
              </DrawerDescription>
            </DrawerHeader>

            <div className="space-y-3 overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar">
              {selectedEventGroup?.map((ticket, idx) => (
                <button
                  key={ticket.id}
                  onClick={() => {
                    navigate(`/ticket/${ticket.id}`);
                    setSelectedEventGroup(null);
                  }}
                  className="w-full flex items-center justify-between p-5 bg-card rounded-[24px] border border-border hover:border-primary/50 transition-all active:scale-[0.98] group"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <Ticket className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none mb-1">Entrada #{idx + 1}</p>
                      <h4 className="text-sm font-black text-foreground">{ticket.zone || 'General'}</h4>
                      <p className="text-[10px] text-muted-foreground font-bold mt-0.5">Comprada el {new Date(ticket.purchase_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  </div>
                </button>
              ))}
            </div>

            <Button 
              variant="ghost" 
              onClick={() => setSelectedEventGroup(null)}
              className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] text-muted-foreground"
            >
              Cerrar
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default MyTicketsPage;
