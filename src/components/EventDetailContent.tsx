import React, { memo } from 'react';
import { Star } from 'lucide-react';

export const Description = memo(({ description, isExpanded, onToggle }: {
  description: string;
  isExpanded: boolean;
  onToggle: () => void;
}) => (
  <div className="px-1">
    <h2 className="text-lg lg:text-xl font-black text-foreground tracking-tight mb-3">Descripción</h2>
    <div className="relative">
      <p className={`text-muted-foreground text-[13px] lg:text-[15px] leading-relaxed font-medium transition-all duration-300 ${!isExpanded ? 'line-clamp-[6]' : ''}`}>
        {description}
      </p>
      {description && description.length > 300 && (
        <button onClick={onToggle} className="text-primary text-[11px] font-black uppercase tracking-widest mt-2 hover:underline">
          {isExpanded ? 'Ver menos' : 'Ver más'}
        </button>
      )}
    </div>
  </div>
));

export const ReviewsSummary = memo(({ reviews, onClick }: { reviews: any[]; onClick: () => void }) => {
  const avgRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;
  return (
    <div onClick={onClick} className="mx-1 p-5 bg-secondary/20 rounded-[32px] border border-border flex items-center justify-between cursor-pointer hover:bg-secondary/40 transition-all active:scale-[0.98]">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-card flex items-center justify-center text-amber-500 shadow-sm border border-border">
          <Star className="w-6 h-6 fill-current" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-black text-foreground">{avgRating.toFixed(1)}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-3 h-3 ${s <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
              ))}
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
            {reviews.length} {reviews.length === 1 ? 'Reseña' : 'Reseñas'} de la comunidad
          </p>
        </div>
      </div>
    </div>
  );
});

export const OrganizerCard = memo(({ organizerProfile, organizerId, onNavigate }: {
  organizerProfile: any;
  organizerId: string;
  onNavigate: (path: string) => void;
}) => (
  <div onClick={() => onNavigate(`/profile/u/${organizerId}`)} className="bg-card rounded-[32px] border border-border shadow-sm p-5 cursor-pointer hover:bg-secondary/30 transition-all">
    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-3">Organizador</p>
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-muted border border-border shrink-0">
        <img src={organizerProfile?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'} loading="lazy" alt="Organizer" className="w-full h-full object-cover rounded-2xl" width={56} height={56} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-black text-foreground truncate">{organizerProfile?.full_name || 'Organizador'}</h3>
        <p className="text-xs text-muted-foreground font-medium">Organizador del evento</p>
      </div>
    </div>
  </div>
));

export const AmenitiesSection = memo(({ amenities }: { amenities: any[] }) => {
  if (!amenities?.length) return null;
  return (
    <div className="px-1 pb-4">
      <h2 className="text-lg lg:text-xl font-black text-foreground tracking-tight mb-4">Servicios Incluidos</h2>
      <div className="flex flex-wrap gap-2.5">
        {amenities.map((item: any, idx: number) => (
          <div key={item.key || idx} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-border bg-card text-foreground/80">
            <span className="text-[11px] font-black uppercase tracking-wider">{item.label || item.key}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

export const AttendeesCard = memo(({ followers, ticketsSold }: { followers: string[]; ticketsSold: number }) => (
  <div className="bg-card rounded-[32px] border border-border shadow-sm p-5">
    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-3">Asistentes</p>
    <div className="flex items-center gap-3">
      <div className="flex -space-x-3">
        {followers.length > 0 ? followers.slice(0, 5).map((avatar, i) => (
          <div key={`follow-${i}`} className="w-10 h-10 rounded-full border-4 border-background overflow-hidden bg-muted shadow-sm">
            <img src={avatar} loading="lazy" alt="Follower" className="w-full h-full object-cover" width={40} height={40} />
          </div>
        )) : [1, 2, 3].map(i => (
          <div key={`skeleton-${i}`} className="w-10 h-10 rounded-full border-4 border-background bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-xs">?</span>
          </div>
        ))}
      </div>
      <span className="text-sm font-black text-foreground">{ticketsSold} {ticketsSold === 1 ? 'asistente' : 'asistentes'}</span>
    </div>
  </div>
));

export const GalleryDialog = memo(({ open, setOpen, images, currentIndex, setCurrentIndex }: {
  open: boolean;
  setOpen: (v: boolean) => void;
  images: string[];
  currentIndex: number;
  setCurrentIndex: (v: number) => void;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={() => setOpen(false)}>
      <button onClick={() => setOpen(false)} className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md transition-all z-50">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      <img
        key={currentIndex}
        src={images[currentIndex]}
        alt={`Foto ${currentIndex + 1}`}
        className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
        loading="lazy"
      />
      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); setCurrentIndex(currentIndex > 0 ? currentIndex - 1 : images.length - 1); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); setCurrentIndex(currentIndex < images.length - 1 ? currentIndex + 1 : 0); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </>
      )}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
        {images.map((_, idx) => (
          <button key={`dot-${idx}`} onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
            className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-primary w-4' : 'bg-white/40'}`} />
        ))}
      </div>
    </div>
  );
});
