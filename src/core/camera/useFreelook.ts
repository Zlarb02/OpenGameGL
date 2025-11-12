/**
 * Hook pour gérer le freelook (regarder autour sans tourner le personnage)
 */

import { useState, useEffect, useRef } from 'react';
import { useInput } from '../input';
import { GameAction } from '../input/actions/ActionDefinitions';

export function useFreelook() {
  const { inputManager } = useInput();
  const [isFreelooking, setIsFreelooking] = useState(false);
  const freelookPressTime = useRef<number>(0);
  const lastTapTime = useRef<number>(0);

  useEffect(() => {
    // Debug: log toutes les touches pressées
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log('[Freelook Debug] Key pressed:', e.code, e.key);
    };
    window.addEventListener('keydown', handleKeyDown);

    const updateInterval = setInterval(() => {
      const freelookPressed = inputManager.isActionPressed(GameAction.FREELOOK);
      const now = Date.now();

      if (freelookPressed) {
        // Première pression
        if (freelookPressTime.current === 0) {
          freelookPressTime.current = now;
          console.log('[Freelook] Key pressed, starting timer');
        }

        // Hold mode (maintenir > 200ms)
        if (now - freelookPressTime.current > 200) {
          if (!isFreelooking) {
            console.log('[Freelook] Activating freelook (hold mode)');
          }
          setIsFreelooking(true);
        }
      } else {
        // Relâché
        if (freelookPressTime.current > 0) {
          const pressDuration = now - freelookPressTime.current;

          // Tap mode (< 200ms) = toggle
          if (pressDuration < 200) {
            console.log('[Freelook] Tap detected, toggling');
            // Simple tap = toggle
            setIsFreelooking(prev => {
              console.log('[Freelook] Toggle:', !prev);
              return !prev;
            });
          } else {
            // Hold relâché - désactiver freelook
            console.log('[Freelook] Hold released, deactivating');
            setIsFreelooking(false);
          }

          freelookPressTime.current = 0;
        }
      }
    }, 16); // ~60fps

    return () => {
      clearInterval(updateInterval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [inputManager]);

  return {
    isFreelooking,
  };
}
