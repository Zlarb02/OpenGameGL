/**
 * AimOffsetLayer
 * Handles vertical aim adjustment by rotating the spine bone
 * This is an additive layer that adjusts the character's torso based on camera pitch
 */

import { Bone } from 'three';
import {
  IAnimationLayer,
  AnimationLayerConfig,
  AnimationState,
  AnimationContext,
  LayerPriority,
} from '../AnimationTypes';

export interface AimOffsetConfig {
  maxPhiDelta?: number;      // Max camera pitch delta (default: PI/3)
  maxSpineRotation?: number; // Max spine rotation in radians (default: 0.8)
  enableManualAim?: boolean; // Override with manual angle
  manualAimAngle?: number;   // Manual angle for debugging
}

/**
 * AimOffsetLayer - Procedural layer that adjusts spine rotation based on camera pitch
 * This layer doesn't use animation clips, it directly manipulates bones
 */
export class AimOffsetLayer implements IAnimationLayer {
  config: AnimationLayerConfig = {
    name: 'aimOffset',
    priority: LayerPriority.ADDITIVE,
    weight: 1.0,
    enabled: false, // Disabled by default, enabled when aiming
    blendMode: 'additive',
  };

  states: Map<string, AnimationState> = new Map();
  currentState: string | null = null;

  private aimConfig: AimOffsetConfig;
  private spineBone: Bone | null = null;

  constructor(config?: AimOffsetConfig) {
    this.aimConfig = {
      maxPhiDelta: config?.maxPhiDelta ?? Math.PI / 3,      // 60° max camera movement
      maxSpineRotation: config?.maxSpineRotation ?? 0.8,    // 45° max spine rotation
      enableManualAim: config?.enableManualAim ?? false,
      manualAimAngle: config?.manualAimAngle ?? 0,
    };
  }

  /**
   * Initialize layer - this layer doesn't use animation clips
   */
  async initialize(): Promise<void> {
    console.log('[AimOffsetLayer] Initialized (procedural layer, no clips)');
  }

  /**
   * Set spine bone reference
   */
  setSpineBone(bone: Bone): void {
    this.spineBone = bone;
    console.log('[AimOffsetLayer] Spine bone set');
  }

  /**
   * Get spine bone
   */
  getSpineBone(): Bone | null {
    return this.spineBone;
  }

  /**
   * Update aim offset configuration
   */
  updateConfig(config: Partial<AimOffsetConfig>): void {
    this.aimConfig = { ...this.aimConfig, ...config };
  }

  /**
   * Get state by name (not used for procedural layer)
   */
  getState(name: string): AnimationState | undefined {
    return undefined;
  }

  /**
   * Get all states (returns empty for procedural layer)
   */
  getAllStates(): AnimationState[] {
    return [];
  }

  /**
   * Update layer - applies spine rotation based on camera pitch
   */
  update(deltaTime: number, context: AnimationContext): string | null {
    if (!this.config.enabled || !this.spineBone) {
      return null;
    }

    // Manual aim mode (for debugging)
    if (this.aimConfig.enableManualAim) {
      this.spineBone.rotation.x = this.aimConfig.manualAimAngle ?? 0;
      return null;
    }

    // Automatic aim mode based on camera pitch
    const cameraPhi = context.cameraPhi ?? Math.PI / 2; // Default: looking straight ahead
    const neutralPhi = Math.PI / 2; // 90° = looking straight ahead
    const phiDelta = cameraPhi - neutralPhi;

    // Convert phiDelta to spine rotation angle (inverted)
    const maxPhiDelta = this.aimConfig.maxPhiDelta ?? Math.PI / 3;
    const maxSpineRotation = this.aimConfig.maxSpineRotation ?? 0.8;

    // Calculate proportional rotation (with sign inversion)
    const spineRotation = -(phiDelta / maxPhiDelta) * maxSpineRotation;

    // Clamp rotation to max values
    const clampedRotation = Math.max(
      -maxSpineRotation,
      Math.min(maxSpineRotation, spineRotation)
    );

    // Apply rotation to spine bone
    this.spineBone.rotation.x = clampedRotation;

    return null; // Procedural layer doesn't return a state name
  }

  /**
   * Enable layer
   */
  enable(fadeInDuration?: number): void {
    this.config.enabled = true;
    console.log('[AimOffsetLayer] Enabled');
  }

  /**
   * Disable layer
   */
  disable(fadeOutDuration?: number): void {
    this.config.enabled = false;

    // Reset spine rotation when disabled
    if (this.spineBone) {
      this.spineBone.rotation.x = 0;
    }

    console.log('[AimOffsetLayer] Disabled');
  }
}
