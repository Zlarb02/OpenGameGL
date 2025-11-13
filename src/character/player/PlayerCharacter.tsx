/**
 * PlayerCharacter
 * Player-specific character wrapper
 * Composes Character with Locomotion + TPS layers
 */

import { useMemo, useEffect, useRef, useCallback } from 'react';
import { Character } from '../components/Character';
import { Locomotion } from '../animation/layers/Locomotion';
import { TPS_Rifle } from '../animation/layers/TPS_Rifle';
import { AimOffset } from '../animation/layers/AimOffset';
import { AnimationLayerSystem } from '../animation/AnimationLayerSystem';
import { useCharacterSelector } from '../hooks/useCharacterSelector';
import { useWeaponState } from './tps/weapons/useWeaponState';
import { useAimDebug } from './tps/shooting/useAimDebug';
import { useEquipment } from './equipment/EquipmentContext';
import { useQuickbar } from '../../ui/quickbar/QuickbarContext';

export interface PlayerCharacterProps {
  isMoving: boolean;
  isSprinting: boolean;
  isGrounded: boolean;
  movementInput: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
  };
  characterRotation: number;
  cameraPhi: number;
  velocity?: { x: number; y: number; z: number };
}

/**
 * PlayerCharacter - Wraps Character with player-specific configuration
 */
export function PlayerCharacter({
  isMoving,
  isSprinting,
  isGrounded,
  movementInput,
  characterRotation,
  cameraPhi,
  velocity = { x: 0, y: 0, z: 0 },
}: PlayerCharacterProps) {
  const { modelPath, modelScale, modelYOffset } = useCharacterSelector();
  const { weaponEquipped, isAiming, isShooting, isCrouching, isReloading } = useWeaponState();
  const { enableManualAim, manualAimAngle } = useAimDebug();
  const { equippedItemsVersion, getWieldedSlot, getAllEquipped } = useEquipment(); // Track equipment changes
  const { syncSlots } = useQuickbar(); // Sync quickbar with equipment

  // Synchronize quickbar with equipment whenever equipment changes
  useEffect(() => {
    const equippedItems = getAllEquipped();
    syncSlots(equippedItems);
    console.log('[PlayerCharacter] Synced quickbar with equipment', equippedItems.size, 'items');
  }, [equippedItemsVersion, getAllEquipped, syncSlots]);
  const layerSystemRef = useRef<AnimationLayerSystem | null>(null);
  const aimOffsetLayerRef = useRef<AimOffset | null>(null);
  const previousWieldedSlotRef = useRef<ReturnType<typeof getWieldedSlot>>(null);

  // Create layers - memoized so they don't recreate on every render
  const layers = useMemo(() => {
    const locomotionLayer = new Locomotion({
      enableSprint: true,
      enable8Way: false,  // Base locomotion doesn't use 8-way
    });

    const tpsLayer = new TPS_Rifle({
      enableCrouch: true,
      enable8Way: true,  // TPS layer uses 8-way strafe
    });

    // Create aim offset layer (for vertical aiming)
    const aimOffsetLayer = new AimOffset({
      maxPhiDelta: Math.PI / 3,      // 60° max camera movement
      maxSpineRotation: 0.8,          // 45° max spine rotation
    });

    // TPS layer starts disabled, gets enabled when weapon is wielded
    tpsLayer.config.enabled = weaponEquipped;

    // Aim offset layer starts disabled, gets enabled when weapon is wielded
    aimOffsetLayer.config.enabled = weaponEquipped;

    // Store ref to aim offset layer for debug updates
    aimOffsetLayerRef.current = aimOffsetLayer;

    return [locomotionLayer, tpsLayer, aimOffsetLayer];
  }, []); // Empty deps - layers created once

  // Callback when layer system is ready - useCallback to prevent re-renders
  const handleLayerSystemReady = useCallback((layerSystem: AnimationLayerSystem) => {
    layerSystemRef.current = layerSystem;
    console.log('[PlayerCharacter] Layer system ready');
  }, []);

  // Update TPS layer enabled state when weapon equipped changes
  // When TPS layer is active, disable locomotion layer (they can't both play)
  // Debounce to avoid reacting to intermediate states during weapon swaps
  useEffect(() => {
    if (!layerSystemRef.current) return;

    const layerSystem = layerSystemRef.current;
    const currentWieldedSlot = getWieldedSlot();

    // Check if wielded slot actually changed (not just version bump from intermediate state)
    const wieldedSlotChanged = previousWieldedSlotRef.current !== currentWieldedSlot;

    // Debug log to see what's happening
    if (wieldedSlotChanged) {
      console.log('[PlayerCharacter] Wielded slot changed:', previousWieldedSlotRef.current, '→', currentWieldedSlot);
    }

    previousWieldedSlotRef.current = currentWieldedSlot;

    // Debounce layer updates to avoid reacting to intermediate states
    // This prevents T-pose during weapon swaps when weaponEquipped temporarily becomes false
    const timeoutId = setTimeout(() => {
      if (weaponEquipped) {
        // Enable TPS + AimOffset, disable Locomotion (properly through layer system)
        console.log('[PlayerCharacter] Enabling TPS + AimOffset Layers, disabling Locomotion (forceRefresh:', wieldedSlotChanged, ')');

        // CRITICAL: Always force refresh when weapon equipped to ensure animation resets
        // This fixes T-pose during weapon swaps (especially 2→1)
        layerSystem.enableLayer('tps', { fadeInDuration: 0, forceRefresh: true });
        layerSystem.enableLayer('aimOffset', { fadeInDuration: 0, forceRefresh: true });

        // Then fade out old layer quickly
        layerSystem.disableLayer('locomotion', { fadeOutDuration: 0.1 });
      } else {
        // Disable TPS + AimOffset, enable Locomotion
        console.log('[PlayerCharacter] Disabling TPS + AimOffset Layers, enabling Locomotion');

        // CRITICAL: Enable new layer FIRST with NO FADE (instant) to avoid T-pose
        // Force refresh to reset animation
        layerSystem.enableLayer('locomotion', { fadeInDuration: 0, forceRefresh: true });

        // Then fade out old layers quickly
        layerSystem.disableLayer('tps', { fadeOutDuration: 0.1 });
        layerSystem.disableLayer('aimOffset', { fadeOutDuration: 0.1 });
      }
    }, 10); // 10ms debounce - wait for state to settle

    return () => clearTimeout(timeoutId);
  }, [weaponEquipped, equippedItemsVersion, getWieldedSlot]); // React to version changes to trigger check

  // Update aim offset layer config when debug settings change
  useEffect(() => {
    if (aimOffsetLayerRef.current) {
      aimOffsetLayerRef.current.updateConfig({
        enableManualAim,
        manualAimAngle,
      });
    }
  }, [enableManualAim, manualAimAngle]);

  return (
    <>
      <Character
        modelPath={modelPath}
        layers={layers}
        isMoving={isMoving}
        isSprinting={isSprinting}
        isGrounded={isGrounded}
        isAiming={isAiming}
        isShooting={isShooting}
        isCrouching={isCrouching}
        isReloading={isReloading}
        movementInput={movementInput}
        characterRotation={characterRotation}
        cameraPhi={cameraPhi}
        velocity={velocity}
        onLayerSystemReady={handleLayerSystemReady}
      />
    </>
  );
}
