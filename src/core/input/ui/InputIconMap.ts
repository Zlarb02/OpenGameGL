/**
 * Mapping des actions vers les chemins d'icônes Kenney
 */

import { GameAction } from '../actions/ActionDefinitions';
import { DeviceType, GamepadType, KeyboardLayout } from '../core/InputTypes';

/**
 * Structure du chemin d'icône
 */
export interface IconPath {
  path: string;
  alt: string;
}

/**
 * Obtenir le chemin de l'icône pour une action selon le périphérique
 */
export function getActionIcon(
  action: GameAction,
  deviceType: DeviceType,
  gamepadType?: GamepadType,
  keyboardLayout?: KeyboardLayout
): IconPath | null {
  switch (deviceType) {
    case DeviceType.KEYBOARD_MOUSE:
      return getKeyboardMouseIcon(action, keyboardLayout || KeyboardLayout.QWERTY);

    case DeviceType.GAMEPAD:
      return getGamepadIcon(action, gamepadType || GamepadType.GENERIC);

    case DeviceType.TOUCH:
      return getTouchIcon(action);

    default:
      return null;
  }
}

/**
 * Icônes clavier/souris
 */
function getKeyboardMouseIcon(action: GameAction, layout: KeyboardLayout): IconPath | null {
  const basePath = '/assets/Keyboard & Mouse/Double';

  // Mapping des actions aux icônes
  switch (action) {
    // Mouvement
    case GameAction.MOVE_FORWARD:
      return layout === KeyboardLayout.AZERTY
        ? { path: `${basePath}/keyboard_z.png`, alt: 'Z' }
        : { path: `${basePath}/keyboard_w.png`, alt: 'W' };

    case GameAction.MOVE_BACKWARD:
      return { path: `${basePath}/keyboard_s.png`, alt: 'S' };

    case GameAction.MOVE_LEFT:
      return layout === KeyboardLayout.AZERTY
        ? { path: `${basePath}/keyboard_q.png`, alt: 'Q' }
        : { path: `${basePath}/keyboard_a.png`, alt: 'A' };

    case GameAction.MOVE_RIGHT:
      return { path: `${basePath}/keyboard_d.png`, alt: 'D' };

    case GameAction.JUMP:
      return { path: `${basePath}/keyboard_space.png`, alt: 'Space' };

    case GameAction.SPRINT:
      return { path: `${basePath}/keyboard_shift.png`, alt: 'Shift' };

    case GameAction.CROUCH:
      return { path: `${basePath}/keyboard_c.png`, alt: 'C' };

    case GameAction.PRONE:
      return { path: `${basePath}/keyboard_ctrl.png`, alt: 'Ctrl' };

    case GameAction.DASH:
      return { path: `${basePath}/keyboard_alt.png`, alt: 'Alt' };

    // Combat
    case GameAction.AIM:
      return { path: `${basePath}/mouse_right.png`, alt: 'Right Click' };

    case GameAction.FIRE:
      return { path: `${basePath}/mouse_left.png`, alt: 'Left Click' };

    case GameAction.RELOAD:
      return { path: `${basePath}/keyboard_r.png`, alt: 'R' };

    case GameAction.USE:
      return { path: `${basePath}/keyboard_e.png`, alt: 'E' };

    case GameAction.MELEE_EQUIP:
      return { path: `${basePath}/keyboard_f.png`, alt: 'F' };

    // Menus
    case GameAction.PAUSE:
      return { path: `${basePath}/keyboard_escape.png`, alt: 'Esc' };

    case GameAction.INVENTORY:
      return { path: `${basePath}/keyboard_i.png`, alt: 'I' };

    case GameAction.MAP:
      return { path: `${basePath}/keyboard_m.png`, alt: 'M' };

    case GameAction.QUICK_INVENTORY:
      return { path: `${basePath}/keyboard_tab.png`, alt: 'Tab' };

    // Slots rapides
    case GameAction.QUICK_SLOT_1:
      return { path: `${basePath}/keyboard_1.png`, alt: '1' };
    case GameAction.QUICK_SLOT_2:
      return { path: `${basePath}/keyboard_2.png`, alt: '2' };
    case GameAction.QUICK_SLOT_3:
      return { path: `${basePath}/keyboard_3.png`, alt: '3' };
    case GameAction.QUICK_SLOT_4:
      return { path: `${basePath}/keyboard_4.png`, alt: '4' };
    case GameAction.QUICK_SLOT_5:
      return { path: `${basePath}/keyboard_5.png`, alt: '5' };

    default:
      return null;
  }
}

/**
 * Icônes manette
 */
function getGamepadIcon(action: GameAction, gamepadType: GamepadType): IconPath | null {
  let basePath = '/assets';

  // Choisir le bon dossier selon le type de manette
  switch (gamepadType) {
    case GamepadType.XBOX:
      basePath += '/Xbox Series/Double';
      break;
    case GamepadType.PLAYSTATION:
      basePath += '/PlayStation Series/Double';
      break;
    case GamepadType.NINTENDO_SWITCH:
      basePath += '/Nintendo Switch/Double';
      break;
    default:
      basePath += '/Xbox Series/Double'; // Par défaut Xbox
  }

  // Mapping des actions aux boutons
  switch (action) {
    // Mouvement
    case GameAction.JUMP:
      return gamepadType === GamepadType.PLAYSTATION
        ? { path: `${basePath}/playstation_button_cross.png`, alt: 'X' }
        : { path: `${basePath}/xbox_button_a.png`, alt: 'A' };

    case GameAction.SPRINT:
      return gamepadType === GamepadType.PLAYSTATION
        ? { path: `${basePath}/playstation_stick_l_press.png`, alt: 'L3' }
        : { path: `${basePath}/xbox_stick_l_press.png`, alt: 'L3' };

    case GameAction.CROUCH:
      return gamepadType === GamepadType.PLAYSTATION
        ? { path: `${basePath}/playstation_button_circle.png`, alt: 'Circle' }
        : { path: `${basePath}/xbox_button_b.png`, alt: 'B' };

    // Combat
    case GameAction.AIM:
      return gamepadType === GamepadType.PLAYSTATION
        ? { path: `${basePath}/playstation_trigger_l2.png`, alt: 'L2' }
        : { path: `${basePath}/xbox_lt.png`, alt: 'LT' };

    case GameAction.FIRE:
      return gamepadType === GamepadType.PLAYSTATION
        ? { path: `${basePath}/playstation_trigger_r2.png`, alt: 'R2' }
        : { path: `${basePath}/xbox_rt.png`, alt: 'RT' };

    case GameAction.RELOAD:
      return gamepadType === GamepadType.PLAYSTATION
        ? { path: `${basePath}/playstation_button_triangle.png`, alt: 'Triangle' }
        : { path: `${basePath}/xbox_button_y.png`, alt: 'Y' };

    case GameAction.USE:
      return gamepadType === GamepadType.PLAYSTATION
        ? { path: `${basePath}/playstation_button_square.png`, alt: 'Square' }
        : { path: `${basePath}/xbox_button_x.png`, alt: 'X' };

    case GameAction.MELEE_EQUIP:
      return gamepadType === GamepadType.PLAYSTATION
        ? { path: `${basePath}/playstation_stick_r_press.png`, alt: 'R3' }
        : { path: `${basePath}/xbox_stick_r_press.png`, alt: 'R3' };

    case GameAction.NEXT_WEAPON:
      return gamepadType === GamepadType.PLAYSTATION
        ? { path: `${basePath}/playstation_button_r1.png`, alt: 'R1' }
        : { path: `${basePath}/xbox_rb.png`, alt: 'RB' };

    // D-Pad
    case GameAction.QUICK_HEAL:
      return gamepadType === GamepadType.PLAYSTATION
        ? { path: `${basePath}/playstation_dpad_up.png`, alt: 'D-Pad Up' }
        : { path: `${basePath}/xbox_dpad_up.png`, alt: 'D-Pad Up' };

    case GameAction.THROW_SELECT_NEXT:
      return gamepadType === GamepadType.PLAYSTATION
        ? { path: `${basePath}/playstation_dpad_right.png`, alt: 'D-Pad Right' }
        : { path: `${basePath}/xbox_dpad_right.png`, alt: 'D-Pad Right' };

    case GameAction.THROW_SELECT_PREV:
      return gamepadType === GamepadType.PLAYSTATION
        ? { path: `${basePath}/playstation_dpad_left.png`, alt: 'D-Pad Left' }
        : { path: `${basePath}/xbox_dpad_left.png`, alt: 'D-Pad Left' };

    case GameAction.QUICK_EMOTE:
      return gamepadType === GamepadType.PLAYSTATION
        ? { path: `${basePath}/playstation_dpad_down.png`, alt: 'D-Pad Down' }
        : { path: `${basePath}/xbox_dpad_down.png`, alt: 'D-Pad Down' };

    // Menus
    case GameAction.PAUSE:
      return gamepadType === GamepadType.PLAYSTATION
        ? { path: `${basePath}/playstation5_button_options.png`, alt: 'Options' }
        : { path: `${basePath}/xbox_button_menu.png`, alt: 'Menu' };

    case GameAction.MAP:
      return gamepadType === GamepadType.PLAYSTATION
        ? { path: `${basePath}/playstation4_button_share.png`, alt: 'Share' }
        : { path: `${basePath}/xbox_button_view.png`, alt: 'View' };

    default:
      return null;
  }
}

/**
 * Icônes tactiles (mobile)
 */
function getTouchIcon(action: GameAction): IconPath | null {
  const basePath = '/assets/Touch';

  switch (action) {
    case GameAction.JUMP:
      return { path: `${basePath}/Double/Touch_Swipe_Up.png`, alt: 'Swipe Up' };

    case GameAction.FIRE:
      return { path: `${basePath}/Double/Touch_Tap.png`, alt: 'Tap' };

    case GameAction.AIM:
      return { path: `${basePath}/Double/Touch_Hold.png`, alt: 'Hold' };

    default:
      return null;
  }
}

/**
 * Obtenir le label texte d'une action (fallback si pas d'icône)
 */
export function getActionLabel(
  action: GameAction,
  deviceType: DeviceType,
  gamepadType?: GamepadType,
  keyboardLayout?: KeyboardLayout
): string {
  // Pour clavier/souris
  if (deviceType === DeviceType.KEYBOARD_MOUSE) {
    const keyMap: Partial<Record<GameAction, string>> = {
      [GameAction.MOVE_FORWARD]: keyboardLayout === KeyboardLayout.AZERTY ? 'Z' : 'W',
      [GameAction.MOVE_BACKWARD]: 'S',
      [GameAction.MOVE_LEFT]: keyboardLayout === KeyboardLayout.AZERTY ? 'Q' : 'A',
      [GameAction.MOVE_RIGHT]: 'D',
      [GameAction.JUMP]: 'Space',
      [GameAction.SPRINT]: 'Shift',
      [GameAction.CROUCH]: 'C',
      [GameAction.AIM]: 'Right Click',
      [GameAction.FIRE]: 'Left Click',
      [GameAction.RELOAD]: 'R',
      [GameAction.USE]: 'E',
    };

    return keyMap[action] || action.toString();
  }

  // Pour manette
  if (deviceType === DeviceType.GAMEPAD) {
    const gamepadMap: Partial<Record<GameAction, string>> = {
      [GameAction.JUMP]:
        gamepadType === GamepadType.PLAYSTATION ? 'X' : 'A',
      [GameAction.CROUCH]:
        gamepadType === GamepadType.PLAYSTATION ? 'Circle' : 'B',
      [GameAction.AIM]:
        gamepadType === GamepadType.PLAYSTATION ? 'L2' : 'LT',
      [GameAction.FIRE]:
        gamepadType === GamepadType.PLAYSTATION ? 'R2' : 'RT',
      [GameAction.RELOAD]:
        gamepadType === GamepadType.PLAYSTATION ? 'Triangle' : 'Y',
      [GameAction.USE]:
        gamepadType === GamepadType.PLAYSTATION ? 'Square' : 'X',
    };

    return gamepadMap[action] || action.toString();
  }

  return action.toString();
}
