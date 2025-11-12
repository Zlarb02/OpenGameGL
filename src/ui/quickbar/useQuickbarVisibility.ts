/**
 * Quickbar Visibility Hook
 * Manages auto-hide behavior for the quickbar UI
 */

import { useState, useCallback, useRef, useEffect } from 'react';

const AUTO_HIDE_DELAY = 3000; // 3 seconds

export interface QuickbarVisibilityControls {
  isVisible: boolean;
  show: () => void;
  hide: () => void;
  resetTimer: () => void;
}

/**
 * Hook to manage quickbar visibility with auto-hide timer
 */
export function useQuickbarVisibility(): QuickbarVisibilityControls {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear existing timer
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Show quickbar (cancels hide timer)
  const show = useCallback(() => {
    setIsVisible(true);
    clearTimer();
  }, [clearTimer]);

  // Hide quickbar immediately
  const hide = useCallback(() => {
    setIsVisible(false);
    clearTimer();
  }, [clearTimer]);

  // Reset timer (show and start countdown to hide)
  const resetTimer = useCallback(() => {
    setIsVisible(true);
    clearTimer();

    // Start new timer
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
      timerRef.current = null;
    }, AUTO_HIDE_DELAY);
  }, [clearTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    isVisible,
    show,
    hide,
    resetTimer,
  };
}
