import { useCallback } from 'react';
import { useShootingRaycast, HitResult } from '../shooting/useShootingRaycast';
import { useWeaponState } from '../weapons/useWeaponState';
import { useHitDetection, HitType, HitMarkerData } from './HitDetectionContext';

/**
 * Component that manages hit detection raycasting.
 * Must be placed inside Canvas to have access to useThree.
 */
export function HitDetectionManager() {
  const { isShooting, weaponEquipped } = useWeaponState();
  const { setLastHit, addHitMarker } = useHitDetection();

  // Callback when a shot is fired
  const handleHit = useCallback((result: HitResult) => {
    setLastHit(result);

    if (!result.hit) {
      return;
    }

    // Determine hit type (for now, everything is just a HIT)
    // Later, we can check object properties/tags to determine KILL vs HIT
    // For example: if object.userData.isEnemy && object.userData.health <= damage
    const hitType: HitType = 'HIT';

    // Add hit marker at screen center
    const marker: HitMarkerData = {
      type: hitType,
      timestamp: Date.now(),
      position: { x: 0.5, y: 0.5 } // Center of screen (normalized 0-1)
    };

    addHitMarker(marker);
  }, [setLastHit, addHitMarker]);

  // Use raycasting hook only when weapon is equipped
  useShootingRaycast({
    isShooting: weaponEquipped && isShooting,
    onHit: handleHit,
    maxDistance: 100
  });

  // This component doesn't render anything
  return null;
}
