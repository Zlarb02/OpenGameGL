/**
 * Bindings par défaut pour clavier/souris
 * Supporte AZERTY et QWERTY automatiquement
 */

import { GameAction } from '../actions/ActionDefinitions';
import { ActionBinding, DeviceBindings, DeviceType, KeyboardLayout } from '../core/InputTypes';

/**
 * Crée les bindings clavier/souris par défaut pour un layout donné
 */
export function createDefaultKeyboardBindings(layout: KeyboardLayout): DeviceBindings {
  // Déterminer les touches de mouvement selon le layout
  const moveKeys = getMovementKeys(layout);

  const bindings: ActionBinding[] = [
    // === LOCOMOTION ===
    {
      action: GameAction.MOVE_FORWARD,
      primary: { type: 'keyboard', key: moveKeys.forward },
      secondary: { type: 'keyboard', key: 'ArrowUp' },
      mode: 'hold',
    },
    {
      action: GameAction.MOVE_BACKWARD,
      primary: { type: 'keyboard', key: moveKeys.backward },
      secondary: { type: 'keyboard', key: 'ArrowDown' },
      mode: 'hold',
    },
    {
      action: GameAction.MOVE_LEFT,
      primary: { type: 'keyboard', key: moveKeys.left },
      secondary: { type: 'keyboard', key: 'ArrowLeft' },
      mode: 'hold',
    },
    {
      action: GameAction.MOVE_RIGHT,
      primary: { type: 'keyboard', key: moveKeys.right },
      secondary: { type: 'keyboard', key: 'ArrowRight' },
      mode: 'hold',
    },
    {
      action: GameAction.JUMP,
      primary: { type: 'keyboard', key: 'Space' },
      mode: 'tap',
    },
    {
      action: GameAction.SPRINT,
      primary: { type: 'keyboard', key: 'ShiftLeft' },
      secondary: { type: 'keyboard', key: 'ShiftRight' },
      mode: 'hold',
    },
    {
      action: GameAction.CROUCH,
      primary: { type: 'keyboard', key: 'KeyC' },
      mode: 'toggle',
    },
    {
      action: GameAction.PRONE,
      primary: { type: 'keyboard', key: 'ControlLeft' },
      secondary: { type: 'keyboard', key: 'KeyX' },
      mode: 'hold',
    },
    {
      action: GameAction.DASH,
      primary: { type: 'keyboard', key: 'AltLeft' },
      mode: 'tap',
    },

    // === CAMERA ===
    {
      action: GameAction.FREELOOK,
      primary: { type: 'keyboard', key: layout === KeyboardLayout.AZERTY ? 'KeyZ' : 'KeyZ' }, // KeyZ = W affiché sur AZERTY (libre), Z affiché sur QWERTY (libre)
      mode: 'hold',
    },
    {
      action: GameAction.FREELOOK_TOGGLE,
      primary: { type: 'keyboard', key: layout === KeyboardLayout.AZERTY ? 'KeyZ' : 'KeyZ' }, // Tap
      mode: 'tap',
    },
    {
      action: GameAction.ZOOM_IN,
      primary: { type: 'mouse', button: 3 }, // Molette haut (géré différemment)
      mode: 'tap',
    },
    {
      action: GameAction.ZOOM_OUT,
      primary: { type: 'mouse', button: 4 }, // Molette bas (géré différemment)
      mode: 'tap',
    },

    // === COMBAT ===
    {
      action: GameAction.AIM,
      primary: { type: 'mouse', button: 2 }, // Clic droit
      mode: 'hold',
    },
    {
      action: GameAction.FIRE,
      primary: { type: 'mouse', button: 0 }, // Clic gauche
      mode: 'tap',
    },
    {
      action: GameAction.RELOAD,
      primary: { type: 'keyboard', key: 'KeyR' },
      mode: 'tap',
    },
    {
      action: GameAction.STOW_WEAPON,
      primary: { type: 'keyboard', key: 'KeyR' },
      mode: 'hold',
    },
    {
      action: GameAction.MELEE_EQUIP,
      primary: { type: 'keyboard', key: 'KeyF' },
      mode: 'hold',
    },

    // === OBJETS À LANCER ===
    {
      action: GameAction.THROW_SELECT_NEXT,
      primary: { type: 'keyboard', key: 'KeyG' },
      mode: 'tap',
    },

    // === ACTIONS CONTEXTUELLES ===
    {
      action: GameAction.USE,
      primary: { type: 'keyboard', key: 'KeyE' },
      mode: 'tap',
    },
    {
      action: GameAction.QUICK_HEAL,
      primary: { type: 'keyboard', key: 'KeyH' },
      mode: 'tap',
    },

    // === INVENTAIRE & SLOTS RAPIDES ===
    {
      action: GameAction.QUICK_SLOT_1,
      primary: { type: 'keyboard', key: 'Digit1' },
      mode: 'tap',
    },
    {
      action: GameAction.QUICK_SLOT_2,
      primary: { type: 'keyboard', key: 'Digit2' },
      mode: 'tap',
    },
    {
      action: GameAction.QUICK_SLOT_3,
      primary: { type: 'keyboard', key: 'Digit3' },
      mode: 'tap',
    },
    {
      action: GameAction.QUICK_SLOT_4,
      primary: { type: 'keyboard', key: 'Digit4' },
      mode: 'tap',
    },
    {
      action: GameAction.QUICK_SLOT_5,
      primary: { type: 'keyboard', key: 'Digit5' },
      mode: 'tap',
    },
    {
      action: GameAction.QUICK_SLOT_6,
      primary: { type: 'keyboard', key: 'Digit6' },
      mode: 'tap',
    },
    {
      action: GameAction.QUICK_SLOT_7,
      primary: { type: 'keyboard', key: 'Digit7' },
      mode: 'tap',
    },
    {
      action: GameAction.QUICK_SLOT_8,
      primary: { type: 'keyboard', key: 'Digit8' },
      mode: 'tap',
    },
    {
      action: GameAction.QUICK_SLOT_9,
      primary: { type: 'keyboard', key: 'Digit9' },
      mode: 'tap',
    },
    {
      action: GameAction.QUICK_SLOT_0,
      primary: { type: 'keyboard', key: 'Digit0' },
      mode: 'tap',
    },
    {
      action: GameAction.QUICK_SLOT_MINUS,
      primary: { type: 'keyboard', key: 'Minus' },
      mode: 'tap',
    },
    {
      action: GameAction.QUICK_SLOT_EQUALS,
      primary: { type: 'keyboard', key: 'Equal' },
      mode: 'tap',
    },

    // === MENUS ===
    {
      action: GameAction.QUICK_INVENTORY,
      primary: { type: 'keyboard', key: 'Tab' },
      mode: 'tap',
    },
    {
      action: GameAction.INVENTORY,
      primary: { type: 'keyboard', key: 'KeyI' },
      mode: 'tap',
    },
    {
      action: GameAction.JOURNAL,
      primary: { type: 'keyboard', key: 'KeyJ' },
      mode: 'tap',
    },
    {
      action: GameAction.QUESTS,
      primary: { type: 'keyboard', key: 'KeyQ' },
      mode: 'tap',
    },
    {
      action: GameAction.CHARACTER,
      primary: { type: 'keyboard', key: 'KeyP' },
      mode: 'tap',
    },
    {
      action: GameAction.MAP,
      primary: { type: 'keyboard', key: 'KeyM' },
      secondary: { type: 'keyboard', key: 'Comma' }, // , sur AZERTY
      mode: 'tap',
    },

    // === MODES ===
    {
      action: GameAction.CONSTRUCTION_MODE,
      primary: { type: 'keyboard', key: 'KeyV' },
      mode: 'tap',
    },
    {
      action: GameAction.EMOTE_MODE,
      primary: { type: 'keyboard', key: 'KeyB' },
      mode: 'tap',
    },

    // === SYSTÈME ===
    {
      action: GameAction.PAUSE,
      primary: { type: 'keyboard', key: 'Escape' },
      mode: 'tap',
    },
  ];

  return {
    deviceType: DeviceType.KEYBOARD_MOUSE,
    bindings,
  };
}

/**
 * Obtenir les touches de mouvement selon le layout
 */
function getMovementKeys(layout: KeyboardLayout) {
  switch (layout) {
    case KeyboardLayout.AZERTY:
      return {
        forward: 'KeyW', // Z sur clavier AZERTY (physiquement)
        backward: 'KeyS',
        left: 'KeyA', // Q sur clavier AZERTY
        right: 'KeyD',
      };
    case KeyboardLayout.QWERTZ:
      return {
        forward: 'KeyW',
        backward: 'KeyS',
        left: 'KeyA',
        right: 'KeyD',
      };
    case KeyboardLayout.QWERTY:
    default:
      return {
        forward: 'KeyW',
        backward: 'KeyS',
        left: 'KeyA',
        right: 'KeyD',
      };
  }
}

/**
 * Obtenir un label lisible pour une touche
 * Prend en compte le layout pour afficher le bon caractère
 */
export function getKeyboardBindingLabel(
  binding: ActionBinding,
  layout: KeyboardLayout
): string {
  if (binding.primary.type === 'keyboard') {
    const key = binding.primary.key;

    // Touches spéciales avec des noms lisibles
    const specialKeys: Record<string, string> = {
      Space: 'Espace',
      ShiftLeft: 'Shift',
      ShiftRight: 'Shift',
      ControlLeft: 'Ctrl',
      ControlRight: 'Ctrl',
      AltLeft: 'Alt',
      AltRight: 'Alt',
      Escape: 'Échap',
      Tab: 'Tab',
      Enter: 'Entrée',
      ArrowUp: '↑',
      ArrowDown: '↓',
      ArrowLeft: '←',
      ArrowRight: '→',
    };

    if (specialKeys[key]) {
      return specialKeys[key];
    }

    // Pour les touches de caractères, afficher selon le layout
    if (key.startsWith('Key')) {
      const letter = key.substring(3);

      // Mapping AZERTY
      if (layout === KeyboardLayout.AZERTY) {
        const azertyMap: Record<string, string> = {
          Q: 'A',
          W: 'Z',
          A: 'Q',
          Z: 'W',
          M: ',',
        };
        return azertyMap[letter] || letter;
      }

      return letter;
    }

    // Pour les chiffres
    if (key.startsWith('Digit')) {
      return key.substring(5);
    }

    return key;
  }

  if (binding.primary.type === 'mouse') {
    const button = binding.primary.button;
    if (button === 0) return 'Clic Gauche';
    if (button === 1) return 'Clic Molette';
    if (button === 2) return 'Clic Droit';
    if (button === 3) return 'Molette Haut';
    if (button === 4) return 'Molette Bas';
    return `Bouton Souris ${button}`;
  }

  return 'Inconnu';
}
