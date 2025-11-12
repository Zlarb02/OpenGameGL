import { useCallback } from 'react';
import { useHitMarker } from './HitMarkerContext';
import { HitResult } from '../../../core/health';

/**
 * Hook to provide hit marker feedback based on hit results
 */
export function useHitMarkerFeedback() {
  const { addHitMarker } = useHitMarker();

  const showHitMarker = useCallback((hitResult: HitResult) => {
    const isKill = hitResult.wasDeath || hitResult.wasDestroyed;
    addHitMarker(hitResult.targetType, isKill);
  }, [addHitMarker]);

  return { showHitMarker };
}
