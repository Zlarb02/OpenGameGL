import { useControls } from 'leva';
import { createSectionControls } from '../../utils/levaSectionManager';

// Tous les modèles utiliseront automatiquement les animations du pack X Bot
export const AVAILABLE_MODELS = {
  'X Bot': '/models/xbot/X Bot.fbx',
  'Default': '/models/character.glb',
  'SWAT + Rifle': '/models/swat-rifle.fbx',
  'Vanguard': '/models/vanguard.fbx',
  'The Boss': '/models/the-boss.fbx',
  'Ch11': '/models/ch11.fbx',
  'Eve': '/models/eve.fbx',
  'Ch44': '/models/ch44.fbx',
  'Paladin': '/models/paladin.fbx',
  'Kaya': '/models/kaya.fbx',
} as const;

export function useCharacterSelector() {
  const controls = useControls('🎯 Character', {
    character: {
      value: 'X Bot',
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
