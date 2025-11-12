import { useRef, useState } from 'react';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { Health, HealthHandle, HealthTargetType } from '../core/health';
import { Mesh } from 'three';

interface TargetBallProps {
  position: [number, number, number];
  targetType?: HealthTargetType;
  maxHealth?: number;
  onHit?: (health: number, isDead: boolean) => void;
}

/**
 * Example target ball with Health component for testing
 */
export function TargetBall({
  position,
  targetType = HealthTargetType.ENEMY,
  maxHealth = 100,
  onHit
}: TargetBallProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const healthRef = useRef<HealthHandle>(null);
  const meshRef = useRef<Mesh>(null);
  const [isDead, setIsDead] = useState(false);

  const handleDeath = () => {
    setIsDead(true);
    // Optionally remove or fade out after death
    setTimeout(() => {
      if (rigidBodyRef.current) {
        rigidBodyRef.current.setEnabled(false);
      }
    }, 100);
  };

  const handleDamage = (damage: number, health: number) => {
    // Visual feedback on damage
    if (meshRef.current) {
      const intensity = damage / maxHealth;
      meshRef.current.scale.set(
        1 + intensity * 0.2,
        1 + intensity * 0.2,
        1 + intensity * 0.2
      );
      setTimeout(() => {
        if (meshRef.current) {
          meshRef.current.scale.set(1, 1, 1);
        }
      }, 100);
    }

    onHit?.(health, health <= 0);
  };

  // Color based on target type
  const getColor = () => {
    switch (targetType) {
      case HealthTargetType.ENEMY:
        return '#ff4444';
      case HealthTargetType.ALLY:
        return '#4444ff';
      case HealthTargetType.NEUTRAL:
        return '#ffaa44';
      case HealthTargetType.ENVIRONMENT:
        return '#888888';
      case HealthTargetType.DESTRUCTIBLE:
        return '#aa8844';
      case HealthTargetType.PICKUP:
        return '#44ff44';
      default:
        return '#ffffff';
    }
  };

  return (
    <Health
      ref={healthRef}
      maxHealth={maxHealth}
      targetType={targetType}
      destructible={targetType === HealthTargetType.DESTRUCTIBLE}
      onDeath={handleDeath}
      onDamage={handleDamage}
    >
      <RigidBody
        ref={rigidBodyRef}
        position={position}
        colliders="ball"
        type="fixed"
        userData={{ healthRef, targetType }}
      >
        <mesh ref={meshRef}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial
            color={getColor()}
            opacity={isDead ? 0.3 : 1}
            transparent={isDead}
          />
        </mesh>
      </RigidBody>
    </Health>
  );
}
