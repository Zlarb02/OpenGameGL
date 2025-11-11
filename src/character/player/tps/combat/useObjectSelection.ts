/**
 * Système de sélection d'objets par raycast depuis la caméra
 * Détecte l'objet interactible le plus proche visé par le joueur
 */

import { useFrame, useThree } from '@react-three/fiber';
import { Raycaster, Vector3 } from 'three';
import { useRef } from 'react';
import { useInteractableStore } from '../../interactions/useInteractableManager';
import { useInput, GameAction } from '../../../../core/input';

const raycaster = new Raycaster();
raycaster.layers.set(0); // Ne détecter que le layer 0 (ignorer les indicateurs sur layer 1)
const cameraDirection = new Vector3();

export function useObjectSelection(characterRef: React.MutableRefObject<any>) {
  const { camera } = useThree();
  const { inputManager } = useInput();
  const setSelected = useInteractableStore((state) => state.setSelected);
  const interact = useInteractableStore((state) => state.interact);
  const interactables = useInteractableStore((state) => state.interactables);

  const lastInteractTime = useRef(0);
  const lastSelectedId = useRef<string | null>(null);

  useFrame(() => {
    if (!characterRef.current) return;

    // Obtenir la direction de la caméra
    camera.getWorldDirection(cameraDirection);

    // Configurer le raycast depuis la position de la caméra
    raycaster.set(camera.position, cameraDirection);
    raycaster.far = 100; // Distance maximale de détection (augmentée pour voir de loin)

    // Collecter tous les Object3D des interactables
    const objects = Array.from(interactables.values()).map(i => i.object3D);

    if (objects.length === 0) {
      setSelected(null);
      return;
    }

    // Les objets sont enregistrés et prêts

    // Faire le raycast avec tous les descendants
    const intersections = raycaster.intersectObjects(objects, true);

    let closestInteractable: { id: string; distance: number } | null = null;

    // Trouver l'objet interactible le plus proche (peu importe la distance)
    for (const intersection of intersections) {
      // Remonter la hiérarchie pour trouver l'objet racine interactible
      let current = intersection.object;
      let found = false;

      while (current && !found) {
        // Chercher si cet objet correspond à un interactible
        for (const [id, interactable] of interactables.entries()) {
          if (current === interactable.object3D) {
            const distance = intersection.distance;

            // Sélectionner l'objet le plus proche, peu importe la distance
            if (!closestInteractable || distance < closestInteractable.distance) {
              closestInteractable = { id, distance };
            }
            found = true;
            break;
          }
        }
        current = current.parent;
      }
    }

    // Mettre à jour la sélection avec la distance et si on peut interagir
    if (closestInteractable) {
      const interactable = interactables.get(closestInteractable.id);
      const canInteract = interactable ? closestInteractable.distance <= interactable.interactionRange : false;
      setSelected(closestInteractable.id, closestInteractable.distance, canInteract);
      lastSelectedId.current = closestInteractable.id;

      // Gérer l'interaction (seulement si on est assez proche)
      if (canInteract) {
        const now = Date.now();
        if (inputManager.isActionJustPressed(GameAction.USE)) {
          if (now - lastInteractTime.current > 200) {
            interact();
            lastInteractTime.current = now;
          }
        }
      }
    } else {
      setSelected(null);
      lastSelectedId.current = null;
    }
  });
}
