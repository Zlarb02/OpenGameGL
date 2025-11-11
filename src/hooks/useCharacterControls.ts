import { useControls } from 'leva';
import { createSectionControls } from '../utils/levaSectionManager';

export function useCharacterControls() {
  return useControls('🎯 Character Physics', {
    moveSpeed: { value: 9.0, min: 0, max: 15, step: 0.1 },
    sprintMultiplier: { value: 1.25, min: 1, max: 3, step: 0.1 },
    jumpForce: { value: 2.5, min: 0, max: 5, step: 0.1 },
    fallMultiplier: { value: 5.0, min: 1, max: 5, step: 0.1 },
    airControl: { value: 0.75, min: 0, max: 1, step: 0.05 },
    friction: { value: 0.5, min: 0, max: 2, step: 0.05 },
    linearDamping: { value: 5.0, min: 0, max: 10, step: 0.1 }, // Augmenté de 1.0 à 5.0 pour arrêt plus rapide
    angularDamping: { value: 3.0, min: 0, max: 5, step: 0.1 },

    // Section controls
    ...createSectionControls('Character Physics', 'leva__🎯 Character Physics'),
  }, { collapsed: true });
}