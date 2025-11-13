/**
 * Equipment Transform Sync
 * Listens to WeaponTransformOverrides changes and updates attached equipment in real-time
 * Enables live Leva debugging of weapon positions/rotations
 */

import { useEffect } from 'react';
import { useEquipment } from '../EquipmentContext';
import { WeaponTransformOverrides } from '../config/WeaponTransformOverrides';

export function EquipmentTransformSync() {
  const { refreshTransforms } = useEquipment();

  useEffect(() => {
    // Subscribe to override changes
    const unsubscribe = WeaponTransformOverrides.subscribe(() => {
      // Refresh all transforms when overrides change (via Leva)
      refreshTransforms();
    });

    return unsubscribe;
  }, [refreshTransforms]);

  // This component doesn't render anything
  return null;
}
