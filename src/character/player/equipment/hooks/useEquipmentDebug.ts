/**
 * Equipment Debug Hook
 * Provides live debugging controls for equipment positions and rotations
 */

import { useControls } from 'leva';
import { createSectionControls } from '../../../../utils/levaSectionManager';
import { EquipmentSlotType } from '../types/EquipmentTypes';

export interface EquipmentDebugConfig {
  enabled: boolean;
  slot: EquipmentSlotType;
  scale: number;
  position: [number, number, number];
  rotation: [number, number, number];
  useDegrees: boolean;
}

export function useEquipmentDebug(
  slotType: EquipmentSlotType,
  defaultValues?: {
    scale?: number;
    position?: [number, number, number];
    rotation?: [number, number, number];
  }
): EquipmentDebugConfig {
  const sectionName = `🔧 Debug - ${slotType}`;

  const debug = useControls(sectionName, {
    enabled: {
      value: true,
      label: '✅ Enable Correction'
    },
    useDegrees: {
      value: false,
      label: 'Use Degrees (°)'
    },
    scale: {
      value: defaultValues?.scale ?? 1.0,
      min: 0.01,
      max: 200.0,
      step: 0.1,
      label: 'Scale'
    },
    posX: {
      value: defaultValues?.position?.[0] ?? 0,
      min: -500,
      max: 500,
      step: 0.01,
      label: 'Position X'
    },
    posY: {
      value: defaultValues?.position?.[1] ?? 0,
      min: -500,
      max: 500,
      step: 0.01,
      label: 'Position Y'
    },
    posZ: {
      value: defaultValues?.position?.[2] ?? 0,
      min: -500,
      max: 500,
      step: 0.01,
      label: 'Position Z'
    },
    rotX: {
      value: defaultValues?.rotation?.[0] ?? 0,
      min: -Math.PI * 2,
      max: Math.PI * 2,
      step: 0.01,
      label: 'Rotation X (rad)'
    },
    rotY: {
      value: defaultValues?.rotation?.[1] ?? 0,
      min: -Math.PI * 2,
      max: Math.PI * 2,
      step: 0.01,
      label: 'Rotation Y (rad)'
    },
    rotZ: {
      value: defaultValues?.rotation?.[2] ?? 0,
      min: -Math.PI * 2,
      max: Math.PI * 2,
      step: 0.01,
      label: 'Rotation Z (rad)'
    },
    rotXDeg: {
      value: ((defaultValues?.rotation?.[0] ?? 0) * 180 / Math.PI),
      min: -720,
      max: 720,
      step: 0.1,
      label: 'Rotation X (°)',
      render: (get) => get('useDegrees')
    },
    rotYDeg: {
      value: ((defaultValues?.rotation?.[1] ?? 0) * 180 / Math.PI),
      min: -720,
      max: 720,
      step: 0.1,
      label: 'Rotation Y (°)',
      render: (get) => get('useDegrees')
    },
    rotZDeg: {
      value: ((defaultValues?.rotation?.[2] ?? 0) * 180 / Math.PI),
      min: -720,
      max: 720,
      step: 0.1,
      label: 'Rotation Z (°)',
      render: (get) => get('useDegrees')
    },
    // Section controls
    ...createSectionControls(sectionName, `leva__${sectionName}`),
  }, { collapsed: true });

  // Convert degrees to radians if using degrees mode
  const rotation: [number, number, number] = debug.useDegrees
    ? [
        debug.rotXDeg * Math.PI / 180,
        debug.rotYDeg * Math.PI / 180,
        debug.rotZDeg * Math.PI / 180,
      ]
    : [debug.rotX, debug.rotY, debug.rotZ];

  const config = {
    enabled: debug.enabled,
    slot: slotType,
    scale: debug.scale,
    position: [debug.posX, debug.posY, debug.posZ] as [number, number, number],
    rotation,
    useDegrees: debug.useDegrees,
  };

  // Log formatted config when debug is enabled (for easy copy-paste)
  // Removed: too verbose, use Leva panel instead

  return config;
}

/**
 * Hook for debugging back weapons specifically
 */
export function useBackWeaponDebug(slot: 'left' | 'right') {
  const slotType = slot === 'left'
    ? EquipmentSlotType.BACK_LEFT
    : EquipmentSlotType.BACK_RIGHT;

  // Default values based on slot (calibrated values)
  const defaultValues = slot === 'left'
    ? {
        scale: 80.0,
        position: [-9, 5, -18] as [number, number, number],
        rotation: [-4.64, -3.31, -4.97] as [number, number, number],
      }
    : {
        scale: 80.0,
        position: [5, 5, -14] as [number, number, number],
        rotation: [-4.82, -2.97, 4.80] as [number, number, number],
      };

  return useEquipmentDebug(slotType, defaultValues);
}
