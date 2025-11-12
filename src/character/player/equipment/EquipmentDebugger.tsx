/**
 * Equipment Debugger Component
 * Updates equipment transforms in real-time based on Leva controls
 */

import { useEffect } from 'react';
import { useEquipment } from './EquipmentContext';
import { EquipmentSlotType } from './types/EquipmentTypes';
import { useEquipmentDebug } from './useEquipmentDebug';

export function EquipmentDebugger() {
  const { updateTransform } = useEquipment();
  const debug = useEquipmentDebug();

  // Update back left slot
  useEffect(() => {
    if (!debug.enabled) return;

    updateTransform(
      EquipmentSlotType.BACK_LEFT,
      debug.backLeft.position,
      debug.backLeft.rotation,
      debug.backLeft.scale
    );
  }, [
    debug.enabled,
    debug.backLeft.position,
    debug.backLeft.rotation,
    debug.backLeft.scale,
    updateTransform,
  ]);

  // Update back right slot
  useEffect(() => {
    if (!debug.enabled) return;

    updateTransform(
      EquipmentSlotType.BACK_RIGHT,
      debug.backRight.position,
      debug.backRight.rotation,
      debug.backRight.scale
    );
  }, [
    debug.enabled,
    debug.backRight.position,
    debug.backRight.rotation,
    debug.backRight.scale,
    updateTransform,
  ]);

  return null; // This component doesn't render anything
}
