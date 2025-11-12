/**
 * InputManager - Gestionnaire central du système d'input
 *
 * Responsabilités:
 * - Détection automatique des périphériques
 * - Gestion des bindings et rebindings
 * - Mise à jour de l'état des inputs chaque frame
 * - Sauvegarde/chargement des préférences
 */

import { GameAction } from '../actions/ActionDefinitions';
import {
  DeviceType,
  GamepadType,
  KeyboardLayout,
  OperatingSystem,
  InputState,
  ActionStates,
  ActiveDeviceInfo,
  ControlOptions,
  DEFAULT_CONTROL_OPTIONS,
  ActionBinding,
  DeviceBindings,
  InputBinding,
  GamepadBinding,
  KeyboardBinding,
  MouseBinding,
} from './InputTypes';
import { detectKeyboardLayout, detectOS, getKeyLabel } from '../utils/KeyboardLayoutDetector';
import {
  detectGamepadType,
  getFirstConnectedGamepad,
  applyDeadzone,
  GamepadAxis,
} from '../utils/GamepadDetector';
import { createDefaultKeyboardBindings } from '../bindings/DefaultKeyboardBindings';
import { createDefaultGamepadBindings } from '../bindings/DefaultGamepadBindings';

/**
 * Classe principale du système d'input
 */
export class InputManager {
  private static instance: InputManager | null = null;

  // État des périphériques
  private activeDevice: ActiveDeviceInfo;
  private keyboardLayout: KeyboardLayout = KeyboardLayout.QWERTY;
  private os: OperatingSystem = OperatingSystem.OTHER;

  // Bindings
  private keyboardBindings: DeviceBindings;
  private gamepadBindings: DeviceBindings;
  private currentBindings: DeviceBindings;

  // État des inputs
  private actionStates: ActionStates = new Map();
  private keyStates: Map<string, boolean> = new Map();
  private mouseStates: Map<number, boolean> = new Map();
  private gamepadButtonStates: Map<number, boolean> = new Map();
  private pressStartTimes: Map<GameAction, number> = new Map();

  // Options
  private options: ControlOptions = { ...DEFAULT_CONTROL_OPTIONS };

  // Listeners
  private eventListeners: Map<GameAction, Set<(state: InputState) => void>> = new Map();

  // État de verrouillage du pointeur
  private isPointerLocked: boolean = false;

  private constructor() {
    this.os = detectOS();
    this.activeDevice = {
      type: DeviceType.KEYBOARD_MOUSE,
      keyboardLayout: this.keyboardLayout,
      os: this.os,
    };

    // Créer les bindings par défaut
    this.keyboardBindings = createDefaultKeyboardBindings(this.keyboardLayout);
    this.gamepadBindings = createDefaultGamepadBindings();
    this.currentBindings = this.keyboardBindings;

    // Initialiser l'état de toutes les actions
    Object.values(GameAction).forEach((action) => {
      this.actionStates.set(action, {
        pressed: false,
        justPressed: false,
        justReleased: false,
        pressedDuration: 0,
      });
    });

    this.setupEventListeners();
    this.loadOptions();
    // NE PAS charger les bindings ici - attendre initialize() pour avoir le bon layout
  }

  /**
   * Singleton - Obtenir l'instance
   */
  public static getInstance(): InputManager {
    if (!InputManager.instance) {
      InputManager.instance = new InputManager();
    }
    return InputManager.instance;
  }

  /**
   * Initialiser le système d'input
   */
  public async initialize(): Promise<void> {
    // Détecter le layout clavier AVANT tout
    this.keyboardLayout = await detectKeyboardLayout();
    this.activeDevice.keyboardLayout = this.keyboardLayout;

    // Recréer les bindings avec le bon layout détecté
    this.keyboardBindings = createDefaultKeyboardBindings(this.keyboardLayout);
    if (this.activeDevice.type === DeviceType.KEYBOARD_MOUSE) {
      this.currentBindings = this.keyboardBindings;
    }

    // MAINTENANT on peut charger les bindings personnalisés (avec le bon layout de base)
    this.loadBindings();

    console.log('[InputManager] Initialized', {
      os: this.os,
      keyboardLayout: this.keyboardLayout,
      device: this.activeDevice.type,
    });
  }

  /**
   * Mettre à jour l'état des inputs (appelé chaque frame)
   */
  public update(deltaTime: number): void {
    // Détecter automatiquement les changements de périphérique
    if (this.options.autoDetectDevice) {
      this.detectActiveDevice();
    }

    // Réinitialiser les états "just pressed/released"
    this.actionStates.forEach((state, action) => {
      state.justPressed = false;
      state.justReleased = false;

      // Mettre à jour la durée d'appui
      if (state.pressed) {
        state.pressedDuration += deltaTime * 1000; // en ms
      }
    });

    // Mettre à jour l'état de chaque action selon les bindings actuels
    this.currentBindings.bindings.forEach((binding) => {
      const wasPressed = this.actionStates.get(binding.action)?.pressed || false;
      const isPressed = this.isBindingPressed(binding);

      const state = this.actionStates.get(binding.action);
      if (state) {
        state.pressed = isPressed;
        state.justPressed = isPressed && !wasPressed;
        state.justReleased = !isPressed && wasPressed;

        if (state.justPressed) {
          this.pressStartTimes.set(binding.action, Date.now());
          state.pressedDuration = 0;
        }

        if (state.justReleased) {
          this.pressStartTimes.delete(binding.action);
          state.pressedDuration = 0;
        }

        // Notifier les listeners
        if (state.justPressed || state.justReleased) {
          this.notifyListeners(binding.action, state);
        }
      }
    });
  }

  /**
   * Vérifier si un binding est actuellement pressé
   */
  private isBindingPressed(binding: ActionBinding): boolean {
    const input = binding.primary;

    switch (input.type) {
      case 'keyboard':
        return this.isKeyPressed(input);

      case 'mouse':
        return this.isMousePressed(input);

      case 'gamepad':
        return this.isGamepadPressed(input);

      default:
        return false;
    }
  }

  /**
   * Vérifier si une touche clavier est pressée
   */
  private isKeyPressed(input: KeyboardBinding): boolean {
    const keyPressed = this.keyStates.get(input.key) || false;

    if (!keyPressed) return false;

    // Vérifier les modificateurs
    if (input.modifiers) {
      if (input.modifiers.ctrl && !this.keyStates.get('ControlLeft') && !this.keyStates.get('ControlRight'))
        return false;
      if (input.modifiers.alt && !this.keyStates.get('AltLeft') && !this.keyStates.get('AltRight'))
        return false;
      if (input.modifiers.shift && !this.keyStates.get('ShiftLeft') && !this.keyStates.get('ShiftRight'))
        return false;
      if (input.modifiers.meta && !this.keyStates.get('MetaLeft') && !this.keyStates.get('MetaRight'))
        return false;
    }

    return true;
  }

  /**
   * Vérifier si un bouton souris est pressé
   */
  private isMousePressed(input: MouseBinding): boolean {
    // Le pointer doit être verrouillé pour les actions de combat
    if (!this.isPointerLocked) return false;

    return this.mouseStates.get(input.button) || false;
  }

  /**
   * Vérifier si un bouton/axe de manette est pressé
   */
  private isGamepadPressed(input: GamepadBinding): boolean {
    const gamepad = getFirstConnectedGamepad();
    if (!gamepad) return false;

    // Bouton simple
    if (input.button !== undefined) {
      return gamepad.buttons[input.button]?.pressed || false;
    }

    // Axe (stick)
    if (input.axis) {
      const axisValue = gamepad.axes[input.axis.index];
      const deadzonedValue = applyDeadzone(
        axisValue,
        input.axis.index < 2 ? this.options.leftStickDeadzone : this.options.rightStickDeadzone
      );

      if (input.axis.direction === 'positive') {
        return deadzonedValue > input.axis.threshold;
      } else {
        return deadzonedValue < -input.axis.threshold;
      }
    }

    // Combo de boutons
    if (input.combo) {
      const btn1 = gamepad.buttons[input.combo.primary]?.pressed || false;
      const btn2 = gamepad.buttons[input.combo.secondary]?.pressed || false;
      return btn1 && btn2;
    }

    return false;
  }

  /**
   * Détection automatique du périphérique actif
   */
  private detectActiveDevice(): void {
    // Vérifier si une manette est connectée et active
    const gamepad = getFirstConnectedGamepad();
    if (gamepad) {
      // Vérifier si des boutons ou axes sont actifs
      const hasGamepadInput =
        gamepad.buttons.some((btn) => btn.pressed) ||
        gamepad.axes.some((axis) => Math.abs(axis) > 0.15);

      if (hasGamepadInput && this.activeDevice.type !== DeviceType.GAMEPAD) {
        this.switchToDevice(DeviceType.GAMEPAD, gamepad);
        return;
      }
    }

    // Sinon, rester sur clavier/souris
    if (this.activeDevice.type !== DeviceType.KEYBOARD_MOUSE) {
      // Vérifier si des touches sont pressées
      const hasKeyboardInput = this.keyStates.size > 0 || this.mouseStates.size > 0;
      if (hasKeyboardInput) {
        this.switchToDevice(DeviceType.KEYBOARD_MOUSE);
      }
    }
  }

  /**
   * Changer de périphérique
   */
  private switchToDevice(deviceType: DeviceType, gamepad?: Gamepad): void {
    console.log(`[InputManager] Switching to ${deviceType}`);

    this.activeDevice.type = deviceType;

    if (deviceType === DeviceType.GAMEPAD && gamepad) {
      this.activeDevice.gamepadType = detectGamepadType(gamepad);
      this.activeDevice.gamepadIndex = gamepad.index;
      this.currentBindings = this.gamepadBindings;
    } else {
      this.activeDevice.gamepadType = undefined;
      this.activeDevice.gamepadIndex = undefined;
      this.currentBindings = this.keyboardBindings;
    }
  }

  /**
   * Configuration des event listeners
   */
  private setupEventListeners(): void {
    // Clavier
    window.addEventListener('keydown', (e) => {
      this.keyStates.set(e.code, true);
    });

    window.addEventListener('keyup', (e) => {
      this.keyStates.delete(e.code);
    });

    // Souris
    window.addEventListener('mousedown', (e) => {
      this.mouseStates.set(e.button, true);
    });

    window.addEventListener('mouseup', (e) => {
      this.mouseStates.delete(e.button);
    });

    // Pointer lock
    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement !== null;
    });

    // Manettes
    window.addEventListener('gamepadconnected', (e) => {
      console.log('[InputManager] Gamepad connected:', e.gamepad.id);
      if (this.options.autoDetectDevice) {
        this.switchToDevice(DeviceType.GAMEPAD, e.gamepad);
      }
    });

    window.addEventListener('gamepaddisconnected', (e) => {
      console.log('[InputManager] Gamepad disconnected:', e.gamepad.id);
      if (this.options.autoDetectDevice) {
        this.switchToDevice(DeviceType.KEYBOARD_MOUSE);
      }
    });

    // Nettoyer les états lors de la perte de focus
    window.addEventListener('blur', () => {
      this.keyStates.clear();
      this.mouseStates.clear();
      this.gamepadButtonStates.clear();
    });
  }

  /**
   * Obtenir l'état d'une action
   */
  public getActionState(action: GameAction): InputState {
    return (
      this.actionStates.get(action) || {
        pressed: false,
        justPressed: false,
        justReleased: false,
        pressedDuration: 0,
      }
    );
  }

  /**
   * Vérifier si une action est pressée
   */
  public isActionPressed(action: GameAction): boolean {
    return this.actionStates.get(action)?.pressed || false;
  }

  /**
   * Vérifier si une action vient d'être pressée
   */
  public isActionJustPressed(action: GameAction): boolean {
    return this.actionStates.get(action)?.justPressed || false;
  }

  /**
   * Vérifier si une action vient d'être relâchée
   */
  public isActionJustReleased(action: GameAction): boolean {
    return this.actionStates.get(action)?.justReleased || false;
  }

  /**
   * Obtenir la valeur d'un axe (pour les sticks)
   */
  public getAxisValue(axis: GamepadAxis): number {
    if (this.activeDevice.type !== DeviceType.GAMEPAD) return 0;

    const gamepad = getFirstConnectedGamepad();
    if (!gamepad) return 0;

    const rawValue = gamepad.axes[axis] || 0;
    const deadzone =
      axis < 2 ? this.options.leftStickDeadzone : this.options.rightStickDeadzone;

    return applyDeadzone(rawValue, deadzone);
  }

  /**
   * Obtenir les informations sur le périphérique actif
   */
  public getActiveDevice(): ActiveDeviceInfo {
    return { ...this.activeDevice };
  }

  /**
   * Obtenir les options de contrôle
   */
  public getOptions(): ControlOptions {
    return { ...this.options };
  }

  /**
   * Modifier les options
   */
  public setOptions(options: Partial<ControlOptions>): void {
    this.options = { ...this.options, ...options };
    this.saveOptions();
  }

  /**
   * S'abonner aux changements d'une action
   */
  public addEventListener(action: GameAction, callback: (state: InputState) => void): void {
    if (!this.eventListeners.has(action)) {
      this.eventListeners.set(action, new Set());
    }
    this.eventListeners.get(action)!.add(callback);
  }

  /**
   * Se désabonner
   */
  public removeEventListener(action: GameAction, callback: (state: InputState) => void): void {
    this.eventListeners.get(action)?.delete(callback);
  }

  /**
   * Notifier les listeners
   */
  private notifyListeners(action: GameAction, state: InputState): void {
    this.eventListeners.get(action)?.forEach((callback) => callback(state));
  }

  /**
   * Sauvegarder les options
   */
  private saveOptions(): void {
    try {
      localStorage.setItem('inputOptions', JSON.stringify(this.options));
    } catch (error) {
      console.warn('[InputManager] Failed to save options:', error);
    }
  }

  /**
   * Charger les options
   */
  private loadOptions(): void {
    try {
      const saved = localStorage.getItem('inputOptions');
      if (saved) {
        this.options = { ...DEFAULT_CONTROL_OPTIONS, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('[InputManager] Failed to load options:', error);
    }
  }

  /**
   * Réinitialiser aux valeurs par défaut
   */
  public resetToDefaults(): void {
    this.options = { ...DEFAULT_CONTROL_OPTIONS };
    this.keyboardBindings = createDefaultKeyboardBindings(this.keyboardLayout);
    this.gamepadBindings = createDefaultGamepadBindings();

    if (this.activeDevice.type === DeviceType.KEYBOARD_MOUSE) {
      this.currentBindings = this.keyboardBindings;
    } else {
      this.currentBindings = this.gamepadBindings;
    }

    this.saveOptions();
    this.saveBindings();
  }

  /**
   * Obtenir le binding d'une action
   */
  public getBinding(action: GameAction): ActionBinding | undefined {
    return this.currentBindings.bindings.find(b => b.action === action);
  }

  /**
   * Rebinder une action
   */
  public rebindAction(action: GameAction, newBinding: InputBinding, mode?: 'tap' | 'hold' | 'toggle'): void {
    const bindingIndex = this.currentBindings.bindings.findIndex(b => b.action === action);

    if (bindingIndex !== -1) {
      // Mettre à jour le binding existant
      this.currentBindings.bindings[bindingIndex].primary = newBinding;
      if (mode) {
        this.currentBindings.bindings[bindingIndex].mode = mode;
      }
    } else {
      // Créer un nouveau binding
      this.currentBindings.bindings.push({
        action,
        primary: newBinding,
        mode: mode || 'tap',
      });
    }

    this.saveBindings();
  }

  /**
   * Obtenir le label d'un binding
   */
  public getBindingLabel(action: GameAction): string {
    const binding = this.getBinding(action);
    if (!binding) return 'Not bound';

    const input = binding.primary;

    if (input.type === 'keyboard') {
      // Utiliser getKeyLabel pour afficher la touche selon le layout
      return getKeyLabel(input.key, this.keyboardLayout);
    }

    if (input.type === 'mouse') {
      if (input.button === 0) return 'Left Click';
      if (input.button === 1) return 'Middle Click';
      if (input.button === 2) return 'Right Click';
      return `Mouse ${input.button}`;
    }

    if (input.type === 'gamepad') {
      if (input.button !== undefined) {
        return `Button ${input.button}`;
      }
      if (input.axis) {
        return `Axis ${input.axis.index}`;
      }
    }

    return 'Unknown';
  }

  /**
   * Sauvegarder les bindings personnalisés
   */
  private saveBindings(): void {
    try {
      const customBindings = {
        keyboardLayout: this.keyboardLayout, // Sauvegarder le layout utilisé
        keyboard: this.keyboardBindings,
        gamepad: this.gamepadBindings,
      };
      localStorage.setItem('inputBindings', JSON.stringify(customBindings));
      console.log('[InputManager] Bindings saved for layout:', this.keyboardLayout);
    } catch (error) {
      console.warn('[InputManager] Failed to save bindings:', error);
    }
  }

  /**
   * Charger les bindings personnalisés
   */
  private loadBindings(): void {
    try {
      const saved = localStorage.getItem('inputBindings');
      if (saved) {
        const customBindings = JSON.parse(saved);

        // Vérifier que le layout correspond
        if (customBindings.keyboardLayout && customBindings.keyboardLayout !== this.keyboardLayout) {
          console.log(`[InputManager] Saved bindings are for ${customBindings.keyboardLayout}, but current layout is ${this.keyboardLayout}. Using defaults.`);
          // Ne pas charger les bindings d'un autre layout
          return;
        }

        this.keyboardBindings = customBindings.keyboard || this.keyboardBindings;
        this.gamepadBindings = customBindings.gamepad || this.gamepadBindings;

        if (this.activeDevice.type === DeviceType.KEYBOARD_MOUSE) {
          this.currentBindings = this.keyboardBindings;
        } else {
          this.currentBindings = this.gamepadBindings;
        }

        console.log('[InputManager] Bindings loaded for layout:', this.keyboardLayout);
      }
    } catch (error) {
      console.warn('[InputManager] Failed to load bindings:', error);
    }
  }

  /**
   * Nettoyer les ressources
   */
  public dispose(): void {
    this.eventListeners.clear();
    this.keyStates.clear();
    this.mouseStates.clear();
    this.gamepadButtonStates.clear();
    InputManager.instance = null;
  }
}
