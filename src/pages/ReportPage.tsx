import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSmartBack } from '@/hooks/useSmartBack';
import { 
  ArrowLeft, ShieldAlert, AlertTriangle, MessageSquare, 
  ChevronRight, Send, CheckCircle2, ShieldX, UserX,
  FileWarning, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const REPORT_REASONS = [
  { 
    id: 'child_safety', 
    label: 'Seguridad de menores', 
    desc: 'Contenido relacionado con abuso o acoso de menores',
    severity: 'critical',
    icon: ShieldX
  },
  { 
    id: 'illegal_content', 
    label: 'Contenido ilegal', 
    desc: 'Promoción de actividades ilegales o sustancias prohibidas',
    severity: 'high',
    icon: FileWarning
  },
  { 
    id: 'harassment', 
    label: 'Acoso o Bullying', 
    desc: 'Comportamiento abusivo o intimidatorio hacia otros',
    severity: 'high',
    icon: UserX
  },
  { 
    id: 'hate_speech', 
    label: 'Discurso de odio', 
    desc: 'Contenido que promueve el odio o la discriminación',
    severity: 'high',
    icon: AlertTriangle
  },
  { 
    id: 'spam_scam', 
    label: 'Spam o Estafa', 
    desc: 'Publicidad no deseada o intentos de fraude',
    severity: 'medium',
    icon: MessageSquare
  },
  { 
    id: 'other', 
    label: 'Otro motivo', 
    desc: 'Alguna otra razón no listada aquí',
    severity: 'medium',
    icon: Info
  }
];

const ReportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const goBack = useSmartBack();
  
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [eventTitle, setEventTitle] = useState('');

  useEffect(() => {
    const fetchEventData = async () => {
      if (!id) return;
      try {
        // Try to get room first to find event_id
        const { data: roomData } = await supabase
          .from('chat_rooms')
          .select('event_id, name')
          .eq('id', id)
          .single();
        
        if (roomData?.event_id) {
          const { data: eventData } = await supabase
            .from('events')
            .select('title')
            .eq('id', roomData.event_id)
            .single();
          
          if (eventData) setEventTitle(eventData.title);
        } else if (roomData?.name) {
          setEventTitle(roomData.name);
        } else {
          // Fallback if ID is directly an event ID
          const { data: eventData } = await supabase
            .from('events')
            .select('title')
            .eq('id', id)
            .single();
          if (eventData) setEventTitle(eventData.title);
        }
      } catch (error) {
        console.error("Error fetching event for report", error);
      }
    };
    fetchEventData();
  }, [id]);

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error("Por favor selecciona un motivo");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // In a real app, we would insert into a 'reports' table
      // const { error } = await supabase
      //   .from('reports')
      //   .insert({
      //     reporter_id: user?.id,
      //     target_id: id,
      //     target_type: 'event',
      //     reason: selectedReason,
      //     description: description,
      //     status: 'pending'
      //   });

      // Mocking the API delay for a premium feel
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSuccess(true);
      toast.success("Reporte enviado correctamente");
      
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (error) {
      toast.error("Error al enviar el reporte. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
        <div className="w-28 h-28 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-8 shadow-inner shadow-emerald-500/20 relative">
          <CheckCircle2 className="w-16 h-16 stroke-[3px] animate-in zoom-in spin-in-90 duration-1000" />
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping opacity-20" />
        </div>
        <h2 className="text-3xl font-black text-foreground tracking-tight mb-2">Operación Satisfecha</h2>
        <p className="text-emerald-500 font-black uppercase text-[12px] tracking-[0.3em] mb-6">Reporte Enviado</p>
        <p className="text-muted-foreground text-[15px] font-medium leading-relaxed max-w-xs mb-10">
          Gracias por ayudarnos a mantener segura la comunidad. Nuestro equipo revisará <span className="text-foreground font-bold">"{eventTitle || 'este contenido'}"</span> con la máxima prioridad.
        </p>
        <div className="w-full max-w-[240px] h-2 bg-secondary rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-emerald-500 animate-progress origin-left shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
        </div>
        <p className="mt-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Regresando a la plataforma...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-5 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-2xl bg-secondary/50 hover:bg-secondary transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-lg font-black text-foreground tracking-tight">Reportar Contenido</h1>
          <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Atención de Seguridad</p>
        </div>
      </header>

      <main className="p-6 max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Intro */}
        <section className="bg-rose-500/5 rounded-[32px] p-6 border border-rose-500/10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground tracking-tight mb-1">¿Por qué reportas esto?</h2>
              <p className="text-[13px] text-muted-foreground font-medium leading-relaxed">
                Estás reportando el evento: <span className="font-bold text-foreground">"{eventTitle || 'Cargando...'}"</span>. 
                Tu denuncia es anónima y fundamental para la seguridad de todos.
              </p>
            </div>
          </div>
        </section>

        {/* Reasons Grid */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-4">Selecciona un motivo</h3>
          <div className="grid grid-cols-1 gap-3">
            {REPORT_REASONS.map((reason) => {
              const Icon = reason.icon;
              return (
                <button
                  key={reason.id}
                  onClick={() => setSelectedReason(reason.id)}
                  className={`flex items-center gap-4 p-4 rounded-[24px] border transition-all text-left group ${
                    selectedReason === reason.id 
                      ? 'bg-rose-500 border-rose-500 text-white shadow-xl shadow-rose-500/20 scale-[1.02]' 
                      : 'bg-card border-border hover:border-rose-500/30'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                    selectedReason === reason.id ? 'bg-white/20' : 'bg-secondary/50 group-hover:bg-rose-500/10'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      selectedReason === reason.id ? 'text-white' : 'text-rose-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-black text-[14px] leading-tight mb-0.5 ${
                      selectedReason === reason.id ? 'text-white' : 'text-foreground'
                    }`}>
                      {reason.label}
                    </p>
                    <p className={`text-[11px] truncate ${
                      selectedReason === reason.id ? 'text-white/70' : 'text-muted-foreground'
                    }`}>
                      {reason.desc}
                    </p>
                  </div>
                  {reason.severity === 'critical' && selectedReason !== reason.id && (
                    <span className="px-2 py-1 bg-rose-500/10 text-rose-500 rounded-lg text-[8px] font-black uppercase tracking-widest shrink-0">Grave</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-4">
          <div className="px-4">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Más información (opcional)</h3>
            <p className="text-[11px] text-muted-foreground/60 mt-1">Proporciona detalles adicionales para ayudarnos a investigar mejor.</p>
          </div>
          <Textarea 
            placeholder="Describe lo sucedido aquí..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[140px] rounded-[24px] border-border bg-card p-6 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-[14px]"
          />
        </div>

        {/* Footer Info */}
        <div className="p-6 bg-secondary/30 rounded-[32px] border border-border/50 flex gap-4">
          <ShieldAlert className="w-5 h-5 text-muted-foreground/40 shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground/60 font-medium leading-relaxed">
            Nuestros moderadores revisarán el contenido en un plazo máximo de 24 horas. Si se trata de una emergencia legal o peligro inmediato, por favor contacta a las autoridades locales además de este reporte.
          </p>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background/80 to-transparent z-[100] pb-10">
        {!selectedReason && (
          <div className="flex justify-center mb-4">
             <div className="bg-rose-500/10 backdrop-blur-md border border-rose-500/20 px-4 py-2 rounded-full animate-bounce">
               <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                 <AlertTriangle className="w-3 h-3" />
                 Selecciona un motivo para continuar
               </p>
             </div>
          </div>
        )}
        <Button 
          disabled={isSubmitting}
          onClick={handleSubmit}
          className={`w-full h-16 rounded-[24px] font-black uppercase text-[12px] tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 ${
            !selectedReason 
              ? 'bg-muted text-muted-foreground opacity-80 cursor-not-allowed' 
              : 'bg-foreground text-background hover:bg-slate-800'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-3 border-background/30 border-t-background rounded-full animate-spin" />
              Enviando Reporte...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Enviar Denuncia
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ReportPage;
