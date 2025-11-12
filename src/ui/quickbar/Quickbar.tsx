/**
 * Quickbar Component
 * Displays quick access slots for equipment (1-8)
 */

import React from 'react';
import { useEquipment } from '../../character/player/equipment/EquipmentContext';
import { EquipmentRegistry } from '../../character/player/equipment/config/EquipmentRegistry';
import { useInventory } from '../../character/player/inventory/InventoryContext';
import { useQuickbarVisibility } from './useQuickbarVisibility';

// Export visibility controls for use in other components
export { useQuickbarVisibility };

interface QuickbarSlotProps {
  slotNumber: number;
  icon?: string;
  isOccupied: boolean;
  isActive?: boolean;
}

function QuickbarSlot({ slotNumber, icon, isOccupied, isActive }: QuickbarSlotProps) {
  return (
    <div
      className={`
        relative w-14 h-14 rounded-lg border-2 transition-all
        ${isActive ? 'border-yellow-400 bg-yellow-400/20' : 'border-gray-600 bg-gray-900/80'}
        ${isOccupied ? 'bg-gray-800/90' : 'bg-gray-900/60'}
        backdrop-blur-sm
        flex items-center justify-center
      `}
    >
      {/* Slot number badge */}
      <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-gray-700 border border-gray-500 flex items-center justify-center text-xs font-bold text-white">
        {slotNumber}
      </div>

      {/* Item icon */}
      {isOccupied && icon && (
        <div className="text-2xl">
          {icon}
        </div>
      )}

      {/* Empty slot indicator */}
      {!isOccupied && (
        <div className="text-gray-600 text-xs">-</div>
      )}
    </div>
  );
}

export function Quickbar() {
  const { getEquipped, isWielded, equippedItemsVersion } = useEquipment();

  // Get all quickbar slots from registry
  const quickbarSlots = EquipmentRegistry.getQuickbarSlots();

  // Only show first 8 slots (for keys 1-8)
  const displaySlots = quickbarSlots.slice(0, 8);

  // Always visible - removed conditional rendering
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
      <div className="flex gap-2 p-2 rounded-xl bg-black/40 backdrop-blur-md border border-gray-700/50">
        {displaySlots.map((slotConfig, index) => {
          const slotNumber = index + 1;
          const equipped = getEquipped(slotConfig.slotType);
          const active = isWielded(slotConfig.slotType);

          return (
            <QuickbarSlot
              key={slotConfig.slotType}
              slotNumber={slotNumber}
              icon={equipped?.icon}
              isOccupied={!!equipped}
              isActive={active}
            />
          );
        })}
      </div>
    </div>
  );
}
