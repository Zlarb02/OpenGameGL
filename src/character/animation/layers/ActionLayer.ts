/**
 * Action Layer
 * Handles one-shot actions like shooting and reloading
 * Override layer that plays on top of other animations
 */

import { AnimationClip, Bone } from 'three';
import { FBXLoader } from 'three-stdlib';
import {
  IAnimationLayer,
  AnimationLayerConfig,
  AnimationState,
  AnimationContext,
  LayerPriority,
} from '../AnimationTypes';

export interface ActionLayerConfig {
  enableShooting?: boolean;
  enableReloading?: boolean;
  affectedBones?: string[];
}

/**
 * ActionLayer - Manages action animations (shoot, reload, etc.)
 */
export class ActionLayer implements IAnimationLayer {
  config: AnimationLayerConfig;
  states: Map<string, AnimationState>;
  currentState: string | null;

  private actionConfig: ActionLayerConfig;
  private currentAction: string | null = null;
  private actionStartTime: number = 0;
  private actionDuration: number = 0;

  constructor(config: ActionLayerConfig = {}) {
    this.actionConfig = {
      enableShooting: true,
      enableReloading: true,
      ...config,
    };

    this.config = {
      name: 'action',
      priority: LayerPriority.OVERRIDE,
      weight: 1.0,
      enabled: false,
      blendMode: 'override',
      affectedBones: config.affectedBones,
    };

    this.states = new Map();
    this.currentState = null;
  }

  /**
   * Initialize with animation clips
   */
  async initialize(clips: AnimationClip[]): Promise<void> {
    console.log('[ActionLayer] Initializing...');

    // Load action animations
    await this.loadActionAnimations();

    console.log('[ActionLayer] Initialized with states:', Array.from(this.states.keys()));
  }

  /**
   * Load action-specific animations
   */
  private async loadActionAnimations(): Promise<void> {
    const loader = new FBXLoader();

    const loadAnim = async (path: string, stateName: string, duration?: number) => {
      try {
        const fbx = await loader.loadAsync(path);
        const clip = fbx.animations[0];

        if (clip) {
          // Store animation with metadata
          const state: AnimationState = {
            name: stateName,
            clip,
            loop: false, // Actions don't loop
            timeScale: 1.0,
            fadeInDuration: 0.1,
            fadeOutDuration: 0.1,
            weight: 1.0,
            clampWhenFinished: true, // Hold last frame
          };

          this.states.set(stateName, state);

          console.log(`[ActionLayer] Loaded ${stateName} (duration: ${clip.duration.toFixed(2)}s)`);
        }
      } catch (error) {
        console.warn(`[ActionLayer] Failed to load ${stateName}:`, error);
      }
    };

    const loadPromises = [];

    if (this.actionConfig.enableShooting) {
      loadPromises.push(
        loadAnim('/models/animations/rifle-shooting.fbx', 'RIFLE_SHOOTING')
      );
    }

    if (this.actionConfig.enableReloading) {
      // Add reload animation when available
      // loadPromises.push(
      //   loadAnim('/models/animations/rifle-reload.fbx', 'RIFLE_RELOAD')
      // );
    }

    await Promise.all(loadPromises);
  }

  /**
   * Start an action (shooting, reloading, etc.)
   */
  playAction(actionName: string): number {
    const state = this.states.get(actionName);
    if (!state) {
      console.warn(`[ActionLayer] Action ${actionName} not found`);
      return 0;
    }

    this.currentAction = actionName;
    this.currentState = actionName;
    this.actionStartTime = performance.now();
    this.actionDuration = state.clip.duration * 1000; // Convert to ms

    // Enable the layer temporarily
    this.config.enabled = true;

    console.log(`[ActionLayer] Playing action: ${actionName} (${this.actionDuration}ms)`);

    return this.actionDuration;
  }

  /**
   * Check if an action is currently playing
   */
  isActionPlaying(): boolean {
    if (!this.currentAction) return false;

    const elapsed = performance.now() - this.actionStartTime;
    return elapsed < this.actionDuration;
  }

  /**
   * Get remaining time for current action (in ms)
   */
  getActionRemainingTime(): number {
    if (!this.currentAction) return 0;

    const elapsed = performance.now() - this.actionStartTime;
    return Math.max(0, this.actionDuration - elapsed);
  }

  getState(name: string): AnimationState | undefined {
    return this.states.get(name);
  }

  getAllStates(): AnimationState[] {
    return Array.from(this.states.values());
  }

  /**
   * Update layer - manages action playback
   */
  update(deltaTime: number, context: AnimationContext): string | null {
    if (!this.config.enabled) return null;

    // Check if action is still playing
    if (this.currentAction) {
      if (!this.isActionPlaying()) {
        // Action finished
        console.log(`[ActionLayer] Action ${this.currentAction} finished`);
        this.currentAction = null;
        this.currentState = null;
        this.config.enabled = false;
        return null;
      }

      // Return current action state
      return this.currentState;
    }

    // Check for new actions
    if (context.isShooting && this.actionConfig.enableShooting) {
      return this.currentState; // Return shooting state
    }

    if (context.isReloading && this.actionConfig.enableReloading) {
      return this.currentState; // Return reload state
    }

    return null;
  }

  enable(fadeInDuration?: number): void {
    this.config.enabled = true;
  }

  disable(fadeOutDuration?: number): void {
    this.config.enabled = false;
    this.currentAction = null;
    this.currentState = null;
  }
}
