/**
 * Composant générique pour tous les objets ramassables
 * Gère l'enregistrement, la sélection et l'indicateur visuel
 */

import React, { useRef, useEffect, useId, ReactNode } from 'react';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { Billboard } from '@react-three/drei';
import { useInteractableStore } from '../hooks/useInteractableManager';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PickupProps {
  position: [number, number, number];
  onPickup: () => void;
  interactionRange?: number;
  children: ReactNode;
  mass?: number;
  restitution?: number;
  friction?: number;
  linearDamping?: number;
  angularDamping?: number;
  colliders?: 'cuboid' | 'ball' | 'trimesh' | 'hull';
}

/**
 * Indicateur visuel qui apparaît au-dessus de l'objet sélectionné
 */
function PickupIndicator({ rigidBodyRef }: { rigidBodyRef: React.RefObject<RapierRigidBody> }) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (groupRef.current) {
      // Mettre l'indicateur sur le layer 1 pour l'exclure du raycast
      groupRef.current.traverse((obj) => {
        obj.layers.set(1);
      });
    }
  }, []);

  useFrame(() => {
    if (rigidBodyRef.current && groupRef.current) {
      const pos = rigidBodyRef.current.translation();
      groupRef.current.position.set(pos.x, pos.y + 1, pos.z);
    }
  });

  return (
    <group ref={groupRef}>
      <Billboard follow={true}>
        <mesh>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshBasicMaterial color="#ff00ff" toneMapped={false} />
        </mesh>
      </Billboard>
    </group>
  );
}

/**
 * Composant Pickup générique
 */
export function Pickup({
  position,
  onPickup,
  interactionRange = 5,
  children,
  mass = 5,
  restitution = 0.1,
  friction = 1.2,
  linearDamping = 0.8,
  angularDamping = 0.8,
  colliders = 'hull',
}: PickupProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const id = useId();
  const register = useInteractableStore((state) => state.register);
  const unregister = useInteractableStore((state) => state.unregister);
  const selectedId = useInteractableStore((state) => state.selectedId);

  const groupRef = useRef<any>(null);

  // Enregistrer l'objet comme interactible
  useEffect(() => {
    if (!groupRef.current) return;

    register({
      id,
      object3D: groupRef.current,
      onInteract: onPickup,
      interactionRange,
      rigidBodyRef, // Ajouter la ref du RigidBody pour obtenir la vraie position
    });

    return () => {
      unregister(id);
    };
  }, [id, onPickup, register, unregister, interactionRange]);

  const isSelected = selectedId === id;

  return (
    <>
      <group ref={groupRef}>
        <RigidBody
          ref={rigidBodyRef}
          position={position}
          type="dynamic"
          colliders={colliders}
          mass={mass}
          restitution={restitution}
          friction={friction}
          linearDamping={linearDamping}
          angularDamping={angularDamping}
          ccd={true}
        >
          {children}
        </RigidBody>
      </group>

      {/* Indicateur visuel désactivé - on utilise InteractIcon3D à la place */}
      {/* {isSelected && <PickupIndicator rigidBodyRef={rigidBodyRef} />} */}
    </>
  );
}
