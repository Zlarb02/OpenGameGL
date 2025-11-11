/**
 * Types de base pour le système d'input
 */

import { GameAction } from '../actions/ActionDefinitions';

/**
 * Types de périphériques supportés
 */
export enum DeviceType {
  KEYBOARD_MOUSE = 'keyboard_mouse',
  GAMEPAD = 'gamepad',
  TOUCH = 'touch',
}

/**
 * Types de manettes
 */
export enum GamepadType {
  XBOX = 'xbox',
  PLAYSTATION = 'playstation',
  NINTENDO_SWITCH = 'nintendo_switch',
  GENERIC = 'generic',
}

/**
 * Layout clavier
 */
export enum KeyboardLayout {
  QWERTY = 'qwerty',
  AZERTY = 'azerty',
  QWERTZ = 'qwertz',
  OTHER = 'other',
}

/**
 * OS pour les touches de modification
 */
export enum OperatingSystem {
  WINDOWS = 'windows',
  MAC = 'mac',
  LINUX = 'linux',
  OTHER = 'other',
}

/**
 * État d'un input (bouton, touche)
 */
export interface InputState {
  pressed: boolean; // Est actuellement appuyé
  justPressed: boolean; // Vient d'être appuyé ce frame
  justReleased: boolean; // Vient d'être relâché ce frame
  pressedDuration: number; // Durée en ms depuis l'appui
}

/**
 * Binding clavier
 */
export interface KeyboardBinding {
  type: 'keyboard';
  key: string; // Code de la touche (ex: 'KeyW', 'Space')
  modifiers?: {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean; // Cmd sur Mac, Win sur Windows
  };
}

/**
 * Binding souris
 */
export interface MouseBinding {
  type: 'mouse';
  button: number; // 0 = gauche, 1 = milieu, 2 = droite
  modifiers?: {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
  };
}

/**
 * Binding manette
 */
export interface GamepadBinding {
  type: 'gamepad';
  button?: number; // Index du bouton (0-17)
  axis?: {
    index: number; // Index de l'axe (0-3)
    direction: 'positive' | 'negative'; // > 0 ou < 0
    threshold: number; // Seuil de détection (ex: 0.5)
  };
  combo?: {
    // Pour les combos de boutons (ex: L1 + R1)
    primary: number;
    secondary: number;
  };
}

/**
 * Binding tactile
 */
export interface TouchBinding {
  type: 'touch';
  zone: 'left' | 'right' | 'center' | 'custom';
  gesture?: 'tap' | 'hold' | 'swipe' | 'pinch';
  button?: string; // ID du bouton virtuel
}

/**
 * Union de tous les types de bindings
 */
export type InputBinding = KeyboardBinding | MouseBinding | GamepadBinding | TouchBinding;

/**
 * Mapping d'une action vers un ou plusieurs bindings
 */
export interface ActionBinding {
  action: GameAction;
  primary: InputBinding; // Binding principal
  secondary?: InputBinding; // Binding alternatif
  mode: 'tap' | 'hold' | 'toggle'; // Mode d'activation
}

/**
 * Configuration complète des bindings pour un périphérique
 */
export interface DeviceBindings {
  deviceType: DeviceType;
  bindings: ActionBinding[];
}

/**
 * État complet des actions
 */
export type ActionStates = Map<GameAction, InputState>;

/**
 * Informations sur le périphérique actif
 */
export interface ActiveDeviceInfo {
  type: DeviceType;
  gamepadType?: GamepadType;
  gamepadIndex?: number;
  keyboardLayout?: KeyboardLayout;
  os?: OperatingSystem;
}

/**
 * Configuration des options de contrôle
 */
export interface ControlOptions {
  // Général
  autoDetectDevice: boolean;
  forceDeviceType?: DeviceType; // Forcer un type de périphérique
  displayDeviceType?: DeviceType; // Afficher les icônes d'un autre périphérique

  // Souris
  mouseSensitivity: number;
  invertY: boolean;

  // Manette
  gamepadSensitivity: number;
  gamepadInvertY: boolean;
  leftStickDeadzone: number;
  rightStickDeadzone: number;

  // Modes de comportement
  sprintMode: 'hold' | 'toggle';
  crouchMode: 'hold' | 'toggle';
  freelookMode: 'hold' | 'toggle';
  aimMode: 'hold' | 'toggle';
}

/**
 * Options par défaut
 */
export const DEFAULT_CONTROL_OPTIONS: ControlOptions = {
  autoDetectDevice: true,
  mouseSensitivity: 0.002,
  invertY: false,
  gamepadSensitivity: 1.0,
  gamepadInvertY: false,
  leftStickDeadzone: 0.15,
  rightStickDeadzone: 0.15,
  sprintMode: 'hold',
  crouchMode: 'toggle',
  freelookMode: 'hold',
  aimMode: 'hold',
};
