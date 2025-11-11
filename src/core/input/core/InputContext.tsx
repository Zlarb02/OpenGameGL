/**
 * Contexte React pour le système d'input
 */

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { InputManager } from './InputManager';
import { GameAction } from '../actions/ActionDefinitions';
import { InputState, ActiveDeviceInfo, ControlOptions } from './InputTypes';

interface InputContextValue {
  inputManager: InputManager;
  activeDevice: ActiveDeviceInfo;
  options: ControlOptions;
  isActionPressed: (action: GameAction) => boolean;
  isActionJustPressed: (action: GameAction) => boolean;
  isActionJustReleased: (action: GameAction) => boolean;
  getActionState: (action: GameAction) => InputState;
  setOptions: (options: Partial<ControlOptions>) => void;
}

const InputContext = createContext<InputContextValue | null>(null);

/**
 * Provider pour le système d'input
 */
export function InputProvider({ children }: { children: React.ReactNode }) {
  const inputManagerRef = useRef<InputManager>(InputManager.getInstance());
  const [activeDevice, setActiveDevice] = useState<ActiveDeviceInfo>(
    inputManagerRef.current.getActiveDevice()
  );
  const [options, setOptions] = useState<ControlOptions>(
    inputManagerRef.current.getOptions()
  );
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    const inputManager = inputManagerRef.current;

    // Initialiser le système
    inputManager.initialize().then(() => {
      setActiveDevice(inputManager.getActiveDevice());
      setOptions(inputManager.getOptions());
    });

    // Boucle de mise à jour
    const updateLoop = (time: number) => {
      const deltaTime = (time - lastTimeRef.current) / 1000; // en secondes
      lastTimeRef.current = time;

      inputManager.update(deltaTime);

      // Mettre à jour l'état du device (si changé)
      const currentDevice = inputManager.getActiveDevice();
      if (currentDevice.type !== activeDevice.type) {
        setActiveDevice(currentDevice);
      }

      animationFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animationFrameRef.current = requestAnimationFrame(updateLoop);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleSetOptions = React.useCallback((newOptions: Partial<ControlOptions>) => {
    inputManagerRef.current.setOptions(newOptions);
    // Ne mettre à jour le state que si les options ont vraiment changé
    const updatedOptions = inputManagerRef.current.getOptions();
    setOptions((prevOptions) => {
      // Comparaison simple des valeurs
      if (JSON.stringify(prevOptions) !== JSON.stringify(updatedOptions)) {
        return updatedOptions;
      }
      return prevOptions;
    });
  }, []);

  const contextValue: InputContextValue = React.useMemo(() => ({
    inputManager: inputManagerRef.current,
    activeDevice,
    options,
    isActionPressed: (action) => inputManagerRef.current.isActionPressed(action),
    isActionJustPressed: (action) => inputManagerRef.current.isActionJustPressed(action),
    isActionJustReleased: (action) => inputManagerRef.current.isActionJustReleased(action),
    getActionState: (action) => inputManagerRef.current.getActionState(action),
    setOptions: handleSetOptions,
  }), [activeDevice, options, handleSetOptions]);

  return <InputContext.Provider value={contextValue}>{children}</InputContext.Provider>;
}

/**
 * Hook pour accéder au système d'input
 */
export function useInput() {
  const context = useContext(InputContext);
  if (!context) {
    throw new Error('useInput must be used within InputProvider');
  }
  return context;
}

/**
 * Hook pour écouter une action spécifique
 */
export function useAction(action: GameAction) {
  const { inputManager } = useInput();
  const [state, setState] = useState<InputState>(() => inputManager.getActionState(action));

  useEffect(() => {
    const callback = (newState: InputState) => {
      setState(newState);
    };

    inputManager.addEventListener(action, callback);

    return () => {
      inputManager.removeEventListener(action, callback);
    };
  }, [action, inputManager]);

  return state;
}

/**
 * Hook pour vérifier si une action est pressée (mise à jour temps réel)
 */
export function useActionPressed(action: GameAction): boolean {
  const { inputManager } = useInput();
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const check = () => {
      setPressed(inputManager.isActionPressed(action));
      requestAnimationFrame(check);
    };

    const rafId = requestAnimationFrame(check);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [action, inputManager]);

  return pressed;
}

/**
 * Hook pour obtenir les valeurs d'axes de la manette
 */
export function useGamepadAxes() {
  const { inputManager, activeDevice } = useInput();
  const [axes, setAxes] = useState({ leftX: 0, leftY: 0, rightX: 0, rightY: 0 });

  useEffect(() => {
    if (activeDevice.type !== 'gamepad') {
      setAxes({ leftX: 0, leftY: 0, rightX: 0, rightY: 0 });
      return;
    }

    const updateAxes = () => {
      setAxes({
        leftX: inputManager.getAxisValue(0),
        leftY: inputManager.getAxisValue(1),
        rightX: inputManager.getAxisValue(2),
        rightY: inputManager.getAxisValue(3),
      });
      requestAnimationFrame(updateAxes);
    };

    const rafId = requestAnimationFrame(updateAxes);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [activeDevice.type, inputManager]);

  return axes;
}
