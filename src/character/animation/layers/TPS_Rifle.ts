/**
 * TPS Layer
 * TPS-specific animation layer (aim, shoot, crouch, 8-way strafe)
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

export interface TPS_RifleConfig {
  enableCrouch?: boolean;
  enable8Way?: boolean;
  animations?: {
    basePath?: string;
  };
}

export class TPS_Rifle implements IAnimationLayer {
  config: AnimationLayerConfig = {
    name: 'tps',
    priority: LayerPriority.ADDITIVE,
    weight: 1.0,
    enabled: false,  // Disabled by default, enabled when weapon equipped
    blendMode: 'additive',
  };

  states: Map<string, AnimationState> = new Map();
  currentState: string | null = null;

  private tpsConfig: TPS_RifleConfig;
  private loader: FBXLoader;
  private spineBone: Bone | null = null;

  constructor(config?: TPS_RifleConfig) {
    this.tpsConfig = {
      enableCrouch: config?.enableCrouch ?? true,
      enable8Way: config?.enable8Way ?? true,
      animations: config?.animations ?? {},
    };

    this.loader = new FBXLoader();
  }

  /**
   * Initialize layer with animation clips
   */
  async initialize(clips?: AnimationClip[]): Promise<void> {
    // Load TPS animations
    if (!clips || clips.length === 0) {
      await this.loadTPSAnimations();
    } else {
      this.registerClips(clips);
    }
  }

  /**
   * Load TPS-specific animations
   */
  private async loadTPSAnimations(): Promise<void> {
    const basePath = this.tpsConfig.animations?.basePath ?? '/models/weapons/rifle-pack/';

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
            fadeInDuration: 0.15,
            fadeOutDuration: 0.15,
          });
        }
      } catch (error) {
        console.warn(`[TPS_Rifle] Failed to load ${stateName}:`, error);
      }
    };

    // Core rifle animations
    const loadPromises = [
      // Idle
      loadAnim(`${basePath}idle.fbx`, 'RIFLE_IDLE'),
      loadAnim(`${basePath}idle aiming.fbx`, 'RIFLE_IDLE_AIM'),

      // Walk (8-way)
      loadAnim(`${basePath}walk forward.fbx`, 'RIFLE_WALK_FORWARD', { filterMode: 'all' }),
      loadAnim(`${basePath}walk backward.fbx`, 'RIFLE_WALK_BACKWARD', { filterMode: 'all' }),
      loadAnim(`${basePath}walk left.fbx`, 'RIFLE_WALK_LEFT', { filterMode: 'all' }),
      loadAnim(`${basePath}walk right.fbx`, 'RIFLE_WALK_RIGHT', { filterMode: 'all' }),
      loadAnim(`${basePath}walk forward left.fbx`, 'RIFLE_WALK_FORWARD_LEFT', { filterMode: 'all' }),
      loadAnim(`${basePath}walk forward right.fbx`, 'RIFLE_WALK_FORWARD_RIGHT', { filterMode: 'all' }),
      loadAnim(`${basePath}walk backward left.fbx`, 'RIFLE_WALK_BACKWARD_LEFT', { filterMode: 'all' }),
      loadAnim(`${basePath}walk backward right.fbx`, 'RIFLE_WALK_BACKWARD_RIGHT', { filterMode: 'all' }),

      // Run (8-way)
      loadAnim(`${basePath}run forward.fbx`, 'RIFLE_RUN_FORWARD', { filterMode: 'all' }),
      loadAnim(`${basePath}run backward.fbx`, 'RIFLE_RUN_BACKWARD', { filterMode: 'all' }),
      loadAnim(`${basePath}run left.fbx`, 'RIFLE_RUN_LEFT', { filterMode: 'all' }),
      loadAnim(`${basePath}run right.fbx`, 'RIFLE_RUN_RIGHT', { filterMode: 'all' }),
      loadAnim(`${basePath}run forward left.fbx`, 'RIFLE_RUN_FORWARD_LEFT', { filterMode: 'all' }),
      loadAnim(`${basePath}run forward right.fbx`, 'RIFLE_RUN_FORWARD_RIGHT', { filterMode: 'all' }),
      loadAnim(`${basePath}run backward left.fbx`, 'RIFLE_RUN_BACKWARD_LEFT', { filterMode: 'all' }),
      loadAnim(`${basePath}run backward right.fbx`, 'RIFLE_RUN_BACKWARD_RIGHT', { filterMode: 'all' }),

      // Sprint
      loadAnim(`${basePath}sprint forward.fbx`, 'RIFLE_SPRINT_FORWARD', { filterMode: 'all' }),
      loadAnim(`${basePath}sprint backward.fbx`, 'RIFLE_SPRINT_BACKWARD', { filterMode: 'all' }),

      // Jump/Fall (lower body animations)
      loadAnim(`${basePath}jump up.fbx`, 'RIFLE_JUMP', { filterMode: 'all', loop: false }),
      loadAnim(`${basePath}jump loop.fbx`, 'RIFLE_FALL', { filterMode: 'all' }),
      loadAnim(`${basePath}jump down.fbx`, 'RIFLE_LANDING', { filterMode: 'all', loop: false }),
    ];

    // Add crouch animations if enabled
    if (this.tpsConfig.enableCrouch) {
      loadPromises.push(
        loadAnim(`${basePath}idle crouching.fbx`, 'RIFLE_CROUCH_IDLE', { filterMode: 'all' }),
        loadAnim(`${basePath}idle crouching aiming.fbx`, 'RIFLE_CROUCH_IDLE_AIM', { filterMode: 'all' }),
        loadAnim(`${basePath}walk crouching forward.fbx`, 'RIFLE_CROUCH_WALK_FORWARD', { filterMode: 'all' }),
        loadAnim(`${basePath}walk crouching backward.fbx`, 'RIFLE_CROUCH_WALK_BACKWARD', { filterMode: 'all' }),
        loadAnim(`${basePath}walk crouching left.fbx`, 'RIFLE_CROUCH_WALK_LEFT', { filterMode: 'all' }),
        loadAnim(`${basePath}walk crouching right.fbx`, 'RIFLE_CROUCH_WALK_RIGHT', { filterMode: 'all' }),
        loadAnim(`${basePath}walk crouching forward left.fbx`, 'RIFLE_CROUCH_WALK_FORWARD_LEFT', { filterMode: 'all' }),
        loadAnim(`${basePath}walk crouching forward right.fbx`, 'RIFLE_CROUCH_WALK_FORWARD_RIGHT', { filterMode: 'all' }),
        loadAnim(`${basePath}walk crouching backward left.fbx`, 'RIFLE_CROUCH_WALK_BACKWARD_LEFT', { filterMode: 'all' }),
        loadAnim(`${basePath}walk crouching backward right.fbx`, 'RIFLE_CROUCH_WALK_BACKWARD_RIGHT', { filterMode: 'all' })
      );
    }

    await Promise.all(loadPromises);
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
   * Update layer - returns target state name based on TPS context
   */
  update(deltaTime: number, context: AnimationContext): string | null {
    if (!this.config.enabled) return null;

    // NOTE: Shooting animation is NOT handled here as it needs to be
    // played as an overlay on upper body only to avoid T-pose.
    // It should be handled separately in a dedicated shooting system.

    let targetState = 'RIFLE_IDLE';

    // PRIORITY: Grounded state (FALL) > Ground movement > Idle
    // HIGHEST PRIORITY: Check if in air (not grounded)
    if (!context.isGrounded) {
      // In air - use jump/fall animations for lower body
      targetState = 'RIFLE_FALL';  // Default to fall loop

      // Note: RIFLE_JUMP and RIFLE_LANDING could be triggered by
      // jump events from the animation system if needed
    }
    // Then check movement (only if grounded)
    else if (context.isMoving) {
      // Calculate 8-way direction if enabled
      let direction = 'FORWARD';

      if (this.tpsConfig.enable8Way && context.movementInput && context.characterRotation !== undefined) {
        direction = this.calculate8WayDirection(context);
      }

      // Priority: Crouch > Aim (walk) > Sprint > Run
      if (context.isCrouching) {
        targetState = `RIFLE_CROUCH_WALK_${direction}`;
      } else if (context.isAiming) {
        targetState = `RIFLE_WALK_${direction}`;
      } else if (context.isSprinting && (direction === 'FORWARD' || direction === 'BACKWARD')) {
        targetState = `RIFLE_SPRINT_${direction}`;
      } else {
        targetState = `RIFLE_RUN_${direction}`;
      }
    }
    // Default: idle
    else {
      // Idle states
      if (context.isCrouching) {
        targetState = context.isAiming ? 'RIFLE_CROUCH_IDLE_AIM' : 'RIFLE_CROUCH_IDLE';
      } else {
        targetState = context.isAiming ? 'RIFLE_IDLE_AIM' : 'RIFLE_IDLE';
      }
    }

    // Fallback if animation doesn't exist
    if (!this.states.has(targetState)) {
      targetState = 'RIFLE_IDLE';
    }

    // Return target state if different from current
    if (targetState !== this.currentState) {
      return targetState;
    }

    return null;  // No change needed
  }

  /**
   * Calculate 8-way strafe direction based on input
   * For TPS rifle mode: character always faces camera, so directions are relative to input only
   */
  private calculate8WayDirection(context: AnimationContext): string {
    const input = context.movementInput;

    // With rifle equipped, character always faces camera direction
    // So we determine animation direction purely from input keys
    // This ensures animations remain consistent regardless of camera rotation

    let direction = 'FORWARD';

    // Priority: Check diagonals first (two keys pressed)
    if (input.forward && input.left) {
      direction = 'FORWARD_LEFT';
    } else if (input.forward && input.right) {
      direction = 'FORWARD_RIGHT';
    } else if (input.backward && input.left) {
      direction = 'BACKWARD_LEFT';
    } else if (input.backward && input.right) {
      direction = 'BACKWARD_RIGHT';
    }
    // Then check cardinal directions (single key)
    else if (input.forward) {
      direction = 'FORWARD';
    } else if (input.backward) {
      direction = 'BACKWARD';
    } else if (input.left) {
      direction = 'LEFT';
    } else if (input.right) {
      direction = 'RIGHT';
    }

    return direction;
  }

  /**
   * Enable layer (when weapon equipped)
   */
  enable(fadeInDuration?: number): void {
    this.config.enabled = true;
  }

  /**
   * Disable layer (when weapon stowed)
   */
  disable(fadeOutDuration?: number): void {
    this.config.enabled = false;
  }

  /**
   * Set spine bone reference for aim offset
   */
  setSpineBone(bone: Bone): void {
    this.spineBone = bone;
  }

  /**
   * Get spine bone
   */
  getSpineBone(): Bone | null {
    return this.spineBone;
  }
}
