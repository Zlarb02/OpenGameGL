/**
 * Rifle ramassable - utilise le composant Pickup générique
 */

import React from 'react';
import { useGLTF } from '@react-three/drei';
import { Pickup } from './Pickup';

interface RiflePickupProps {
  position: [number, number, number];
  onPickup: () => void;
}

/**
 * Rifle ramassable dans le monde
 */
export function RiflePickup({ position, onPickup }: RiflePickupProps) {
  // Charger le modèle du rifle
  const { scene } = useGLTF('/models/weapons/rifle.glb');

  return (
    <Pickup
      position={position}
      onPickup={onPickup}
      interactionRange={5}
      mass={5}
      restitution={0.1}
      friction={1.2}
      linearDamping={0.8}
      angularDamping={0.8}
      colliders="hull"
    >
      <primitive object={scene.clone()} scale={1.5} rotation={[0, Math.PI / 2, 0]} />
    </Pickup>
  );
}

// Preload le modèle
useGLTF.preload('/models/weapons/rifle.glb');
