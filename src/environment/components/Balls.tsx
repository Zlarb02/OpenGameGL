import { useMemo, useRef, useState, useCallback } from 'react';
import { ShaderMaterial, Color, Mesh, Vector3Tuple } from 'three';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { useControls, button } from 'leva';
import { ToonVertexShader, ToonFragmentShader } from '../../rendering/shaders/toonShader';
import { createSectionControls } from '../../utils/levaSectionManager';
import { Health, HealthHandle, HealthTargetType } from '../../core/health';

interface BallData {
  id: number;
  position: Vector3Tuple;
  scale: number;
}

interface BallProps {
  position: Vector3Tuple;
  scale: number;
  toonMaterial: ShaderMaterial;
  bounciness: number;
  friction: number;
  onDestroy: () => void;
}

function Ball({ position, scale, toonMaterial, bounciness, friction, onDestroy }: BallProps) {
  const healthRef = useRef<HealthHandle>(null);
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<Mesh>(null);
  const [isDead, setIsDead] = useState(false);

  const handleDeath = () => {
    setIsDead(true);

    // Disable physics immediately
    if (rigidBodyRef.current) {
      rigidBodyRef.current.setEnabled(false);
    }

    // Fade out and remove after delay
    setTimeout(() => {
      onDestroy();
    }, 500);
  };

  const handleDamage = (damage: number) => {
    // Visual feedback on damage
    if (meshRef.current) {
      const intensity = damage / 30;
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
  };

  // Don't render if dead
  if (isDead) {
    return null;
  }

  return (
    <Health
      ref={healthRef}
      maxHealth={30}
      targetType={HealthTargetType.DESTRUCTIBLE}
      destructible={true}
      onDeath={handleDeath}
      onDamage={handleDamage}
    >
      <RigidBody
        ref={rigidBodyRef}
        colliders="ball"
        restitution={bounciness}
        friction={friction}
        position={position}
        userData={{ healthRef, targetType: HealthTargetType.DESTRUCTIBLE }}
      >
        <mesh ref={meshRef} castShadow receiveShadow>
          <icosahedronGeometry args={[scale, 3]} />
          <primitive object={toonMaterial} attach="material" />
        </mesh>
      </RigidBody>
    </Health>
  );
}

export function Balls() {
  const nextBallIdRef = useRef(0);
  const [activeBalls, setActiveBalls] = useState<BallData[]>([]);

  const addBall = useCallback(() => {
    const x = (Math.random() - 0.5) * 10;
    const y = Math.random() * 10 + 5;
    const z = (Math.random() - 0.5) * 10;
    const scale = Math.random() * 0.5 + 0.3;

    setActiveBalls(prev => [
      ...prev,
      { id: nextBallIdRef.current, position: [x, y, z], scale }
    ]);
    nextBallIdRef.current += 1;
  }, []);

  const addMultipleBalls = useCallback((count: number) => {
    const newBalls: BallData[] = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 10;
      const y = Math.random() * 10 + 5;
      const z = (Math.random() - 0.5) * 10;
      const scale = Math.random() * 0.5 + 0.3;
      newBalls.push({ id: nextBallIdRef.current + i, position: [x, y, z], scale });
    }
    setActiveBalls(prev => [...prev, ...newBalls]);
    nextBallIdRef.current += count;
  }, []);

  const clearAllBalls = useCallback(() => {
    setActiveBalls([]);
  }, []);

  const controls = useControls('🎨 Balls', {
    bounciness: { value: 0.7, min: 0, max: 1, step: 0.1 },
    friction: { value: .25, min: 0, max: 1, step: 0.1 },
    outlineThickness: { value: 0.25, min: 0, max: 0.5, step: 0.01 },

    // Ball management
    addOne: button(() => addBall()),
    add10: button(() => addMultipleBalls(10)),
    add50: button(() => addMultipleBalls(50)),
    add100: button(() => addMultipleBalls(100)),
    clearAll: button(() => clearAllBalls()),

    // Section controls
    ...createSectionControls('Balls', 'leva__🎨 Balls'),
  }, { collapsed: true });

  const toonMaterial = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        color: { value: new Color('#51BCFF') },
        outlineThickness: { value: controls.outlineThickness }
      },
      vertexShader: ToonVertexShader,
      fragmentShader: ToonFragmentShader,
    });
  }, [controls.outlineThickness]);

  const handleBallDestroy = (id: number) => {
    setActiveBalls(prev => prev.filter(ball => ball.id !== id));
  };

  return (
    <>
      {activeBalls.map((ball) => (
        <Ball
          key={ball.id}
          position={ball.position}
          scale={ball.scale}
          toonMaterial={toonMaterial}
          bounciness={controls.bounciness}
          friction={controls.friction}
          onDestroy={() => handleBallDestroy(ball.id)}
        />
      ))}
    </>
  );
}
