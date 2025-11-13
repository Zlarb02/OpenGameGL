/**
 * ShieldPickup - Copper Shield pickup
 */

import { WeaponPickup, preloadWeaponModel } from './WeaponPickup';
import { EquipmentSlotType } from '../../equipment/types/EquipmentTypes';

interface ShieldPickupProps {
  position: [number, number, number];
  onPickup: () => void;
}

/**
 * Copper Shield pickup in the world
 */
export function ShieldPickup({ position, onPickup }: ShieldPickupProps) {
  return (
    <WeaponPickup
      position={position}
      onPickup={onPickup}
      weaponId="copper-shield"
      weaponName="Copper Shield"
      weaponType="shield"
      modelPath="/models/weapons/copper-shield.glb"
      modelScale={1.5}
      modelRotation={[0, Math.PI / 2, 0]}
      autoEquipSlot={EquipmentSlotType.BACK_LEFT}
      mass={6}
    />
  );
}

// Preload model
preloadWeaponModel('/models/weapons/copper-shield.glb');
