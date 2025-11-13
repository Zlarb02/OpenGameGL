/**
 * Reload & Stow Controls Hook
 * Gère le comportement de la touche R avec détection tap/hold
 *
 * Comportement :
 * - Si mains vides (stowed) : R tap → draw weapon (sortir l'arme)
 * - Si arme en main (wielded) :
 *   - R tap (<0.5s) : reload
 *   - R hold (0.5s-1.5s puis release) : stow weapon (ranger)
 *   - R hold (>1.5s puis release) : drop weapon au sol
 */

import { useEffect, useRef } from 'react';
import { useInput, GameAction } from '../../../core/input';
import { useEquipment } from './EquipmentContext';
import { useWorldItemManager } from '../inventory/WorldItemManager';
import { EquipmentRegistry } from './config/EquipmentRegistry';
import { EquipmentSlotType } from './types/EquipmentTypes';
import { useCharacterTransform } from '../../components/CharacterTransformContext';
import * as THREE from 'three';

const TAP_THRESHOLD = 0.25; // 0.25s - tap for reload
const STOW_START = 0.25; // 0.25s - start stow range
const DROP_THRESHOLD = 0.8; // 0.8s - auto drop (no release needed)

export function useReloadStowControls() {
  const { inputManager } = useInput();
  const { getWieldedSlot, getWieldedEquipment, getEquipped, wield, stow, unequip } = useEquipment();
  const { spawnItem } = useWorldItemManager();
  const { getTransform } = useCharacterTransform();

  const pressStartTimeRef = useRef<number | null>(null);
  const isHoldingRef = useRef(false);
  const wieldedAtPressRef = useRef<{ slot: any; equipment: any } | null>(null);
  const dropTriggeredRef = useRef(false); // Track if drop was already triggered

  useEffect(() => {
    let checkIntervalId: number | null = null;

    // Handle R key press/release for reload/stow/drop/draw
    const handleReloadKey = async (state: any) => {
      const currentTime = Date.now();

      // Key pressed
      if (state.pressed && !isHoldingRef.current) {
        pressStartTimeRef.current = currentTime;
        isHoldingRef.current = true;
        dropTriggeredRef.current = false; // Reset drop flag

        // Capture wielded state at press time
        const wieldedSlot = getWieldedSlot();
        const wieldedEquipment = getWieldedEquipment();
        wieldedAtPressRef.current = wieldedSlot && wieldedEquipment
          ? { slot: wieldedSlot, equipment: wieldedEquipment }
          : null;

        console.log('[ReloadStow] R key pressed, wielded:', wieldedAtPressRef.current ? 'YES' : 'NO');

        // Start checking for auto-drop (only if weapon is wielded)
        if (wieldedAtPressRef.current) {
          checkIntervalId = window.setInterval(() => {
            if (!isHoldingRef.current || !pressStartTimeRef.current) {
              if (checkIntervalId) clearInterval(checkIntervalId);
              return;
            }

            const elapsed = (Date.now() - pressStartTimeRef.current) / 1000;

            // Auto-drop at 1s threshold (no release needed)
            if (elapsed >= DROP_THRESHOLD && !dropTriggeredRef.current) {
              dropTriggeredRef.current = true;
              isHoldingRef.current = false;
              pressStartTimeRef.current = null;
              if (checkIntervalId) clearInterval(checkIntervalId);

              console.log('[ReloadStow] AUTO DROP at 1s → Drop weapon to world');

              const { slot: wieldedSlot, equipment: wieldedEquipment } = wieldedAtPressRef.current!;

              // Drop the weapon
              (async () => {
                // Simple approach: unequip (deletes attached model) and spawn clean pickup
                const unequippedEquipment = await unequip(wieldedSlot);
                if (!unequippedEquipment) {
                  console.error('[ReloadStow] Failed to unequip weapon');
                  wieldedAtPressRef.current = null;
                  return;
                }

                console.log('[ReloadStow] Unequipped weapon, spawning clean pickup...');

                // Spawn in world (in front of player with actual position/direction)
                const transform = getTransform();
                const dropPosition = transform.position.clone().add(
                  transform.forward.clone().multiplyScalar(2) // 2 units in front
                ).add(new THREE.Vector3(0, 1, 0)); // Slightly above ground
                const dropDirection = transform.forward.clone();

                // Convert Equipment to InventoryItem format for spawning
                const itemToSpawn = {
                  id: unequippedEquipment.id,
                  name: unequippedEquipment.name,
                  quantity: 1,
                  icon: unequippedEquipment.icon,
                  isEquipment: true,
                  equipmentType: unequippedEquipment.type,
                };

                console.log('[ReloadStow] Spawning clean pickup:', itemToSpawn);
                spawnItem(itemToSpawn, dropPosition, dropDirection);
                wieldedAtPressRef.current = null;
              })();
            }
          }, 50); // Check every 50ms
        }
      }

      // Key released
      if (!state.pressed && isHoldingRef.current) {
        if (checkIntervalId) {
          clearInterval(checkIntervalId);
          checkIntervalId = null;
        }

        const holdDuration = pressStartTimeRef.current
          ? (currentTime - pressStartTimeRef.current) / 1000
          : 0;

        isHoldingRef.current = false;
        pressStartTimeRef.current = null;

        // If drop was already triggered, ignore the release
        if (dropTriggeredRef.current) {
          console.log('[ReloadStow] Release ignored - drop already triggered');
          wieldedAtPressRef.current = null;
          return;
        }

        console.log('[ReloadStow] R key released, hold duration:', holdDuration.toFixed(2), 's');

        // Case 1: Mains vides au moment du press → Draw weapon
        if (!wieldedAtPressRef.current) {
          console.log('[ReloadStow] No weapon wielded, trying to draw...');

          // Try to draw first equipped back weapon (check BOTH back slots)
          const backSlots = EquipmentRegistry.getBackWeaponSlots();
          for (const slot of backSlots) {
            // Check if this slot has equipment
            const equipment = getEquipped(slot);
            if (equipment) {
              // Check current wielded state
              const currentWielded = getWieldedSlot();
              if (!currentWielded) {
                // Before wielding, check if hand has orphan weapon (directly equipped to HAND_PRIMARY)
                const handEquipment = getEquipped(EquipmentSlotType.HAND_PRIMARY);
                if (handEquipment && !currentWielded) {
                  // Orphan weapon detected - drop it before wielding
                  console.log('[ReloadStow] Dropping orphan weapon from hand before wielding');

                  (async () => {
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

                    // Now wield the back weapon
                    await wield(slot);
                    console.log(`[ReloadStow] Drew weapon from ${slot}`);
                  })();
                } else {
                  wield(slot);
                  console.log(`[ReloadStow] Drawing weapon from ${slot}`);
                }
                break;
              }
            }
          }
          wieldedAtPressRef.current = null;
          return;
        }

        // Case 2: Arme en main au moment du press
        const { slot: wieldedSlot, equipment: wieldedEquipment } = wieldedAtPressRef.current;

        if (holdDuration < TAP_THRESHOLD) {
          // Tap (< 0.25s) → Reload
          console.log('[ReloadStow] TAP → Reload (not implemented yet)');
          // TODO: Implement reload logic when animations are ready
        } else if (holdDuration >= STOW_START && holdDuration < DROP_THRESHOLD) {
          // Hold 0.25s-1s → Stow
          console.log('[ReloadStow] HOLD → Stow weapon');
          stow();
        }

        wieldedAtPressRef.current = null;
      }
    };

    inputManager.addEventListener(GameAction.RELOAD, handleReloadKey);

    return () => {
      if (checkIntervalId) {
        clearInterval(checkIntervalId);
      }
      inputManager.removeEventListener(GameAction.RELOAD, handleReloadKey);
    };
  }, [inputManager, getWieldedSlot, getWieldedEquipment, getEquipped, wield, stow, unequip, spawnItem, getTransform]);
}
