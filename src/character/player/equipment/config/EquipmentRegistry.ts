/**
 * Equipment Registry
 * Central registry for all equipment configurations and slot definitions
 */

import {
  Equipment,
  EquipmentSlotType,
  EquipmentSlotConfig,
  AttachmentBehavior,
  WeaponType,
  ConsumableType,
  ToolType,
  EquipmentCategory,
} from '../types/EquipmentTypes';

/**
 * Central registry for all equipment configurations
 */
export class EquipmentRegistry {
  private static slots: Map<EquipmentSlotType, EquipmentSlotConfig> = new Map();
  private static equipment: Map<string, Equipment> = new Map();
  private static initialized = false;

  /**
   * Initialize registry with slot configurations
   */
  static initialize() {
    if (this.initialized) return;

    // Back weapon slots - Accept ANY back weapon on either side (rifles, swords, shields)
    this.registerSlot({
      slotType: EquipmentSlotType.BACK_LEFT,
      displayName: 'DOS 1',
      category: EquipmentCategory.WEAPON,
      allowedTypes: [WeaponType.RIFLE, WeaponType.SWORD, WeaponType.SHIELD],
      quickbarCompatible: true,
      quickbarSlot: 1,
      attachmentConfig: {
        behavior: AttachmentBehavior.BONE_PARENT,
        boneName: 'mixamorigspine2',
        boneSearchPatterns: ['spine2', 'spine_02'],
        position: [-9, 5, -18],
        rotation: [-4.64, -3.31, -4.97],
        scale: 80.0,
        hideWhenStowed: false,
      },
      requiresSpecificAnimation: true,
      animationSet: 'rifle',
    });

    this.registerSlot({
      slotType: EquipmentSlotType.BACK_RIGHT,
      displayName: 'DOS 2',
      category: EquipmentCategory.WEAPON,
      allowedTypes: [WeaponType.RIFLE, WeaponType.SWORD, WeaponType.SHIELD],
      quickbarCompatible: true,
      quickbarSlot: 2,
      attachmentConfig: {
        behavior: AttachmentBehavior.BONE_PARENT,
        boneName: 'mixamorigspine2',
        boneSearchPatterns: ['spine2', 'spine_02'],
        position: [5, 5, -14],
        rotation: [-4.82, -2.97, 4.80],
        scale: 80.0,
        hideWhenStowed: false,
      },
      requiresSpecificAnimation: true,
      animationSet: 'rifle',
    });

    // Thigh weapon slots (pistols, knives)
    this.registerSlot({
      slotType: EquipmentSlotType.THIGH_RIGHT,
      displayName: 'HOLSTER',
      category: EquipmentCategory.WEAPON,
      allowedTypes: [WeaponType.PISTOL, WeaponType.KNIFE],
      quickbarCompatible: true,
      quickbarSlot: 3,
      attachmentConfig: {
        behavior: AttachmentBehavior.BONE_PARENT,
        boneName: 'mixamorigrightupleg',
        boneSearchPatterns: ['rightupleg', 'right_upleg', 'rightleg', 'right_leg'],
        position: [0.1, -0.2, 0.05],
        rotation: [0, 0, -0.2],
        scale: 1.0,
        hideWhenStowed: false,
      },
      requiresSpecificAnimation: false,
    });

    this.registerSlot({
      slotType: EquipmentSlotType.THIGH_LEFT,
      displayName: 'FOURREAU',
      category: EquipmentCategory.WEAPON,
      allowedTypes: [WeaponType.PISTOL, WeaponType.KNIFE],
      quickbarCompatible: true,
      quickbarSlot: 4,
      attachmentConfig: {
        behavior: AttachmentBehavior.BONE_PARENT,
        boneName: 'mixamorigleftupleg',
        boneSearchPatterns: ['leftupleg', 'left_upleg', 'leftleg', 'left_leg'],
        position: [-0.1, -0.2, 0.05],
        rotation: [0, 0, 0.2],
        scale: 1.0,
        hideWhenStowed: false,
      },
      requiresSpecificAnimation: false,
    });

    // Hand slots (for active weapons - NOT in quickbar, controlled by wielding)
    this.registerSlot({
      slotType: EquipmentSlotType.HAND_PRIMARY,
      displayName: 'MAIN DROITE',
      category: EquipmentCategory.WEAPON,
      allowedTypes: [WeaponType.RIFLE, WeaponType.PISTOL, WeaponType.KNIFE, WeaponType.SWORD],
      quickbarCompatible: false, // Hand slots are not in quickbar
      attachmentConfig: {
        behavior: AttachmentBehavior.BONE_ATTACH,
        boneName: 'mixamorigrighthand',
        boneSearchPatterns: ['righthand', 'right_hand', 'hand_r'],
        position: [-8.2, 6.4, 1.9],
        rotation: [-1.8, 2.7, 1.8],
        scale: 80.0,
        hideWhenStowed: true,
      },
      requiresSpecificAnimation: true,
      animationSet: 'rifle',
    });

    this.registerSlot({
      slotType: EquipmentSlotType.HAND_SECONDARY,
      displayName: 'MAIN GAUCHE',
      category: EquipmentCategory.WEAPON,
      allowedTypes: [WeaponType.PISTOL, WeaponType.KNIFE, WeaponType.SHIELD],
      quickbarCompatible: false, // Hand slots are not in quickbar
      attachmentConfig: {
        behavior: AttachmentBehavior.BONE_ATTACH,
        boneName: 'mixamoriglefthand',
        boneSearchPatterns: ['lefthand', 'left_hand', 'hand_l'],
        position: [0.08, 0.06, 0.02],
        rotation: [1.8, -2.7, -1.8],
        scale: 80.0,
        hideWhenStowed: true,
      },
      requiresSpecificAnimation: true,
      animationSet: 'pistol',
    });

    // Belt/Utility slots (tools, throwables, consumables)
    // Slot 5: LAMPE (flashlight, lantern)
    this.registerSlot({
      slotType: EquipmentSlotType.BELT_SLOT_1,
      displayName: 'LAMPE',
      category: EquipmentCategory.TOOL,
      allowedTypes: [
        ToolType.FLASHLIGHT,
        ToolType.LANTERN,
      ],
      quickbarCompatible: true,
      quickbarSlot: 5,
      attachmentConfig: {
        behavior: AttachmentBehavior.BONE_PARENT,
        boneName: 'mixamorigspine',
        boneSearchPatterns: ['spine', 'spine_01'],
        position: [-0.1, -0.1, 0.15],
        rotation: [0, 0, 0],
        scale: 0.5,
        hideWhenStowed: false,
      },
      requiresSpecificAnimation: false,
    });

    // Slot 6: POCHE 1 (throwables, consumables)
    this.registerSlot({
      slotType: EquipmentSlotType.BELT_SLOT_2,
      displayName: 'POCHE 1',
      category: EquipmentCategory.CONSUMABLE,
      allowedTypes: [
        WeaponType.GRENADE,
        WeaponType.MOLOTOV,
        ConsumableType.MEDICAL,
        ConsumableType.BANDAGE,
        ConsumableType.FOOD,
        ConsumableType.POTION,
      ],
      quickbarCompatible: true,
      quickbarSlot: 6,
      attachmentConfig: {
        behavior: AttachmentBehavior.BONE_PARENT,
        boneName: 'mixamorigspine',
        boneSearchPatterns: ['spine', 'spine_01'],
        position: [0.0, -0.1, 0.15],
        rotation: [0, 0, 0],
        scale: 0.5,
        hideWhenStowed: false,
      },
      requiresSpecificAnimation: false,
    });

    // Slot 7: POCHE 2 (throwables, consumables)
    this.registerSlot({
      slotType: EquipmentSlotType.BELT_SLOT_3,
      displayName: 'POCHE 2',
      category: EquipmentCategory.CONSUMABLE,
      allowedTypes: [
        WeaponType.GRENADE,
        WeaponType.MOLOTOV,
        ConsumableType.MEDICAL,
        ConsumableType.BANDAGE,
        ConsumableType.FOOD,
        ConsumableType.POTION,
      ],
      quickbarCompatible: true,
      quickbarSlot: 7,
      attachmentConfig: {
        behavior: AttachmentBehavior.BONE_PARENT,
        boneName: 'mixamorigspine',
        boneSearchPatterns: ['spine', 'spine_01'],
        position: [0.1, -0.1, 0.15],
        rotation: [0, 0, 0],
        scale: 0.5,
        hideWhenStowed: false,
      },
      requiresSpecificAnimation: false,
    });

    // Slot 8: POCHE 3 (throwables, consumables)
    this.registerSlot({
      slotType: EquipmentSlotType.BELT_SLOT_4,
      displayName: 'POCHE 3',
      category: EquipmentCategory.CONSUMABLE,
      allowedTypes: [
        WeaponType.GRENADE,
        WeaponType.MOLOTOV,
        ConsumableType.MEDICAL,
        ConsumableType.BANDAGE,
        ConsumableType.FOOD,
        ConsumableType.POTION,
      ],
      quickbarCompatible: true,
      quickbarSlot: 8,
      attachmentConfig: {
        behavior: AttachmentBehavior.BONE_PARENT,
        boneName: 'mixamorigspine',
        boneSearchPatterns: ['spine', 'spine_01'],
        position: [0.2, -0.1, 0.15],
        rotation: [0, 0, 0],
        scale: 0.5,
        hideWhenStowed: false,
      },
      requiresSpecificAnimation: false,
    });

    // Inventory only slot (quest items, misc)
    this.registerSlot({
      slotType: EquipmentSlotType.INVENTORY_ONLY,
      displayName: 'INVENTAIRE',
      category: EquipmentCategory.MISCELLANEOUS,
      allowedTypes: [], // Accepts anything
      quickbarCompatible: false,
      attachmentConfig: {
        behavior: AttachmentBehavior.NONE,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: 1.0,
      },
      requiresSpecificAnimation: false,
    });

    this.initialized = true;
    console.log(`[EquipmentRegistry] Initialized with ${this.slots.size} slots`);
  }

  /**
   * Register a slot configuration
   */
  static registerSlot(config: EquipmentSlotConfig) {
    this.slots.set(config.slotType, config);
  }

  /**
   * Register equipment
   */
  static registerEquipment(equipment: Equipment) {
    this.equipment.set(equipment.id, equipment);
  }

  /**
   * Get slot configuration
   */
  static getSlotConfig(slotType: EquipmentSlotType): EquipmentSlotConfig | undefined {
    return this.slots.get(slotType);
  }

  /**
   * Get equipment by ID
   */
  static getEquipment(id: string): Equipment | undefined {
    return this.equipment.get(id);
  }

  /**
   * Get all slots for a category
   */
  static getSlotsByCategory(category: EquipmentCategory): EquipmentSlotConfig[] {
    return Array.from(this.slots.values()).filter(
      slot => slot.category === category
    );
  }

  /**
   * Get all quickbar-compatible slots
   */
  static getQuickbarSlots(): EquipmentSlotConfig[] {
    return Array.from(this.slots.values())
      .filter(slot => slot.quickbarCompatible)
      .sort((a, b) => (a.quickbarSlot || 0) - (b.quickbarSlot || 0));
  }

  /**
   * Get back weapon slots (for validation)
   */
  static getBackWeaponSlots(): EquipmentSlotType[] {
    return [EquipmentSlotType.BACK_LEFT, EquipmentSlotType.BACK_RIGHT];
  }

  /**
   * Get thigh weapon slots
   */
  static getThighWeaponSlots(): EquipmentSlotType[] {
    return [EquipmentSlotType.THIGH_LEFT, EquipmentSlotType.THIGH_RIGHT];
  }

  /**
   * Get all registered equipment
   */
  static getAllEquipment(): Equipment[] {
    return Array.from(this.equipment.values());
  }
}

// Auto-initialize on import
EquipmentRegistry.initialize();
