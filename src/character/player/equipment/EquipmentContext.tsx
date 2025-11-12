/**
 * Equipment Context
 * React Context for Equipment Management system
 */

import React, { createContext, useContext, useRef, useCallback, useState, useEffect } from 'react';
import { Group } from 'three';
import { Equipment, EquipmentSlotType } from './types/EquipmentTypes';
import { EquipmentManager } from './systems/EquipmentManager';
import { AttachmentSystem } from './systems/AttachmentSystem';
import { EquipmentRenderer } from './systems/EquipmentRenderer';

interface EquipmentContextValue {
  manager: EquipmentManager | null;
  equip: (equipment: Equipment, slot: EquipmentSlotType) => Promise<boolean>;
  unequip: (slot: EquipmentSlotType) => Promise<Equipment | null>;
  getEquipped: (slot: EquipmentSlotType) => Equipment | null;
  isSlotOccupied: (slot: EquipmentSlotType) => boolean;
  canEquip: (equipment: Equipment, slot?: EquipmentSlotType) => boolean;
  getFirstAvailableBackSlot: () => EquipmentSlotType | null;
  getFirstAvailableThighSlot: () => EquipmentSlotType | null;
  initializeSkeleton: (skeleton: Group) => void;
  updateTransform: (slot: EquipmentSlotType, position: [number, number, number], rotation: [number, number, number], scale: number) => boolean;
  equippedItemsVersion: number; // For triggering re-renders

  // Wielding methods
  wield: (slot: EquipmentSlotType) => Promise<boolean>;
  stow: () => Promise<boolean>;
  getWieldedSlot: () => EquipmentSlotType | null;
  getWieldedEquipment: () => Equipment | null;
  isWielded: (slot: EquipmentSlotType) => boolean;
}

const EquipmentContext = createContext<EquipmentContextValue | null>(null);

export function EquipmentProvider({ children }: { children: React.ReactNode }) {
  const managerRef = useRef<EquipmentManager | null>(null);
  const attachmentSystemRef = useRef<AttachmentSystem | null>(null);
  const rendererRef = useRef<EquipmentRenderer | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [equippedItemsVersion, setEquippedItemsVersion] = useState(0);

  // Initialize systems once
  useEffect(() => {
    if (!attachmentSystemRef.current) {
      attachmentSystemRef.current = new AttachmentSystem();
    }
    if (!rendererRef.current) {
      rendererRef.current = new EquipmentRenderer();
    }
    if (!managerRef.current && attachmentSystemRef.current && rendererRef.current) {
      managerRef.current = new EquipmentManager(
        attachmentSystemRef.current,
        rendererRef.current
      );
      setInitialized(true);
      console.log('[EquipmentContext] Initialized');
    }
  }, []);

  const initializeSkeleton = useCallback((skeleton: Group) => {
    if (attachmentSystemRef.current) {
      attachmentSystemRef.current.initialize(skeleton);
      console.log('[EquipmentContext] Skeleton initialized');
    }
  }, []);

  const equip = useCallback(async (equipment: Equipment, slot: EquipmentSlotType) => {
    if (!managerRef.current || !attachmentSystemRef.current) return false;

    // Check if skeleton is initialized, wait if not
    let retries = 0;
    while (!attachmentSystemRef.current.isInitialized() && retries < 50) {
      console.warn('[EquipmentContext] Skeleton not initialized yet, waiting...', retries);
      await new Promise(resolve => setTimeout(resolve, 100));
      retries++;
    }

    if (!attachmentSystemRef.current.isInitialized()) {
      console.error('[EquipmentContext] Skeleton never initialized after 5 seconds');
      return false;
    }

    const result = await managerRef.current.equip(equipment, slot);
    if (result) {
      setEquippedItemsVersion(v => v + 1); // Trigger re-render
    }
    return result;
  }, []);

  const unequip = useCallback(async (slot: EquipmentSlotType) => {
    if (!managerRef.current) return null;
    const result = await managerRef.current.unequip(slot);
    if (result) {
      setEquippedItemsVersion(v => v + 1); // Trigger re-render
    }
    return result;
  }, []);

  const getEquipped = useCallback((slot: EquipmentSlotType) => {
    if (!managerRef.current) return null;
    return managerRef.current.getEquipped(slot);
  }, [equippedItemsVersion]); // Depend on version for updates

  const isSlotOccupied = useCallback((slot: EquipmentSlotType) => {
    if (!managerRef.current) return false;
    return managerRef.current.isSlotOccupied(slot);
  }, [equippedItemsVersion]); // Depend on version for updates

  const canEquip = useCallback((equipment: Equipment, slot?: EquipmentSlotType) => {
    if (!managerRef.current) return false;
    return managerRef.current.canEquip(equipment, slot);
  }, [equippedItemsVersion]); // Depend on version for updates

  const getFirstAvailableBackSlot = useCallback(() => {
    if (!managerRef.current) return null;
    return managerRef.current.getFirstAvailableBackSlot();
  }, [equippedItemsVersion]); // Depend on version for updates

  const getFirstAvailableThighSlot = useCallback(() => {
    if (!managerRef.current) return null;
    return managerRef.current.getFirstAvailableThighSlot();
  }, [equippedItemsVersion]); // Depend on version for updates

  const updateTransform = useCallback((
    slot: EquipmentSlotType,
    position: [number, number, number],
    rotation: [number, number, number],
    scale: number
  ) => {
    if (!attachmentSystemRef.current) return false;
    return attachmentSystemRef.current.updateTransform(slot, position, rotation, scale);
  }, []);

  // Wielding methods
  const wield = useCallback(async (slot: EquipmentSlotType) => {
    if (!managerRef.current) return false;
    const result = await managerRef.current.wield(slot);
    if (result) {
      setEquippedItemsVersion(v => v + 1);
    }
    return result;
  }, []);

  const stow = useCallback(async () => {
    if (!managerRef.current) return false;
    const result = await managerRef.current.stow();
    if (result) {
      setEquippedItemsVersion(v => v + 1);
    }
    return result;
  }, []);

  const getWieldedSlot = useCallback(() => {
    if (!managerRef.current) return null;
    return managerRef.current.getWieldedSlot();
  }, [equippedItemsVersion]);

  const getWieldedEquipment = useCallback(() => {
    if (!managerRef.current) return null;
    return managerRef.current.getWieldedEquipment();
  }, [equippedItemsVersion]);

  const isWielded = useCallback((slot: EquipmentSlotType) => {
    if (!managerRef.current) return false;
    return managerRef.current.isWielded(slot);
  }, [equippedItemsVersion]);

  return (
    <EquipmentContext.Provider
      value={{
        manager: managerRef.current,
        equip,
        unequip,
        getEquipped,
        isSlotOccupied,
        canEquip,
        getFirstAvailableBackSlot,
        getFirstAvailableThighSlot,
        initializeSkeleton,
        updateTransform,
        equippedItemsVersion,
        wield,
        stow,
        getWieldedSlot,
        getWieldedEquipment,
        isWielded,
      }}
    >
      {children}
    </EquipmentContext.Provider>
  );
}

export function useEquipment() {
  const context = useContext(EquipmentContext);
  if (!context) {
    throw new Error('useEquipment must be used within EquipmentProvider');
  }
  return context;
}
