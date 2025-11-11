import { useControls } from 'leva';
import { createSectionControls } from '../../../../utils/levaSectionManager';

export function useRifleDebug() {
  const debug = useControls('🔧 Debug - Rifle Position', {
    enableRifleDebug: {
      value: false,
      label: '🔧 Rifle Position Debug'
    },
    rifleScale: {
      value: 80.0,
      min: 1,
      max: 200.0,
      step: 1,
      label: 'Scale'
    },
    riflePosX: {
      value: -8.2,
      min: -20,
      max: 20,
      step: 0.1,
      label: 'Position X'
    },
    riflePosY: {
      value: 6.4,
      min: -20,
      max: 20,
      step: 0.1,
      label: 'Position Y'
    },
    riflePosZ: {
      value: 1.9,
      min: -20,
      max: 20,
      step: 0.1,
      label: 'Position Z'
    },
    rifleRotX: {
      value: -1.8,
      min: -Math.PI,
      max: Math.PI,
      step: 0.1,
      label: 'Rotation X (rad)'
    },
    rifleRotY: {
      value: 2.7,
      min: -Math.PI,
      max: Math.PI,
      step: 0.1,
      label: 'Rotation Y (rad)'
    },
    rifleRotZ: {
      value: 1.8,
      min: -Math.PI,
      max: Math.PI,
      step: 0.1,
      label: 'Rotation Z (rad)'
    },

    // Section controls
    ...createSectionControls('Debug - Rifle Position', 'leva__🔧 Debug - Rifle Position'),
  }, { collapsed: true });

  return debug;
}
