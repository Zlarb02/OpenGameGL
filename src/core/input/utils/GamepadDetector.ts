/**
 * Détecteur de type de manette
 */

import { GamepadType } from '../core/InputTypes';

/**
 * Détecte le type de manette à partir de son ID
 */
export function detectGamepadType(gamepad: Gamepad): GamepadType {
  const id = gamepad.id.toLowerCase();

  // Xbox
  if (id.includes('xbox') || id.includes('xinput') || id.includes('x-box')) {
    return GamepadType.XBOX;
  }

  // PlayStation
  if (
    id.includes('playstation') ||
    id.includes('dualshock') ||
    id.includes('dualsense') ||
    id.includes('ps3') ||
    id.includes('ps4') ||
    id.includes('ps5') ||
    id.includes('054c') // Sony vendor ID
  ) {
    return GamepadType.PLAYSTATION;
  }

  // Nintendo Switch
  if (
    id.includes('nintendo') ||
    id.includes('switch') ||
    id.includes('joy-con') ||
    id.includes('pro controller')
  ) {
    return GamepadType.NINTENDO_SWITCH;
  }

  return GamepadType.GENERIC;
}

/**
 * Mapping standard des boutons pour chaque type de manette
 * Basé sur le standard Gamepad API
 */
export interface GamepadButtonMap {
  // Face buttons
  south: number; // A (Xbox) / X (PS) / B (Nintendo)
  east: number; // B (Xbox) / Circle (PS) / A (Nintendo)
  west: number; // X (Xbox) / Square (PS) / Y (Nintendo)
  north: number; // Y (Xbox) / Triangle (PS) / X (Nintendo)

  // Shoulder buttons
  L1: number; // LB (Xbox) / L1 (PS) / L (Nintendo)
  R1: number; // RB (Xbox) / R1 (PS) / R (Nintendo)
  L2: number; // LT (Xbox) / L2 (PS) / ZL (Nintendo)
  R2: number; // RT (Xbox) / R2 (PS) / ZR (Nintendo)

  // Center buttons
  select: number; // View/Back (Xbox) / Share (PS) / Minus (Nintendo)
  start: number; // Menu (Xbox) / Options (PS) / Plus (Nintendo)
  home?: number; // Xbox button / PS button / Home (Nintendo)

  // Stick buttons
  L3: number; // Left stick click
  R3: number; // Right stick click

  // D-Pad
  dpadUp: number;
  dpadDown: number;
  dpadLeft: number;
  dpadRight: number;
}

/**
 * Mapping standard (même pour tous types de manettes avec l'API Gamepad)
 */
export const STANDARD_GAMEPAD_MAPPING: GamepadButtonMap = {
  south: 0,
  east: 1,
  west: 2,
  north: 3,
  L1: 4,
  R1: 5,
  L2: 6,
  R2: 7,
  select: 8,
  start: 9,
  L3: 10,
  R3: 11,
  dpadUp: 12,
  dpadDown: 13,
  dpadLeft: 14,
  dpadRight: 15,
  home: 16,
};

/**
 * Labels des boutons pour chaque type de manette
 */
export function getButtonLabel(buttonIndex: number, gamepadType: GamepadType): string {
  const mapping = STANDARD_GAMEPAD_MAPPING;

  switch (gamepadType) {
    case GamepadType.XBOX:
      if (buttonIndex === mapping.south) return 'A';
      if (buttonIndex === mapping.east) return 'B';
      if (buttonIndex === mapping.west) return 'X';
      if (buttonIndex === mapping.north) return 'Y';
      if (buttonIndex === mapping.L1) return 'LB';
      if (buttonIndex === mapping.R1) return 'RB';
      if (buttonIndex === mapping.L2) return 'LT';
      if (buttonIndex === mapping.R2) return 'RT';
      if (buttonIndex === mapping.select) return 'View';
      if (buttonIndex === mapping.start) return 'Menu';
      if (buttonIndex === mapping.L3) return 'L3';
      if (buttonIndex === mapping.R3) return 'R3';
      if (buttonIndex === mapping.home) return 'Xbox';
      break;

    case GamepadType.PLAYSTATION:
      if (buttonIndex === mapping.south) return 'Cross';
      if (buttonIndex === mapping.east) return 'Circle';
      if (buttonIndex === mapping.west) return 'Square';
      if (buttonIndex === mapping.north) return 'Triangle';
      if (buttonIndex === mapping.L1) return 'L1';
      if (buttonIndex === mapping.R1) return 'R1';
      if (buttonIndex === mapping.L2) return 'L2';
      if (buttonIndex === mapping.R2) return 'R2';
      if (buttonIndex === mapping.select) return 'Share';
      if (buttonIndex === mapping.start) return 'Options';
      if (buttonIndex === mapping.L3) return 'L3';
      if (buttonIndex === mapping.R3) return 'R3';
      if (buttonIndex === mapping.home) return 'PS';
      break;

    case GamepadType.NINTENDO_SWITCH:
      if (buttonIndex === mapping.south) return 'B';
      if (buttonIndex === mapping.east) return 'A';
      if (buttonIndex === mapping.west) return 'Y';
      if (buttonIndex === mapping.north) return 'X';
      if (buttonIndex === mapping.L1) return 'L';
      if (buttonIndex === mapping.R1) return 'R';
      if (buttonIndex === mapping.L2) return 'ZL';
      if (buttonIndex === mapping.R2) return 'ZR';
      if (buttonIndex === mapping.select) return '-';
      if (buttonIndex === mapping.start) return '+';
      if (buttonIndex === mapping.L3) return 'L3';
      if (buttonIndex === mapping.R3) return 'R3';
      if (buttonIndex === mapping.home) return 'Home';
      break;

    default:
      return `Button ${buttonIndex}`;
  }

  // D-Pad
  if (buttonIndex === mapping.dpadUp) return 'D-Pad Up';
  if (buttonIndex === mapping.dpadDown) return 'D-Pad Down';
  if (buttonIndex === mapping.dpadLeft) return 'D-Pad Left';
  if (buttonIndex === mapping.dpadRight) return 'D-Pad Right';

  return `Button ${buttonIndex}`;
}

/**
 * Axes standard
 */
export enum GamepadAxis {
  LEFT_STICK_X = 0,
  LEFT_STICK_Y = 1,
  RIGHT_STICK_X = 2,
  RIGHT_STICK_Y = 3,
}

/**
 * Applique la deadzone à une valeur d'axe
 */
export function applyDeadzone(value: number, deadzone: number): number {
  if (Math.abs(value) < deadzone) {
    return 0;
  }

  // Remapper la valeur pour éviter un saut brusque
  const sign = value > 0 ? 1 : -1;
  return sign * ((Math.abs(value) - deadzone) / (1 - deadzone));
}

/**
 * Vérifie si une manette est connectée
 */
export function isGamepadConnected(index: number): boolean {
  const gamepads = navigator.getGamepads();
  return gamepads[index] !== null && gamepads[index] !== undefined;
}

/**
 * Récupère la première manette connectée
 */
export function getFirstConnectedGamepad(): Gamepad | null {
  const gamepads = navigator.getGamepads();
  for (let i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      return gamepads[i];
    }
  }
  return null;
}
