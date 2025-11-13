/**
 * DragDropManager - Gère le drop d'items au sol
 * Les armes ne sont PAS dans l'inventaire, donc pas de drag & drop pour elles
 * Seuls les consommables/items non-équipement peuvent être droppés
 */

import { useEffect, useRef } from 'react';
import { useDragDrop } from './DragDropContext';
import { useInventory } from '../../character/player/inventory/InventoryContext';
import { useWorldItemManager } from '../../character/player/inventory/WorldItemManager';
import * as THREE from 'three';

export function DragDropManager() {
  const { setDropToWorld } = useDragDrop();
  const { removeItem } = useInventory();
  const { spawnItem } = useWorldItemManager();

  // Use refs to avoid recreating objects on every render
  const defaultPositionRef = useRef(new THREE.Vector3(0, 2, 0));
  const defaultDirectionRef = useRef(new THREE.Vector3(0, 0, 1));

  // Set up drag & drop handlers (only once on mount)
  useEffect(() => {
    // Any → World: Drop item in 3D world (only for non-equipment items)
    setDropToWorld((item, source, sourceIndex) => {
      console.log('[DragDropManager] Drop to world:', item.name, 'from', source);

      // Only allow dropping non-equipment items (consumables, etc.)
      if (item.isEquipment) {
        console.warn('[DragDropManager] Cannot drop equipment items from inventory - they are managed by equipment slots');
        return;
      }

      // Remove from inventory
      removeItem(item.id);

      // Spawn in world
      spawnItem(item, defaultPositionRef.current, defaultDirectionRef.current);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - setup only once on mount

  return null;
}
