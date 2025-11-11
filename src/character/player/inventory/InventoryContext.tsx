/**
 * Contexte pour gérer l'inventaire du joueur
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  icon?: string;
}

interface InventoryContextValue {
  items: InventoryItem[];
  isOpen: boolean;
  addItem: (itemId: string, itemName: string, quantity?: number) => void;
  removeItem: (itemId: string, quantity?: number) => void;
  getItem: (itemId: string) => InventoryItem | undefined;
  hasItem: (itemId: string) => boolean;
  toggleInventory: () => void;
  openInventory: () => void;
  closeInventory: () => void;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((itemId: string, itemName: string, quantity: number = 1) => {
    setItems(prev => {
      const existingItem = prev.find(item => item.id === itemId);

      if (existingItem) {
        // Item existe déjà, augmenter la quantité
        return prev.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Nouvel item
        return [...prev, { id: itemId, name: itemName, quantity }];
      }
    });
  }, []);

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
    const item = items.find(item => item.id === itemId);
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
