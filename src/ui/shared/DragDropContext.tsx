/**
 * Drag & Drop Context
 * Système universel de drag & drop pour l'inventaire et la quickbar
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { InventoryItem } from '../../character/player/inventory/InventoryContext';

export type DragSource = 'inventory' | 'quickbar' | 'world';
export type DropTarget = 'inventory' | 'quickbar' | 'world';

export interface DragData {
  item: InventoryItem;
  source: DragSource;
  sourceIndex?: number; // Pour la quickbar
}

interface DragDropContextValue {
  dragData: DragData | null;
  isDragging: boolean;
  startDrag: (data: DragData) => void;
  endDrag: () => void;
  onDrop: (target: DropTarget, targetIndex?: number) => void;

  // Callbacks pour gérer les différentes actions
  onInventoryToQuickbar?: (item: InventoryItem, slotIndex: number) => void;
  onQuickbarToInventory?: (item: InventoryItem, fromSlotIndex: number) => void;
  onQuickbarToQuickbar?: (item: InventoryItem, fromSlotIndex: number, toSlotIndex: number) => void;
  onDropToWorld?: (item: InventoryItem, source: DragSource, sourceIndex?: number) => void;

  // Setters pour les callbacks
  setInventoryToQuickbar: (callback: (item: InventoryItem, slotIndex: number) => void) => void;
  setQuickbarToInventory: (callback: (item: InventoryItem, fromSlotIndex: number) => void) => void;
  setQuickbarToQuickbar: (callback: (item: InventoryItem, fromSlotIndex: number, toSlotIndex: number) => void) => void;
  setDropToWorld: (callback: (item: InventoryItem, source: DragSource, sourceIndex?: number) => void) => void;
}

const DragDropContext = createContext<DragDropContextValue | null>(null);

export function DragDropProvider({ children }: { children: ReactNode }) {
  const [dragData, setDragData] = useState<DragData | null>(null);
  const [onInventoryToQuickbar, setInventoryToQuickbar] = useState<((item: InventoryItem, slotIndex: number) => void) | undefined>();
  const [onQuickbarToInventory, setQuickbarToInventory] = useState<((item: InventoryItem, fromSlotIndex: number) => void) | undefined>();
  const [onQuickbarToQuickbar, setQuickbarToQuickbar] = useState<((item: InventoryItem, fromSlotIndex: number, toSlotIndex: number) => void) | undefined>();
  const [onDropToWorld, setDropToWorld] = useState<((item: InventoryItem, source: DragSource, sourceIndex?: number) => void) | undefined>();

  const startDrag = useCallback((data: DragData) => {
    setDragData(data);
    console.log('[DragDrop] Started dragging:', data);
  }, []);

  const endDrag = useCallback(() => {
    console.log('[DragDrop] Ended drag');
    setDragData(null);
  }, []);

  const onDrop = useCallback((target: DropTarget, targetIndex?: number) => {
    if (!dragData) return;

    console.log('[DragDrop] Drop:', { from: dragData.source, to: target, item: dragData.item.name });

    // Inventory -> Quickbar
    if (dragData.source === 'inventory' && target === 'quickbar' && targetIndex !== undefined) {
      onInventoryToQuickbar?.(dragData.item, targetIndex);
    }
    // Quickbar -> Inventory
    else if (dragData.source === 'quickbar' && target === 'inventory' && dragData.sourceIndex !== undefined) {
      onQuickbarToInventory?.(dragData.item, dragData.sourceIndex);
    }
    // Quickbar -> Quickbar (swap)
    else if (dragData.source === 'quickbar' && target === 'quickbar' && dragData.sourceIndex !== undefined && targetIndex !== undefined) {
      onQuickbarToQuickbar?.(dragData.item, dragData.sourceIndex, targetIndex);
    }
    // Any -> World (drop item)
    else if (target === 'world') {
      onDropToWorld?.(dragData.item, dragData.source, dragData.sourceIndex);
    }

    endDrag();
  }, [dragData, onInventoryToQuickbar, onQuickbarToInventory, onQuickbarToQuickbar, onDropToWorld, endDrag]);

  return (
    <DragDropContext.Provider
      value={{
        dragData,
        isDragging: dragData !== null,
        startDrag,
        endDrag,
        onDrop,
        onInventoryToQuickbar,
        onQuickbarToInventory,
        onQuickbarToQuickbar,
        onDropToWorld,
        setInventoryToQuickbar: (cb) => setInventoryToQuickbar(() => cb),
        setQuickbarToInventory: (cb) => setQuickbarToInventory(() => cb),
        setQuickbarToQuickbar: (cb) => setQuickbarToQuickbar(() => cb),
        setDropToWorld: (cb) => setDropToWorld(() => cb),
      }}
    >
      {children}
    </DragDropContext.Provider>
  );
}

export function useDragDrop() {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within a DragDropProvider');
  }
  return context;
}
