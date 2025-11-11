/**
 * Hook pour gérer l'ouverture/fermeture de l'inventaire
 */

import { useEffect } from 'react';
import { useInput, GameAction } from '../../../core/input';
import { useInventory } from './InventoryContext';

export function useInventoryControls() {
  const { inputManager } = useInput();
  const { toggleInventory } = useInventory();

  useEffect(() => {
    const handleInventoryToggle = (state: any) => {
      if (state.justPressed) {
        toggleInventory();
      }
    };

    inputManager.addEventListener(GameAction.INVENTORY, handleInventoryToggle);

    return () => {
      inputManager.removeEventListener(GameAction.INVENTORY, handleInventoryToggle);
    };
  }, [inputManager, toggleInventory]);
}
