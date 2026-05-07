import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Heart, Calendar, MapPin,
  Sparkles, Clock, Loader2, DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

export type FilterType = 'featured' | 'popular' | 'today' | 'tomorrow' | 'nearby' | 'all';
export type PriceFilterType = 'all' | 'free' | 'paid';

interface EventFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  priceFilter: PriceFilterType;
  onPriceFilterChange: (priceFilter: PriceFilterType) => void;
  eventCount: number;
  isLoading?: boolean;
  userLocation?: {
    latitude: number;
    longitude: number;
    city?: string;
  };
}

const EventFilters: React.FC<EventFiltersProps> = ({
  activeFilter,
  onFilterChange,
  priceFilter,
  onPriceFilterChange,
  eventCount,
  isLoading = false,
  userLocation
}) => {
  const filters = useMemo(() => [
    {
      id: 'featured' as FilterType,
      label: 'Destacados',
      icon: Sparkles,
      color: 'from-yellow-400 to-yellow-600',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      description: 'Eventos recientes'
    },
    {
      id: 'popular' as FilterType,
      label: 'Populares',
      icon: Heart,
      color: 'from-red-400 to-red-600',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      description: 'Más asistentes'
    },
    {
      id: 'today' as FilterType,
      label: 'Hoy',
      icon: Calendar,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      description: 'Para hoy'
    },
    {
      id: 'tomorrow' as FilterType,
      label: 'Mañana',
      icon: Clock,
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      description: 'Para mañana'
    },
    {
      id: 'nearby' as FilterType,
      label: 'Cerca',
      icon: MapPin,
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      description: userLocation?.city ? `En ${userLocation.city}` : 'Con ubicación'
    },
    {
      id: 'all' as FilterType,
      label: 'Todos',
      icon: Star,
      color: 'from-gray-400 to-gray-600',
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-gray-500/20',
      description: 'Todos los eventos'
    }
  ], [userLocation?.city]);

  const priceFilters = useMemo(() => [
    {
      id: 'all' as PriceFilterType,
      label: 'Cualquier precio',
      icon: DollarSign,
      description: 'Todos los precios'
    },
    {
      id: 'free' as PriceFilterType,
      label: 'Gratis',
      icon: Star,
      description: 'Sin costo'
    },
    {
      id: 'paid' as PriceFilterType,
      label: 'De pago',
      icon: DollarSign,
      description: 'Con costo'
    }
  ], []);

  return (
    <div className="px-6 py-4 space-y-6">
      {/* Filter Tabs */}
      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;

            return (
              <motion.button
                key={filter.id}
                onClick={() => onFilterChange(filter.id)}
                className={`
                  relative flex-shrink-0 px-4 py-3 rounded-xl border transition-all duration-200
                  ${isActive
                    ? `bg-gradient-to-r ${filter.color} text-white border-transparent shadow-lg`
                    : `bg-card text-muted-foreground border-border hover:border-border/80 ${filter.bgColor} hover:shadow-md`
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex flex-col items-center gap-1.5 min-w-[60px]">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-current'}`} />
                  <div className="text-center">
                    <div className={`text-xs font-bold leading-tight ${isActive ? 'text-white' : 'text-current'}`}>
                      {filter.label}
                    </div>
                    <div className={`text-[10px] leading-tight mt-0.5 ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
                      {filter.description}
                    </div>
                  </div>
                </div>

                {/* Active indicator */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center"
                    >
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${filter.color}`} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        {/* Price Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {priceFilters.map((priceFilterOption) => {
            const Icon = priceFilterOption.icon;
            const isActive = priceFilter === priceFilterOption.id;

            return (
              <motion.button
                key={priceFilterOption.id}
                onClick={() => onPriceFilterChange(priceFilterOption.id)}
                className={`
                  relative flex-shrink-0 px-4 py-2 rounded-lg border transition-all duration-200
                  ${isActive
                    ? 'bg-foreground text-background border-foreground shadow-lg shadow-foreground/20'
                    : 'bg-card text-muted-foreground border-border hover:border-border/80 hover:shadow-md'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-background' : 'text-current'}`} />
                  <span className={`text-xs font-bold ${isActive ? 'text-background' : 'text-current'}`}>
                    {priceFilterOption.label}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Results Counter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Cargando eventos...</span>
            </>
          ) : (
            <>
              <Badge variant="secondary" className="text-xs">
                {eventCount} {eventCount === 1 ? 'evento' : 'eventos'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {activeFilter === 'all' ? 'Todos los eventos disponibles' :
                 activeFilter === 'featured' ? 'Eventos más recientes' :
                 activeFilter === 'popular' ? 'Eventos con más asistentes' :
                 activeFilter === 'today' ? 'Eventos programados para hoy' :
                 activeFilter === 'tomorrow' ? 'Eventos programados para mañana' :
                 'Eventos con ubicación definida'}
              </span>
            </>
          )}
        </div>

        {/* Clear Filter Button */}
        {(activeFilter !== 'all' || priceFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onFilterChange('all');
              onPriceFilterChange('all');
            }}
            className="text-xs h-8 px-3"
          >
            Ver todos
          </Button>
        )}
      </div>
    </div>
  );
};

export default EventFilters;