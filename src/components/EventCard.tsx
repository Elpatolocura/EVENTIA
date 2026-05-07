import React, { memo } from 'react';
import { EventData } from '@/types';
import { Heart, MapPin, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';

interface EventCardProps {
  event: EventData;
  variant?: 'large' | 'small';
  isFavorite?: boolean;
  onFavoriteToggle?: (e: React.MouseEvent) => void;
}

const EventCard = ({ event, variant = 'large', isFavorite: isFavProp, onFavoriteToggle }: EventCardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();


  if (variant === 'small') {
    return (
      <button
        onClick={() => navigate(`/event/${event.id}`)}
        className="bg-card rounded-2xl p-3.5 border border-border text-left min-w-[150px] flex-shrink-0 transition-shadow hover:shadow-md will-change-transform"
      >
        <div className="h-16 w-full bg-secondary rounded-xl overflow-hidden mb-2">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              {event.emoji || '📅'}
            </div>
          )}
        </div>
        <p className="font-semibold text-foreground text-sm leading-tight truncate">{event.title}</p>
        <p className="text-muted-foreground text-[10px] mt-1">
          {event.event_date || event.date}
        </p>
        {event.distance_km !== undefined && event.distance_km < 999999 && (
          <div className="flex items-center gap-1 mt-1 text-primary">
            <MapPin className="w-3 h-3" />
            <span className="text-[10px] font-medium">{event.distance_km < 1 ? '< 1' : Math.round(event.distance_km)} km</span>
          </div>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate(`/event/${event.id}`)}
      className="bg-card rounded-2xl overflow-hidden border border-border text-left w-full transition-shadow hover:shadow-md will-change-transform"
    >
      <div className="h-40 bg-secondary flex items-center justify-center text-5xl relative overflow-hidden">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-foreground/80 to-foreground/40 text-white">
            {event.emoji || '📅'}
          </div>
        )}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="bg-background/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-wider shadow-sm w-fit">
            {event.category}
          </div>
          {event.distance_km !== undefined && event.distance_km < 999999 && (
            <div className="bg-primary/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full font-bold text-[10px] flex items-center gap-1 w-fit shadow-sm">
              <MapPin className="w-3 h-3" />
              {event.distance_km < 1 ? '< 1' : Math.round(event.distance_km)} km
            </div>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <div
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle?.(e);
            }}
            role="button"
            tabIndex={0}
            className={`w-10 h-10 rounded-xl backdrop-blur-md flex items-center justify-center transition-all border cursor-pointer ${
              isFavProp
                ? 'bg-red-500 border-red-500 text-white'
                : 'bg-white/10 border-white/10 text-white hover:bg-white hover:text-red-500'
            }`}
          >
            <Heart
              className={`w-4 h-4 ${isFavProp ? 'fill-current' : ''}`}
            />
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-base leading-tight truncate">{event.title}</h3>
            <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1.5">
              <span>{event.event_date || event.date}</span>
              <span>·</span>
              <span>{event.event_time || event.time}</span>
              {event.location && (
                <>
                  <span>·</span>
                  <span className="truncate max-w-[100px]">{event.location.split(',')[0]}</span>
                </>
              )}
            </p>
          </div>
          <div className="bg-accent/10 text-accent px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 ml-2">
            {!event.price || Number(event.price) === 0 ? t('common.free') : `$${event.price}`}

          </div>
        </div>
        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{event.attendees_count || event.attendees || 0} {t('event_detail.attendees')}</span>
          </div>
          <span className="text-xs font-semibold text-foreground bg-secondary px-3 py-1.5 rounded-lg">
            {t('common.view_more')}
          </span>
        </div>
      </div>
    </button>
  );
};

// Memoize: skip re-renders if favorite state and key event fields haven't changed.
export default memo(EventCard, (prev, next) => {
  return (
    prev.event.id === next.event.id &&
    prev.event.title === next.event.title &&
    prev.event.image_url === next.event.image_url &&
    prev.event.attendees_count === next.event.attendees_count &&
    prev.event.attendees === next.event.attendees &&
    prev.event.distance_km === next.event.distance_km &&
    prev.event.price === next.event.price &&
    prev.event.event_date === next.event.event_date &&
    prev.event.event_time === next.event.event_time &&
    prev.isFavorite === next.isFavorite &&
    prev.variant === next.variant
  );
});
