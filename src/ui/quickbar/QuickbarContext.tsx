/**
 * Quickbar Context
 * Affiche automatiquement les slots d'équipement physiques (1 = dos gauche, 2 = dos droit, etc.)
 * La quickbar reflète l'état réel de l'équipement, pas un système séparé
 */

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Equipment, EquipmentSlotType } from '../../character/player/equipment/types/EquipmentTypes';
import { EquipmentRegistry } from '../../character/player/equipment/config/EquipmentRegistry';

export interface QuickbarSlot {
  index: number;
  slotType: EquipmentSlotType; // Le slot d'équipement physique correspondant
  displayName: string; // Nom d'affichage du slot (DOS 1, HOLSTER, etc.)
  equipment: Equipment | null; // L'équipement actuellement dans ce slot
}

interface QuickbarContextValue {
  slots: QuickbarSlot[];
  activeSlotIndex: number | null;

  // Slot sync (appelé automatiquement par EquipmentContext)
  syncSlots: (equippedItems: Map<EquipmentSlotType, Equipment>) => void;

  // Active slot
  setActiveSlot: (index: number | null) => void;

  // Visibility
  isVisible: boolean;
  showTemporarily: () => void; // Montre pendant 2 secondes
  showPermanently: () => void; // Montre tant que l'inventaire est ouvert
  hide: () => void;
}

const QuickbarContext = createContext<QuickbarContextValue | null>(null);

export function QuickbarProvider({ children }: { children: ReactNode }) {
  // Initialize 8 slots with their corresponding equipment slots
  // Get displayNames from EquipmentRegistry
  const slotTypes = [
    EquipmentSlotType.BACK_LEFT,
    EquipmentSlotType.BACK_RIGHT,
    EquipmentSlotType.THIGH_RIGHT,
    EquipmentSlotType.THIGH_LEFT,
    EquipmentSlotType.BELT_SLOT_1,
    EquipmentSlotType.BELT_SLOT_2,
    EquipmentSlotType.BELT_SLOT_3,
    EquipmentSlotType.BELT_SLOT_4,
  ];

  const initialSlots: QuickbarSlot[] = slotTypes.map((slotType, index) => {
    const config = EquipmentRegistry.getSlotConfig(slotType);
    return {
      index,
      slotType,
      displayName: config?.displayName || `Slot ${index + 1}`,
      equipment: null,
    };
  });

  const [slots, setSlots] = useState<QuickbarSlot[]>(initialSlots);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Synchronize quickbar with equipped items
  const syncSlots = useCallback((equippedItems: Map<EquipmentSlotType, Equipment>) => {
    setSlots(prev => {
      return prev.map(slot => ({
        ...slot,
        equipment: equippedItems.get(slot.slotType) || null,
      }));
    });
  }, []);

  const setActiveSlot = useCallback((index: number | null) => {
    setActiveSlotIndex(index);
    if (index !== null) {
      showTemporarily();
    }
  }, []);

  const showTemporarily = useCallback(() => {
    setIsVisible(true);

    // Clear existing timeout
    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }

    // Hide after 2 seconds
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    setHideTimeout(timeout);
  }, [hideTimeout]);

  const showPermanently = useCallback(() => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
    setIsVisible(true);
  }, [hideTimeout]);

  const hide = useCallback(() => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
    setIsVisible(false);
  }, [hideTimeout]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [hideTimeout]);

  return (
    <QuickbarContext.Provider
      value={{
        slots,
        activeSlotIndex,
        syncSlots,
        setActiveSlot,
        isVisible,
        showTemporarily,
        showPermanently,
        hide,
      }}
    >
      {children}
    </QuickbarContext.Provider>
  );
}

export function useQuickbar() {
  const context = useContext(QuickbarContext);
  if (!context) {
    throw new Error('useQuickbar must be used within a QuickbarProvider');
  }
  return context;
}
