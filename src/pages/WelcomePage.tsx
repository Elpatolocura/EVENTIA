import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, Sparkles, MapPin, Ticket } from 'lucide-react';

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/eventia_welcome_bg_1776577135770.png" 
          loading="lazy"
          alt="Welcome" 
          className="h-full w-full object-cover opacity-60 scale-105 animate-pulse-slow"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex h-full min-h-screen flex-col justify-end px-8 pb-16 pt-12">
        
        {/* Logo Section */}
        <div className="absolute top-12 left-8 flex items-center gap-2 animate-fade-in">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">EVENTIA</span>
        </div>

        {/* Main Text */}
        <div className="space-y-4 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
            <MapPin className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Tu ciudad te espera</span>
          </div>
          
          <h1 className="text-[44px] font-black leading-[1.1] tracking-tight text-white">
            Descubre <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-cyan-400">
              Momentos 
            </span> <br />
            Inolvidables
          </h1>
          
          <p className="max-w-[280px] text-lg font-medium leading-relaxed text-slate-300">
            Encuentra los mejores eventos locales y conecta con tu comunidad.
          </p>
        </div>

        {/* Actions Section */}
        <div className="mt-12 space-y-6 animate-fade-in-up delay-200">
          <Button 
            onClick={() => navigate('/auth')}
            className="group relative h-20 w-full overflow-hidden rounded-[28px] bg-gradient-to-r from-primary to-indigo-600 p-[2px] active:scale-[0.98] transition-all shadow-2xl shadow-primary/40"
          >
            <div className="flex h-full w-full items-center justify-center rounded-[26px] bg-white transition-colors group-hover:bg-transparent">
              <span className="flex items-center justify-center gap-3 text-xl font-black tracking-tight text-slate-950 transition-colors group-hover:text-white">
                ¡Quiero vivir la aventura!
                <ChevronRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Button>

          <p className="text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest pt-2">
            Al continuar, aceptas nuestros <br />
            <span className="text-white/60 underline cursor-pointer hover:text-primary transition-colors">Términos y Condiciones</span>
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />
      <div className="absolute top-1/2 -left-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-[100px]" />
    </div>
  );
};

export default WelcomePage;
