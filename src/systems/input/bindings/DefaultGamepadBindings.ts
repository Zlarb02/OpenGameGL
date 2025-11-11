/**
 * Bindings par défaut pour manette (gamepad)
 * Compatible Xbox, PlayStation, Nintendo Switch
 */

import { GameAction } from '../actions/ActionDefinitions';
import { ActionBinding, DeviceBindings, DeviceType, GamepadType } from '../core/InputTypes';
import { STANDARD_GAMEPAD_MAPPING, GamepadAxis } from '../utils/GamepadDetector';

const BTN = STANDARD_GAMEPAD_MAPPING;

/**
 * Crée les bindings manette par défaut
 */
export function createDefaultGamepadBindings(): DeviceBindings {
  const bindings: ActionBinding[] = [
    // === LOCOMOTION ===
    // Stick gauche pour le déplacement
    {
      action: GameAction.MOVE_FORWARD,
      primary: {
        type: 'gamepad',
        axis: {
          index: GamepadAxis.LEFT_STICK_Y,
          direction: 'negative', // Axe Y inversé (négatif = haut)
          threshold: 0.15,
        },
      },
      mode: 'hold',
    },
    {
      action: GameAction.MOVE_BACKWARD,
      primary: {
        type: 'gamepad',
        axis: {
          index: GamepadAxis.LEFT_STICK_Y,
          direction: 'positive',
          threshold: 0.15,
        },
      },
      mode: 'hold',
    },
    {
      action: GameAction.MOVE_LEFT,
      primary: {
        type: 'gamepad',
        axis: {
          index: GamepadAxis.LEFT_STICK_X,
          direction: 'negative',
          threshold: 0.15,
        },
      },
      mode: 'hold',
    },
    {
      action: GameAction.MOVE_RIGHT,
      primary: {
        type: 'gamepad',
        axis: {
          index: GamepadAxis.LEFT_STICK_X,
          direction: 'positive',
          threshold: 0.15,
        },
      },
      mode: 'hold',
    },

    // Boutons de mouvement
    {
      action: GameAction.JUMP,
      primary: { type: 'gamepad', button: BTN.south }, // A (Xbox) / X (PS)
      mode: 'tap',
    },
    {
      action: GameAction.SPRINT,
      primary: { type: 'gamepad', button: BTN.L3 }, // Click stick gauche
      mode: 'hold',
    },
    {
      action: GameAction.CROUCH,
      primary: { type: 'gamepad', button: BTN.east }, // B (Xbox) / Circle (PS)
      mode: 'toggle', // Tap pour accroupi
    },
    {
      action: GameAction.PRONE,
      primary: { type: 'gamepad', button: BTN.east }, // B (Xbox) / Circle (PS) - Hold
      mode: 'hold', // Hold pour s'allonger
    },
    {
      action: GameAction.DASH,
      primary: { type: 'gamepad', button: BTN.L1 }, // LB / L1 + direction
      mode: 'tap',
    },

    // === CAMERA ===
    // Stick droit pour la caméra
    {
      action: GameAction.CAMERA_UP,
      primary: {
        type: 'gamepad',
        axis: {
          index: GamepadAxis.RIGHT_STICK_Y,
          direction: 'negative',
          threshold: 0.15,
        },
      },
      mode: 'hold',
    },
    {
      action: GameAction.CAMERA_DOWN,
      primary: {
        type: 'gamepad',
        axis: {
          index: GamepadAxis.RIGHT_STICK_Y,
          direction: 'positive',
          threshold: 0.15,
        },
      },
      mode: 'hold',
    },
    {
      action: GameAction.CAMERA_LEFT,
      primary: {
        type: 'gamepad',
        axis: {
          index: GamepadAxis.RIGHT_STICK_X,
          direction: 'negative',
          threshold: 0.15,
        },
      },
      mode: 'hold',
    },
    {
      action: GameAction.CAMERA_RIGHT,
      primary: {
        type: 'gamepad',
        axis: {
          index: GamepadAxis.RIGHT_STICK_X,
          direction: 'positive',
          threshold: 0.15,
        },
      },
      mode: 'hold',
    },

    // Freelook avec combo L1 + R1
    {
      action: GameAction.FREELOOK,
      primary: {
        type: 'gamepad',
        combo: {
          primary: BTN.L1,
          secondary: BTN.R1,
        },
      },
      mode: 'hold',
    },
    {
      action: GameAction.FREELOOK_TOGGLE,
      primary: {
        type: 'gamepad',
        combo: {
          primary: BTN.L1,
          secondary: BTN.R1,
        },
      },
      mode: 'tap',
    },

    // === COMBAT ===
    {
      action: GameAction.AIM,
      primary: { type: 'gamepad', button: BTN.L2 }, // LT / L2
      mode: 'hold',
    },
    {
      action: GameAction.FIRE,
      primary: { type: 'gamepad', button: BTN.R2 }, // RT / R2
      mode: 'tap',
    },
    {
      action: GameAction.RELOAD,
      primary: { type: 'gamepad', button: BTN.north }, // Y (Xbox) / Triangle (PS)
      mode: 'tap',
    },
    {
      action: GameAction.STOW_WEAPON,
      primary: { type: 'gamepad', button: BTN.north }, // Y (Xbox) / Triangle (PS) - Hold
      mode: 'hold',
    },
    {
      action: GameAction.MELEE_EQUIP,
      primary: { type: 'gamepad', button: BTN.R3 }, // Click stick droit
      mode: 'tap',
    },
    {
      action: GameAction.NEXT_WEAPON,
      primary: { type: 'gamepad', button: BTN.R1 }, // RB / R1 - Tap
      mode: 'tap',
    },
    {
      action: GameAction.WEAPON_WHEEL,
      primary: { type: 'gamepad', button: BTN.R1 }, // RB / R1 - Hold
      mode: 'hold',
    },

    // === OBJETS À LANCER ===
    {
      action: GameAction.THROW_SELECT_NEXT,
      primary: { type: 'gamepad', button: BTN.dpadRight },
      mode: 'tap',
    },
    {
      action: GameAction.THROW_SELECT_PREV,
      primary: { type: 'gamepad', button: BTN.dpadLeft },
      mode: 'tap',
    },

    // === ACTIONS CONTEXTUELLES ===
    {
      action: GameAction.USE,
      primary: { type: 'gamepad', button: BTN.west }, // X (Xbox) / Square (PS)
      mode: 'tap',
    },
    {
      action: GameAction.QUICK_HEAL,
      primary: { type: 'gamepad', button: BTN.dpadUp },
      mode: 'tap',
    },

    // === MENUS & MODES ===
    {
      action: GameAction.CONSTRUCTION_WHEEL,
      primary: { type: 'gamepad', button: BTN.L1 }, // LB / L1 - Hold
      mode: 'hold',
    },
    {
      action: GameAction.EMOTE_WHEEL,
      primary: { type: 'gamepad', button: BTN.L1 }, // LB / L1 - Hold (onglet 2)
      mode: 'hold',
    },
    {
      action: GameAction.QUICK_EMOTE,
      primary: { type: 'gamepad', button: BTN.dpadDown },
      mode: 'tap',
    },

    // === SYSTÈME ===
    {
      action: GameAction.PAUSE,
      primary: { type: 'gamepad', button: BTN.start }, // Menu / Options
      mode: 'tap',
    },
    {
      action: GameAction.MAP,
      primary: { type: 'gamepad', button: BTN.select }, // View / Share
      mode: 'tap',
    },

    // Navigation dans les menus
    {
      action: GameAction.MENU_UP,
      primary: { type: 'gamepad', button: BTN.dpadUp },
      secondary: {
        type: 'gamepad',
        axis: {
          index: GamepadAxis.LEFT_STICK_Y,
          direction: 'negative',
          threshold: 0.5,
        },
      },
      mode: 'tap',
    },
    {
      action: GameAction.MENU_DOWN,
      primary: { type: 'gamepad', button: BTN.dpadDown },
      secondary: {
        type: 'gamepad',
        axis: {
          index: GamepadAxis.LEFT_STICK_Y,
          direction: 'positive',
          threshold: 0.5,
        },
      },
      mode: 'tap',
    },
    {
      action: GameAction.MENU_LEFT,
      primary: { type: 'gamepad', button: BTN.dpadLeft },
      secondary: {
        type: 'gamepad',
        axis: {
          index: GamepadAxis.LEFT_STICK_X,
          direction: 'negative',
          threshold: 0.5,
        },
      },
      mode: 'tap',
    },
    {
      action: GameAction.MENU_RIGHT,
      primary: { type: 'gamepad', button: BTN.dpadRight },
      secondary: {
        type: 'gamepad',
        axis: {
          index: GamepadAxis.LEFT_STICK_X,
          direction: 'positive',
          threshold: 0.5,
        },
      },
      mode: 'tap',
    },
    {
      action: GameAction.MENU_CONFIRM,
      primary: { type: 'gamepad', button: BTN.south }, // A (Xbox) / X (PS)
      mode: 'tap',
    },
    {
      action: GameAction.MENU_BACK,
      primary: { type: 'gamepad', button: BTN.east }, // B (Xbox) / Circle (PS)
      mode: 'tap',
    },
  ];

  return {
    deviceType: DeviceType.GAMEPAD,
    bindings,
  };
}

/**
 * Obtenir un label lisible pour un binding de manette
 */
export function getGamepadBindingLabel(
  binding: ActionBinding,
  gamepadType: GamepadType
): string {
  if (binding.primary.type !== 'gamepad') {
    return 'Inconnu';
  }

  const gamepadBinding = binding.primary;

  // Bouton simple
  if (gamepadBinding.button !== undefined) {
    return getButtonName(gamepadBinding.button, gamepadType);
  }

  // Axe (stick)
  if (gamepadBinding.axis) {
    const axis = gamepadBinding.axis;
    const stickName =
      axis.index === GamepadAxis.LEFT_STICK_X || axis.index === GamepadAxis.LEFT_STICK_Y
        ? 'Stick Gauche'
        : 'Stick Droit';

    const direction =
      axis.index === GamepadAxis.LEFT_STICK_Y || axis.index === GamepadAxis.RIGHT_STICK_Y
        ? axis.direction === 'negative'
          ? 'Haut'
          : 'Bas'
        : axis.direction === 'negative'
        ? 'Gauche'
        : 'Droite';

    return `${stickName} ${direction}`;
  }

  // Combo
  if (gamepadBinding.combo) {
    const btn1 = getButtonName(gamepadBinding.combo.primary, gamepadType);
    const btn2 = getButtonName(gamepadBinding.combo.secondary, gamepadType);
    return `${btn1} + ${btn2}`;
  }

  return 'Inconnu';
}

/**
 * Obtenir le nom d'un bouton selon le type de manette
 */
function getButtonName(buttonIndex: number, gamepadType: GamepadType): string {
  const BTN = STANDARD_GAMEPAD_MAPPING;

  switch (gamepadType) {
    case GamepadType.XBOX:
      if (buttonIndex === BTN.south) return 'A';
      if (buttonIndex === BTN.east) return 'B';
      if (buttonIndex === BTN.west) return 'X';
      if (buttonIndex === BTN.north) return 'Y';
      if (buttonIndex === BTN.L1) return 'LB';
      if (buttonIndex === BTN.R1) return 'RB';
      if (buttonIndex === BTN.L2) return 'LT';
      if (buttonIndex === BTN.R2) return 'RT';
      if (buttonIndex === BTN.L3) return 'L3';
      if (buttonIndex === BTN.R3) return 'R3';
      if (buttonIndex === BTN.select) return 'View';
      if (buttonIndex === BTN.start) return 'Menu';
      if (buttonIndex === BTN.dpadUp) return 'D-Pad ↑';
      if (buttonIndex === BTN.dpadDown) return 'D-Pad ↓';
      if (buttonIndex === BTN.dpadLeft) return 'D-Pad ←';
      if (buttonIndex === BTN.dpadRight) return 'D-Pad →';
      break;

    case GamepadType.PLAYSTATION:
      if (buttonIndex === BTN.south) return '✕';
      if (buttonIndex === BTN.east) return '○';
      if (buttonIndex === BTN.west) return '□';
      if (buttonIndex === BTN.north) return '△';
      if (buttonIndex === BTN.L1) return 'L1';
      if (buttonIndex === BTN.R1) return 'R1';
      if (buttonIndex === BTN.L2) return 'L2';
      if (buttonIndex === BTN.R2) return 'R2';
      if (buttonIndex === BTN.L3) return 'L3';
      if (buttonIndex === BTN.R3) return 'R3';
      if (buttonIndex === BTN.select) return 'Share';
      if (buttonIndex === BTN.start) return 'Options';
      if (buttonIndex === BTN.dpadUp) return 'D-Pad ↑';
      if (buttonIndex === BTN.dpadDown) return 'D-Pad ↓';
      if (buttonIndex === BTN.dpadLeft) return 'D-Pad ←';
      if (buttonIndex === BTN.dpadRight) return 'D-Pad →';
      break;

    case GamepadType.NINTENDO_SWITCH:
      if (buttonIndex === BTN.south) return 'B';
      if (buttonIndex === BTN.east) return 'A';
      if (buttonIndex === BTN.west) return 'Y';
      if (buttonIndex === BTN.north) return 'X';
      if (buttonIndex === BTN.L1) return 'L';
      if (buttonIndex === BTN.R1) return 'R';
      if (buttonIndex === BTN.L2) return 'ZL';
      if (buttonIndex === BTN.R2) return 'ZR';
      if (buttonIndex === BTN.L3) return 'L3';
      if (buttonIndex === BTN.R3) return 'R3';
      if (buttonIndex === BTN.select) return '-';
      if (buttonIndex === BTN.start) return '+';
      if (buttonIndex === BTN.dpadUp) return 'D-Pad ↑';
      if (buttonIndex === BTN.dpadDown) return 'D-Pad ↓';
      if (buttonIndex === BTN.dpadLeft) return 'D-Pad ←';
      if (buttonIndex === BTN.dpadRight) return 'D-Pad →';
      break;

    default:
      return `Bouton ${buttonIndex}`;
  }

  return `Bouton ${buttonIndex}`;
}
