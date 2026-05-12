import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  country: string | null;
  loading: boolean;
  error: string | null;
  permission: PermissionState | null;
}

const CACHE_KEY = 'eventia_location';
const CACHE_DURATION = 1000 * 60 * 30;

const loadCached = (): Partial<LocationState> | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed._cached > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const useLocation = () => {
  const { t } = useTranslation();
  const [location, setLocation] = useState<LocationState>(() => {
    const cached = loadCached();
    if (cached) return { ...cached, loading: false, error: null, permission: 'granted' } as LocationState;
    return { latitude: null, longitude: null, city: null, country: null, loading: true, error: null, permission: null };
  });

  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    return 2 * R * Math.asin(Math.sqrt(
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2
    ));
  }, []);

  const saveLocation = useCallback((lat: number, lng: number, city: string, country: string) => {
    const locData = { latitude: lat, longitude: lng, city, country, _cached: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(locData));
    setLocation(prev => ({ ...prev, ...locData, loading: false, error: null }));
  }, []);

  const requestLocation = useCallback(() => {
    setLocation(prev => ({ ...prev, loading: true, error: null }));
    if (!navigator.geolocation) {
      setLocation(prev => ({ ...prev, loading: false, error: 'Geolocalización no soportada' }));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          .then(r => r.json())
          .then(data => {
            const city = data.address?.city || data.address?.town || data.address?.village || 'Ubicación Desconocida';
            const country = data.address?.country || '';
            saveLocation(latitude, longitude, city, country);
          })
          .catch(() => saveLocation(latitude, longitude, 'Cerca de ti', ''));
      },
      () => { setLocation(prev => ({ ...prev, loading: false, error: 'Permiso de ubicación denegado', permission: 'denied' })); },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
    );
  }, [saveLocation]);

  useEffect(() => {
    if (!localStorage.getItem(CACHE_KEY)) requestLocation();
  }, [requestLocation]);

  return { ...location, requestLocation, setManualLocation: saveLocation, calculateDistance };
};