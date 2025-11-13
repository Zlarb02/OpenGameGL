/**
 * TPS Sword & Shield Layer
 * Sword & Shield-specific animation layer (idle, walk, run, strafe, crouch)
 * Additive layer on top of locomotion
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

export interface TPS_SwordShieldConfig {
  enableCrouch?: boolean;
  enable8Way?: boolean;
  animations?: {
    basePath?: string;
  };
}

export class TPS_SwordShield implements IAnimationLayer {
  config: AnimationLayerConfig = {
    name: 'tps_swordshield',
    priority: LayerPriority.ADDITIVE,
    weight: 1.0,
    enabled: false,  // Disabled by default, enabled when weapon equipped
    blendMode: 'additive',
  };

  states: Map<string, AnimationState> = new Map();
  currentState: string | null = null;

  private swordShieldConfig: TPS_SwordShieldConfig;
  private loader: FBXLoader;

  constructor(config?: TPS_SwordShieldConfig) {
    this.swordShieldConfig = {
      enableCrouch: config?.enableCrouch ?? true,
      enable8Way: config?.enable8Way ?? false, // Disabled for now (not enough animations)
      animations: config?.animations ?? {},
    };

    this.loader = new FBXLoader();
  }

  /**
   * Initialize layer with animation clips
   */
  async initialize(clips?: AnimationClip[]): Promise<void> {
    // Load Sword & Shield animations
    if (!clips || clips.length === 0) {
      await this.loadSwordShieldAnimations();
    } else {
      this.registerClips(clips);
    }
  }

  /**
   * Load Sword & Shield-specific animations
   */
  private async loadSwordShieldAnimations(): Promise<void> {
    const basePath = this.swordShieldConfig.animations?.basePath ?? '/models/weapons/swordshield-pack/';

    // Helper to load animation
    const loadAnim = async (
      path: string,
      stateName: string,
      options: {
        loop?: boolean;
        filterMode?: 'none' | 'all' | 'rootOnly';
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

          // Filter tracks based on mode
          if (options.filterMode === 'all') {
            clip.tracks = clip.tracks.filter(track => !track.name.includes('.position'));
          } else if (options.filterMode === 'rootOnly') {
            clip.tracks = clip.tracks.filter(track => {
              const trackName = track.name.toLowerCase();
              const isRootPosition = trackName.includes('hips.position') ||
                                    trackName.includes('mixamorighips.position');
              return !isRootPosition;
            });
          }

          this.states.set(stateName, {
            name: stateName,
            clip,
            loop: options.loop ?? true,
            timeScale: options.timeScale ?? 1.0,
            fadeInDuration: 0.2,
            fadeOutDuration: 0.2,
          });
        }
      } catch (error) {
        console.warn(`[TPS_SwordShield] Failed to load ${stateName}:`, error);
      }
    };

    // Map available Mixamo animations to our state names
    const loadPromises = [
      // Idle animations (multiple variants available)
      loadAnim(`${basePath}sword and shield idle.fbx`, 'SWORDSHIELD_IDLE'),

      // Walk animations
      loadAnim(`${basePath}sword and shield walk.fbx`, 'SWORDSHIELD_WALK_FORWARD', { filterMode: 'all' }),
      loadAnim(`${basePath}sword and shield walk (2).fbx`, 'SWORDSHIELD_WALK_BACKWARD', { filterMode: 'all' }),

      // Strafe animations
      loadAnim(`${basePath}sword and shield strafe.fbx`, 'SWORDSHIELD_WALK_LEFT', { filterMode: 'all' }),
      loadAnim(`${basePath}sword and shield strafe (2).fbx`, 'SWORDSHIELD_WALK_RIGHT', { filterMode: 'all' }),
      loadAnim(`${basePath}sword and shield strafe (3).fbx`, 'SWORDSHIELD_WALK_FORWARD_LEFT', { filterMode: 'all' }),
      loadAnim(`${basePath}sword and shield strafe (4).fbx`, 'SWORDSHIELD_WALK_FORWARD_RIGHT', { filterMode: 'all' }),

      // Run animations
      loadAnim(`${basePath}sword and shield run.fbx`, 'SWORDSHIELD_RUN_FORWARD', { filterMode: 'all' }),
      loadAnim(`${basePath}sword and shield run (2).fbx`, 'SWORDSHIELD_RUN_BACKWARD', { filterMode: 'all' }),

      // Jump animations
      loadAnim(`${basePath}sword and shield jump.fbx`, 'SWORDSHIELD_JUMP', { filterMode: 'all', loop: false }),
      loadAnim(`${basePath}sword and shield jump (2).fbx`, 'SWORDSHIELD_FALL', { filterMode: 'all' }),
    ];

    // Add crouch animations if enabled
    if (this.swordShieldConfig.enableCrouch) {
      loadPromises.push(
        loadAnim(`${basePath}sword and shield crouch idle.fbx`, 'SWORDSHIELD_CROUCH_IDLE', { filterMode: 'all' }),
        loadAnim(`${basePath}sword and shield crouching.fbx`, 'SWORDSHIELD_CROUCH_WALK_FORWARD', { filterMode: 'all' }),
        loadAnim(`${basePath}sword and shield crouching (2).fbx`, 'SWORDSHIELD_CROUCH_WALK_BACKWARD', { filterMode: 'all' }),
        loadAnim(`${basePath}sword and shield crouching (3).fbx`, 'SWORDSHIELD_CROUCH_WALK_LEFT', { filterMode: 'all' }),
        loadAnim(`${basePath}sword and shield crouch.fbx`, 'SWORDSHIELD_CROUCH_WALK_RIGHT', { filterMode: 'all' }),
      );
    }

    await Promise.all(loadPromises);
    console.log(`[TPS_SwordShield] Loaded ${this.states.size} animations`);
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
        fadeInDuration: 0.2,
        fadeOutDuration: 0.2,
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
   * Calculate 8-way directional movement
   */
  private calculate8WayDirection(context: AnimationContext): string {
    const { movementInput } = context;
    if (!movementInput) return 'FORWARD';

    const { forward, backward, left, right } = movementInput;

    // 8-way direction logic
    if (forward && !left && !right) return 'FORWARD';
    if (backward && !left && !right) return 'BACKWARD';
    if (left && !forward && !backward) return 'LEFT';
    if (right && !forward && !backward) return 'RIGHT';
    if (forward && left) return 'FORWARD_LEFT';
    if (forward && right) return 'FORWARD_RIGHT';
    if (backward && left) return 'BACKWARD_LEFT';
    if (backward && right) return 'BACKWARD_RIGHT';

    return 'FORWARD';
  }

  /**
   * Update layer - returns target state name based on context
   */
  update(deltaTime: number, context: AnimationContext): string | null {
    if (!this.config.enabled) return null;

    let targetState = 'SWORDSHIELD_IDLE';

    // PRIORITY: Airborne > Movement > Idle

    // Check if in air (not grounded)
    if (!context.isGrounded) {
      targetState = 'SWORDSHIELD_FALL';
    }
    // Check movement (only if grounded)
    else if (context.isMoving) {
      let direction = 'FORWARD';

      if (this.swordShieldConfig.enable8Way && context.movementInput) {
        direction = this.calculate8WayDirection(context);
      }

      // Priority: Crouch > Sprint > Run > Walk
      if (context.isCrouching) {
        targetState = `SWORDSHIELD_CROUCH_WALK_${direction}`;
      } else if (context.isSprinting && (direction === 'FORWARD' || direction === 'BACKWARD')) {
        // Use run for sprint (no separate sprint animation)
        targetState = `SWORDSHIELD_RUN_${direction}`;
      } else {
        targetState = `SWORDSHIELD_RUN_${direction}`;
      }
    }
    // Default: idle
    else {
      if (context.isCrouching) {
        targetState = 'SWORDSHIELD_CROUCH_IDLE';
      } else {
        targetState = 'SWORDSHIELD_IDLE';
      }
    }

    // Fallback to idle if state doesn't exist
    if (!this.states.has(targetState)) {
      console.warn(`[TPS_SwordShield] State ${targetState} not found, using SWORDSHIELD_IDLE`);
      targetState = 'SWORDSHIELD_IDLE';
    }

    this.currentState = targetState;
    return targetState;
  }

  /**
   * Set spine bone reference for upper body animations
   */
  setSpineBone(bone: Bone): void {
    // Reserved for future upper body overlay animations
  }

  /**
   * Enable/disable layer
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    console.log(`[TPS_SwordShield] Layer ${enabled ? 'enabled' : 'disabled'}`);
  }
}
