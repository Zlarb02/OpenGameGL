/**
 * Locomotion Layer
 * Base locomotion layer - reusable for all characters (Player, NPCs, Enemies, etc.)
 * Handles: IDLE, WALK, RUN, SPRINT, JUMP, FALL, LANDING
 */

import { AnimationClip, LoopRepeat } from 'three';
import { FBXLoader } from 'three-stdlib';
import {
  IAnimationLayer,
  AnimationLayerConfig,
  AnimationState,
  AnimationContext,
  LayerPriority,
} from '../AnimationTypes';

export interface LocomotionLayerConfig {
  enableSprint?: boolean;
  enable8Way?: boolean;  // For future TPS 8-way strafe
  animations?: {
    idle?: string;
    walk?: string;
    run?: string;
    sprint?: string;
    jump?: string;
    fall?: string;
    landing?: string;
  };
}

export class LocomotionLayer implements IAnimationLayer {
  config: AnimationLayerConfig = {
    name: 'locomotion',
    priority: LayerPriority.BASE,
    weight: 1.0,
    enabled: true,
    blendMode: 'normal',
  };

  states: Map<string, AnimationState> = new Map();
  currentState: string | null = null;

  private locomotionConfig: LocomotionLayerConfig;
  private loader: FBXLoader;

  constructor(config?: LocomotionLayerConfig) {
    this.locomotionConfig = {
      enableSprint: config?.enableSprint ?? true,
      enable8Way: config?.enable8Way ?? false,
      animations: config?.animations ?? {},
    };

    this.loader = new FBXLoader();
  }

  /**
   * Initialize layer with animation clips
   */
  async initialize(clips?: AnimationClip[]): Promise<void> {
    // Load default animations if not provided
    if (!clips || clips.length === 0) {
      await this.loadDefaultAnimations();
    } else {
      // Use provided clips
      this.registerClips(clips);
    }
  }

  /**
   * Load default locomotion animations
   */
  private async loadDefaultAnimations(): Promise<void> {
    const baseAnimPath = '/models/characters/xbot/';

    // Helper to load animation
    const loadAnim = async (
      path: string,
      stateName: string,
      options: {
        loop?: boolean;
        filterPositions?: boolean;
        timeScale?: number;
      } = {}
    ): Promise<void> => {
      try {
        const fbx = await new Promise<any>((resolve, reject) => {
          this.loader.load(
            path,
            (result) => resolve(result),
            undefined,
            (error) => reject(error)
          );
        });

        if (fbx.animations?.[0]) {
          let clip = fbx.animations[0].clone();
          clip.name = stateName;

          // Filter position tracks if requested
          if (options.filterPositions) {
            clip.tracks = clip.tracks.filter(track => !track.name.includes('.position'));
          }

          this.states.set(stateName, {
            name: stateName,
            clip,
            loop: options.loop ?? true,
            timeScale: options.timeScale ?? 1.0,
            fadeInDuration: 0.15,
            fadeOutDuration: 0.15,
          });
        }
      } catch (error) {
        console.warn(`[LocomotionLayer] Failed to load ${stateName}:`, error);
      }
    };

    // Load core animations
    await Promise.all([
      loadAnim(
        this.locomotionConfig.animations?.idle ?? `${baseAnimPath}idle-new.fbx`,
        'IDLE'
      ),
      loadAnim(
        this.locomotionConfig.animations?.walk ?? `${baseAnimPath}walking.fbx`,
        'WALK',
        { filterPositions: true }
      ),
      loadAnim(
        this.locomotionConfig.animations?.run ?? `${baseAnimPath}standard run.fbx`,
        'RUN',
        { filterPositions: true }
      ),
      loadAnim(
        this.locomotionConfig.animations?.fall ?? `${baseAnimPath}falling-idle.fbx`,
        'FALL'
      ),
      loadAnim(
        this.locomotionConfig.animations?.landing ?? `${baseAnimPath}falling-to-landing.fbx`,
        'LANDING',
        { loop: false }
      ),
    ]);

    // Load sprint if enabled
    if (this.locomotionConfig.enableSprint) {
      await loadAnim(
        this.locomotionConfig.animations?.sprint ?? `${baseAnimPath}standard run.fbx`,
        'SPRINT',
        { filterPositions: true, timeScale: 1.3 }
      );
    }
  }

  /**
   * Register animation clips
   */
  private registerClips(clips: AnimationClip[]): void {
    clips.forEach(clip => {
      this.states.set(clip.name, {
        name: clip.name,
        clip,
        loop: true,
        fadeInDuration: 0.15,
        fadeOutDuration: 0.15,
      });
    });
  }

  /**
   * Get state by name
   */
  getState(name: string): AnimationState | undefined {
    return this.states.get(name);
  }

  /**
   * Get all states
   */
  getAllStates(): AnimationState[] {
    return Array.from(this.states.values());
  }

  /**
   * Update layer - returns target state name
   */
  update(deltaTime: number, context: AnimationContext): string | null {
    if (!this.config.enabled) return null;

    // Determine target state based on context
    // PRIORITY: Grounded state (FALL) > Movement > Idle
    let targetState = 'IDLE';

    // HIGHEST PRIORITY: Check if in air (not grounded)
    if (!context.isGrounded) {
      targetState = 'FALL';
    }
    // Then check movement (only if grounded)
    else if (context.isMoving) {
      if (context.isSprinting && this.locomotionConfig.enableSprint) {
        targetState = 'SPRINT';
      } else {
        targetState = 'RUN';
      }
    }
    // Default: idle
    else {
      targetState = 'IDLE';
    }

    // Check if state exists
    if (!this.states.has(targetState)) {
      targetState = 'IDLE';  // Fallback
    }

    // Return target state if different from current
    if (targetState !== this.currentState) {
      return targetState;
    }

    return null;  // No change needed
  }

  /**
   * Enable layer
   */
  enable(fadeInDuration?: number): void {
    this.config.enabled = true;
  }

  /**
   * Disable layer
   */
  disable(fadeOutDuration?: number): void {
    this.config.enabled = false;
  }

  /**
   * Check if state exists
   */
  hasState(stateName: string): boolean {
    return this.states.has(stateName);
  }

  /**
   * Get current state name
   */
  getCurrentState(): string | null {
    return this.currentState;
  }
}
