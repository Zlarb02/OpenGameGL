import { useControls, folder } from 'leva';
import { useEffect } from 'react';
import { WeaponType, EquipmentSlotType } from '../types/EquipmentTypes';
import { WeaponTransformOverrides } from '../config/WeaponTransformOverrides';

/**
 * Shield Transform Debug Hook
 *
 * Pattern: Default values are hardcoded in WeaponTransformOverrides.initialize()
 * This debug hook ONLY overrides when enableShieldDebug is explicitly enabled.
 *
 * Workflow:
 * 1. Use this debug to find good values
 * 2. Hardcode them in WeaponTransformOverrides.initialize()
 * 3. Keep this debug available for future adjustments
 */
export function useShieldTransformDebug() {
  const controls = useControls('Shield Transform Debug', {
    enableShieldDebug: {
      value: false,
      label: 'Enable Shield Debug',
    },

    'Back Slots': folder({
      // === BACK LEFT (Default: [12.1, -8.4, -16.1], [-3.14, -0.03, 0.71], 67.0) ===
      backLeft: folder({
        backLeftPosX: { value: 12.1, min: -50, max: 50, step: 0.1, label: 'Position X' },
        backLeftPosY: { value: -8.4, min: -50, max: 50, step: 0.1, label: 'Position Y' },
        backLeftPosZ: { value: -16.1, min: -50, max: 50, step: 0.1, label: 'Position Z' },
        backLeftRotX: { value: -3.14, min: -Math.PI, max: Math.PI, step: 0.01, label: 'Rotation X' },
        backLeftRotY: { value: -0.03, min: -Math.PI, max: Math.PI, step: 0.01, label: 'Rotation Y' },
        backLeftRotZ: { value: 0.71, min: -Math.PI, max: Math.PI, step: 0.01, label: 'Rotation Z' },
        backLeftScale: { value: 67.0, min: 0.1, max: 200, step: 0.1, label: 'Scale' },
      }),

      // === BACK RIGHT (Default: [-20.0, -11.3, -20.0], [-3.00, 0.03, -0.79], 67.0) ===
      backRight: folder({
        backRightPosX: { value: -20.0, min: -50, max: 50, step: 0.1, label: 'Position X' },
        backRightPosY: { value: -11.3, min: -50, max: 50, step: 0.1, label: 'Position Y' },
        backRightPosZ: { value: -20.0, min: -50, max: 50, step: 0.1, label: 'Position Z' },
        backRightRotX: { value: -3.00, min: -Math.PI, max: Math.PI, step: 0.01, label: 'Rotation X' },
        backRightRotY: { value: 0.03, min: -Math.PI, max: Math.PI, step: 0.01, label: 'Rotation Y' },
        backRightRotZ: { value: -0.79, min: -Math.PI, max: Math.PI, step: 0.01, label: 'Rotation Z' },
        backRightScale: { value: 67.0, min: 0.1, max: 200, step: 0.1, label: 'Scale' },
      }),
    }),
  });

  // ONLY update overrides when debug is ENABLED
  useEffect(() => {
    if (!controls.enableShieldDebug) return;

    // Back Left
    WeaponTransformOverrides.set(WeaponType.SHIELD, EquipmentSlotType.BACK_LEFT, {
      position: [controls.backLeftPosX, controls.backLeftPosY, controls.backLeftPosZ],
      rotation: [controls.backLeftRotX, controls.backLeftRotY, controls.backLeftRotZ],
      scale: controls.backLeftScale,
    });

    // Back Right
    WeaponTransformOverrides.set(WeaponType.SHIELD, EquipmentSlotType.BACK_RIGHT, {
      position: [controls.backRightPosX, controls.backRightPosY, controls.backRightPosZ],
      rotation: [controls.backRightRotX, controls.backRightRotY, controls.backRightRotZ],
      scale: controls.backRightScale,
    });
  }, [
    controls.enableShieldDebug,
    controls.backLeftPosX,
    controls.backLeftPosY,
    controls.backLeftPosZ,
    controls.backLeftRotX,
    controls.backLeftRotY,
    controls.backLeftRotZ,
    controls.backLeftScale,
    controls.backRightPosX,
    controls.backRightPosY,
    controls.backRightPosZ,
    controls.backRightRotX,
    controls.backRightRotY,
    controls.backRightRotZ,
    controls.backRightScale,
  ]);

  return controls;
}
