/**
 * Equipment Debug Hook
 * Allows real-time adjustment of equipment position, rotation, and scale via Leva
 */

import { useControls, folder } from 'leva';

export function useEquipmentDebug() {
  const debug = useControls('Equipment Debug', {
    'Back Weapons': folder({
      enabled: {
        value: true,
        label: 'Enable Debug',
      },
      position: {
        value: { x: -0.15, y: 0.2, z: -0.1 },
        step: 0.01,
        min: -2,
        max: 2,
        label: 'Position (Left)',
      },
      rotation: {
        value: { x: 0, y: 0, z: -0.3 },
        step: 0.1,
        min: -Math.PI * 2,
        max: Math.PI * 2,
        label: 'Rotation (Left)',
      },
      scale: {
        value: 80,
        min: 0.1,
        max: 200,
        step: 1,
        label: 'Scale',
      },
      positionRight: {
        value: { x: 0.15, y: 0.2, z: -0.1 },
        step: 0.01,
        min: -2,
        max: 2,
        label: 'Position (Right)',
      },
      rotationRight: {
        value: { x: 0, y: 0, z: 0.3 },
        step: 0.1,
        min: -Math.PI * 2,
        max: Math.PI * 2,
        label: 'Rotation (Right)',
      },
    }),
  });

  return {
    enabled: debug.enabled,
    backLeft: {
      position: [debug.position.x, debug.position.y, debug.position.z] as [number, number, number],
      rotation: [debug.rotation.x, debug.rotation.y, debug.rotation.z] as [number, number, number],
      scale: debug.scale,
    },
    backRight: {
      position: [debug.positionRight.x, debug.positionRight.y, debug.positionRight.z] as [number, number, number],
      rotation: [debug.rotationRight.x, debug.rotationRight.y, debug.rotationRight.z] as [number, number, number],
      scale: debug.scale,
    },
  };
}
