/**
 * SwordPickup - Iron Sword pickup
 */

import { WeaponPickup, preloadWeaponModel } from './WeaponPickup';
import { EquipmentSlotType } from '../../equipment/types/EquipmentTypes';

interface SwordPickupProps {
  position: [number, number, number];
  onPickup: () => void;
}

/**
 * Iron Sword pickup in the world
 */
export function SwordPickup({ position, onPickup }: SwordPickupProps) {
  return (
    <WeaponPickup
      position={position}
      onPickup={onPickup}
      weaponId="iron-sword"
      weaponName="Iron Sword"
      weaponType="sword"
      modelPath="/models/weapons/iron-sword.glb"
      modelScale={1.5}
      modelRotation={[0, Math.PI / 2, 0]}
      autoEquipSlot={EquipmentSlotType.BACK_RIGHT}
      mass={5}
    />
  );
}

// Preload model
preloadWeaponModel('/models/weapons/iron-sword.glb');
