import React, { createContext, useContext, useState, useCallback } from 'react';
import { HitResult } from '../shooting/useShootingRaycast';

export type HitType = 'NONE' | 'HIT' | 'KILL';

export type HitMarkerData = {
  type: HitType;
  timestamp: number;
  position?: { x: number; y: number }; // Screen position for displaying marker
};

type HitDetectionContextType = {
  lastHit: HitResult | null;
  hitMarkers: HitMarkerData[];
  setLastHit: (hit: HitResult) => void;
  addHitMarker: (marker: HitMarkerData) => void;
};

const HitDetectionContext = createContext<HitDetectionContextType | undefined>(undefined);

export function HitDetectionProvider({ children }: { children: React.ReactNode }) {
  const [hitMarkers, setHitMarkers] = useState<HitMarkerData[]>([]);
  const [lastHit, setLastHit] = useState<HitResult | null>(null);

  const addHitMarker = useCallback((marker: HitMarkerData) => {
    setHitMarkers(prev => [...prev, marker]);

    // Remove hit marker after animation duration (e.g., 1 second)
    setTimeout(() => {
      setHitMarkers(prev => prev.filter(m => m.timestamp !== marker.timestamp));
    }, 1000);
  }, []);

  return (
    <HitDetectionContext.Provider
      value={{
        lastHit,
        hitMarkers,
        setLastHit,
        addHitMarker
      }}
    >
      {children}
    </HitDetectionContext.Provider>
  );
}

export function useHitDetection() {
  const context = useContext(HitDetectionContext);
  if (context === undefined) {
    throw new Error('useHitDetection must be used within a HitDetectionProvider');
  }
  return context;
}
