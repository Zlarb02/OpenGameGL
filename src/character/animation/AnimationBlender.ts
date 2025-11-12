/**
 * Animation Blender
 * Utility for advanced animation blending and crossfading
 */

import { AnimationAction, AnimationMixer } from 'three';

export interface CrossfadeOptions {
  from: AnimationAction;
  to: AnimationAction;
  duration: number;
  matchPose?: boolean;
  freezeFrom?: boolean;
  onComplete?: () => void;
}

export interface BlendOptions {
  actions: AnimationAction[];
  weights: number[];
  duration?: number;
}

/**
 * Animation Blender - Advanced blending utilities
 */
export class AnimationBlender {
  /**
   * Crossfade between two animations
   */
  static crossfade(options: CrossfadeOptions): void {
    const { from, to, duration, matchPose, freezeFrom, onComplete } = options;

    // Match pose if requested
    if (matchPose) {
      const currentTime = from.time;
      const toClipDuration = to.getClip().duration;
      to.time = Math.min(currentTime, toClipDuration);
    }

    // Freeze from animation if requested
    if (freezeFrom) {
      from.timeScale = 0;
    }

    // Reset and play target
    to.reset();

    // CRITICAL: Set timeScale to 1 BEFORE playing to prevent speed anomalies
    to.timeScale = 1;
    to.setEffectiveTimeScale(1);
    to.setEffectiveWeight(1);
    to.play();

    // Crossfade
    if (duration > 0) {
      to.crossFadeFrom(from, duration, true);
    } else {
      // Instant switch
      from.stop();
    }

    // Call onComplete after duration
    if (onComplete) {
      setTimeout(onComplete, duration * 1000);
    }
  }

  /**
   * Freeze current animation and fade to new one (smooth equipment transition)
   */
  static freezeAndFade(
    from: AnimationAction,
    to: AnimationAction,
    fadeDuration: number = 0.2,
    onComplete?: () => void
  ): void {
    // 1. Freeze current animation
    from.timeScale = 0;

    // 2. Play target animation
    to.reset();

    // CRITICAL: Reset timeScale to 1 BEFORE playing to prevent speed anomalies
    to.timeScale = 1;
    to.setEffectiveTimeScale(1);
    to.setEffectiveWeight(0);
    to.play();

    // 3. Fade in target while fading out frozen animation
    to.fadeIn(fadeDuration);
    from.fadeOut(fadeDuration);

    // 4. Call onComplete
    if (onComplete) {
      setTimeout(onComplete, fadeDuration * 1000);
    }
  }

  /**
   * Blend multiple animations together
   */
  static blend(options: BlendOptions): void {
    const { actions, weights, duration = 0.2 } = options;

    if (actions.length !== weights.length) {
      console.error('[AnimationBlender] Actions and weights arrays must have same length');
      return;
    }

    // Normalize weights to sum to 1
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const normalizedWeights = weights.map(w => w / totalWeight);

    // Set weights for each action
    actions.forEach((action, index) => {
      const targetWeight = normalizedWeights[index];

      if (!action.isRunning()) {
        action.play();
      }

      // Fade to target weight
      if (duration > 0) {
        action.setEffectiveWeight(action.getEffectiveWeight());
        // Manually interpolate weight over time
        const startWeight = action.getEffectiveWeight();
        const deltaWeight = targetWeight - startWeight;
        let elapsed = 0;

        const interval = setInterval(() => {
          elapsed += 16;  // ~60fps
          const progress = Math.min(elapsed / (duration * 1000), 1);
          const currentWeight = startWeight + deltaWeight * progress;
          action.setEffectiveWeight(currentWeight);

          if (progress >= 1) {
            clearInterval(interval);
          }
        }, 16);
      } else {
        action.setEffectiveWeight(targetWeight);
      }
    });
  }

  /**
   * Synchronize time between two animations
   */
  static synchronize(source: AnimationAction, target: AnimationAction): void {
    const sourceTime = source.time;
    const sourceDuration = source.getClip().duration;
    const targetDuration = target.getClip().duration;

    // Scale time proportionally
    const normalizedTime = sourceTime / sourceDuration;
    target.time = normalizedTime * targetDuration;
  }

  /**
   * Create additive animation layer
   */
  static createAdditiveLayer(
    baseAction: AnimationAction,
    additiveAction: AnimationAction,
    weight: number = 1
  ): void {
    // Ensure base is playing
    if (!baseAction.isRunning()) {
      baseAction.play();
    }

    // Play additive on top
    if (!additiveAction.isRunning()) {
      additiveAction.play();
    }

    additiveAction.setEffectiveWeight(weight);

    // Note: For true additive blending, the additive clip should be
    // created as an additive clip in the animation authoring tool
  }

  /**
   * Instant switch with optional time offset
   */
  static instantSwitch(
    from: AnimationAction,
    to: AnimationAction,
    timeOffset: number = 0
  ): void {
    from.stop();
    to.reset();
    to.time = timeOffset;

    // CRITICAL: Reset timeScale to 1 to prevent speed anomalies
    to.timeScale = 1;
    to.setEffectiveTimeScale(1);

    to.play();
    to.setEffectiveWeight(1);
  }

  /**
   * Fade in action
   */
  static fadeIn(action: AnimationAction, duration: number = 0.2): void {
    if (!action.isRunning()) {
      action.reset();
      action.play();
    }
    action.fadeIn(duration);
  }

  /**
   * Fade out action
   */
  static fadeOut(action: AnimationAction, duration: number = 0.2): void {
    action.fadeOut(duration);
    setTimeout(() => action.stop(), duration * 1000);
  }

  /**
   * Stop all actions except specified ones
   */
  static stopAllExcept(mixer: AnimationMixer, exceptActions: AnimationAction[]): void {
    // Get all actions from mixer
    const allActions = (mixer as any)._actions as AnimationAction[];

    allActions.forEach((action: AnimationAction) => {
      if (!exceptActions.includes(action)) {
        action.stop();
      }
    });
  }
}
