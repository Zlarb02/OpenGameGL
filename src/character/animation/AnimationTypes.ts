/**
 * Animation System Types
 * Core types for the modular animation system
 */

import { AnimationAction, AnimationClip } from 'three';

/**
 * Animation State - Represents a single animation state
 */
export interface AnimationState {
  name: string;
  clip: AnimationClip;
  loop: boolean;
  timeScale?: number;
  fadeInDuration?: number;
  fadeOutDuration?: number;
  weight?: number;
  clampWhenFinished?: boolean;
}

/**
 * Animation Transition - Defines how to transition between states
 */
export interface AnimationTransition {
  from: string;
  to: string;
  duration: number;
  condition?: () => boolean;
  onStart?: () => void;
  onComplete?: () => void;
}

/**
 * Animation Layer Priority
 */
export enum LayerPriority {
  BASE = 0,        // Base layer (locomotion)
  ADDITIVE = 1,    // Additive layer (aim offset, etc.)
  OVERRIDE = 2,    // Override layer (full body animations)
}

/**
 * Animation Layer Configuration
 */
export interface AnimationLayerConfig {
  name: string;
  priority: LayerPriority;
  weight: number;  // 0-1
  enabled: boolean;
  blendMode: 'normal' | 'additive' | 'override';
  affectedBones?: string[];  // If specified, only affects these bones
}

/**
 * Animation Layer Interface
 */
export interface IAnimationLayer {
  config: AnimationLayerConfig;
  states: Map<string, AnimationState>;
  currentState: string | null;

  initialize(clips: AnimationClip[]): void;
  getState(name: string): AnimationState | undefined;
  getAllStates(): AnimationState[];
  update(deltaTime: number, context: AnimationContext): string | null;
  enable(fadeInDuration?: number): void;
  disable(fadeOutDuration?: number): void;
}

/**
 * Animation Context - State passed to layers for decision making
 */
export interface AnimationContext {
  isGrounded: boolean;
  isMoving: boolean;
  isSprinting: boolean;
  isCrouching: boolean;
  isAiming: boolean;
  isShooting: boolean;
  isReloading: boolean;
  movementInput: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
  };
  velocity: { x: number; y: number; z: number };
  characterRotation: number;
  cameraPhi: number;
  [key: string]: any;  // Extensible for custom context
}

/**
 * Animation State Machine Events
 */
export enum AnimationEvent {
  STATE_ENTER = 'state_enter',
  STATE_EXIT = 'state_exit',
  TRANSITION_START = 'transition_start',
  TRANSITION_END = 'transition_end',
  LAYER_ENABLED = 'layer_enabled',
  LAYER_DISABLED = 'layer_disabled',
}

/**
 * Event Listener Type
 */
export type AnimationEventListener = (data: any) => void;
