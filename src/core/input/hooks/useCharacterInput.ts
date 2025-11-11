/**
 * Hook personnalisé pour les contrôles du personnage
 * Compatible avec le système d'input
 */

import { useInput } from '../core/InputContext';
import { GameAction } from '../actions/ActionDefinitions';
import { GamepadAxis } from '../utils/GamepadDetector';

/**
 * Interface compatible avec l'ancien système useKeyboardControls
 */
export interface CharacterInputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  sprint: boolean;
}

/**
 * Hook pour obtenir l'état des contrôles du personnage
 * Retourne un format compatible avec l'ancien code
 */
export function useCharacterInput(): CharacterInputState {
  const { inputManager, activeDevice } = useInput();

  // Pour clavier/souris, utiliser les bindings d'actions
  if (activeDevice.type === 'keyboard_mouse') {
    return {
      forward: inputManager.isActionPressed(GameAction.MOVE_FORWARD),
      backward: inputManager.isActionPressed(GameAction.MOVE_BACKWARD),
      left: inputManager.isActionPressed(GameAction.MOVE_LEFT),
      right: inputManager.isActionPressed(GameAction.MOVE_RIGHT),
      jump: inputManager.isActionPressed(GameAction.JUMP),
      sprint: inputManager.isActionPressed(GameAction.SPRINT),
    };
  }

  // Pour manette, utiliser les axes du stick gauche
  if (activeDevice.type === 'gamepad') {
    const leftX = inputManager.getAxisValue(GamepadAxis.LEFT_STICK_X);
    const leftY = inputManager.getAxisValue(GamepadAxis.LEFT_STICK_Y);

    return {
      forward: leftY < -0.15,
      backward: leftY > 0.15,
      left: leftX < -0.15,
      right: leftX > 0.15,
      jump: inputManager.isActionPressed(GameAction.JUMP),
      sprint: inputManager.isActionPressed(GameAction.SPRINT),
    };
  }

  // Fallback
  return {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
  };
}

/**
 * Hook pour obtenir les valeurs brutes des axes (pour mouvement précis)
 */
export function useMovementAxes(): { x: number; y: number } {
  const { inputManager, activeDevice } = useInput();

  if (activeDevice.type === 'gamepad') {
    return {
      x: inputManager.getAxisValue(GamepadAxis.LEFT_STICK_X),
      y: inputManager.getAxisValue(GamepadAxis.LEFT_STICK_Y),
    };
  }

  // Pour clavier, simuler des axes (-1, 0, 1)
  let x = 0;
  let y = 0;

  if (inputManager.isActionPressed(GameAction.MOVE_LEFT)) x -= 1;
  if (inputManager.isActionPressed(GameAction.MOVE_RIGHT)) x += 1;
  if (inputManager.isActionPressed(GameAction.MOVE_FORWARD)) y -= 1;
  if (inputManager.isActionPressed(GameAction.MOVE_BACKWARD)) y += 1;

  // Normaliser le vecteur si déplacement diagonal
  if (x !== 0 && y !== 0) {
    const length = Math.sqrt(x * x + y * y);
    x /= length;
    y /= length;
  }

  return { x, y };
}
