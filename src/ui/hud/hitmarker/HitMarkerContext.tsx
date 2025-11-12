import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { HitMarkerData } from './HitMarkerTypes';
import { HealthTargetType } from '../../../core/health';

interface HitMarkerContextValue {
  hitMarkers: HitMarkerData[];
  addHitMarker: (targetType: HealthTargetType, isKill: boolean) => void;
  removeHitMarker: (id: string) => void;
}

const HitMarkerContext = createContext<HitMarkerContextValue | null>(null);

export function HitMarkerProvider({ children }: { children: ReactNode }) {
  const [hitMarkers, setHitMarkers] = useState<HitMarkerData[]>([]);

  const addHitMarker = useCallback((targetType: HealthTargetType, isKill: boolean) => {
    const id = `${Date.now()}-${Math.random()}`;
    const newMarker: HitMarkerData = {
      id,
      targetType,
      isKill,
      timestamp: Date.now()
    };

    setHitMarkers(prev => [...prev, newMarker]);

    // Auto-remove after animation (500ms)
    setTimeout(() => {
      setHitMarkers(prev => prev.filter(m => m.id !== id));
    }, 500);
  }, []);

  const removeHitMarker = useCallback((id: string) => {
    setHitMarkers(prev => prev.filter(m => m.id !== id));
  }, []);

  return (
    <HitMarkerContext.Provider value={{ hitMarkers, addHitMarker, removeHitMarker }}>
      {children}
    </HitMarkerContext.Provider>
  );
}

export function useHitMarker() {
  const context = useContext(HitMarkerContext);
  if (!context) {
    throw new Error('useHitMarker must be used within HitMarkerProvider');
  }
  return context;
}
