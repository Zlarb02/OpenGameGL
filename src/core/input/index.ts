/**
 * Point d'entrée principal du système d'input
 * Export de toutes les APIs publiques
 */

// Core
export { InputManager } from './core/InputManager';
export { InputProvider, useInput, useAction, useActionPressed, useGamepadAxes } from './core/InputContext';
export type {
  DeviceType,
  GamepadType,
  KeyboardLayout,
  OperatingSystem,
  InputState,
  ActionStates,
  ActiveDeviceInfo,
  ControlOptions,
  InputBinding,
  ActionBinding,
  DeviceBindings,
} from './core/InputTypes';

// Actions
export { GameAction, ActionGroup, ACTION_METADATA } from './actions/ActionDefinitions';
export type { ActionMetadata } from './actions/ActionDefinitions';

// UI Components
export { InputIcon, InputCombo, InputPrompt, InputHelpList } from './ui/InputIcon';
export { getActionIcon, getActionLabel } from './ui/InputIconMap';

// Utils
export { detectKeyboardLayout, detectOS, getKeyLabel } from './utils/KeyboardLayoutDetector';
export { detectGamepadType, getButtonLabel, applyDeadzone, GamepadAxis } from './utils/GamepadDetector';

// Hooks
export { useCharacterInput, useMovementAxes } from './hooks/useCharacterInput';
export type { CharacterInputState } from './hooks/useCharacterInput';
