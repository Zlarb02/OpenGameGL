/**
 * Animation Layer System
 * Manages multiple animation layers with priorities and blending
 */

import { AnimationMixer, AnimationAction } from 'three';
import {
  IAnimationLayer,
  AnimationLayerConfig,
  LayerPriority,
  AnimationContext,
  AnimationEvent,
  AnimationEventListener,
} from './AnimationTypes';

export class AnimationLayerSystem {
  private mixer: AnimationMixer;
  private layers: Map<string, IAnimationLayer> = new Map();
  private layerActions: Map<string, Map<string, AnimationAction>> = new Map();
  private eventListeners: Map<AnimationEvent, AnimationEventListener[]> = new Map();

  constructor(mixer: AnimationMixer) {
    this.mixer = mixer;
  }

  /**
   * Register a layer
   */
  registerLayer(layer: IAnimationLayer): void {
    const layerName = layer.config.name;

    // Store layer
    this.layers.set(layerName, layer);

    // Create actions for all states in this layer
    const layerActionsMap = new Map<string, AnimationAction>();

    layer.getAllStates().forEach(state => {
      const action = this.mixer.clipAction(state.clip);
      action.setLoop(state.loop ? 2201 : 2200, Infinity);

      if (state.timeScale !== undefined) {
        action.timeScale = state.timeScale;
      }

      if (state.clampWhenFinished) {
        action.clampWhenFinished = true;
      }

      // Set initial weight based on layer config
      action.setEffectiveWeight(layer.config.enabled ? layer.config.weight : 0);

      layerActionsMap.set(state.name, action);
    });

    this.layerActions.set(layerName, layerActionsMap);
  }

  /**
   * Enable a layer
   */
  enableLayer(layerName: string, options?: { fadeInDuration?: number; forceRefresh?: boolean }): boolean {
    const layer = this.layers.get(layerName);
    if (!layer) {
      console.warn(`[AnimationLayerSystem] Layer "${layerName}" not found`);
      return false;
    }

    const fadeInDuration = options?.fadeInDuration ?? 0.2;
    const forceRefresh = options?.forceRefresh ?? false;

    // If already enabled and not forcing refresh, skip
    if (layer.config.enabled && !forceRefresh) {
      return true;  // Already enabled
    }

    // Update layer config
    layer.config.enabled = true;

    // Enable layer
    layer.enable(fadeInDuration);

    // Force immediate transition to appropriate idle state to prevent T-pose
    const layerActionsMap = this.layerActions.get(layerName);
    if (layerActionsMap) {
      // Determine initial state based on layer name
      let initialStateName = 'IDLE';
      if (layerName === 'tps') {
        initialStateName = 'RIFLE_IDLE';
      }

      // Check if this state exists
      if (layerActionsMap.has(initialStateName)) {
        const initialAction = layerActionsMap.get(initialStateName)!;

        // Start playing immediately
        initialAction.reset();
        initialAction.setEffectiveWeight(layer.config.weight);
        initialAction.play();

        if (fadeInDuration > 0) {
          initialAction.fadeIn(fadeInDuration);
        }

        // Update layer's current state
        layer.currentState = initialStateName;
      }
    }

    this.emit(AnimationEvent.LAYER_ENABLED, { layer: layerName });
    return true;
  }

  /**
   * Disable a layer
   */
  disableLayer(layerName: string, options?: { fadeOutDuration?: number }): boolean {
    const layer = this.layers.get(layerName);
    if (!layer) {
      console.warn(`[AnimationLayerSystem] Layer "${layerName}" not found`);
      return false;
    }

    if (!layer.config.enabled) {
      return true;  // Already disabled
    }

    const fadeOutDuration = options?.fadeOutDuration ?? 0.2;

    // Update layer config
    layer.config.enabled = false;

    // Disable layer
    layer.disable(fadeOutDuration);

    // CRITICAL: Fade out actions instead of stopping immediately to prevent T-pose
    const layerActionsMap = this.layerActions.get(layerName);
    if (layerActionsMap) {
      layerActionsMap.forEach((action, stateName) => {
        if (action.isRunning()) {
          // Fade out smoothly instead of stopping immediately
          if (fadeOutDuration > 0) {
            action.fadeOut(fadeOutDuration);
            // Schedule stop after fade completes
            setTimeout(() => {
              if (action.isRunning()) {
                action.stop();
              }
            }, fadeOutDuration * 1000);
          } else {
            action.stop();
          }
        }
      });
    }

    // Reset current state so it's clean when re-enabled
    layer.currentState = null;

    this.emit(AnimationEvent.LAYER_DISABLED, { layer: layerName });
    return true;
  }

  /**
   * Update all layers
   */
  update(deltaTime: number, context: AnimationContext): void {
    // Update mixer
    this.mixer.update(deltaTime);

    // SAFEGUARD: Validate and fix any abnormal timeScales
    this.validateTimeScales();

    // Sort layers by priority
    const sortedLayers = Array.from(this.layers.entries())
      .filter(([_, layer]) => layer.config.enabled)
      .sort((a, b) => a[1].config.priority - b[1].config.priority);

    // Update each enabled layer
    for (const [layerName, layer] of sortedLayers) {
      const targetStateName = layer.update(deltaTime, context);

      if (targetStateName && targetStateName !== layer.currentState) {
        // Transition to new state in this layer
        this.transitionLayerState(layerName, targetStateName, context);
      }
    }
  }

  /**
   * SAFEGUARD: Validate all action timeScales and fix anomalies
   * Prevents the bug where animations randomly play 2-3x faster
   */
  private validateTimeScales(): void {
    this.layerActions.forEach((layerActionsMap, layerName) => {
      const layer = this.layers.get(layerName);
      if (!layer || !layer.config.enabled) return;

      layerActionsMap.forEach((action, stateName) => {
        if (!action.isRunning()) return;

        // Get expected timeScale from state definition
        const state = layer.getState(stateName);
        const expectedTimeScale = state?.timeScale || 1.0;

        // Detect abnormal timeScale (outside reasonable range)
        const currentTimeScale = action.timeScale;
        const isAbnormal = currentTimeScale < 0.5 || currentTimeScale > 2.0;

        // If timeScale doesn't match expected value and is running, fix it
        if (Math.abs(currentTimeScale - expectedTimeScale) > 0.01 || isAbnormal) {
          console.warn(
            `[AnimationLayerSystem] Correcting abnormal timeScale in ${layerName}/${stateName}: ` +
            `${currentTimeScale.toFixed(2)} → ${expectedTimeScale.toFixed(2)}`
          );
          action.timeScale = expectedTimeScale;
          action.setEffectiveTimeScale(expectedTimeScale);
        }
      });
    });
  }

  /**
   * Transition a layer to a new state
   */
  private transitionLayerState(
    layerName: string,
    targetStateName: string,
    context: AnimationContext
  ): void {
    const layer = this.layers.get(layerName);
    const layerActionsMap = this.layerActions.get(layerName);

    if (!layer || !layerActionsMap) return;

    const targetState = layer.getState(targetStateName);
    const targetAction = layerActionsMap.get(targetStateName);

    if (!targetState || !targetAction) {
      console.warn(`[AnimationLayerSystem] State "${targetStateName}" not found in layer "${layerName}"`);
      return;
    }

    // Get current action if exists
    const currentAction = layer.currentState ? layerActionsMap.get(layer.currentState) : null;

    // Determine fade duration
    const fadeDuration = targetState.fadeInDuration ?? 0.15;

    // Reset and play target action
    targetAction.reset();

    // CRITICAL: Set timeScale before playing to prevent race conditions
    const desiredTimeScale = targetState.timeScale || 1;
    targetAction.timeScale = desiredTimeScale;
    targetAction.setEffectiveTimeScale(desiredTimeScale);

    targetAction.setEffectiveWeight(layer.config.weight);
    targetAction.play();

    // Crossfade if there's a current action
    if (currentAction && fadeDuration > 0) {
      targetAction.crossFadeFrom(currentAction, fadeDuration, true);
    } else if (fadeDuration > 0) {
      targetAction.fadeIn(fadeDuration);
    }

    // Update layer's current state
    layer.currentState = targetStateName;
  }

  /**
   * Get action from a layer
   */
  getLayerAction(layerName: string, stateName: string): AnimationAction | undefined {
    const layerActionsMap = this.layerActions.get(layerName);
    return layerActionsMap?.get(stateName);
  }

  /**
   * Check if layer is enabled
   */
  isLayerEnabled(layerName: string): boolean {
    const layer = this.layers.get(layerName);
    return layer?.config.enabled ?? false;
  }

  /**
   * Get layer by name
   */
  getLayer(layerName: string): IAnimationLayer | undefined {
    return this.layers.get(layerName);
  }

  /**
   * Get all layers
   */
  getAllLayers(): IAnimationLayer[] {
    return Array.from(this.layers.values());
  }

  /**
   * Set layer weight
   */
  setLayerWeight(layerName: string, weight: number): boolean {
    const layer = this.layers.get(layerName);
    if (!layer) {
      console.warn(`[AnimationLayerSystem] Layer "${layerName}" not found`);
      return false;
    }

    layer.config.weight = Math.max(0, Math.min(1, weight));

    // Update all actions in this layer
    const layerActionsMap = this.layerActions.get(layerName);
    if (layerActionsMap && layer.config.enabled) {
      layerActionsMap.forEach(action => {
        if (action.isRunning()) {
          action.setEffectiveWeight(layer.config.weight);
        }
      });
    }

    return true;
  }

  /**
   * Stop all animations
   */
  stopAll(): void {
    this.layerActions.forEach(layerActionsMap => {
      layerActionsMap.forEach(action => action.stop());
    });

    this.layers.forEach(layer => {
      layer.currentState = null;
    });
  }

  /**
   * Reset all layers
   */
  reset(): void {
    this.stopAll();
    this.layers.clear();
    this.layerActions.clear();
    this.eventListeners.clear();
  }

  /**
   * Add event listener
   */
  addEventListener(event: AnimationEvent, listener: AnimationEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(event: AnimationEvent, listener: AnimationEventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: AnimationEvent, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }
}
