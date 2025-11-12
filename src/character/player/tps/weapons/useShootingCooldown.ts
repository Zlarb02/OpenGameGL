import { useRef, useCallback } from 'react';

export interface ShootingCooldownConfig {
  cooldownDuration: number; // in milliseconds
}

/**
 * Hook to manage shooting cooldown
 * Ensures shots can only fire after cooldown has elapsed
 */
export function useShootingCooldown(config: ShootingCooldownConfig) {
  const lastShotTime = useRef<number>(0);
  const isOnCooldownRef = useRef<boolean>(false);

  const canShoot = useCallback((): boolean => {
    if (isOnCooldownRef.current) {
      const now = performance.now();
      const elapsed = now - lastShotTime.current;

      if (elapsed >= config.cooldownDuration) {
        isOnCooldownRef.current = false;
        return true;
      }

      return false;
    }

    return true;
  }, [config.cooldownDuration]);

  const startCooldown = useCallback((customDuration?: number) => {
    lastShotTime.current = performance.now();
    isOnCooldownRef.current = true;

    const duration = customDuration ?? config.cooldownDuration;

    // Auto-reset cooldown after duration
    setTimeout(() => {
      isOnCooldownRef.current = false;
    }, duration);
  }, [config.cooldownDuration]);

  const getRemainingCooldown = useCallback((): number => {
    if (!isOnCooldownRef.current) return 0;

    const now = performance.now();
    const elapsed = now - lastShotTime.current;
    const remaining = Math.max(0, config.cooldownDuration - elapsed);

    return remaining;
  }, [config.cooldownDuration]);

  const reset = useCallback(() => {
    lastShotTime.current = 0;
    isOnCooldownRef.current = false;
  }, []);

  return {
    canShoot,
    startCooldown,
    getRemainingCooldown,
    reset,
  };
}
