/**
 * WorldItemManager - Gère le spawn/despawn des items dans le monde 3D
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { InventoryItem } from './InventoryContext';
import * as THREE from 'three';

export interface WorldItem {
  id: string;
  item: InventoryItem;
  position: [number, number, number];
  timestamp: number;
}

interface WorldItemManagerContextValue {
  worldItems: WorldItem[];
  spawnItem: (item: InventoryItem, playerPosition: THREE.Vector3, playerDirection: THREE.Vector3) => void;
  removeItem: (id: string) => void;
}

const WorldItemManagerContext = createContext<WorldItemManagerContextValue | null>(null);

export function WorldItemManagerProvider({ children }: { children: ReactNode }) {
  const [worldItems, setWorldItems] = useState<WorldItem[]>([]);

  const spawnItem = useCallback((item: InventoryItem, playerPosition: THREE.Vector3, playerDirection: THREE.Vector3) => {
    // Spawn item in front of player
    const spawnPosition = new THREE.Vector3()
      .copy(playerPosition)
      .add(playerDirection.clone().multiplyScalar(3)) // 3 units in front
      .add(new THREE.Vector3(0, 1.5, 0)); // Slightly above ground

    const worldItem: WorldItem = {
      id: `world_${item.id}_${Date.now()}`,
      item,
      position: [spawnPosition.x, spawnPosition.y, spawnPosition.z],
      timestamp: Date.now(),
    };

    setWorldItems(prev => [...prev, worldItem]);
    console.log('[WorldItemManager] Spawned item in world:', item.name, 'at', worldItem.position);
  }, []);

  const removeItem = useCallback((id: string) => {
    setWorldItems(prev => prev.filter(item => item.id !== id));
    console.log('[WorldItemManager] Removed item from world:', id);
  }, []);

  return (
    <WorldItemManagerContext.Provider value={{ worldItems, spawnItem, removeItem }}>
      {children}
    </WorldItemManagerContext.Provider>
  );
}

export function useWorldItemManager() {
  const context = useContext(WorldItemManagerContext);
  if (!context) {
    throw new Error('useWorldItemManager must be used within a WorldItemManagerProvider');
  }
  return context;
}
