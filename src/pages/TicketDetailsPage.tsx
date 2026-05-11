import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSmartBack } from '@/hooks/useSmartBack';
import { 
  ArrowLeft, Calendar, MapPin, Clock, Share2, 
  Download, MoreHorizontal, Info, ShieldCheck, 
  QrCode, Wallet 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const TicketDetailsPage = () => {
  const navigate = useNavigate();
  const goBack = useSmartBack('/tickets');
  const { id } = useParams();

  const [ticketData, setTicketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('tickets')
          .select('*, events (*)')
          .eq('id', id)
          .single();

        if (error) throw error;
        setTicketData(data);
      } catch (error) {
        console.error(error);
        toast.error('Ticket no encontrado');
        navigate('/tickets');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTicketDetails();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium">Cargando tu ticket...</p>
      </div>
    );
  }

  if (!ticketData) return null;

  const event = ticketData.events;
  const qrCodeData = `EVENTIA-TICKET-${ticketData.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrCodeData}`;

  return (
    <div className="min-h-screen bg-background pb-12 lg:pb-8 animate-fade-in">
      {/* Header */}
      <div className="p-4 lg:px-8 lg:py-5 flex items-center justify-between sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-4">
          <button onClick={goBack} className="lg:hidden p-2.5 rounded-2xl bg-card shadow-sm border border-border active:scale-90 transition-all flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-black text-foreground">Mi Ticket</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl gap-2 h-9 border-border" onClick={() => toast.info('Compartiendo...')}>
            <Share2 className="w-4 h-4" /> Compartir
          </Button>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-5 lg:gap-8 lg:max-w-6xl lg:mx-auto lg:px-8 lg:pt-8">
        {/* ═══ Left: Ticket Card (spans 3 cols) ═══ */}
        <div className="lg:col-span-3 px-6 lg:px-0 mt-6 lg:mt-0">
          <div className="relative group max-w-lg lg:max-w-none mx-auto">
            {/* Top Section */}
            <div className="bg-card rounded-t-[32px] p-6 lg:p-10 border-x border-t border-border shadow-xl shadow-black/5">
              <div className="flex justify-between items-start mb-8">
                <div className="space-y-1">
                  <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    {ticketData.zone || 'General'}
                  </span>
                  <h2 className="text-2xl lg:text-3xl font-black text-foreground leading-tight pt-2">{event.title}</h2>
                </div>
                <span className="text-sm font-black text-foreground/40">#{ticketData.id.slice(0, 6).toUpperCase()}</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Calendar className="w-5 h-5 text-primary" /></div>
                  <div>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Fecha</p>
                    <p className="text-sm font-bold text-foreground">{new Date(event.event_date || event.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center"><Clock className="w-5 h-5 text-rose-500" /></div>
                  <div>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Hora</p>
                    <p className="text-sm font-bold text-foreground">{event.event_time || event.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl lg:col-span-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center"><MapPin className="w-5 h-5 text-emerald-500" /></div>
                  <div className="flex-1">
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Lugar</p>
                    <p className="text-sm font-bold text-foreground">{event.location}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Divider */}
            <div className="relative h-8 flex items-center bg-card border-x border-border">
              <div className="absolute -left-4 w-8 h-8 rounded-full bg-background border-r border-border"></div>
              <div className="absolute -right-4 w-8 h-8 rounded-full bg-background border-l border-border"></div>
              <div className="w-full border-t-2 border-dashed border-border mx-4"></div>
            </div>

            {/* QR + Info */}
            <div className="bg-card rounded-b-[32px] p-6 lg:p-10 border-x border-b border-border shadow-xl shadow-black/5">
              <div className="lg:flex lg:items-center lg:gap-10">
                <div className="relative inline-block group shrink-0 mx-auto lg:mx-0">
                  <div className="absolute -inset-4 bg-primary/5 rounded-[40px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <img src={qrCodeUrl} loading="lazy" alt="QR Code" className="w-44 h-44 lg:w-52 lg:h-52 relative z-10 p-2 bg-white rounded-2xl border-2 border-slate-100 invert dark:invert-0" />
                </div>
                <div className="mt-6 lg:mt-0 lg:flex-1 text-center lg:text-left">
                  <p className="text-lg lg:text-xl font-black text-foreground tracking-[0.3em]">#EV-{ticketData.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-[11px] text-muted-foreground font-bold mt-1">Presenta este código QR en la entrada del evento</p>
                  <div className="flex gap-6 mt-6 pt-6 border-t border-border justify-center lg:justify-start">
                    <div className="text-center lg:text-left">
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Cantidad</p>
                      <p className="text-lg font-black text-foreground">x{ticketData.quantity}</p>
                    </div>
                    <div className="text-center lg:text-left">
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Valor</p>
                      <p className="text-lg font-black text-foreground">${ticketData.total_price}</p>
                    </div>
                    <div className="text-center lg:text-left">
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Zona</p>
                      <p className="text-lg font-black text-foreground">{ticketData.zone || 'General'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Right: Actions & Info (spans 2 cols) ═══ */}
        <div className="px-6 lg:px-0 lg:col-span-2 mt-8 lg:mt-0 space-y-6">
          {/* Actions */}
          <div className="bg-card rounded-[32px] border border-border p-6 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Acciones</h3>
            <Button variant="outline" className="w-full h-14 rounded-2xl border-border gap-3 font-bold justify-start text-foreground bg-card hover:bg-secondary" onClick={() => toast.success('Guardado en Apple Wallet')}>
              <Wallet className="w-5 h-5 text-muted-foreground" /> Añadir a Apple Wallet
            </Button>
            <Button variant="outline" className="w-full h-14 rounded-2xl border-border gap-3 font-bold justify-start text-foreground bg-card hover:bg-secondary" onClick={() => toast.info('Descargando PDF...')}>
              <Download className="w-5 h-5 text-muted-foreground" /> Descargar PDF
            </Button>
            <Button variant="outline" className="w-full h-14 rounded-2xl border-border gap-3 font-bold justify-start text-foreground bg-card hover:bg-secondary" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Enlace copiado'); }}>
              <Share2 className="w-5 h-5 text-muted-foreground" /> Copiar enlace
            </Button>
          </div>

          {/* Purchase Info */}
          <div className="bg-card rounded-[32px] border border-border p-6 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Información de compra</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-2xl">
                <span className="text-[11px] font-medium text-muted-foreground">Comprado el</span>
                <span className="text-[11px] font-bold text-foreground">{new Date(ticketData.purchase_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-2xl">
                <span className="text-[11px] font-medium text-muted-foreground">Estado</span>
                <span className="text-[11px] font-bold text-emerald-500">Activo</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-2xl">
                <span className="text-[11px] font-medium text-muted-foreground">Ticket ID</span>
                <span className="text-[11px] font-bold text-foreground font-mono">{ticketData.id.slice(0, 12)}...</span>
              </div>
            </div>
          </div>

          {/* Security Info */}
          <div className="bg-blue-500/5 rounded-[32px] border border-blue-500/10 p-6 flex gap-4">
            <div className="w-10 h-10 rounded-2xl bg-card shadow-sm flex items-center justify-center shrink-0 border border-blue-500/20">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-blue-500">Entrada Protegida</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                Este ticket es personal e intransferible. Asegúrate de tener el brillo de tu pantalla al máximo al escanear.
              </p>
            </div>
          </div>

          {/* Support */}
          <button onClick={() => navigate('/support')} className="w-full py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors text-center">
            ¿Problemas? <span className="text-primary underline">Contactar soporte</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsPage;
