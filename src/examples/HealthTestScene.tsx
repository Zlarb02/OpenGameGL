import { TargetBall } from './TargetBall';
import { HealthTargetType } from '../core/health';

/**
 * Test scene with various target types to demonstrate Health system and hit markers
 */
export function HealthTestScene() {
  return (
    <>
      {/* Enemy targets (white hit marker, gray when killed) */}
      <TargetBall
        position={[5, 1.5, -5]}
        targetType={HealthTargetType.ENEMY}
        maxHealth={100}
      />
      <TargetBall
        position={[3, 1.5, -5]}
        targetType={HealthTargetType.ENEMY}
        maxHealth={50}
      />

      {/* Ally targets (orange hit marker, red when killed) */}
      <TargetBall
        position={[-3, 1.5, -5]}
        targetType={HealthTargetType.ALLY}
        maxHealth={100}
      />

      {/* Neutral targets (orange hit marker, red when killed) */}
      <TargetBall
        position={[-5, 1.5, -5]}
        targetType={HealthTargetType.NEUTRAL}
        maxHealth={100}
      />

      {/* Destructible environment (yellow hit marker, brown when destroyed) */}
      <TargetBall
        position={[0, 1.5, -8]}
        targetType={HealthTargetType.DESTRUCTIBLE}
        maxHealth={75}
      />
      <TargetBall
        position={[2, 1.5, -8]}
        targetType={HealthTargetType.DESTRUCTIBLE}
        maxHealth={30}
      />

      {/* Pickup items (green hit marker, blue when destroyed) */}
      <TargetBall
        position={[-2, 1.5, -8]}
        targetType={HealthTargetType.PICKUP}
        maxHealth={25}
      />

      {/* Environment (yellow hit marker, brown when destroyed) */}
      <TargetBall
        position={[0, 1.5, -3]}
        targetType={HealthTargetType.ENVIRONMENT}
        maxHealth={200}
      />
    </>
  );
}
