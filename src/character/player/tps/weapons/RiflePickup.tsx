/**
 * Rifle pickup - uses unified WeaponPickup system
 */

import { WeaponPickup, preloadWeaponModel } from './WeaponPickup';
import { EquipmentSlotType } from '../../equipment/types/EquipmentTypes';

interface RiflePickupProps {
  position: [number, number, number];
  onPickup: () => void;
}

/**
 * Rifle pickup in the world
 * Uses unified WeaponPickup with automatic slot selection
 */
export function RiflePickup({ position, onPickup }: RiflePickupProps) {
  return (
    <WeaponPickup
      position={position}
      onPickup={onPickup}
      weaponId="rifle"
      weaponName="Rifle"
      weaponType="rifle"
      modelPath="/models/weapons/rifle.glb"
      modelScale={1.5}
      modelRotation={[0, Math.PI / 2, 0]}
      autoEquipSlot={EquipmentSlotType.BACK_LEFT} // Used only for fallback/preference
      mass={5}
    />
  );
}

// Preload model
preloadWeaponModel('/models/weapons/rifle.glb');
