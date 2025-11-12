import { useCallback } from 'react';
import { useShootingRaycast, HitResult } from '../shooting/useShootingRaycast';
import { useShootingWithHealth } from '../shooting/useShootingWithHealth';
import { useWeaponState } from '../weapons/useWeaponState';
import { useHitDetection, HitType, HitMarkerData } from './HitDetectionContext';

/**
 * Component that manages hit detection raycasting.
 * Must be placed inside Canvas to have access to useThree.
 */
export function HitDetectionManager() {
  const { isShooting, weaponEquipped } = useWeaponState();
  const { setLastHit, addHitMarker } = useHitDetection();

  // Callback when a shot is fired (for old system compatibility)
  const handleHit = useCallback((result: HitResult) => {
    setLastHit(result);

    // Old hit marker system - kept for backward compatibility
    // New system is handled automatically in useShootingWithHealth
    if (!result.hit) {
      return;
    }

    const hitType: HitType = 'HIT';
    const marker: HitMarkerData = {
      type: hitType,
      timestamp: Date.now(),
      position: { x: 0.5, y: 0.5 }
    };

    // Note: This is the old system. New hit markers are shown via useShootingWithHealth
    // addHitMarker(marker);
  }, [setLastHit, addHitMarker]);

  // Use NEW health-integrated shooting system
  useShootingWithHealth({
    isShooting: weaponEquipped && isShooting,
    damage: 10, // Rifle damage: 10 per shot
    maxDistance: 100
  });

  // This component doesn't render anything
  return null;
}
