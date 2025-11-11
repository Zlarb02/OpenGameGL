import { useControls } from 'leva';
import { createSectionControls } from '../utils/levaSectionManager';

export function useAimDebug() {
  const debug = useControls('🔧 Debug - Aim', {
    enableManualAim: {
      value: false,
      label: '🔧 Manual Aim Test'
    },
    manualAimAngle: {
      value: 0,
      min: -1.5,
      max: 1.5,
      step: 0.05,
      label: 'Spine Rotation (rad)'
    },

    // Section controls
    ...createSectionControls('Debug - Aim', 'leva__🔧 Debug - Aim'),
  }, { collapsed: true });

  return debug;
}
