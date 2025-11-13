/**
 * Equipment Manager
 * Manages equipped items and inventory integration
 */

import * as THREE from 'three';
import { Equipment, EquipmentSlotType, WeaponState, WeaponEquipment } from '../types/EquipmentTypes';
import { AttachmentSystem } from './AttachmentSystem';
import { EquipmentRenderer } from './EquipmentRenderer';
import { EquipmentRegistry } from '../config/EquipmentRegistry';
import { WeaponTransformOverrides } from '../config/WeaponTransformOverrides';

/**
 * Manages equipped items and inventory integration
 */
export class EquipmentManager {
  private equippedItems: Map<EquipmentSlotType, Equipment> = new Map(); // Stowed items (on back, visible)
  private wieldedSlot: EquipmentSlotType | null = null; // Currently wielded weapon (in hand)
  private attachmentSystem: AttachmentSystem;
  private renderer: EquipmentRenderer;

  constructor(
    attachmentSystem: AttachmentSystem,
    renderer: EquipmentRenderer
  ) {
    this.attachmentSystem = attachmentSystem;
    this.renderer = renderer;
  }

  /**
   * Equip item to slot
   */
  async equip(
    equipment: Equipment,
    targetSlot: EquipmentSlotType
  ): Promise<boolean> {
    // Validate slot compatibility
    if (!this.isCompatible(equipment, targetSlot)) {
      console.error(`[EquipmentManager] Equipment ${equipment.id} not compatible with slot ${targetSlot}`);
      return false;
    }

    // Validate back weapon limit (max 2)
    if (this.isBackWeaponSlot(targetSlot)) {
      const backWeaponsCount = this.getEquippedBackWeaponsCount();
      if (backWeaponsCount >= 2 && !this.equippedItems.has(targetSlot)) {
        console.error('[EquipmentManager] Cannot equip more than 2 back weapons');
        return false;
      }
    }

    // Unequip existing item in slot
    await this.unequip(targetSlot);

    // Load model
    const model = await this.renderer.loadModel(equipment);
    if (!model) {
      console.error(`[EquipmentManager] Failed to load model for ${equipment.id}`);
      return false;
    }

    // Attach to slot
    const attached = this.attachmentSystem.attach(equipment, targetSlot, model);
    if (!attached) {
      console.error(`[EquipmentManager] Failed to attach ${equipment.id} to ${targetSlot}`);
      return false;
    }

    // Store equipped item
    this.equippedItems.set(targetSlot, equipment);

    return true;
  }

  /**
   * Unequip item from slot
   */
  async unequip(slot: EquipmentSlotType): Promise<Equipment | null> {
    const equipment = this.equippedItems.get(slot);
    if (!equipment) return null;

    // Determine which slot to detach from
    // If the weapon is wielded, it's attached to HAND_PRIMARY, not the original slot
    const slotToDetach = this.wieldedSlot === slot ? EquipmentSlotType.HAND_PRIMARY : slot;

    console.log(`[EquipmentManager] Unequipping from ${slotToDetach} (original slot: ${slot}, wielded: ${this.wieldedSlot === slot})`);

    // Detach visual
    this.attachmentSystem.detach(slotToDetach);

    // Clear wielded state if this was the wielded weapon
    if (this.wieldedSlot === slot) {
      console.log('[EquipmentManager] Clearing wielded slot');
      this.wieldedSlot = null;
    }

    // Remove from equipped items
    this.equippedItems.delete(slot);

    return equipment;
  }

  /**
   * Unequip item and return both Equipment and the 3D model
   * Used for dropping items to reuse the existing model
   */
  async unequipAndReturnModel(slot: EquipmentSlotType): Promise<{ equipment: Equipment; model: THREE.Object3D } | null> {
    const equipment = this.equippedItems.get(slot);
    if (!equipment) return null;

    // Determine which slot to detach from
    // If the weapon is wielded, it's attached to HAND_PRIMARY, not the original slot
    const slotToDetach = this.wieldedSlot === slot ? EquipmentSlotType.HAND_PRIMARY : slot;

    console.log(`[EquipmentManager] Detaching from ${slotToDetach} (original slot: ${slot}, wielded: ${this.wieldedSlot === slot})`);

    // Detach visual and return the Object3D
    const model = this.attachmentSystem.detachAndReturn(slotToDetach);
    if (!model) {
      console.error('[EquipmentManager] Failed to detach model from', slotToDetach);
      return null;
    }

    // Clear wielded state if this was the wielded weapon
    if (this.wieldedSlot === slot) {
      this.wieldedSlot = null;
    }

    // Remove from equipped items
    this.equippedItems.delete(slot);

    return { equipment, model };
  }

  /**
   * Check if equipment is compatible with slot
   */
  private isCompatible(
    equipment: Equipment,
    slot: EquipmentSlotType
  ): boolean {
    // Check if equipment declares this slot as compatible
    if ('compatibleSlots' in equipment) {
      return equipment.compatibleSlots.includes(slot);
    }

    // Check slot configuration
    const slotConfig = EquipmentRegistry.getSlotConfig(slot);
    if (!slotConfig) return false;

    // Check category match
    if (slotConfig.category !== equipment.category) return false;

    // Check specific type compatibility
    if ('weaponType' in equipment) {
      return slotConfig.allowedTypes.includes(equipment.weaponType);
    }
    if ('consumableType' in equipment) {
      return slotConfig.allowedTypes.includes(equipment.consumableType);
    }

    return true;
  }

  /**
   * Check if slot is a back weapon slot
   */
  private isBackWeaponSlot(slot: EquipmentSlotType): boolean {
    return slot === EquipmentSlotType.BACK_LEFT || slot === EquipmentSlotType.BACK_RIGHT;
  }

  /**
   * Get count of equipped back weapons
   */
  private getEquippedBackWeaponsCount(): number {
    let count = 0;
    if (this.equippedItems.has(EquipmentSlotType.BACK_LEFT)) count++;
    if (this.equippedItems.has(EquipmentSlotType.BACK_RIGHT)) count++;
    return count;
  }

  /**
   * Get equipment in slot
   */
  getEquipped(slot: EquipmentSlotType): Equipment | null {
    return this.equippedItems.get(slot) || null;
  }

  /**
   * Get all equipped items
   */
  getAllEquipped(): Map<EquipmentSlotType, Equipment> {
    return new Map(this.equippedItems);
  }

  /**
   * Find slots that can hold this equipment
   */
  getCompatibleSlots(equipment: Equipment): EquipmentSlotType[] {
    if ('compatibleSlots' in equipment) {
      return [...equipment.compatibleSlots];
    }
    return [];
  }

  /**
   * Toggle equipment visibility (e.g., stow weapon)
   */
  setSlotVisible(slot: EquipmentSlotType, visible: boolean) {
    this.attachmentSystem.setVisible(slot, visible);
  }

  /**
   * Check if slot is occupied
   */
  isSlotOccupied(slot: EquipmentSlotType): boolean {
    return this.equippedItems.has(slot);
  }

  /**
   * Get first available back weapon slot
   */
  getFirstAvailableBackSlot(): EquipmentSlotType | null {
    if (!this.equippedItems.has(EquipmentSlotType.BACK_LEFT)) {
      return EquipmentSlotType.BACK_LEFT;
    }
    if (!this.equippedItems.has(EquipmentSlotType.BACK_RIGHT)) {
      return EquipmentSlotType.BACK_RIGHT;
    }
    return null;
  }

  /**
   * Get first available slot from equipment's compatible slots
   * Generic version that works for any equipment type
   */
  getFirstAvailableSlot(equipment: Equipment): EquipmentSlotType | null {
    const compatibleSlots = equipment.compatibleSlots || [];

    for (const slot of compatibleSlots) {
      if (!this.equippedItems.has(slot)) {
        return slot;
      }
    }

    return null; // All compatible slots are occupied
  }

  /**
   * Get first available thigh slot
   */
  getFirstAvailableThighSlot(): EquipmentSlotType | null {
    if (!this.equippedItems.has(EquipmentSlotType.THIGH_RIGHT)) {
      return EquipmentSlotType.THIGH_RIGHT;
    }
    if (!this.equippedItems.has(EquipmentSlotType.THIGH_LEFT)) {
      return EquipmentSlotType.THIGH_LEFT;
    }
    return null;
  }

  /**
   * Can this equipment be equipped (considering all constraints)?
   */
  canEquip(equipment: Equipment, slot?: EquipmentSlotType): boolean {
    // If no slot specified, check if ANY compatible slot is available
    if (!slot) {
      const compatibleSlots = this.getCompatibleSlots(equipment);
      for (const testSlot of compatibleSlots) {
        if (this.canEquip(equipment, testSlot)) {
          return true;
        }
      }
      return false;
    }

    // Check compatibility
    if (!this.isCompatible(equipment, slot)) {
      return false;
    }

    // Check back weapon limit
    if (this.isBackWeaponSlot(slot)) {
      const backWeaponsCount = this.getEquippedBackWeaponsCount();
      // Can equip if slot is empty OR replacing existing item in same slot
      if (backWeaponsCount >= 2 && !this.equippedItems.has(slot)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Wield a weapon (draw from stowed position to hand)
   * Weapon must already be equipped (stowed) in a slot
   */
  async wield(slot: EquipmentSlotType): Promise<boolean> {
    const equipment = this.equippedItems.get(slot);
    if (!equipment) {
      console.error(`[EquipmentManager] No equipment in slot ${slot} to wield`);
      return false;
    }

    // If already wielding this slot, do nothing
    if (this.wieldedSlot === slot) {
      return true;
    }

    // If currently wielding another weapon, stow it inline (without setting wieldedSlot to null)
    // This prevents intermediate state where no weapon is wielded
    if (this.wieldedSlot && this.wieldedSlot !== slot) {
      const currentWieldedSlot = this.wieldedSlot;
      const currentEquipment = this.equippedItems.get(currentWieldedSlot);

      if (currentEquipment) {
        console.log(`[EquipmentManager] Inline stow: ${currentEquipment.name} from ${currentWieldedSlot}`);

        // Detach from hand
        this.attachmentSystem.detach(EquipmentSlotType.HAND_PRIMARY);

        // Re-attach to original stowed position (back)
        const stowModel = await this.renderer.loadModel(currentEquipment);
        if (stowModel) {
          this.attachmentSystem.attach(currentEquipment, currentWieldedSlot, stowModel);
        }
      }
    }

    // Check for orphan weapon in hand (weapon without a wieldedSlot reference)
    const handEquipment = this.equippedItems.get(EquipmentSlotType.HAND_PRIMARY);
    if (handEquipment && !this.wieldedSlot) {
      console.warn('[EquipmentManager] Removing orphan weapon from hand to make room for wield');
      this.attachmentSystem.detach(EquipmentSlotType.HAND_PRIMARY);
      this.equippedItems.delete(EquipmentSlotType.HAND_PRIMARY);
    }

    // Detach from back/stowed position
    this.attachmentSystem.detach(slot);

    // Load model and attach to hand (HAND_PRIMARY)
    const model = await this.renderer.loadModel(equipment);
    if (!model) {
      console.error(`[EquipmentManager] Failed to load model for wielding`);
      return false;
    }

    const attachedToHand = this.attachmentSystem.attach(
      equipment,
      EquipmentSlotType.HAND_PRIMARY,
      model
    );

    if (!attachedToHand) {
      console.error(`[EquipmentManager] Failed to attach to hand`);
      // Re-attach to original slot on failure
      const backupModel = await this.renderer.loadModel(equipment);
      if (backupModel) {
        this.attachmentSystem.attach(equipment, slot, backupModel);
      }
      return false;
    }

    // Set wielded slot atomically (only one state change)
    this.wieldedSlot = slot;
    console.log(`[EquipmentManager] Wielded ${equipment.name} to slot ${slot}`);

    return true;
  }

  /**
   * Stow the currently wielded weapon (put back to stowed position)
   */
  async stow(): Promise<boolean> {
    if (!this.wieldedSlot) {
      return true;
    }

    const slot = this.wieldedSlot;
    const equipment = this.equippedItems.get(slot);

    if (!equipment) {
      console.error('[EquipmentManager] Wielded slot has no equipment! State inconsistency detected.');
      this.wieldedSlot = null;
      return false;
    }

    // Detach from hand
    this.attachmentSystem.detach(EquipmentSlotType.HAND_PRIMARY);

    // Re-attach to original stowed position (back)
    const model = await this.renderer.loadModel(equipment);
    if (!model) {
      console.error(`[EquipmentManager] Failed to load model for stowing`);
      return false;
    }

    const reattached = this.attachmentSystem.attach(equipment, slot, model);
    if (!reattached) {
      console.error(`[EquipmentManager] Failed to re-attach to ${slot}`);
      return false;
    }

    this.wieldedSlot = null;

    return true;
  }

  /**
   * Get currently wielded weapon slot
   */
  getWieldedSlot(): EquipmentSlotType | null {
    return this.wieldedSlot;
  }

  /**
   * Get currently wielded equipment
   */
  getWieldedEquipment(): Equipment | null {
    if (!this.wieldedSlot) return null;
    return this.equippedItems.get(this.wieldedSlot) || null;
  }

  /**
   * Check if a specific slot is currently wielded
   */
  isWielded(slot: EquipmentSlotType): boolean {
    return this.wieldedSlot === slot;
  }

  /**
   * Get weapon state for a slot
   */
  getWeaponState(slot: EquipmentSlotType): WeaponState {
    if (!this.equippedItems.has(slot)) {
      return WeaponState.IN_INVENTORY;
    }
    if (this.wieldedSlot === slot) {
      return WeaponState.WIELDED;
    }
    return WeaponState.STOWED;
  }

  /**
   * Refresh transforms of all equipped items from WeaponTransformOverrides
   * Used for real-time Leva debugging
   * Only updates stowed equipment (not wielded), as wielded equipment uses hand transforms
   */
  refreshTransforms(): void {
    for (const [slot, equipment] of this.equippedItems.entries()) {
      // Skip wielded equipment (it's in hand, not in back slot)
      if (this.wieldedSlot === slot) {
        continue;
      }

      // Only update weapon equipment with overrides
      if ('weaponType' in equipment) {
        const weaponEquipment = equipment as WeaponEquipment;
        const override = WeaponTransformOverrides.get(weaponEquipment.weaponType, slot);

        if (override) {
          // Update the transform of the attached equipment
          const success = this.attachmentSystem.updateTransform(
            slot,
            override.position,
            override.rotation,
            override.scale
          );

          if (success) {
            console.log(`[EquipmentManager] ✓ Refreshed transform for ${weaponEquipment.weaponType} in ${slot}`);
          }
        }
      }
    }
  }
}
