/**
 * Equipment Type System
 * Defines all types, enums, and interfaces for the modular equipment system
 */

/**
 * Equipment Category - Top-level classification
 */
export enum EquipmentCategory {
  WEAPON = 'weapon',
  CONSUMABLE = 'consumable',
  TOOL = 'tool',
  QUEST = 'quest',
  MISCELLANEOUS = 'miscellaneous',
}

/**
 * Weapon State - Clear distinction between inventory and equipped states
 */
export enum WeaponState {
  /** In inventory only, not visible on character */
  IN_INVENTORY = 'in_inventory',
  /** Stowed on character (back/thigh), visible but not in use */
  STOWED = 'stowed',
  /** Wielded in hand, actively usable */
  WIELDED = 'wielded',
}

/**
 * Equipment Slot Type - Where equipment can be attached/stored
 */
export enum EquipmentSlotType {
  // Back weapons (2 slots)
  BACK_LEFT = 'back_left',
  BACK_RIGHT = 'back_right',

  // Thigh weapons (2 slots)
  THIGH_RIGHT = 'thigh_right',
  THIGH_LEFT = 'thigh_left',

  // Hands (2 slots - primary/secondary)
  HAND_PRIMARY = 'hand_primary',
  HAND_SECONDARY = 'hand_secondary',

  // Belt/Quick access (4 slots)
  BELT_SLOT_1 = 'belt_slot_1',
  BELT_SLOT_2 = 'belt_slot_2',
  BELT_SLOT_3 = 'belt_slot_3',
  BELT_SLOT_4 = 'belt_slot_4',

  // Inventory only (no visual attachment)
  INVENTORY_ONLY = 'inventory_only',
}

/**
 * Weapon Type - Specific weapon classifications
 */
export enum WeaponType {
  RIFLE = 'rifle',
  PISTOL = 'pistol',
  KNIFE = 'knife',
  GRENADE = 'grenade',
  MOLOTOV = 'molotov',
  SWORD = 'sword',
  SHIELD = 'shield',
}

/**
 * Consumable Type
 */
export enum ConsumableType {
  MEDICAL = 'medical',
  FOOD = 'food',
  POTION = 'potion',
  BANDAGE = 'bandage',
}

/**
 * Tool Type
 */
export enum ToolType {
  FLASHLIGHT = 'flashlight',
  LANTERN = 'lantern',
  BINOCULARS = 'binoculars',
  COMPASS = 'compass',
}

/**
 * Visual Attachment Behavior
 */
export enum AttachmentBehavior {
  BONE_ATTACH = 'bone_attach',        // Attach to specific bone (weapons in hand)
  BONE_PARENT = 'bone_parent',        // Parent to bone (back weapons)
  WORLD_POSITION = 'world_position',  // Absolute world position
  NONE = 'none',                      // No visual (inventory only)
}

/**
 * Base Equipment Interface - All equipment extends this
 */
export interface BaseEquipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  icon?: string;

  // Stacking behavior
  stackable: boolean;
  maxStackSize: number;

  // Equipment-specific metadata
  metadata?: Record<string, any>;
}

/**
 * Equipment Attachment Configuration
 */
export interface EquipmentAttachmentConfig {
  behavior: AttachmentBehavior;

  // Bone attachment settings
  boneName?: string;                  // e.g., 'RightHand', 'Spine2'
  boneSearchPatterns?: string[];      // Fallback patterns: ['righthand', 'right_hand', 'mixamorigrighthand']

  // Transform settings
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;

  // Model settings
  modelPath?: string;                 // 3D model for this equipment
  hideWhenStowed?: boolean;           // Hide visual when not equipped
}

/**
 * Equipment Slot Configuration
 */
export interface EquipmentSlotConfig {
  slotType: EquipmentSlotType;
  displayName: string;                // Display name (e.g., "DOS 1", "HOLSTER", "POCHE 1")
  category: EquipmentCategory;

  // Compatibility
  allowedTypes: (WeaponType | ConsumableType | string)[];

  // Quickbar integration
  quickbarCompatible: boolean;
  quickbarSlot?: number;              // 1-9 for keyboard bindings

  // Visual settings
  attachmentConfig: EquipmentAttachmentConfig;

  // Animation integration
  requiresSpecificAnimation?: boolean;
  animationSet?: string;              // e.g., 'rifle', 'pistol', 'unarmed'
}

/**
 * Weapon Equipment - Extends base with weapon-specific properties
 */
export interface WeaponEquipment extends BaseEquipment {
  category: EquipmentCategory.WEAPON;
  weaponType: WeaponType;

  // Weapon stats
  damage?: number;
  range?: number;
  fireRate?: number;
  ammoCapacity?: number;

  // Visual/Audio
  modelPath: string;
  fireSound?: string;
  reloadSound?: string;

  // Behavior
  requiresAiming: boolean;
  twoHanded: boolean;

  // Slots this weapon can be equipped to
  compatibleSlots: EquipmentSlotType[];
}

/**
 * Equipment Effect (for consumables, buffs, etc.)
 */
export interface EquipmentEffect {
  type: 'heal' | 'buff' | 'debuff' | 'custom';
  value: number;
  duration?: number;                  // ms, undefined = instant
  customHandler?: string;             // Reference to custom effect handler
}

/**
 * Consumable Equipment
 */
export interface ConsumableEquipment extends BaseEquipment {
  category: EquipmentCategory.CONSUMABLE;
  consumableType: ConsumableType;

  // Usage behavior
  useDuration: number;                // ms to use
  cooldown?: number;                  // ms cooldown after use

  // Effects
  effects: EquipmentEffect[];

  // Slots
  compatibleSlots: EquipmentSlotType[];
}

/**
 * Tool Equipment
 */
export interface ToolEquipment extends BaseEquipment {
  category: EquipmentCategory.TOOL;
  toolType: ToolType;

  // Tool behavior
  isToggleable: boolean;              // Can be toggled on/off (e.g., flashlight)
  consumesPower?: boolean;            // Requires power/battery
  durability?: number;                // Tool durability

  // Visual/Audio
  modelPath?: string;
  activateSound?: string;
  deactivateSound?: string;

  // Slots
  compatibleSlots: EquipmentSlotType[];
}

/**
 * Quest Item Equipment
 */
export interface QuestEquipment extends BaseEquipment {
  category: EquipmentCategory.QUEST;
  questId?: string;
  isUnique: boolean;

  // Quest items usually don't have slots (inventory only)
  compatibleSlots: [EquipmentSlotType.INVENTORY_ONLY];
}

/**
 * Union type for all equipment
 */
export type Equipment = WeaponEquipment | ConsumableEquipment | ToolEquipment | QuestEquipment;
