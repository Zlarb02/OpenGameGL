import { useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { HealthConfig, DamageInfo, HitResult } from './HealthTypes';

export interface HealthHandle {
  takeDamage: (damageInfo: DamageInfo) => HitResult;
  heal: (amount: number) => void;
  getHealth: () => number;
  getMaxHealth: () => number;
  isDead: () => boolean;
}

interface HealthProps extends HealthConfig {
  children?: React.ReactNode;
}

/**
 * Lightweight, modular Health component
 * Can be attached to any entity: enemies, allies, player, environment, pickups, etc.
 */
export const Health = forwardRef<HealthHandle, HealthProps>(({
  maxHealth,
  currentHealth,
  targetType,
  destructible = false,
  onDeath,
  onDamage,
  children
}, ref) => {
  const health = useRef(currentHealth ?? maxHealth);
  const isDead = useRef(false);

  const takeDamage = useCallback((damageInfo: DamageInfo): HitResult => {
    if (isDead.current) {
      return {
        targetType,
        wasDeath: false,
        wasDestroyed: false,
        remainingHealth: 0
      };
    }

    health.current = Math.max(0, health.current - damageInfo.amount);

    onDamage?.(damageInfo.amount, health.current);

    const died = health.current <= 0;
    if (died) {
      isDead.current = true;
      onDeath?.();
    }

    return {
      targetType,
      wasDeath: died,
      wasDestroyed: died && destructible,
      remainingHealth: health.current
    };
  }, [targetType, destructible, onDeath, onDamage]);

  const heal = useCallback((amount: number) => {
    if (isDead.current) return;
    health.current = Math.min(maxHealth, health.current + amount);
  }, [maxHealth]);

  const getHealth = useCallback(() => health.current, []);
  const getMaxHealth = useCallback(() => maxHealth, [maxHealth]);
  const getIsDead = useCallback(() => isDead.current, []);

  useImperativeHandle(ref, () => ({
    takeDamage,
    heal,
    getHealth,
    getMaxHealth,
    isDead: getIsDead
  }), [takeDamage, heal, getHealth, getMaxHealth, getIsDead]);

  return <>{children}</>;
});

Health.displayName = 'Health';
