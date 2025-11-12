/**
 * Types for the Health system
 */

export enum HealthTargetType {
  ENEMY = 'enemy',
  ALLY = 'ally',
  NEUTRAL = 'neutral',
  ENVIRONMENT = 'environment',
  DESTRUCTIBLE = 'destructible',
  PICKUP = 'pickup'
}

export interface HealthConfig {
  maxHealth: number;
  currentHealth?: number;
  targetType: HealthTargetType;
  destructible?: boolean;
  onDeath?: () => void;
  onDamage?: (damage: number, health: number) => void;
}

export interface DamageInfo {
  amount: number;
  sourcePosition?: [number, number, number];
  sourceId?: string;
}

export interface HitResult {
  targetType: HealthTargetType;
  wasDeath: boolean;
  wasDestroyed: boolean;
  remainingHealth: number;
}
