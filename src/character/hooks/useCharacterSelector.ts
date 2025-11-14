import { useControls } from 'leva';
import { createSectionControls } from '../../utils/levaSectionManager';

// Tous les modèles utiliseront automatiquement les animations du pack X Bot
export const AVAILABLE_MODELS = {
  'X Bot': '/models/characters/xbot/X Bot.fbx',
  'Security Guard': '/models/characters/security_guard.fbx',
} as const;

export function useCharacterSelector() {
  const controls = useControls('🎯 Character', {
    character: {
      value: 'Security Guard',
      options: Object.keys(AVAILABLE_MODELS),
      label: '🎮 Model'
    },
    modelYOffset: {
      value: 0,
      min: -3,
      max: 0,
      step: 0.05,
      label: '📏 Y Offset (hauteur)'
    },
    modelScale: {
      value: 1.5,
      min: 0.5,
      max: 3,
      step: 0.1,
      label: '📐 Scale'
    },

    // Section controls
    ...createSectionControls('Character', 'leva__🎯 Character'),
  }, { collapsed: true });

  return {
    modelPath: AVAILABLE_MODELS[controls.character as keyof typeof AVAILABLE_MODELS],
    modelYOffset: controls.modelYOffset,
    modelScale: controls.modelScale
  };
}
