/**
 * Quick Slot Controls Hook
 * Handles keyboard input for quick slots (1-8)
 */

import { useEffect } from 'react';
import * as THREE from 'three';
import { useInput, GameAction } from '../../../core/input';
import { useEquipment } from './EquipmentContext';
import { EquipmentRegistry } from './config/EquipmentRegistry';
import { EquipmentSlotType } from './types/EquipmentTypes';
import { useWorldItemManager } from '../inventory/WorldItemManager';
import { useCharacterTransform } from '../../components/CharacterTransformContext';

/**
 * Hook to handle quick slot keyboard inputs (1-8)
 * Allows equipping/unequipping items from quickbar slots
 */
export function useQuickSlotControls() {
  const { inputManager } = useInput();
  const { getEquipped, wield, stow, getWieldedSlot, unequip } = useEquipment();
  const { spawnItem } = useWorldItemManager();
  const { getTransform } = useCharacterTransform();

  useEffect(() => {
    // Map GameAction to quick slot number (1-8)
    const quickSlotActions = [
      GameAction.QUICK_SLOT_1,
      GameAction.QUICK_SLOT_2,
      GameAction.QUICK_SLOT_3,
      GameAction.QUICK_SLOT_4,
      GameAction.QUICK_SLOT_5,
      GameAction.QUICK_SLOT_6,
      GameAction.QUICK_SLOT_7,
      GameAction.QUICK_SLOT_8,
    ];

    // Get quickbar slots from registry
    const quickbarSlots = EquipmentRegistry.getQuickbarSlots().slice(0, 8);

    // Create handler for each quick slot
    const handlers: Array<(state: any) => void> = [];

    quickSlotActions.forEach((action, index) => {
      const handler = async (state: any) => {
        if (state.justPressed) {
          const slotConfig = quickbarSlots[index];
          if (!slotConfig) return;

          const equipped = getEquipped(slotConfig.slotType);
          const currentWieldedSlot = getWieldedSlot();

          if (!equipped) {
            console.log(`[QuickSlot ${index + 1}] Empty slot`);
            return;
          }

          // If this slot is already wielded, stow it
          if (currentWieldedSlot === slotConfig.slotType) {
            console.log(`[QuickSlot ${index + 1}] Stowing ${equipped.name}`);
            await stow();
          } else {
            // Check for orphan weapon in hand before wielding
            const handEquipment = getEquipped(EquipmentSlotType.HAND_PRIMARY);
            if (handEquipment && !currentWieldedSlot) {
              // Orphan weapon detected - drop it before wielding
              console.log(`[QuickSlot ${index + 1}] Dropping orphan weapon from hand before wielding`);

              const unequippedEquipment = await unequip(EquipmentSlotType.HAND_PRIMARY);
              if (unequippedEquipment) {
                // Spawn dropped weapon in world
                const transform = getTransform();
                const dropPosition = transform.position.clone().add(
                  transform.forward.clone().multiplyScalar(2)
                ).add(new THREE.Vector3(0, 1, 0));
                const dropDirection = transform.forward.clone();

                const itemToSpawn = {
                  id: unequippedEquipment.id,
                  name: unequippedEquipment.name,
                  quantity: 1,
                  icon: unequippedEquipment.icon,
                  isEquipment: true,
                  equipmentType: unequippedEquipment.type,
                };

                spawnItem(itemToSpawn, dropPosition, dropDirection);
              }
            }

            // Wield this weapon (will automatically stow current weapon if any)
            console.log(`[QuickSlot ${index + 1}] Wielding ${equipped.name}`);
            await wield(slotConfig.slotType);
          }
        }
      };

      handlers.push(handler);
      inputManager.addEventListener(action, handler);
    });

    // Cleanup
    return () => {
      quickSlotActions.forEach((action, index) => {
        inputManager.removeEventListener(action, handlers[index]);
      });
    };
  }, [inputManager, getEquipped, wield, stow, getWieldedSlot, unequip, spawnItem, getTransform]);
}
