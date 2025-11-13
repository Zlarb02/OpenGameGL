/**
 * WeaponPickup - Abstract weapon pickup component
 * Base class for all weapon pickups (Rifle, Sword, Shield, etc.)
 */

import { useCallback } from 'react';
import { useGLTF } from '@react-three/drei';
import { Pickup } from './Pickup';
import { useEquipment } from '../../equipment/EquipmentContext';
import { EquipmentRegistry } from '../../equipment/config/EquipmentRegistry';
import { EquipmentSlotType } from '../../equipment/types/EquipmentTypes';

export interface WeaponPickupProps {
  /** World position */
  position: [number, number, number];
  /** Callback when picked up */
  onPickup: () => void;
  /** Weapon ID in registry */
  weaponId: string;
  /** Display name */
  weaponName: string;
  /** Weapon type for metadata */
  weaponType: string;
  /** 3D model path */
  modelPath: string;
  /** Model scale */
  modelScale?: number;
  /** Model rotation */
  modelRotation?: [number, number, number];
  /** Auto-equip slot (back slot for rifles/swords/shields) */
  autoEquipSlot: EquipmentSlotType;
  /** Pickup mass */
  mass?: number;
}

/**
 * Generic weapon pickup component
 * Handles inventory, auto-equip to back slots, and 3D model display
 */
export function WeaponPickup({
  position,
  onPickup,
  weaponId,
  weaponName,
  weaponType,
  modelPath,
  modelScale = 1.5,
  modelRotation = [0, Math.PI / 2, 0],
  autoEquipSlot,
  mass = 5,
}: WeaponPickupProps) {
  const { scene } = useGLTF(modelPath);
  const { equip, getEquipped } = useEquipment();

  const handlePickup = useCallback(async () => {
    // Get weapon equipment from registry first
    const weaponEquipment = EquipmentRegistry.getEquipment(weaponId);
    if (!weaponEquipment) {
      console.error(`[WeaponPickup] Weapon ${weaponId} not found in registry`);
      return;
    }

    // Generic slot finding: find first available slot from compatibleSlots
    // This works for ANY equipment type (weapons, tools, consumables)
    const availableSlot = weaponEquipment.compatibleSlots.find(slot => !getEquipped(slot));

    if (!availableSlot) {
      console.warn(`[WeaponPickup] ❌ Cannot pick up ${weaponName}: All compatible slots are full!`);
      // TODO: Show UI notification to player
      return; // Don't pick up if no slots available
    }

    // Equip to the available slot (stowed position)
    const equipSuccess = await equip(weaponEquipment, availableSlot);

    if (equipSuccess) {
      console.log(`[WeaponPickup] ✅ Equipped ${weaponName} to ${availableSlot}`);
      onPickup();
    } else {
      console.error(`[WeaponPickup] ❌ Failed to equip ${weaponName} to ${availableSlot}`);
    }
  }, [equip, getEquipped, onPickup, weaponId, weaponName]);

  return (
    <Pickup
      position={position}
      onPickup={handlePickup}
      interactionRange={5}
      mass={mass}
      restitution={0.1}
      friction={1.2}
      linearDamping={0.8}
      angularDamping={0.8}
      colliders="hull"
    >
      <primitive object={scene.clone()} scale={modelScale} rotation={modelRotation} />
    </Pickup>
  );
}

/**
 * Preload weapon model
 */
export function preloadWeaponModel(modelPath: string) {
  useGLTF.preload(modelPath);
}
