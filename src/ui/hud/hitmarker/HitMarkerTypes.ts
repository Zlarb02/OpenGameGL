import { HealthTargetType } from '../../../core/health';

/**
 * Hit marker color configuration based on target type and result
 */
export interface HitMarkerColor {
  normal: string;
  kill: string;
}

export const HIT_MARKER_COLORS: Record<HealthTargetType, HitMarkerColor> = {
  [HealthTargetType.ENEMY]: {
    normal: '#FFFFFF',    // Blanc
    kill: '#888888'       // Grisé
  },
  [HealthTargetType.ENVIRONMENT]: {
    normal: '#FFFF00',    // Jaune
    kill: '#8B4513'       // Marron
  },
  [HealthTargetType.DESTRUCTIBLE]: {
    normal: '#FFFF00',    // Jaune
    kill: '#8B4513'       // Marron
  },
  [HealthTargetType.PICKUP]: {
    normal: '#00FF00',    // Vert
    kill: '#0000FF'       // Bleu
  },
  [HealthTargetType.ALLY]: {
    normal: '#FFA500',    // Orange
    kill: '#FF0000'       // Rouge
  },
  [HealthTargetType.NEUTRAL]: {
    normal: '#FFA500',    // Orange
    kill: '#FF0000'       // Rouge
  }
};

export interface HitMarkerData {
  id: string;
  targetType: HealthTargetType;
  isKill: boolean;
  timestamp: number;
}
