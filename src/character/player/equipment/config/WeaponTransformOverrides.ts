/**
 * Weapon Transform Overrides System
 *
 * Modular, scalable system for weapon-specific transforms across ANY slot:
 * - Back weapons: rifle, sword, shield
 * - Thigh/Belt: holster, sheath, flashlight
 * - Future slots: grenades, tools, etc.
 *
 * Real-time Leva integration for visual debugging
 */

import { WeaponType, EquipmentSlotType } from '../types/EquipmentTypes';

export interface TransformConfig {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}

type OverrideKey = string; // Format: "weaponType_slotType"

/**
 * Central registry for weapon-specific transform overrides
 */
export class WeaponTransformOverrides {
  private static overrides: Map<OverrideKey, TransformConfig> = new Map();
  private static listeners: Set<() => void> = new Set();

  private static key(weaponType: WeaponType | string, slotType: EquipmentSlotType): OverrideKey {
    return `${weaponType}_${slotType}`;
  }

  static set(
    weaponType: WeaponType | string,
    slotType: EquipmentSlotType,
    transform: TransformConfig
  ): void {
    this.overrides.set(this.key(weaponType, slotType), transform);
    this.notifyListeners();
  }

  static get(
    weaponType: WeaponType | string,
    slotType: EquipmentSlotType
  ): TransformConfig | undefined {
    return this.overrides.get(this.key(weaponType, slotType));
  }

  static has(weaponType: WeaponType | string, slotType: EquipmentSlotType): boolean {
    return this.overrides.has(this.key(weaponType, slotType));
  }

  static subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private static notifyListeners(): void {
    this.listeners.forEach(cb => cb());
  }

  static initialize(): void {
    // === SWORD - Back Slots (Default values, can be overridden by Leva) ===
    this.set(WeaponType.SWORD, EquipmentSlotType.BACK_LEFT, {
      position: [6.0, -13.2, -14.5],
      rotation: [-0.29, -1.43, 1.15],
      scale: 80.0,
    });

    this.set(WeaponType.SWORD, EquipmentSlotType.BACK_RIGHT, {
      position: [-9.1, -14.5, -15.7],
      rotation: [-2.88, 1.32, -1.74],
      scale: 80.0,
    });

    // === SHIELD - Back Slots (Default values, can be overridden by Leva) ===
    this.set(WeaponType.SHIELD, EquipmentSlotType.BACK_LEFT, {
      position: [12.1, -8.4, -16.1],
      rotation: [-3.14, -0.03, 0.71],
      scale: 67.0,
    });

    this.set(WeaponType.SHIELD, EquipmentSlotType.BACK_RIGHT, {
      position: [-20.0, -11.3, -20.0],
      rotation: [-3.00, 0.03, -0.79],
      scale: 67.0,
    });

    // === FUTURE: Thigh/Belt Slots (placeholders) ===
    // Quickbar 3 - Holster (right hip/thigh)
    this.set(WeaponType.PISTOL, EquipmentSlotType.THIGH_RIGHT, {
      position: [0.1, -0.2, 0.05],
      rotation: [0, 0, -0.2],
      scale: 1.0,
    });

    // Quickbar 4 - Sheath (left hip/thigh)
    this.set(WeaponType.KNIFE, EquipmentSlotType.THIGH_LEFT, {
      position: [-0.1, -0.2, 0.05],
      rotation: [0, 0, 0.2],
      scale: 1.0,
    });

    // Quickbar 5 - Flashlight (left belt, back)
    // Note: Using 'flashlight' as custom type for now
    this.set('flashlight', 'belt_slot_1' as EquipmentSlotType, {
      position: [-0.2, -0.1, -0.15],
      rotation: [0, 0, 0],
      scale: 0.5,
    });

    console.log('[WeaponTransformOverrides] ✓ Initialized (rifle uses registry defaults)');
  }
}

WeaponTransformOverrides.initialize();
