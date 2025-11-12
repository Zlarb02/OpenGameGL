/**
 * Attachment System
 * Manages equipment visual attachment to character skeleton
 */

import { Group, Bone, Object3D } from 'three';
import { Equipment, EquipmentSlotType, AttachmentBehavior } from '../types/EquipmentTypes';
import { EquipmentRegistry } from '../config/EquipmentRegistry';

/**
 * Manages equipment visual attachment to character skeleton
 */
export class AttachmentSystem {
  private skeleton: Group | null = null;
  private boneCache: Map<string, Bone> = new Map();
  private attachedEquipment: Map<EquipmentSlotType, Object3D> = new Map();

  constructor() {}

  /**
   * Initialize system with character skeleton
   */
  initialize(characterModel: Group) {
    this.skeleton = characterModel;
    this.cacheBones(characterModel);
  }

  /**
   * Cache all bones for quick lookup
   */
  private cacheBones(model: Group) {
    this.boneCache.clear();

    model.traverse((child) => {
      if (child.type === 'Bone') {
        const bone = child as Bone;
        const boneName = bone.name.toLowerCase();
        this.boneCache.set(boneName, bone);
      }
    });
  }

  /**
   * Find bone by name or search patterns
   */
  findBone(boneName: string, searchPatterns?: string[]): Bone | null {
    // Try exact match first
    const exactMatch = this.boneCache.get(boneName.toLowerCase());
    if (exactMatch) return exactMatch;

    // Try search patterns
    if (searchPatterns) {
      for (const pattern of searchPatterns) {
        const match = this.boneCache.get(pattern.toLowerCase());
        if (match) {
          return match;
        }
      }
    }

    // Try partial matching as last resort
    const allBones = Array.from(this.boneCache.keys());
    const partialMatch = allBones.find(name =>
      name.includes('spine') && name.includes('2')
    );

    if (partialMatch) {
      return this.boneCache.get(partialMatch) || null;
    }

    console.warn(`[AttachmentSystem] ✗ Bone not found: ${boneName}`, {
      searchPatterns,
      availableBones: allBones.filter(n => n.includes('spine')).slice(0, 10)
    });
    return null;
  }

  /**
   * Attach equipment to slot
   */
  attach(
    equipment: Equipment,
    slotType: EquipmentSlotType,
    model: Object3D
  ): boolean {
    const slotConfig = EquipmentRegistry.getSlotConfig(slotType);
    if (!slotConfig) {
      console.error(`[AttachmentSystem] No slot config for ${slotType}`);
      return false;
    }

    const { attachmentConfig } = slotConfig;

    // Detach any existing equipment in this slot
    this.detach(slotType);

    // Apply attachment based on behavior
    switch (attachmentConfig.behavior) {
      case AttachmentBehavior.BONE_ATTACH:
      case AttachmentBehavior.BONE_PARENT:
        return this.attachToBone(
          model,
          attachmentConfig,
          slotType
        );

      case AttachmentBehavior.WORLD_POSITION:
        return this.attachToWorld(
          model,
          attachmentConfig,
          slotType
        );

      case AttachmentBehavior.NONE:
        // No visual attachment
        return true;

      default:
        console.error(`[AttachmentSystem] Unknown attachment behavior: ${attachmentConfig.behavior}`);
        return false;
    }
  }

  /**
   * Attach to bone
   */
  private attachToBone(
    model: Object3D,
    config: any,
    slotType: EquipmentSlotType
  ): boolean {
    if (!config.boneName) {
      console.error('[AttachmentSystem] ✗ Bone name required for bone attachment');
      return false;
    }

    const bone = this.findBone(config.boneName, config.boneSearchPatterns);
    if (!bone) {
      console.error(`[AttachmentSystem] ✗ Bone not found: ${config.boneName}`);
      return false;
    }

    // CRITICAL: Reset model transforms to identity before adding to group
    model.position.set(0, 0, 0);
    model.rotation.set(0, 0, 0);
    model.scale.set(1, 1, 1);
    model.updateMatrix();

    // Create attachment group
    const attachmentGroup = new Group();
    attachmentGroup.name = `attachment_${slotType}`;
    attachmentGroup.add(model);

    // Apply transform to group (not to model)
    attachmentGroup.position.set(...config.position);
    attachmentGroup.rotation.set(...config.rotation);
    attachmentGroup.scale.setScalar(config.scale);

    // CRITICAL: Disable auto-update to prevent animations from overriding transforms
    attachmentGroup.matrixAutoUpdate = false;

    // Force matrix update once
    attachmentGroup.updateMatrix();
    attachmentGroup.updateMatrixWorld(true);

    // Attach to bone
    bone.add(attachmentGroup);

    // Store reference
    this.attachedEquipment.set(slotType, attachmentGroup);

    // Ensure visibility
    attachmentGroup.visible = true;
    attachmentGroup.traverse((child) => {
      if ('visible' in child) {
        child.visible = true;
      }
    });

    return true;
  }

  /**
   * Attach to world position (relative to character)
   */
  private attachToWorld(
    model: Object3D,
    config: any,
    slotType: EquipmentSlotType
  ): boolean {
    if (!this.skeleton) {
      console.error('[AttachmentSystem] Skeleton not initialized');
      return false;
    }

    const attachmentGroup = new Group();
    attachmentGroup.name = `attachment_${slotType}`;
    attachmentGroup.add(model);

    attachmentGroup.position.set(...config.position);
    attachmentGroup.rotation.set(...config.rotation);
    attachmentGroup.scale.setScalar(config.scale);

    this.skeleton.add(attachmentGroup);
    this.attachedEquipment.set(slotType, attachmentGroup);

    console.log(`[AttachmentSystem] Attached to world position for slot ${slotType}`);
    return true;
  }

  /**
   * Detach equipment from slot
   */
  detach(slotType: EquipmentSlotType): boolean {
    const attached = this.attachedEquipment.get(slotType);
    if (!attached) return false;

    if (attached.parent) {
      attached.parent.remove(attached);
    }

    this.attachedEquipment.delete(slotType);
    return true;
  }

  /**
   * Toggle visibility of equipment in slot
   */
  setVisible(slotType: EquipmentSlotType, visible: boolean) {
    const attached = this.attachedEquipment.get(slotType);
    if (attached) {
      attached.visible = visible;
    }
  }

  /**
   * Get all currently attached equipment
   */
  getAttachedEquipment(): Map<EquipmentSlotType, Object3D> {
    return new Map(this.attachedEquipment);
  }

  /**
   * Check if slot has attached equipment
   */
  isAttached(slotType: EquipmentSlotType): boolean {
    return this.attachedEquipment.has(slotType);
  }

  /**
   * Check if skeleton is initialized
   */
  isInitialized(): boolean {
    return this.boneCache.size > 0;
  }

  /**
   * Get attached object for slot
   */
  getAttached(slotType: EquipmentSlotType): Object3D | undefined {
    return this.attachedEquipment.get(slotType);
  }

  /**
   * Update transform of attached equipment (for debugging)
   */
  updateTransform(
    slotType: EquipmentSlotType,
    position: [number, number, number],
    rotation: [number, number, number],
    scale: number
  ): boolean {
    const attached = this.attachedEquipment.get(slotType);
    if (!attached) return false;

    attached.position.set(...position);
    attached.rotation.set(...rotation);
    attached.scale.setScalar(scale);

    return true;
  }

  /**
   * Cleanup
   */
  dispose() {
    // Detach all equipment
    for (const slotType of this.attachedEquipment.keys()) {
      this.detach(slotType);
    }

    this.boneCache.clear();
    this.skeleton = null;
  }
}
