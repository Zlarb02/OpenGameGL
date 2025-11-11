/**
 * Définition de toutes les actions possibles dans le jeu
 * Chaque action est un identifiant abstrait indépendant du périphérique
 */

export enum GameAction {
  // === LOCOMOTION ===
  MOVE_FORWARD = 'move_forward',
  MOVE_BACKWARD = 'move_backward',
  MOVE_LEFT = 'move_left',
  MOVE_RIGHT = 'move_right',
  JUMP = 'jump',
  SPRINT = 'sprint',
  CROUCH = 'crouch',
  PRONE = 'prone', // Allongé (futur)
  DASH = 'dash', // Esquive/dash

  // === CAMERA ===
  CAMERA_UP = 'camera_up',
  CAMERA_DOWN = 'camera_down',
  CAMERA_LEFT = 'camera_left',
  CAMERA_RIGHT = 'camera_right',
  FREELOOK = 'freelook', // Maintenir pour regarder autour
  FREELOOK_TOGGLE = 'freelook_toggle', // Toggle mode freelook
  ZOOM_IN = 'zoom_in',
  ZOOM_OUT = 'zoom_out',

  // === COMBAT ===
  AIM = 'aim',
  FIRE = 'fire',
  RELOAD = 'reload',
  STOW_WEAPON = 'stow_weapon', // Ranger/sortir arme (maintenir)
  MELEE_EQUIP = 'melee_equip', // Sortir/ranger couteau
  NEXT_WEAPON = 'next_weapon',
  PREV_WEAPON = 'prev_weapon',
  WEAPON_WHEEL = 'weapon_wheel', // Roue d'armes (maintenir)

  // === OBJETS À LANCER ===
  THROW_SELECT_NEXT = 'throw_select_next',
  THROW_SELECT_PREV = 'throw_select_prev',
  THROW = 'throw',

  // === ACTIONS CONTEXTUELLES ===
  USE = 'use', // Interagir/utiliser/ramasser
  QUICK_HEAL = 'quick_heal',
  TOGGLE_HELMET = 'toggle_helmet', // Casque ON/OFF (oxygène)

  // === INVENTAIRE & MENUS ===
  QUICK_SLOT_1 = 'quick_slot_1',
  QUICK_SLOT_2 = 'quick_slot_2',
  QUICK_SLOT_3 = 'quick_slot_3',
  QUICK_SLOT_4 = 'quick_slot_4',
  QUICK_SLOT_5 = 'quick_slot_5',
  QUICK_SLOT_6 = 'quick_slot_6',
  QUICK_SLOT_7 = 'quick_slot_7',
  QUICK_SLOT_8 = 'quick_slot_8',
  QUICK_SLOT_9 = 'quick_slot_9',
  QUICK_SLOT_0 = 'quick_slot_0',
  QUICK_SLOT_MINUS = 'quick_slot_minus',
  QUICK_SLOT_EQUALS = 'quick_slot_equals',

  QUICK_INVENTORY = 'quick_inventory', // Tab
  INVENTORY = 'inventory', // I
  JOURNAL = 'journal', // J
  QUESTS = 'quests', // Q
  CHARACTER = 'character', // P
  MAP = 'map', // M ou ,

  // === MODES ===
  CONSTRUCTION_MODE = 'construction_mode', // V
  EMOTE_MODE = 'emote_mode', // B
  CONSTRUCTION_WHEEL = 'construction_wheel', // Roue construction (maintenir)
  EMOTE_WHEEL = 'emote_wheel', // Roue emotes (maintenir)
  QUICK_EMOTE = 'quick_emote',

  // === SYSTÈME ===
  PAUSE = 'pause', // ESC / Start
  MENU_UP = 'menu_up',
  MENU_DOWN = 'menu_down',
  MENU_LEFT = 'menu_left',
  MENU_RIGHT = 'menu_right',
  MENU_CONFIRM = 'menu_confirm',
  MENU_BACK = 'menu_back',
}

/**
 * Groupes d'actions pour organisation
 */
export enum ActionGroup {
  LOCOMOTION = 'locomotion',
  CAMERA = 'camera',
  COMBAT = 'combat',
  ITEMS = 'items',
  MENUS = 'menus',
  SYSTEM = 'system',
}

/**
 * Métadonnées pour chaque action
 */
export interface ActionMetadata {
  action: GameAction;
  group: ActionGroup;
  label: string; // Nom affiché dans l'UI
  description: string;
  supportsTap: boolean; // Supporte tap (appui court)
  supportsHold: boolean; // Supporte hold (maintenir)
  supportsToggle: boolean; // Supporte toggle (on/off)
  defaultMode: 'tap' | 'hold' | 'toggle'; // Mode par défaut
  implemented: boolean; // Est-ce que la feature est implémentée?
}

/**
 * Base de données complète des actions
 */
export const ACTION_METADATA: Record<GameAction, ActionMetadata> = {
  // === LOCOMOTION ===
  [GameAction.MOVE_FORWARD]: {
    action: GameAction.MOVE_FORWARD,
    group: ActionGroup.LOCOMOTION,
    label: 'Avancer',
    description: 'Déplacer le personnage vers l\'avant',
    supportsTap: false,
    supportsHold: true,
    supportsToggle: false,
    defaultMode: 'hold',
    implemented: true,
  },
  [GameAction.MOVE_BACKWARD]: {
    action: GameAction.MOVE_BACKWARD,
    group: ActionGroup.LOCOMOTION,
    label: 'Reculer',
    description: 'Déplacer le personnage vers l\'arrière',
    supportsTap: false,
    supportsHold: true,
    supportsToggle: false,
    defaultMode: 'hold',
    implemented: true,
  },
  [GameAction.MOVE_LEFT]: {
    action: GameAction.MOVE_LEFT,
    group: ActionGroup.LOCOMOTION,
    label: 'Gauche',
    description: 'Déplacer le personnage vers la gauche',
    supportsTap: false,
    supportsHold: true,
    supportsToggle: false,
    defaultMode: 'hold',
    implemented: true,
  },
  [GameAction.MOVE_RIGHT]: {
    action: GameAction.MOVE_RIGHT,
    group: ActionGroup.LOCOMOTION,
    label: 'Droite',
    description: 'Déplacer le personnage vers la droite',
    supportsTap: false,
    supportsHold: true,
    supportsToggle: false,
    defaultMode: 'hold',
    implemented: true,
  },
  [GameAction.JUMP]: {
    action: GameAction.JUMP,
    group: ActionGroup.LOCOMOTION,
    label: 'Sauter',
    description: 'Faire sauter le personnage (hold pour sauter plus haut)',
    supportsTap: true,
    supportsHold: true,
    supportsToggle: false,
    defaultMode: 'tap',
    implemented: true,
  },
  [GameAction.SPRINT]: {
    action: GameAction.SPRINT,
    group: ActionGroup.LOCOMOTION,
    label: 'Sprint',
    description: 'Courir plus vite',
    supportsTap: true,
    supportsHold: true,
    supportsToggle: true,
    defaultMode: 'hold',
    implemented: true,
  },
  [GameAction.CROUCH]: {
    action: GameAction.CROUCH,
    group: ActionGroup.LOCOMOTION,
    label: 'S\'accroupir',
    description: 'S\'accroupir pour être plus discret',
    supportsTap: true,
    supportsHold: true,
    supportsToggle: true,
    defaultMode: 'toggle',
    implemented: true,
  },
  [GameAction.PRONE]: {
    action: GameAction.PRONE,
    group: ActionGroup.LOCOMOTION,
    label: 'S\'allonger',
    description: 'S\'allonger au sol (futur)',
    supportsTap: false,
    supportsHold: true,
    supportsToggle: true,
    defaultMode: 'hold',
    implemented: false,
  },
  [GameAction.DASH]: {
    action: GameAction.DASH,
    group: ActionGroup.LOCOMOTION,
    label: 'Esquive/Dash',
    description: 'Esquive rapide dans une direction',
    supportsTap: true,
    supportsHold: false,
    supportsToggle: false,
    defaultMode: 'tap',
    implemented: false,
  },

  // === CAMERA ===
  [GameAction.CAMERA_UP]: {
    action: GameAction.CAMERA_UP,
    group: ActionGroup.CAMERA,
    label: 'Caméra Haut',
    description: 'Tourner la caméra vers le haut',
    supportsTap: false,
    supportsHold: true,
    supportsToggle: false,
    defaultMode: 'hold',
    implemented: true,
  },
  [GameAction.CAMERA_DOWN]: {
    action: GameAction.CAMERA_DOWN,
    group: ActionGroup.CAMERA,
    label: 'Caméra Bas',
    description: 'Tourner la caméra vers le bas',
    supportsTap: false,
    supportsHold: true,
    supportsToggle: false,
    defaultMode: 'hold',
    implemented: true,
  },
  [GameAction.CAMERA_LEFT]: {
    action: GameAction.CAMERA_LEFT,
    group: ActionGroup.CAMERA,
    label: 'Caméra Gauche',
    description: 'Tourner la caméra vers la gauche',
    supportsTap: false,
    supportsHold: true,
    supportsToggle: false,
    defaultMode: 'hold',
    implemented: true,
  },
  [GameAction.CAMERA_RIGHT]: {
    action: GameAction.CAMERA_RIGHT,
    group: ActionGroup.CAMERA,
    label: 'Caméra Droite',
    description: 'Tourner la caméra vers la droite',
    supportsTap: false,
    supportsHold: true,
    supportsToggle: false,
    defaultMode: 'hold',
    implemented: true,
  },
  [GameAction.FREELOOK]: {
    action: GameAction.FREELOOK,
    group: ActionGroup.CAMERA,
    label: 'Freelook',
    description: 'Regarder autour sans tourner le personnage',
    supportsTap: true,
    supportsHold: true,
    supportsToggle: true,
    defaultMode: 'hold',
    implemented: false,
  },
  [GameAction.FREELOOK_TOGGLE]: {
    action: GameAction.FREELOOK_TOGGLE,
    group: ActionGroup.CAMERA,
    label: 'Toggle Freelook',
    description: 'Activer/désactiver le mode freelook',
    supportsTap: true,
    supportsHold: false,
    supportsToggle: false,
    defaultMode: 'tap',
    implemented: false,
  },
  [GameAction.ZOOM_IN]: {
    action: GameAction.ZOOM_IN,
    group: ActionGroup.CAMERA,
    label: 'Zoom +',
    description: 'Zoomer la caméra',
    supportsTap: true,
    supportsHold: true,
    supportsToggle: false,
    defaultMode: 'hold',
    implemented: true,
  },
  [GameAction.ZOOM_OUT]: {
    action: GameAction.ZOOM_OUT,
    group: ActionGroup.CAMERA,
    label: 'Zoom -',
    description: 'Dézoomer la caméra',
    supportsTap: true,
    supportsHold: true,
    supportsToggle: false,
    defaultMode: 'hold',
    implemented: true,
  },

  // === COMBAT ===
  [GameAction.AIM]: {
    action: GameAction.AIM,
    group: ActionGroup.COMBAT,
    label: 'Viser',
    description: 'Viser avec l\'arme',
    supportsTap: false,
    supportsHold: true,
    supportsToggle: true,
    defaultMode: 'hold',
    implemented: true,
  },
  [GameAction.FIRE]: {
    action: GameAction.FIRE,
    group: ActionGroup.COMBAT,
    label: 'Tirer',
    description: 'Tirer avec l\'arme',
    supportsTap: true,
    supportsHold: true,
    supportsToggle: false,
    defaultMode: 'tap',
    implemented: true,
  },
  [GameAction.RELOAD]: {
    action: GameAction.RELOAD,
    group: ActionGroup.COMBAT,
    label: 'Recharger',
    description: 'Recharger l\'arme',
    supportsTap: true,
    supportsHold: false,
    supportsToggle: false,
    defaultMode: 'tap',
    implemented: false,
  },
  [GameAction.STOW_WEAPON]: {
    action: GameAction.STOW_WEAPON,
    group: ActionGroup.COMBAT,
    label: 'Ranger Arme',
    description: 'Ranger/sortir la dernière arme utilisée',
    supportsTap: false,
    supportsHold: true,
    supportsToggle: false,
    defaultMode: 'hold',
    implemented: false,
  },
  [GameAction.MELEE_EQUIP]: {
    action: GameAction.MELEE_EQUIP,
    group: ActionGroup.COMBAT,
    label: 'Couteau',
    description: 'Sortir/ranger le couteau de mêlée',
    supportsTap: true,
    supportsHold: true,
    supportsToggle: false,
    defaultMode: 'hold',
    implemented: false,
  },
  [GameAction.NEXT_WEAPON]: {
    action: GameAction.NEXT_WEAPON,
    group: ActionGroup.COMBAT,
    label: 'Arme Suivante',
    description: 'Sélectionner l\'arme suivante',
    supportsTap: true,
    supportsHold: false,
    supportsToggle: false,
    defaultMode: 'tap',
    implemented: false,
  },
  [GameAction.PREV_WEAPON]: {
    action: GameAction.PREV_WEAPON,
    group: ActionGroup.COMBAT,
    label: 'Arme Précédente',
    description: 'Sélectionner l\'arme précédente',
    supportsTap: true,
    supportsHold: false,
    supportsToggle: false,
    defaultMode: 'tap',
    implemented: false,
  },
  [GameAction.WEAPON_WHEEL]: {
    action: GameAction.WEAPON_WHEEL,
    group: ActionGroup.COMBAT,
    label: 'Roue d\'Armes',
    description: 'Ouvrir la roue de sélection d\'armes',
    supportsTap: false,
    supportsHold: true,
    supportsToggle: false,
    defaultMode: 'hold',
    implemented: false,
  },

  // === OBJETS À LANCER ===
  [GameAction.THROW_SELECT_NEXT]: {
    action: GameAction.THROW_SELECT_NEXT,
    group: ActionGroup.ITEMS,
    label: 'Objet Lancer Suivant',
    description: 'Sélectionner l\'objet à lancer suivant (pierre/grenade)',
    supportsTap: true,
    supportsHold: false,
    supportsToggle: false,
    defaultMode: 'tap',
    implemented: false,
  },
  [GameAction.THROW_SELECT_PREV]: {
    action: GameAction.THROW_SELECT_PREV,
    group: ActionGroup.ITEMS,
    label: 'Objet Lancer Précédent',
    description: 'Sélectionner l\'objet à lancer précédent',
    supportsTap: true,
    supportsHold: false,
    supportsToggle: false,
    defaultMode: 'tap',
    implemented: false,
  },
  [GameAction.THROW]: {
    action: GameAction.THROW,
    group: ActionGroup.ITEMS,
    label: 'Lancer',
    description: 'Lancer l\'objet sélectionné',
    supportsTap: true,
    supportsHold: true,
    supportsToggle: false,
    defaultMode: 'tap',
    implemented: false,
  },

  // === ACTIONS CONTEXTUELLES ===
  [GameAction.USE]: {
    action: GameAction.USE,
    group: ActionGroup.ITEMS,
    label: 'Utiliser/Interagir',
    description: 'Interagir avec un objet/personnage',
    supportsTap: true,
    supportsHold: true,
    supportsToggle: false,
    defaultMode: 'tap',
    implemented: false,
  },
  [GameAction.QUICK_HEAL]: {
    action: GameAction.QUICK_HEAL,
    group: ActionGroup.ITEMS,
    label: 'Soin Rapide',
    description: 'Utiliser un soin rapidement',
    supportsTap: true,
    supportsHold: false,
    supportsToggle: false,
    defaultMode: 'tap',
    implemented: false,
  },
  [GameAction.TOGGLE_HELMET]: {
    action: GameAction.TOGGLE_HELMET,
    group: ActionGroup.ITEMS,
    label: 'Casque ON/OFF',
    description: 'Activer/désactiver le casque (oxygène)',
    supportsTap: true,
    supportsHold: false,
    supportsToggle: false,
    defaultMode: 'tap',
    implemented: false,
  },

  // === INVENTAIRE & MENUS ===
  [GameAction.QUICK_SLOT_1]: { action: GameAction.QUICK_SLOT_1, group: ActionGroup.MENUS, label: 'Slot Rapide 1', description: 'Sélectionner le slot rapide 1', supportsTap: true, supportsHold: false, supportsToggle: false, defaultMode: 'tap', implemented: false },
  [GameAction.QUICK_SLOT_2]: { action: GameAction.QUICK_SLOT_2, group: ActionGroup.MENUS, label: 'Slot Rapide 2', description: 'Sélectionner le slot rapide 2', supportsTap: true, supportsHold: false, supportsToggle: false, defaultMode: 'tap', implemented: false },
  [GameAction.QUICK_SLOT_3]: { action: GameAction.QUICK_SLOT_3, group: ActionGroup.MENUS, label: 'Slot Rapide 3', description: 'Sélectionner le slot rapide 3', supportsTap: true, supportsHold: false, supportsToggle: false, defaultMode: 'tap', implemented: false },
  [GameAction.QUICK_SLOT_4]: { action: GameAction.QUICK_SLOT_4, group: ActionGroup.MENUS, label: 'Slot Rapide 4', description: 'Sélectionner le slot rapide 4', supportsTap: true, supportsHold: false, supportsToggle: false, defaultMode: 'tap', implemented: false },
  [GameAction.QUICK_SLOT_5]: { action: GameAction.QUICK_SLOT_5, group: ActionGroup.MENUS, label: 'Slot Rapide 5', description: 'Sélectionner le slot rapide 5', supportsTap: true, supportsHold: false, supportsToggle: false, defaultMode: 'tap', implemented: false },
  [GameAction.QUICK_SLOT_6]: { action: GameAction.QUICK_SLOT_6, group: ActionGroup.MENUS, label: 'Slot Rapide 6', description: 'Sélectionner le slot rapide 6', supportsTap: true, supportsHold: false, supportsToggle: false, defaultMode: 'tap', implemented: false },
  [GameAction.QUICK_SLOT_7]: { action: GameAction.QUICK_SLOT_7, group: ActionGroup.MENUS, label: 'Slot Rapide 7', description: 'Sélectionner le slot rapide 7', supportsTap: true, supportsHold: false, supportsToggle: false, defaultMode: 'tap', implemented: false },
  [GameAction.QUICK_SLOT_8]: { action: GameAction.QUICK_SLOT_8, group: ActionGroup.MENUS, label: 'Slot Rapide 8', description: 'Sélectionner le slot rapide 8', supportsTap: true, supportsHold: false, supportsToggle: false, defaultMode: 'tap', implemented: false },
  [GameAction.QUICK_SLOT_9]: { action: GameAction.QUICK_SLOT_9, group: ActionGroup.MENUS, label: 'Slot Rapide 9', description: 'Sélectionner le slot rapide 9', supportsTap: true, supportsHold: false, supportsToggle: false, defaultMode: 'tap', implemented: false },
  [GameAction.QUICK_SLOT_0]: { action: GameAction.QUICK_SLOT_0, group: ActionGroup.MENUS, label: 'Slot Rapide 0', description: 'Sélectionner le slot rapide 0', supportsTap: true, supportsHold: false, supportsToggle: false, defaultMode: 'tap', implemented: false },
  [GameAction.QUICK_SLOT_MINUS]: { action: GameAction.QUICK_SLOT_MINUS, group: ActionGroup.MENUS, label: 'Slot Rapide -', description: 'Sélectionner le slot rapide -', supportsTap: true, supportsHold: false, supportsToggle: false, defaultMode: 'tap', implemented: false },
  [GameAction.QUICK_SLOT_EQUALS]: { action: GameAction.QUICK_SLOT_EQUALS, group: ActionGroup.MENUS, label: 'Slot Rapide =', description: 'Sélectionner le slot rapide =', supportsTap: true, supportsHold: false, supportsToggle: false, defaultMode: 'tap', implemented: false },

  [GameAction.QUICK_INVENTORY]: {
    action: GameAction.QUICK_INVENTORY,
    group: ActionGroup.MENUS,
    label: 'Inventaire Rapide',
    description: 'Ouvrir l\'inventaire rapide',
    supportsTap: true,
    supportsHold: false,
    supportsToggle: false,
    defaultMode: 'tap',
    implemented: false,
  },
  [GameAction.INVENTORY]: {
    action: GameAction.INVENTORY,
    group: ActionGroup.MENUS,
    label: 'Inventaire',
    description: 'Ouvrir l\'inventaire complet',
    supportsTap: true,
    supportsHold: false,
    supportsToggle: false,
    defaultMode: 'tap',
    implemented: false,
  },
  [GameAction.JOURNAL]: {
    action: GameAction.JOURNAL,
    group: ActionGroup.MENUS,
    label: 'Journal',
    description: 'Ouvrir le journal',
    supportsTap: true,
    supportsHold: false,
    supportsToggle: false,
    defaultMode: 'tap',
    implemented: false,
  },
  [GameAction.QUESTS]: {
    action: GameAction.QUESTS,
    group: ActionGroup.MENUS,
    label: 'Quêtes',
    description: 'Ouvrir le menu des quêtes',
    supportsTap: true,
    supportsHold: false,
    supportsToggle: false,
    defaultMode: 'tap',
    implemented: false,
  },
  [GameAction.CHARACTER]: {
    action: GameAction.CHARACTER,
    group: ActionGroup.MENUS,
    label: 'Personnage',
    description: 'Ouvrir le menu du personnage',
    supportsTap: true,
    supportsHold: false,
    supportsToggle: false,
    defaultMode: 'tap',
    implemented: false,
  },
  [GameAction.MAP]: {
    action: GameAction.MAP,
    group: ActionGroup.MENUS,
    label: 'Carte',
    description: 'Ouvrir la carte',
    supportsTap: true,
    supportsHold: false,
    supportsToggle: false,
    defaultMode: 'tap',
    implemented: false,
  },

  // === MODES ===
  [GameAction.CONSTRUCTION_MODE]: {
    action: GameAction.CONSTRUCTION_MODE,
    group: ActionGroup.MENUS,
    label: 'Mode Construction',
    description: 'Activer/désactiver le mode construction',
    supportsTap: true,
    supportsHold: false,
    supportsToggle: false,
    defaultMode: 'tap',
    implemented: false,
  },
  [GameAction.EMOTE_MODE]: {
    action: GameAction.EMOTE_MODE,
    group: ActionGroup.MENUS,
    label: 'Mode Emote',
    description: 'Activer/désactiver le mode emote',
    supportsTap: true,
    supportsHold: false,
    supportsToggle: false,
    defaultMode: 'tap',
    implemented: false,
  },
  [GameAction.CONSTRUCTION_WHEEL]: {
    action: GameAction.CONSTRUCTION_WHEEL,
    group: ActionGroup.MENUS,
    label: 'Roue Construction',
    description: 'Ouvrir la roue de construction',
    supportsTap: false,
    supportsHold: true,
    supportsToggle: false,
    defaultMode: 'hold',
    implemented: false,
  },
  [GameAction.EMOTE_WHEEL]: {
    action: GameAction.EMOTE_WHEEL,
    group: ActionGroup.MENUS,
    label: 'Roue Emotes',
    description: 'Ouvrir la roue d\'emotes',
    supportsTap: false,
    supportsHold: true,
    supportsToggle: false,
    defaultMode: 'hold',
    implemented: false,
  },
  [GameAction.QUICK_EMOTE]: {
    action: GameAction.QUICK_EMOTE,
    group: ActionGroup.MENUS,
    label: 'Emote Rapide',
    description: 'Faire l\'emote favori',
    supportsTap: true,
    supportsHold: true,
    supportsToggle: false,
    defaultMode: 'tap',
    implemented: false,
  },

  // === SYSTÈME ===
  [GameAction.PAUSE]: {
    action: GameAction.PAUSE,
    group: ActionGroup.SYSTEM,
    label: 'Pause',
    description: 'Ouvrir le menu pause',
    supportsTap: true,
    supportsHold: false,
    supportsToggle: false,
    defaultMode: 'tap',
    implemented: false,
  },
  [GameAction.MENU_UP]: {
    action: GameAction.MENU_UP,
    group: ActionGroup.SYSTEM,
    label: 'Menu Haut',
    description: 'Navigation menu vers le haut',
    supportsTap: true,
    supportsHold: false,
    supportsToggle: false,
    defaultMode: 'tap',
    implemented: false,
  },
  [GameAction.MENU_DOWN]: {
    action: GameAction.MENU_DOWN,
    group: ActionGroup.SYSTEM,
    label: 'Menu Bas',
    description: 'Navigation menu vers le bas',
    supportsTap: true,
    supportsHold: false,
    supportsToggle: false,
    defaultMode: 'tap',
    implemented: false,
  },
  [GameAction.MENU_LEFT]: {
    action: GameAction.MENU_LEFT,
    group: ActionGroup.SYSTEM,
    label: 'Menu Gauche',
    description: 'Navigation menu vers la gauche',
    supportsTap: true,
    supportsHold: false,
    supportsToggle: false,
    defaultMode: 'tap',
    implemented: false,
  },
  [GameAction.MENU_RIGHT]: {
    action: GameAction.MENU_RIGHT,
    group: ActionGroup.SYSTEM,
    label: 'Menu Droite',
    description: 'Navigation menu vers la droite',
    supportsTap: true,
    supportsHold: false,
    supportsToggle: false,
    defaultMode: 'tap',
    implemented: false,
  },
  [GameAction.MENU_CONFIRM]: {
    action: GameAction.MENU_CONFIRM,
    group: ActionGroup.SYSTEM,
    label: 'Menu Confirmer',
    description: 'Confirmer la sélection dans un menu',
    supportsTap: true,
    supportsHold: false,
    supportsToggle: false,
    defaultMode: 'tap',
    implemented: false,
  },
  [GameAction.MENU_BACK]: {
    action: GameAction.MENU_BACK,
    group: ActionGroup.SYSTEM,
    label: 'Menu Retour',
    description: 'Retour/annuler dans un menu',
    supportsTap: true,
    supportsHold: false,
    supportsToggle: false,
    defaultMode: 'tap',
    implemented: false,
  },
};

/**
 * Helper pour obtenir toutes les actions d'un groupe
 */
export function getActionsByGroup(group: ActionGroup): GameAction[] {
  return Object.values(ACTION_METADATA)
    .filter(meta => meta.group === group)
    .map(meta => meta.action);
}

/**
 * Helper pour obtenir les métadonnées d'une action
 */
export function getActionMetadata(action: GameAction): ActionMetadata {
  return ACTION_METADATA[action];
}
