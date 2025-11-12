import { useControls } from 'leva';
import { createSectionControls } from '../../utils/levaSectionManager';

export function useCameraControls() {
  return useControls('📷 Camera Settings', {
    // Sans rifle - Distance controls
    distance: { value: 2.0, min: 1.5, max: 8, step: 0.1, label: 'Distance (No Rifle)' },
    minDistance: { value: 1.5, min: 0.5, max: 5, step: 0.1, label: 'Min Distance (No Rifle)' },
    maxDistance: { value: 8, min: 3, max: 15, step: 0.1, label: 'Max Distance' },
    
    // Sans rifle - Height and offset
    height: { value: 1.8, min: 0, max: 10, step: 0.1, label: 'Height (No Rifle)' },
    shoulderOffset: { value: 0.5, min: -2, max: 2, step: 0.1, label: 'Shoulder Offset (No Rifle)' },
    
    // Avec rifle - Distance controls
    distanceRifle: { value: 1.0, min: 1.0, max: 8, step: 0.1, label: 'Distance (Rifle)' },
    minDistanceRifle: { value: 1.0, min: 0.5, max: 5, step: 0.1, label: 'Min Distance (Rifle)' },
    
    // Avec rifle - Height and offset
    heightRifle: { value: 2.2, min: 0, max: 10, step: 0.1, label: 'Height (Rifle)' },
    shoulderOffsetRifle: { value: 0.8, min: -2, max: 2, step: 0.1, label: 'Shoulder Offset (Rifle)' },

    // ADS (Aim Down Sights) - Offsets de position caméra lors de la visée
    adsEnabled: { value: true, label: 'Enable ADS Offset' },
    adsOffsetX: { value: 0.23, min: -1, max: 1, step: 0.01, label: 'ADS Offset X (right)' },
    adsOffsetY: { value: 0.0, min: -1, max: 1, step: 0.01, label: 'ADS Offset Y (up)' },
    adsOffsetZ: { value: -1.0, min: -2, max: 0.5, step: 0.01, label: 'ADS Offset Z (forward)' },
    adsTransitionSpeed: { value: 0.15, min: 0.01, max: 1, step: 0.01, label: 'ADS Transition Speed' },
    adsFov: { value: 50, min: 30, max: 75, step: 1, label: 'ADS FOV (zoom)' },
    normalFov: { value: 75, min: 50, max: 90, step: 1, label: 'Normal FOV' },
    fovTransitionSpeed: { value: 0.1, min: 0.01, max: 0.5, step: 0.01, label: 'FOV Transition Speed' },

    // Vertical rotation limits (in degrees)
    minPolarAngle: { value: 1, min: 0, max: 89, step: 1 },
    maxPolarAngle: { value: 175, min: 90, max: 179, step: 1 },
    
    // Smoothing (spring physics)
    positionSmoothing: { value: 0.1, min: 0.01, max: 0.5, step: 0.01 },
    rotationSmoothing: { value: 0.1, min: 0.01, max: 0.5, step: 0.01 },
    
    // Collision
    collisionEnabled: { value: true },
    collisionRadius: { value: 0.3, min: 0.1, max: 1, step: 0.1 },
    
    // Performance (advanced)
    performanceMode: { 
      value: true, 
      label: 'Performance Mode'
    },
    
    // Zoom
    zoomSpeed: { value: 0.5, min: 0.1, max: 2, step: 0.1 },

    // Section controls
    ...createSectionControls('Camera Settings', 'leva__📷 Camera Settings'),
  }, { collapsed: true }); // Replié par défaut
}