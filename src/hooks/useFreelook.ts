/**
 * Hook pour gérer le freelook (regarder autour sans tourner le personnage)
 */

import { useState, useEffect, useRef } from 'react';
import { useInput, GameAction } from '../systems/input';

export function useFreelook() {
  const { inputManager } = useInput();
  const [isFreelooking, setIsFreelooking] = useState(false);
  const freelookPressTime = useRef<number>(0);
  const lastTapTime = useRef<number>(0);

  useEffect(() => {
    const updateInterval = setInterval(() => {
      const freelookPressed = inputManager.isActionPressed(GameAction.FREELOOK);
      const now = Date.now();

      if (freelookPressed) {
        // Première pression
        if (freelookPressTime.current === 0) {
          freelookPressTime.current = now;
        }

        // Hold mode (maintenir > 200ms)
        if (now - freelookPressTime.current > 200) {
          setIsFreelooking(true);
        }
      } else {
        // Relâché
        if (freelookPressTime.current > 0) {
          const pressDuration = now - freelookPressTime.current;

          // Tap mode (< 200ms) = toggle
          if (pressDuration < 200) {
            // Double tap protection
            if (now - lastTapTime.current < 300) {
              // C'est un double tap, on toggle
              setIsFreelooking(prev => !prev);
              lastTapTime.current = 0;
            } else {
              lastTapTime.current = now;
              // Simple tap - on attend de voir si c'est un double tap
              setTimeout(() => {
                if (Date.now() - lastTapTime.current >= 300) {
                  // Pas de double tap, on toggle
                  setIsFreelooking(prev => !prev);
                }
              }, 300);
            }
          } else {
            // Hold relâché - désactiver freelook
            setIsFreelooking(false);
          }

          freelookPressTime.current = 0;
        }
      }
    }, 16); // ~60fps

    return () => clearInterval(updateInterval);
  }, [inputManager]);

  return {
    isFreelooking,
  };
}
