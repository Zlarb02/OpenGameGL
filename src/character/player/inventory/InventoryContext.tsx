/**
 * Contexte pour gérer l'inventaire du joueur
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { WeaponState, EquipmentSlotType, WeaponType } from '../equipment/types/EquipmentTypes';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  icon?: string;

  // Equipment-specific properties
  isEquipment?: boolean;
  equipmentType?: WeaponType | string;
  equipmentState?: WeaponState;
  equipmentSlot?: EquipmentSlotType;
  stackable?: boolean; // Weapons are not stackable
}

interface InventoryContextValue {
  items: InventoryItem[];
  isOpen: boolean;
  addItem: (itemId: string, itemName: string, quantity?: number, itemConfig?: Partial<InventoryItem>) => boolean;
  removeItem: (itemId: string, quantity?: number) => void;
  getItem: (itemId: string) => InventoryItem | undefined;
  hasItem: (itemId: string) => boolean;
  toggleInventory: () => void;
  openInventory: () => void;
  closeInventory: () => void;

  // Equipment-specific methods
  updateItemState: (itemId: string, state: WeaponState, slot?: EquipmentSlotType) => void;
  getBackWeaponsCount: () => number;
  canAddBackWeapon: () => boolean;
  getItemsByType: (equipmentType: WeaponType | string) => InventoryItem[];
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((
    itemId: string,
    itemName: string,
    quantity: number = 1,
    itemConfig?: Partial<InventoryItem>
  ): boolean => {
    // Check if this is a back weapon (rifle)
    const isBackWeapon = itemConfig?.equipmentType === WeaponType.RIFLE;

    if (isBackWeapon) {
      // Enforce 2-weapon limit for back weapons
      const currentBackWeaponsCount = items.filter(item =>
        item.equipmentType === WeaponType.RIFLE
      ).length;

      if (currentBackWeaponsCount >= 2) {
        console.warn('[Inventory] Cannot add weapon: Back weapon limit reached (2/2)');
        return false;
      }

      // Weapons are NOT stackable - each weapon is a unique item
      // Generate unique ID for each weapon instance
      const uniqueId = `${itemId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      setItems(prev => [
        ...prev,
        {
          id: uniqueId,
          name: itemName,
          quantity: 1, // Always 1 for weapons
          stackable: false,
          isEquipment: true,
          equipmentState: WeaponState.IN_INVENTORY,
          ...itemConfig,
        },
      ]);

      console.log(`[Inventory] Added weapon ${itemName} (${currentBackWeaponsCount + 1}/2)`);
      return true;
    }

    // For stackable items (consumables, etc.)
    setItems(prev => {
      const existingItem = prev.find(item => item.id === itemId);

      if (existingItem && itemConfig?.stackable !== false) {
        // Item exists and is stackable, increase quantity
        return prev.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // New item or non-stackable
        return [
          ...prev,
          {
            id: itemId,
            name: itemName,
            quantity,
            stackable: itemConfig?.stackable ?? true,
            ...itemConfig,
          },
        ];
      }
    });

    return true;
  }, [items]);

  const removeItem = useCallback((itemId: string, quantity: number = 1) => {
    setItems(prev => {
      const existingItem = prev.find(item => item.id === itemId);

      if (!existingItem) return prev;

      if (existingItem.quantity <= quantity) {
        // Supprimer l'item complètement
        return prev.filter(item => item.id !== itemId);
      } else {
        // Réduire la quantité
        return prev.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity - quantity }
            : item
        );
      }
    });
  }, []);

  const getItem = useCallback((itemId: string): InventoryItem | undefined => {
    return items.find(item => item.id === itemId);
  }, [items]);

  const hasItem = useCallback((itemId: string): boolean => {
    // Check by exact ID or by equipmentType (for weapons with unique IDs)
    const item = items.find(item => item.id === itemId || item.equipmentType === itemId);
    return item ? item.quantity > 0 : false;
  }, [items]);

  const toggleInventory = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const openInventory = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeInventory = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Equipment-specific methods
  const updateItemState = useCallback((
    itemId: string,
    state: WeaponState,
    slot?: EquipmentSlotType
  ) => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, equipmentState: state, equipmentSlot: slot }
          : item
      )
    );
  }, []);

  const getBackWeaponsCount = useCallback((): number => {
    return items.filter(item => item.equipmentType === WeaponType.RIFLE).length;
  }, [items]);

  const canAddBackWeapon = useCallback((): boolean => {
    return getBackWeaponsCount() < 2;
  }, [getBackWeaponsCount]);

  const getItemsByType = useCallback((equipmentType: WeaponType | string): InventoryItem[] => {
    return items.filter(item => item.equipmentType === equipmentType);
  }, [items]);

  return (
    <InventoryContext.Provider
      value={{
        items,
        isOpen,
        addItem,
        removeItem,
        getItem,
        hasItem,
        toggleInventory,
        openInventory,
        closeInventory,
        updateItemState,
        getBackWeaponsCount,
        canAddBackWeapon,
        getItemsByType,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
