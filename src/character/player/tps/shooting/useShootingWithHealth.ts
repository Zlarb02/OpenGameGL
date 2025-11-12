import { useCallback } from 'react';
import { useShootingRaycast, HitResult as RaycastHitResult } from './useShootingRaycast';
import { useHitMarkerFeedback } from '../../../../ui/hud/hitmarker';
import { HealthHandle, DamageInfo, HealthTargetType } from '../../../../core/health';
import { useWeaponState } from '../weapons/useWeaponState';

interface ShootingWithHealthProps {
  isShooting: boolean;
  damage?: number;
  maxDistance?: number;
  normalSpread?: number; // Dispersion sans visée (en degrés)
  adsSpread?: number; // Dispersion avec visée (en degrés)
}

/**
 * Enhanced shooting hook that integrates with Health system
 * Handles raycast, damage application, and hit marker feedback
 * Spread is reduced when aiming for better accuracy
 */
export function useShootingWithHealth({
  isShooting,
  damage = 25,
  maxDistance = 100,
  normalSpread = 1.5, // ~1.5° de dispersion normale
  adsSpread = 0.3 // ~0.3° de dispersion en visée (5x plus précis)
}: ShootingWithHealthProps) {
  const { showHitMarker } = useHitMarkerFeedback();
  const { isAiming, weaponEquipped } = useWeaponState();

  // Calculer le spread actuel basé sur l'état de visée
  const currentSpread = (weaponEquipped && isAiming) ? adsSpread : normalSpread;

  const handleHit = useCallback((raycastResult: RaycastHitResult) => {
    if (!raycastResult.hit || !raycastResult.object) return;

    // Spawn impact particles at hit location
    if (raycastResult.point) {
      if (typeof window !== 'undefined' && (window as any).__spawnImpactParticles) {
        (window as any).__spawnImpactParticles(raycastResult.point);
        console.log('[Shooting] Spawned impact particles at:', raycastResult.point);
      } else {
        console.warn('[Shooting] Impact particle spawner not available!');
      }
    } else {
      console.log('[Shooting] No hit point for particle spawn');
    }

    // Check if the hit object has health
    const object = raycastResult.object;

    // Look for health data in userData (from parent RigidBody)
    let currentObj = object;
    let healthRef: React.RefObject<HealthHandle> | null = null;
    let targetType: HealthTargetType | null = null;

    // Traverse up the object hierarchy to find health data
    while (currentObj && !healthRef) {
      if (currentObj.userData?.healthRef) {
        healthRef = currentObj.userData.healthRef;
        targetType = currentObj.userData.targetType || HealthTargetType.ENVIRONMENT;
        break;
      }
      currentObj = currentObj.parent as any;
    }

    if (healthRef?.current) {
      // Apply damage
      const damageInfo: DamageInfo = {
        amount: damage,
        sourcePosition: raycastResult.point ? [
          raycastResult.point.x,
          raycastResult.point.y,
          raycastResult.point.z
        ] : undefined
      };

      const hitResult = healthRef.current.takeDamage(damageInfo);

      // Show appropriate hit marker
      showHitMarker(hitResult);
    } else {
      // Hit something without health (environment)
      showHitMarker({
        targetType: HealthTargetType.ENVIRONMENT,
        wasDeath: false,
        wasDestroyed: false,
        remainingHealth: 0
      });
    }
  }, [damage, showHitMarker]);

  const raycastData = useShootingRaycast({
    isShooting,
    onHit: handleHit,
    maxDistance,
    spread: currentSpread
  });

  return raycastData;
}
