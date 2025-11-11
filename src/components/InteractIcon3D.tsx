/**
 * Icône d'interaction 3D affichée au-dessus de l'objet sélectionné
 */

import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useInteractableStore } from '../hooks/useInteractableManager';
import { KeyPrompt3D } from './KeyPrompt3D';
import * as THREE from 'three';

export function InteractIcon3D() {
  const selectedId = useInteractableStore((state) => state.selectedId);
  const canInteract = useInteractableStore((state) => state.canInteract);
  const selectedDistance = useInteractableStore((state) => state.selectedDistance);
  const interactables = useInteractableStore((state) => state.interactables);

  const groupRef = useRef<THREE.Group>(null);

  // Mettre l'indicateur sur les layers 0 ET 1 pour être visible ET éviter le raycast
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.traverse((obj) => {
        // Activer tous les layers pour être visible
        obj.layers.enableAll();
      });
    }
  }, [selectedId]);

  // Mettre à jour la position et le scale à chaque frame
  useFrame(() => {
    if (!selectedId || !groupRef.current) return;

    const interactable = interactables.get(selectedId);
    if (!interactable) return;

    // Obtenir la position du RigidBody si disponible, sinon du Object3D
    let position = new THREE.Vector3();
    if (interactable.rigidBodyRef?.current) {
      const rbPos = interactable.rigidBodyRef.current.translation();
      position.set(rbPos.x, rbPos.y, rbPos.z);
    } else {
      interactable.object3D.getWorldPosition(position);
    }
    position.y += 1.2; // 1.2 unités au-dessus (réduit de 1.5)

    // Mettre à jour la position du group
    groupRef.current.position.copy(position);

    // Calculer le scale basé sur la distance (plus loin = plus grand)
    // Distance minimale: 2, Distance maximale: 20
    // Scale: de 0.5 (proche) à 3 (loin)
    if (selectedDistance !== null) {
      const minDistance = 2;
      const maxDistance = 20;
      const minScale = 0.5;
      const maxScale = 3;

      const clampedDistance = Math.max(minDistance, Math.min(maxDistance, selectedDistance));
      const normalizedDistance = (clampedDistance - minDistance) / (maxDistance - minDistance);
      const scale = minScale + normalizedDistance * (maxScale - minScale);

      groupRef.current.scale.setScalar(scale);
    }
  });

  if (!selectedId) return null;

  const interactable = interactables.get(selectedId);
  if (!interactable) return null;

  // Obtenir la position initiale
  const initialPosition = new THREE.Vector3();
  if (interactable.rigidBodyRef?.current) {
    const rbPos = interactable.rigidBodyRef.current.translation();
    initialPosition.set(rbPos.x, rbPos.y, rbPos.z);
  } else {
    interactable.object3D.getWorldPosition(initialPosition);
  }
  initialPosition.y += 1.2; // Réduit de 1.5 à 1.2

  // Calculer le scale initial basé sur la distance
  let initialScale = 0.5;
  if (selectedDistance !== null) {
    const minDistance = 2;
    const maxDistance = 20;
    const minScale = 0.5;
    const maxScale = 3;

    const clampedDistance = Math.max(minDistance, Math.min(maxDistance, selectedDistance));
    const normalizedDistance = (clampedDistance - minDistance) / (maxDistance - minDistance);
    initialScale = minScale + normalizedDistance * (maxScale - minScale);
  }

  return (
    <group ref={groupRef} position={initialPosition} scale={initialScale}>
      {/* Icône de touche Kenney "E" - grisée si trop loin, taille adaptée à la distance */}
      <KeyPrompt3D action="E" canInteract={canInteract} />
    </group>
  );
}
