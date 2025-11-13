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
    icon: '/icons/weapons/rifle.png',
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

    // Can ONLY be equipped to back slots (not hand - use wield() for that)
    compatibleSlots: [
      EquipmentSlotType.BACK_LEFT,
      EquipmentSlotType.BACK_RIGHT,
    ],
  },
  {
    id: 'iron-sword',
    name: 'Iron Sword',
    category: EquipmentCategory.WEAPON,
    weaponType: WeaponType.SWORD,
    icon: '/icons/weapons/sword.png',
    stackable: false,
    maxStackSize: 1,

    // Weapon stats
    damage: 25,
    range: 2,

    // Visual
    modelPath: '/models/weapons/iron-sword.glb',

    // Behavior
    requiresAiming: false,
    twoHanded: false,

    // Can ONLY be equipped to back slots (not hand - use wield() for that)
    compatibleSlots: [
      EquipmentSlotType.BACK_LEFT,
      EquipmentSlotType.BACK_RIGHT,
    ],
  },
  {
    id: 'copper-shield',
    name: 'Copper Shield',
    category: EquipmentCategory.WEAPON,
    weaponType: WeaponType.SHIELD,
    icon: '/icons/weapons/shield.png',
    stackable: false,
    maxStackSize: 1,

    // Weapon stats (defensive)
    damage: 5,
    range: 1,

    // Visual
    modelPath: '/models/weapons/copper-shield.glb',

    // Behavior
    requiresAiming: false,
    twoHanded: false,

    // Can ONLY be equipped to back slots (not hand - use wield() for that)
    compatibleSlots: [
      EquipmentSlotType.BACK_LEFT,
      EquipmentSlotType.BACK_RIGHT,
    ],
  },
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
