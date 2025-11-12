/**
 * Animation State Machine
 * Core state machine for managing animation states and transitions
 */

import { AnimationMixer, AnimationAction, AnimationClip } from 'three';
import {
  AnimationState,
  AnimationTransition,
  AnimationEvent,
  AnimationEventListener,
  AnimationContext,
} from './AnimationTypes';

export class AnimationStateMachine {
  private mixer: AnimationMixer;
  private states: Map<string, AnimationState> = new Map();
  private actions: Map<string, AnimationAction> = new Map();
  private transitions: AnimationTransition[] = [];
  private currentState: string | null = null;
  private isTransitioning: boolean = false;
  private eventListeners: Map<AnimationEvent, AnimationEventListener[]> = new Map();

  constructor(mixer: AnimationMixer) {
    this.mixer = mixer;
  }

  /**
   * Register an animation state
   */
  registerState(state: AnimationState): void {
    this.states.set(state.name, state);

    // Create action for this state
    const action = this.mixer.clipAction(state.clip);
    action.setLoop(state.loop ? 2201 : 2200, Infinity);  // LoopRepeat : LoopOnce

    if (state.timeScale !== undefined) {
      action.timeScale = state.timeScale;
    }

    if (state.clampWhenFinished) {
      action.clampWhenFinished = true;
    }

    this.actions.set(state.name, action);
  }

  /**
   * Register multiple states
   */
  registerStates(states: AnimationState[]): void {
    states.forEach(state => this.registerState(state));
  }

  /**
   * Register a transition
   */
  registerTransition(transition: AnimationTransition): void {
    this.transitions.push(transition);
  }

  /**
   * Get current state name
   */
  getCurrentState(): string | null {
    return this.currentState;
  }

  /**
   * Check if currently transitioning
   */
  isInTransition(): boolean {
    return this.isTransitioning;
  }

  /**
   * Transition to a new state
   */
  async transitionTo(
    stateName: string,
    duration?: number,
    options?: {
      force?: boolean;
      matchPose?: boolean;
      onComplete?: () => void;
    }
  ): Promise<boolean> {
    // If already in this state and not forced, skip
    if (this.currentState === stateName && !options?.force) {
      return true;
    }

    const targetState = this.states.get(stateName);
    const targetAction = this.actions.get(stateName);

    if (!targetState || !targetAction) {
      console.warn(`[AnimationStateMachine] State "${stateName}" not found`);
      return false;
    }

    // Get current action if exists
    const currentAction = this.currentState ? this.actions.get(this.currentState) : null;

    // Emit transition start event
    this.emit(AnimationEvent.TRANSITION_START, {
      from: this.currentState,
      to: stateName,
    });

    this.isTransitioning = true;

    // Determine transition duration
    const transitionDuration = duration ?? targetState.fadeInDuration ?? 0.2;

    // Emit state exit event for current state
    if (this.currentState) {
      this.emit(AnimationEvent.STATE_EXIT, { state: this.currentState });
    }

    // Handle pose matching for instant transitions
    if (options?.matchPose && currentAction) {
      const currentTime = currentAction.time;
      targetAction.time = Math.min(currentTime, targetAction.getClip().duration);
    }

    // Reset and play target action
    targetAction.reset();

    // CRITICAL: Restore original timeScale from state definition to prevent speed anomalies
    const originalTimeScale = targetState.timeScale || 1;
    targetAction.timeScale = originalTimeScale;
    targetAction.setEffectiveTimeScale(originalTimeScale);

    targetAction.setEffectiveWeight(1);
    targetAction.play();

    // Crossfade if there's a current action
    if (currentAction && transitionDuration > 0) {
      targetAction.crossFadeFrom(currentAction, transitionDuration, true);
    } else if (transitionDuration > 0) {
      targetAction.fadeIn(transitionDuration);
    }

    // Update current state
    const previousState = this.currentState;
    this.currentState = stateName;

    // Emit state enter event
    this.emit(AnimationEvent.STATE_ENTER, { state: stateName });

    // Wait for transition to complete
    await new Promise<void>(resolve => {
      setTimeout(() => {
        this.isTransitioning = false;

        // Emit transition end event
        this.emit(AnimationEvent.TRANSITION_END, {
          from: previousState,
          to: stateName,
        });

        if (options?.onComplete) {
          options.onComplete();
        }

        resolve();
      }, transitionDuration * 1000);
    });

    return true;
  }

  /**
   * Instant transition (no crossfade)
   */
  instantTransitionTo(stateName: string): boolean {
    const targetState = this.states.get(stateName);
    const targetAction = this.actions.get(stateName);

    if (!targetState || !targetAction) {
      console.warn(`[AnimationStateMachine] State "${stateName}" not found`);
      return false;
    }

    // Stop all actions
    this.actions.forEach(action => action.stop());

    // Play target immediately
    targetAction.reset();
    targetAction.play();
    targetAction.setEffectiveWeight(1);

    this.currentState = stateName;
    this.isTransitioning = false;

    this.emit(AnimationEvent.STATE_ENTER, { state: stateName });

    return true;
  }

  /**
   * Update state machine - call every frame
   */
  update(deltaTime: number, context?: AnimationContext): void {
    // Update mixer
    this.mixer.update(deltaTime);

    // Check for automatic transitions
    if (!this.isTransitioning && context) {
      this.checkTransitions(context);
    }
  }

  /**
   * Check and execute automatic transitions based on conditions
   */
  private checkTransitions(context: AnimationContext): void {
    if (!this.currentState) return;

    for (const transition of this.transitions) {
      // Check if this transition applies to current state
      if (transition.from === this.currentState || transition.from === '*') {
        // Check condition
        if (transition.condition && transition.condition()) {
          // Execute transition
          if (transition.onStart) {
            transition.onStart();
          }

          this.transitionTo(transition.to, transition.duration, {
            onComplete: transition.onComplete,
          });

          break;  // Only execute one transition per frame
        }
      }
    }
  }

  /**
   * Get action for a state
   */
  getAction(stateName: string): AnimationAction | undefined {
    return this.actions.get(stateName);
  }

  /**
   * Stop all animations
   */
  stopAll(): void {
    this.actions.forEach(action => action.stop());
    this.currentState = null;
    this.isTransitioning = false;
  }

  /**
   * Reset state machine
   */
  reset(): void {
    this.stopAll();
    this.states.clear();
    this.actions.clear();
    this.transitions = [];
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

  /**
   * Get all registered states
   */
  getStates(): string[] {
    return Array.from(this.states.keys());
  }

  /**
   * Check if state exists
   */
  hasState(stateName: string): boolean {
    return this.states.has(stateName);
  }
}
