/**
 * Sword & Shield pickable - uses generic Pickup component
 */

import React, { useCallback } from 'react';
import { useGLTF } from '@react-three/drei';
import { Pickup } from './Pickup';
import { useEquipment } from '../../equipment/EquipmentContext';
import { EquipmentRegistry } from '../../equipment/config/EquipmentRegistry';
import { Group } from 'three';

interface SwordShieldPickupProps {
  position: [number, number, number];
  onPickup: () => void;
}

/**
 * Sword & Shield pickup in the world
 * Picks up both sword and shield together
 */
export function SwordShieldPickup({ position, onPickup }: SwordShieldPickupProps) {
  // Load both models
  const { scene: swordScene } = useGLTF('/models/weapons/iron-sword.glb');
  const { scene: shieldScene } = useGLTF('/models/weapons/copper-shield.glb');
  const { equip, getEquipped, unequip } = useEquipment();

  const handlePickup = useCallback(async () => {
    // Get equipment from registry first
    const swordEquipment = EquipmentRegistry.getEquipment('iron-sword');
    const shieldEquipment = EquipmentRegistry.getEquipment('copper-shield');

    if (!swordEquipment || !shieldEquipment) {
      console.error('[SwordShieldPickup] Equipment not found in registry');
      return;
    }

    // Find available slots for both items (need 2 back slots)
    const swordSlot = swordEquipment.compatibleSlots.find(slot => !getEquipped(slot));
    const shieldSlot = shieldEquipment.compatibleSlots.find(slot => !getEquipped(slot));

    // Check if we have 2 available back slots
    if (!swordSlot || !shieldSlot) {
      console.warn('[SwordShieldPickup] ❌ Cannot pick up Sword & Shield: Need 2 available back slots!');
      return; // Don't pick up if not enough slots
    }

    // Equip both items
    const swordSuccess = await equip(swordEquipment, swordSlot);
    const shieldSuccess = await equip(shieldEquipment, shieldSlot);

    if (swordSuccess && shieldSuccess) {
      console.log(`[SwordShieldPickup] ✅ Equipped Sword to ${swordSlot} and Shield to ${shieldSlot}`);
      onPickup();
    } else {
      console.error('[SwordShieldPickup] ❌ Failed to equip both items');
      // If one failed, unequip the other to maintain consistency
      if (swordSuccess) await unequip(swordSlot);
      if (shieldSuccess) await unequip(shieldSlot);
    }
  }, [equip, getEquipped, unequip, onPickup]);

  // Create a group to display both items together
  const displayGroup = React.useMemo(() => {
    const group = new Group();

    // Add sword (positioned slightly to the right)
    const sword = swordScene.clone();
    sword.position.set(0.3, 0, 0);
    sword.scale.setScalar(1.5);
    group.add(sword);

    // Add shield (positioned slightly to the left)
    const shield = shieldScene.clone();
    shield.position.set(-0.3, 0, 0);
    shield.scale.setScalar(1.5);
    group.add(shield);

    return group;
  }, [swordScene, shieldScene]);

  return (
    <Pickup
      position={position}
      onPickup={handlePickup}
      interactionRange={5}
      mass={8}
      restitution={0.1}
      friction={1.2}
      linearDamping={0.8}
      angularDamping={0.8}
      colliders="hull"
    >
      <primitive object={displayGroup} />
    </Pickup>
  );
}

// Preload models
useGLTF.preload('/models/weapons/iron-sword.glb');
useGLTF.preload('/models/weapons/copper-shield.glb');
