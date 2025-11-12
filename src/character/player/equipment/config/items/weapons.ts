/**
 * Weapon Equipment Definitions
 * All available weapons in the game
 */

import {
  WeaponEquipment,
  WeaponType,
  EquipmentCategory,
  EquipmentSlotType,
} from '../../types/EquipmentTypes';
import { EquipmentRegistry } from '../EquipmentRegistry';

/**
 * All weapon equipment definitions
 */
export const WEAPONS: WeaponEquipment[] = [
  {
    id: 'rifle',
    name: 'Rifle',
    category: EquipmentCategory.WEAPON,
    weaponType: WeaponType.RIFLE,
    icon: '🔫',
    stackable: false,
    maxStackSize: 1,

    // Weapon stats
    damage: 30,
    range: 100,
    fireRate: 600,
    ammoCapacity: 30,

    // Visual
    modelPath: '/models/weapons/rifle.glb',

    // Behavior
    requiresAiming: true,
    twoHanded: true,

    // Can be equipped to back or hand
    compatibleSlots: [
      EquipmentSlotType.BACK_LEFT,
      EquipmentSlotType.BACK_RIGHT,
      EquipmentSlotType.HAND_PRIMARY,
    ],
  },
  // Additional weapons can be added here
];

/**
 * Register all weapons in the registry
 */
export function registerAllWeapons() {
  WEAPONS.forEach(weapon => {
    EquipmentRegistry.registerEquipment(weapon);
  });
  console.log(`[Weapons] Registered ${WEAPONS.length} weapons`);
}

// Auto-register on import
registerAllWeapons();
