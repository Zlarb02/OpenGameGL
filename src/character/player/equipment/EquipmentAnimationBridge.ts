/**
 * Equipment-Animation Bridge
 * Connects equipment system with animation system
 * Manages layer activation/deactivation based on equipment state
 */

import { AnimationLayerSystem } from '../../animation/AnimationLayerSystem';
import { AnimationBlender } from '../../animation/AnimationBlender';
import { EquipmentSlotType, WeaponState } from './types/EquipmentTypes';

export interface EquipmentAnimationState {
  weaponEquipped: boolean;
  weaponWielded: boolean;
  currentSlot: EquipmentSlotType | null;
}

export class EquipmentAnimationBridge {
  private layerSystem: AnimationLayerSystem | null = null;
  private currentState: EquipmentAnimationState = {
    weaponEquipped: false,
    weaponWielded: false,
    currentSlot: null,
  };

  /**
   * Set animation layer system reference
   */
  setLayerSystem(layerSystem: AnimationLayerSystem): void {
    this.layerSystem = layerSystem;
    console.log('[EquipmentAnimationBridge] Layer system connected');
  }

  /**
   * Handle weapon equipped (stowed on back)
   */
  onWeaponEquipped(slot: EquipmentSlotType): void {
    console.log(`[EquipmentAnimationBridge] Weapon equipped to ${slot}`);

    this.currentState.weaponEquipped = true;
    this.currentState.currentSlot = slot;

    // Don't activate TPS layer yet - only when wielded
    // Just track the state
  }

  /**
   * Handle weapon unequipped (removed from back)
   */
  onWeaponUnequipped(slot: EquipmentSlotType): void {
    console.log(`[EquipmentAnimationBridge] Weapon unequipped from ${slot}`);

    this.currentState.weaponEquipped = false;
    this.currentState.currentSlot = null;

    // If weapon was wielded, stow it first
    if (this.currentState.weaponWielded) {
      this.onWeaponStowed(slot);
    }
  }

  /**
   * Handle weapon wielded (drawn to hands)
   */
  onWeaponWielded(slot: EquipmentSlotType): void {
    if (!this.layerSystem) {
      console.warn('[EquipmentAnimationBridge] Layer system not connected');
      return;
    }

    console.log(`[EquipmentAnimationBridge] Weapon wielded from ${slot}`);

    this.currentState.weaponWielded = true;
    this.currentState.currentSlot = slot;

    // Enable TPS layer with crossfade
    this.layerSystem.enableLayer('tps', { fadeInDuration: 0.2 });

    // TODO: In future, trigger equipment animation here
    // For now, we use freeze + fade technique
  }

  /**
   * Handle weapon stowed (put back on back)
   */
  onWeaponStowed(slot: EquipmentSlotType): void {
    if (!this.layerSystem) {
      console.warn('[EquipmentAnimationBridge] Layer system not connected');
      return;
    }

    console.log(`[EquipmentAnimationBridge] Weapon stowed to ${slot}`);

    this.currentState.weaponWielded = false;

    // Disable TPS layer with crossfade
    this.layerSystem.disableLayer('tps', { fadeOutDuration: 0.2 });

    // TODO: In future, trigger stow animation here
  }

  /**
   * Handle instant weapon switch (e.g., quick slot)
   */
  onWeaponSwitched(fromSlot: EquipmentSlotType, toSlot: EquipmentSlotType): void {
    console.log(`[EquipmentAnimationBridge] Weapon switched from ${fromSlot} to ${toSlot}`);

    this.currentState.currentSlot = toSlot;

    // TPS layer stays enabled, just switch weapon visually
    // No animation transition needed
  }

  /**
   * Get current equipment animation state
   */
  getState(): EquipmentAnimationState {
    return { ...this.currentState };
  }

  /**
   * Check if weapon is equipped
   */
  isWeaponEquipped(): boolean {
    return this.currentState.weaponEquipped;
  }

  /**
   * Check if weapon is wielded
   */
  isWeaponWielded(): boolean {
    return this.currentState.weaponWielded;
  }

  /**
   * Get current equipped slot
   */
  getCurrentSlot(): EquipmentSlotType | null {
    return this.currentState.currentSlot;
  }

  /**
   * Handle weapon state change (generic)
   */
  onWeaponStateChanged(
    slot: EquipmentSlotType,
    newState: WeaponState,
    oldState?: WeaponState
  ): void {
    console.log(`[EquipmentAnimationBridge] Weapon state changed: ${oldState} → ${newState}`);

    switch (newState) {
      case WeaponState.IN_INVENTORY:
        if (oldState === WeaponState.STOWED || oldState === WeaponState.WIELDED) {
          this.onWeaponUnequipped(slot);
        }
        break;

      case WeaponState.STOWED:
        if (oldState === WeaponState.IN_INVENTORY) {
          this.onWeaponEquipped(slot);
        } else if (oldState === WeaponState.WIELDED) {
          this.onWeaponStowed(slot);
        }
        break;

      case WeaponState.WIELDED:
        if (oldState === WeaponState.STOWED || oldState === WeaponState.IN_INVENTORY) {
          this.onWeaponWielded(slot);
        }
        break;
    }
  }

  /**
   * Reset bridge state
   */
  reset(): void {
    this.currentState = {
      weaponEquipped: false,
      weaponWielded: false,
      currentSlot: null,
    };
    console.log('[EquipmentAnimationBridge] Reset');
  }
}

// Singleton instance
export const equipmentAnimationBridge = new EquipmentAnimationBridge();
