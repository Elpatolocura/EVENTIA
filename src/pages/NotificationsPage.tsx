import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartBack } from '@/hooks/useSmartBack';
import { ArrowLeft, Bell, MessageSquare, Ticket, Star, Info, Sparkles, MoreVertical, CheckCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner'; // ✅ AGREGADO: faltaba este import

const NotificationsPage = () => {
  const navigate = useNavigate();
  const goBack = useSmartBack('/');
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchNotifications = async () => {
    try {
      // 🔹 Manejo de error de lock
      let user = null;

      try {
        const result = await supabase.auth.getUser();
        user = result.data?.user;
      } catch (error: any) {
        if (error?.message?.includes('Lock') || error?.message?.includes('lock')) {
          console.log('⚠️ Lock error en NotificationsPage, reintentando...');
          await new Promise(resolve => setTimeout(resolve, 150));
          try {
            const retry = await supabase.auth.getUser();
            user = retry.data?.user;
          } catch (retryError) {
            console.log('Error en reintento de NotificationsPage:', retryError);
          }
        } else {
          console.error('Error inesperado:', error);
        }
      }

      if (user) {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setNotifications(data || []);
      }
    } catch (error) {
      console.error("Error fetching notifications", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      // 🔹 Manejo de error de lock también aquí
      let user = null;

      try {
        const result = await supabase.auth.getUser();
        user = result.data?.user;
      } catch (error: any) {
        if (error?.message?.includes('Lock') || error?.message?.includes('lock')) {
          await new Promise(resolve => setTimeout(resolve, 100));
          const retry = await supabase.auth.getUser();
          user = retry.data?.user;
        }
      }

      if (user) {
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('user_id', user.id);

        if (error) throw error;
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        toast.success('Todas las notificaciones marcadas como leídas');
      }
    } catch (error) {
      toast.error('Error al actualizar notificaciones');
    }
  };

  const clearAll = async () => {
    try {
      // 🔹 Manejo de error de lock también aquí
      let user = null;

      try {
        const result = await supabase.auth.getUser();
        user = result.data?.user;
      } catch (error: any) {
        if (error?.message?.includes('Lock') || error?.message?.includes('lock')) {
          await new Promise(resolve => setTimeout(resolve, 100));
          const retry = await supabase.auth.getUser();
          user = retry.data?.user;
        }
      }

      if (user) {
        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('user_id', user.id);

        if (error) throw error;
        setNotifications([]);
        toast.success('Notificaciones eliminadas');
      }
    } catch (error) {
      toast.error('Error al eliminar notificaciones');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pb-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium text-sm">Cargando notificaciones...</p>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'event': return <Star className="w-4 h-4 text-amber-500" />;
      case 'ticket': return <Ticket className="w-4 h-4 text-green-500" />;
      case 'chat': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      default: return <Info className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={goBack} className="p-2 rounded-full hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Notificaciones</h1>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-xl hover:bg-secondary transition-all active:scale-90">
              <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-border bg-card">
            <DropdownMenuItem
              onClick={markAllAsRead}
              className="gap-3 px-4 py-3 rounded-xl cursor-pointer font-bold text-[13px] text-foreground hover:bg-secondary focus:bg-secondary"
            >
              <CheckCheck className="w-4 h-4 text-emerald-500" /> Marcar como leídas
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-border" />
            <DropdownMenuItem
              onClick={clearAll}
              className="gap-3 px-4 py-3 rounded-xl cursor-pointer font-bold text-[13px] text-rose-500 hover:bg-rose-500/10 focus:bg-rose-500/10 focus:text-rose-600"
            >
              <Trash2 className="w-4 h-4" /> Borrar todas
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="divide-y divide-border">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 flex gap-4 transition-colors hover:bg-secondary/30 ${!notif.read ? 'bg-primary/5' : ''}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${!notif.read ? 'bg-background shadow-sm border border-border/50' : 'bg-secondary'
                }`}>
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start gap-2">
                  <h3 className={`text-sm font-bold leading-tight ${!notif.read ? 'text-foreground' : 'text-foreground/80'}`}>
                    {notif.title}
                  </h3>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(notif.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {notif.message}
                </p>
              </div>

              {!notif.read && (
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shadow-[0_0_8px_rgba(var(--primary),0.5)]"></div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-32 px-10 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 rounded-[32px] blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 rounded-[32px] shadow-2xl shadow-orange-500/40 flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-500">
                <Bell className="w-12 h-12 text-white animate-bounce" />
                <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-amber-300 animate-pulse" />
              </div>
            </div>

            <h3 className="text-2xl font-black text-foreground tracking-tight mb-3">¡Todo al día!</h3>
            <p className="text-muted-foreground text-[15px] font-medium leading-relaxed max-w-[240px] mx-auto mb-10">
              No hay nuevas notificaciones. ¡Es un buen momento para explorar nuevos eventos!
            </p>

            <Button
              onClick={() => navigate('/')}
              className="w-full h-14 rounded-2xl bg-foreground text-background font-black text-sm uppercase tracking-widest shadow-xl shadow-foreground/10 active:scale-95 transition-all hover:opacity-90 border-none"
            >
              Explorar Eventos
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;