/**
 * Rifle ramassable - utilise le composant Pickup générique
 */

import React, { useCallback } from 'react';
import { useGLTF } from '@react-three/drei';
import { Pickup } from './Pickup';
import { useInventory } from '../../inventory/InventoryContext';
import { useEquipment } from '../../equipment/EquipmentContext';
import { EquipmentRegistry } from '../../equipment/config/EquipmentRegistry';
import { EquipmentSlotType } from '../../equipment/types/EquipmentTypes';

interface RiflePickupProps {
  position: [number, number, number];
  onPickup: () => void;
}

/**
 * Rifle ramassable dans le monde
 */
export function RiflePickup({ position, onPickup }: RiflePickupProps) {
  // Charger le modèle du rifle
  const { scene } = useGLTF('/models/weapons/rifle.glb');
  const { addItem } = useInventory();
  const { equip, getFirstAvailableBackSlot } = useEquipment();

  const handlePickup = useCallback(async () => {
    // Add rifle to inventory with equipment configuration
    const success = addItem('rifle', 'Fusil d\'assaut', 1, {
      isEquipment: true,
      equipmentType: 'rifle',
      stackable: false,
    });

    if (!success) {
      console.warn('[RiflePickup] Cannot add rifle: inventory limit reached');
      // TODO: Show UI message or swap prompt
      return;
    }

    // Get rifle equipment from registry
    const rifleEquipment = EquipmentRegistry.getEquipment('rifle');
    if (rifleEquipment) {
      // Try to equip in first available back slot
      const availableSlot = getFirstAvailableBackSlot();
      if (availableSlot) {
        const equipSuccess = await equip(rifleEquipment, availableSlot);
        if (equipSuccess) {
          console.log(`[RiflePickup] Equipped rifle in ${availableSlot}`);
        }
      } else {
        console.warn('[RiflePickup] No available back slots for rifle');
      }
    }

    // Call original onPickup callback
    onPickup();
  }, [addItem, equip, getFirstAvailableBackSlot, onPickup]);

  return (
    <Pickup
      position={position}
      onPickup={handlePickup}
      interactionRange={5}
      mass={5}
      restitution={0.1}
      friction={1.2}
      linearDamping={0.8}
      angularDamping={0.8}
      colliders="hull"
    >
      <primitive object={scene.clone()} scale={1.5} rotation={[0, Math.PI / 2, 0]} />
    </Pickup>
  );
}

// Preload le modèle
useGLTF.preload('/models/weapons/rifle.glb');
