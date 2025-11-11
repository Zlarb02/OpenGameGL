/**
 * Hook Leva pour le rebinding complet des touches
 */

import { button, useControls } from 'leva';
import { useInput, GameAction, ACTION_METADATA, ActionGroup } from '../../core/input';
import { useState } from 'react';
import { createSectionControls } from '../../utils/levaSectionManager';

export function useInputRebind() {
  const { inputManager } = useInput();
  const [rebindingAction, setRebindingAction] = useState<GameAction | null>(null);
  const [, forceUpdate] = useState(0); // Pour forcer le refresh

  // Actions principales à afficher
  const mainActions = [
    GameAction.MOVE_FORWARD,
    GameAction.MOVE_BACKWARD,
    GameAction.MOVE_LEFT,
    GameAction.MOVE_RIGHT,
    GameAction.JUMP,
    GameAction.SPRINT,
    GameAction.CROUCH,
    GameAction.AIM,
    GameAction.FIRE,
    GameAction.RELOAD,
    GameAction.STOW_WEAPON,
    GameAction.QUICK_SLOT_1,
  ];

  // Créer les contrôles avec de beaux noms
  const controls: Record<string, any> = {};

  mainActions.forEach((action, index) => {
    const metadata = ACTION_METADATA[action];
    const currentBinding = inputManager.getBindingLabel(action);

    // Afficher le binding actuel
    controls[`binding_${index}`] = {
      value: currentBinding,
      label: metadata.label,
      disabled: true,
    };

    // Bouton pour rebind
    controls[`rebind_${index}`] = button(() => {
      startRebinding(action, inputManager, setRebindingAction, () => forceUpdate(n => n + 1));
    }, {
      label: '🔧 Rebind',
    });
  });

  // Séparateur et reset
  controls['separator'] = { value: '───────────', disabled: true, label: ' ' };
  controls['resetAll'] = button(() => {
    if (confirm('Réinitialiser tous les bindings aux valeurs par défaut ?')) {
      inputManager.resetToDefaults();
      forceUpdate(n => n + 1);
    }
  }, {
    label: '↻ Réinitialiser tout',
  });

  // Section controls
  const sectionControls = createSectionControls('Key Bindings', 'leva__🎮 Key Bindings', () => forceUpdate(n => n + 1));
  Object.assign(controls, sectionControls);

  useControls('🎮 Key Bindings', controls, { collapsed: true });

  return {
    rebindingAction,
  };
}

/**
 * Créer les contrôles de binding pour un groupe d'actions
 */
function createBindingControls(
  actions: GameAction[],
  inputManager: any,
  rebindingAction: GameAction | null,
  setRebindingAction: (action: GameAction | null) => void
) {
  const controls: Record<string, any> = {};

  actions.forEach(action => {
    const metadata = ACTION_METADATA[action];

    // Obtenir le binding actuel (à implémenter dans InputManager)
    const currentBinding = getCurrentBinding(action, inputManager);

    controls[action] = {
      value: currentBinding,
      label: metadata.label,
      disabled: true, // Lecture seule pour l'instant
    };

    // Bouton pour rebind
    controls[`${action}_rebind`] = button(() => {
      startRebinding(action, inputManager, setRebindingAction);
    }, {
      label: `Rebind ${metadata.label}`,
    });
  });

  return controls;
}

/**
 * Obtenir le binding actuel d'une action
 */
function getCurrentBinding(action: GameAction, inputManager: any): string {
  return inputManager.getBindingLabel(action);
}

/**
 * Démarrer le processus de rebinding
 */
function startRebinding(action: GameAction, inputManager: any, setRebindingAction: (action: GameAction | null) => void, onComplete: () => void) {
  const metadata = ACTION_METADATA[action];

  // Backdrop
  const backdrop = document.createElement('div');
  backdrop.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 9999;
    backdrop-filter: blur(4px);
  `;
  document.body.appendChild(backdrop);

  // Modal
  const modalDiv = document.createElement('div');
  modalDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    color: white;
    padding: 2.5rem;
    border-radius: 16px;
    font-family: system-ui, -apple-system, sans-serif;
    z-index: 10000;
    text-align: center;
    border: 2px solid #3b82f6;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(59, 130, 246, 0.2);
    min-width: 400px;
  `;
  modalDiv.innerHTML = `
    <h3 style="margin: 0 0 1.5rem 0; font-size: 1.4rem; font-weight: 600; color: #60a5fa;">
      Rebind: ${metadata.label}
    </h3>
    <div style="margin: 1.5rem 0; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
      <p style="margin: 0; font-size: 1.1rem; opacity: 0.9;">
        Press any input...
      </p>
      <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; opacity: 0.6;">
        Keyboard • Mouse • Gamepad
      </p>
    </div>
    <p style="margin: 1rem 0 0 0; opacity: 0.5; font-size: 0.85rem;">
      Press ESC to cancel
    </p>
  `;
  document.body.appendChild(modalDiv);

  setRebindingAction(action);

  // Vérifier les conflits
  const checkConflict = (newBinding: any): string | null => {
    // Parcourir toutes les actions pour voir si cette touche est déjà utilisée
    const allActions = Object.values(GameAction);
    for (const otherAction of allActions) {
      if (otherAction === action) continue;

      const binding = inputManager.getBinding(otherAction);
      if (!binding) continue;

      const primary = binding.primary;
      if (primary.type === newBinding.type) {
        if (newBinding.type === 'keyboard' && primary.key === newBinding.key) {
          return ACTION_METADATA[otherAction].label;
        }
        if (newBinding.type === 'mouse' && primary.button === newBinding.button) {
          return ACTION_METADATA[otherAction].label;
        }
        if (newBinding.type === 'gamepad' && primary.button === newBinding.button) {
          return ACTION_METADATA[otherAction].label;
        }
      }
    }
    return null;
  };

  // Écouter le prochain input
  const handleKeyDown = (e: KeyboardEvent) => {
    e.preventDefault();

    if (e.code === 'Escape') {
      cleanup();
      return;
    }

    const newBinding = { type: 'keyboard', key: e.code };
    const conflict = checkConflict(newBinding);

    if (conflict) {
      showWarning(`⚠️ Cette touche est déjà utilisée pour "${conflict}". Continuer ?`, () => {
        inputManager.rebindAction(action, newBinding);
        showSuccess(`✓ ${metadata.label}`, inputManager.getBindingLabel(action));
        setTimeout(() => {
          onComplete();
          cleanup();
        }, 1500);
      });
    } else {
      inputManager.rebindAction(action, newBinding);
      showSuccess(`✓ ${metadata.label}`, inputManager.getBindingLabel(action));
      setTimeout(() => {
        onComplete();
        cleanup();
      }, 1500);
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();

    const newBinding = { type: 'mouse', button: e.button };
    const conflict = checkConflict(newBinding);

    if (conflict) {
      showWarning(`⚠️ Ce bouton est déjà utilisé pour "${conflict}". Continuer ?`, () => {
        inputManager.rebindAction(action, newBinding);
        showSuccess(`✓ ${metadata.label}`, inputManager.getBindingLabel(action));
        setTimeout(() => {
          onComplete();
          cleanup();
        }, 1500);
      });
    } else {
      inputManager.rebindAction(action, newBinding);
      showSuccess(`✓ ${metadata.label}`, inputManager.getBindingLabel(action));
      setTimeout(() => {
        onComplete();
        cleanup();
      }, 1500);
    }
  };

  const handleGamepad = () => {
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      if (!gamepad) continue;

      for (let j = 0; j < gamepad.buttons.length; j++) {
        if (gamepad.buttons[j].pressed) {
          const newBinding = { type: 'gamepad', button: j };
          const conflict = checkConflict(newBinding);

          if (conflict) {
            showWarning(`⚠️ Ce bouton est déjà utilisé pour "${conflict}". Continuer ?`, () => {
              inputManager.rebindAction(action, newBinding);
              showSuccess(`✓ ${metadata.label}`, inputManager.getBindingLabel(action));
              setTimeout(() => {
                onComplete();
                cleanup();
              }, 1500);
            });
          } else {
            inputManager.rebindAction(action, newBinding);
            showSuccess(`✓ ${metadata.label}`, inputManager.getBindingLabel(action));
            setTimeout(() => {
              onComplete();
              cleanup();
            }, 1500);
          }
          return;
        }
      }
    }

    if (document.body.contains(modalDiv)) {
      requestAnimationFrame(handleGamepad);
    }
  };

  const showSuccess = (title: string, binding: string) => {
    modalDiv.innerHTML = `
      <div style="animation: scaleIn 0.3s ease;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">✓</div>
        <h3 style="margin: 0 0 0.5rem 0; font-size: 1.4rem; color: #4ade80;">${title}</h3>
        <p style="margin: 0; font-size: 1.2rem; padding: 1rem; background: rgba(74, 222, 128, 0.1); border-radius: 8px; border: 1px solid #4ade80;">
          ${binding}
        </p>
      </div>
    `;
  };

  const showWarning = (message: string, onConfirm: () => void) => {
    modalDiv.innerHTML = `
      <div>
        <div style="font-size: 2.5rem; margin-bottom: 1rem; color: #fbbf24;">⚠️</div>
        <p style="margin: 0 0 1.5rem 0; font-size: 1rem; line-height: 1.5;">${message}</p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
          <button id="cancelBtn" style="padding: 0.75rem 1.5rem; border: none; border-radius: 8px; background: #374151; color: white; cursor: pointer; font-size: 1rem;">
            Annuler
          </button>
          <button id="confirmBtn" style="padding: 0.75rem 1.5rem; border: none; border-radius: 8px; background: #3b82f6; color: white; cursor: pointer; font-size: 1rem;">
            Continuer
          </button>
        </div>
      </div>
    `;

    document.getElementById('cancelBtn')!.onclick = () => cleanup();
    document.getElementById('confirmBtn')!.onclick = () => {
      onConfirm();
    };
  };

  const cleanup = () => {
    setRebindingAction(null);
    window.removeEventListener('keydown', handleKeyDown, true);
    window.removeEventListener('mousedown', handleMouseDown, true);
    if (document.body.contains(modalDiv)) {
      document.body.removeChild(modalDiv);
    }
    if (document.body.contains(backdrop)) {
      document.body.removeChild(backdrop);
    }
  };

  window.addEventListener('keydown', handleKeyDown, true);
  window.addEventListener('mousedown', handleMouseDown, true);
  requestAnimationFrame(handleGamepad);

  setTimeout(cleanup, 30000);
}
