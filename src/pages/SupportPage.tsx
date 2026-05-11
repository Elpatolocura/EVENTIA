import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartBack } from '@/hooks/useSmartBack';
import { 
  ArrowLeft, MessageCircle, Mail, Phone, ExternalLink, 
  Search, ChevronRight, HelpCircle, AlertCircle, ShieldCheck, 
  MessageSquare, Clock, BookOpen, Zap, Star, Shield, 
  Headphones, Users, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

const FAQItem = ({ title, description }: { title: string, description: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className={`p-1 bg-card rounded-3xl border transition-all duration-300 ${
        isOpen ? 'border-primary/20 shadow-lg shadow-primary/5' : 'border-border shadow-sm'
      }`}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left group"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
            isOpen ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'
          }`}>
            <HelpCircle className="w-4 h-4" />
          </div>
          <h3 className="text-[14px] font-bold tracking-tight text-foreground">{title}</h3>
        </div>
        <ChevronRight className={`w-5 h-5 text-muted-foreground/30 transition-transform duration-300 ${isOpen ? 'rotate-90 text-primary' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="px-5 pb-5 pt-1 animate-in slide-in-from-top-2 duration-300">
          <p className="text-[12px] text-muted-foreground leading-relaxed font-medium pl-11 border-l-2 border-border">
            {description}
          </p>
        </div>
      )}
    </div>
  );
};

const SupportPage = () => {
  const navigate = useNavigate();
  const goBack = useSmartBack('/settings');
  const [activeBenefit, setActiveBenefit] = useState(0);

  const faqs = [
    { title: "¿Mi ticket no aparece?", description: "Normalmente tarda hasta 5 minutos. Revisa tu historial de compras o la bandeja de spam de tu correo electrónico registrado." },
    { title: "¿Puedo pedir un reembolso?", description: "Las políticas de reembolso son establecidas por cada organizador. Generalmente se permiten hasta 48h antes del inicio del evento." },
    { title: "¿Cómo cambio el nombre del ticket?", description: "En eventos nominativos, puedes realizar un cambio de titular desde la sección Ajustes > Mis Entradas > Editar, sujeto a disponibilidad del organizador." },
    { title: "El QR no escanea", description: "Asegúrate de que el brillo de tu pantalla esté al máximo. Si el problema persiste, muestra tu ID de orden y documento de identidad en el mostrador de soporte del evento." },
  ];

  const contactMethods = [
    { 
      icon: <MessageCircle className="w-6 h-6 text-green-500" />, 
      title: "WhatsApp Live", 
      desc: "Respuesta en < 5 min", 
      color: "bg-green-50" 
    },
    { 
      icon: <MessageSquare className="w-6 h-6 text-blue-500" />, 
      title: "Chat en Vivo", 
      desc: "Disponible ahora", 
      color: "bg-blue-50" 
    },
    { 
      icon: <Mail className="w-6 h-6 text-purple-500" />, 
      title: "Correo Electrónico", 
      desc: "Respuesta en 24h", 
      color: "bg-purple-50" 
    },
  ];

  const premiumFeatures = [
    { icon: <Zap className="w-5 h-5" />, title: "Prioridad Absoluta", color: "bg-amber-100 text-amber-600", desc: "Tus tickets saltan al principio de la fila de atención." },
    { icon: <Headphones className="w-5 h-5" />, title: "Agentes Dedicados", color: "bg-blue-100 text-blue-600", desc: "Personal experto asignado exclusivamente para resolver tu caso." },
    { icon: <Shield className="w-5 h-5" />, title: "Protección Total", color: "bg-emerald-100 text-emerald-600", desc: "Garantía de resolución oficial en menos de 30 minutos." },
    { icon: <Users className="w-5 h-5" />, title: "Multi-canal VIP", color: "bg-purple-100 text-purple-600", desc: "Acceso exclusivo a líneas de atención prioritarias." },
  ];

  return (
    <div className="min-h-screen bg-background pb-12 animate-fade-in">
      {/* Fixed Header with Glassmorphism */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border p-6 shadow-sm">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={goBack} 
              className="lg:hidden p-2.5 rounded-2xl bg-card shadow-sm border border-border flex items-center justify-center hover:bg-secondary active:scale-90 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-xl font-black text-foreground tracking-tight">Centro de Ayuda</h1>
          </div>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="¿En qué podemos ayudarte?" 
              className="pl-12 h-14 rounded-2xl border-border bg-card focus-visible:ring-primary/20 text-sm font-medium shadow-none"
            />
          </div>
        </div>
      </div>

      <div className="p-6 max-w-xl mx-auto space-y-6">
        {/* Compact Premium Banner */}
        <div className="bg-slate-900 rounded-[28px] p-4 flex items-center gap-4 relative overflow-hidden shadow-xl shadow-slate-900/10">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 backdrop-blur-sm">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[13px] font-black text-white leading-tight uppercase tracking-tight">Soporte 24/7 Premium</h3>
            <p className="text-[10px] text-slate-400 font-bold truncate">Asistencia prioritaria activada</p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="ghost"
                size="sm"
                className="h-9 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[9px] font-black uppercase tracking-widest border border-white/10"
              >
                Info
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[40px] border-none bg-background p-0 overflow-hidden max-w-[320px] w-[90%] mx-auto shadow-2xl animate-in zoom-in-95 duration-300">
              <DialogClose className="absolute right-4 top-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all active:scale-90">
                <X className="w-4 h-4 text-white" />
              </DialogClose>
              
              <div className="bg-slate-900 p-6 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3 border border-white/10 backdrop-blur-sm">
                  <Star className="w-6 h-6 text-white fill-white" />
                </div>
                <DialogTitle className="text-lg font-black text-white mb-1 uppercase tracking-tighter">Beneficios VIP</DialogTitle>
                <DialogDescription className="text-slate-400 text-[11px] font-medium px-2 leading-tight">
                  Toca un icono para ver los detalles.
                </DialogDescription>
              </div>

              <div className="p-6 space-y-6">
                {/* Grouped Icons */}
                <div className="flex justify-between items-center px-2">
                  {premiumFeatures.map((feat, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveBenefit(idx)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-75 ${
                        activeBenefit === idx 
                          ? `${feat.color} shadow-lg scale-110 ring-2 ring-offset-2 ring-primary/20` 
                          : 'bg-secondary text-muted-foreground/30 hover:bg-secondary/80'
                      }`}
                    >
                      {React.cloneElement(feat.icon as React.ReactElement, { 
                        className: `w-5 h-5 transition-colors ${activeBenefit === idx ? '' : 'text-slate-300'}` 
                      })}
                    </button>
                  ))}
                </div>

                {/* Interactive Detail Area */}
                <div className="bg-secondary/50 rounded-3xl p-5 min-h-[100px] flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h4 className="text-[13px] font-black text-foreground uppercase tracking-tight mb-2">
                    {premiumFeatures[activeBenefit].title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground font-bold leading-relaxed px-2">
                    {premiumFeatures[activeBenefit].desc}
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Contact Grid - Compact Cards with Strategic Speed Badge */}
        <section>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[11px] font-black text-foreground uppercase tracking-[0.15em] ml-1">Atención Directa</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20 shadow-sm">
                <Zap className="w-3 h-3 text-blue-500 fill-blue-500" />
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-wider">4 min</span>
              </div>
              <div className="flex items-center gap-1.5 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[9px] font-black text-green-500 uppercase tracking-wider">Online</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {contactMethods.map((method, idx) => (
              <button 
                key={idx}
                onClick={() => toast.success(`Conectando con ${method.title}...`)}
                className="flex flex-col items-center justify-center p-4 bg-card rounded-[32px] border border-border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all active:scale-90 text-center group gap-3"
              >
                <div className={`w-12 h-12 rounded-2xl ${method.color.replace('50', '500/20')} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300`}>
                  {React.cloneElement(method.icon as React.ReactElement, { className: 'w-5 h-5' })}
                </div>
                <h3 className="text-[11px] font-black text-foreground leading-tight uppercase tracking-tighter">
                  {method.title.split(' ')[0]}<br/>
                  <span className="text-muted-foreground font-bold">{method.title.split(' ')[1] || ''}</span>
                </h3>
              </button>
            ))}
          </div>
        </section>

        {/* Popular Questions */}
        <section>
          <h2 className="text-[11px] font-black text-foreground uppercase tracking-[0.15em] mb-4 ml-1">Preguntas Frecuentes</h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <FAQItem key={idx} title={faq.title} description={faq.description} />
            ))}
          </div>
        </section>

        {/* Knowledge Base Link */}
        <button 
          onClick={() => navigate('/knowledge-base')}
          className="w-full flex items-center justify-between p-5 bg-card rounded-3xl border border-border shadow-sm hover:border-primary/30 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-[13px] font-bold text-foreground">Base de conocimientos</h4>
              <p className="text-[10px] text-muted-foreground font-medium">Guías detalladas y tutoriales</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
        </button>

        {/* Footer Support Tagline */}
        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] pt-4">
          Eventia Support Team
        </p>
      </div>
    </div>
  );
};

export default SupportPage;
