/**
 * Quickbar Component
 * Displays equipment slots (1-8) automatically synced with EquipmentContext
 * Slots 1-2 = Back slots, 3-4 = Thigh slots, 5-8 = Belt slots
 */

import { useQuickbar } from './QuickbarContext';
import { Equipment } from '../../character/player/equipment/types/EquipmentTypes';

interface QuickbarSlotProps {
  slotNumber: number;
  displayName: string;
  equipment: Equipment | null;
  isActive?: boolean;
}

function QuickbarSlot({ slotNumber, displayName, equipment, isActive }: QuickbarSlotProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      {/* Slot container */}
      <div
        className={`
          relative w-14 h-14 rounded border transition-all
          ${isActive ? 'border-white/60 bg-white/30 shadow-lg' : 'border-white/20 bg-white/10'}
          backdrop-blur-sm flex items-center justify-center
        `}
      >
        {/* Slot number badge */}
        <div className="absolute -top-1 -left-1 w-4 h-4 rounded-sm bg-black/60 border border-white/20 flex items-center justify-center text-[10px] font-bold text-white">
          {slotNumber}
        </div>

        {/* Equipment icon */}
        {equipment && (
          <div className="w-10 h-10 flex items-center justify-center">
            {equipment.icon?.startsWith('/') ? (
              <img src={equipment.icon} alt={equipment.name} className="w-full h-full object-contain drop-shadow-lg" />
            ) : (
              <span className="text-2xl drop-shadow-lg">{equipment.icon || '📦'}</span>
            )}
          </div>
        )}
      </div>

      {/* Slot display name */}
      <div className="text-[9px] font-bold text-white/70 uppercase tracking-wider whitespace-nowrap">
        {displayName}
      </div>
    </div>
  );
}

export function Quickbar() {
  const { slots, activeSlotIndex, isVisible } = useQuickbar();

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
      <div className="flex gap-2 p-3 rounded-lg bg-black/40 backdrop-blur-md border border-white/10">
        {slots.map((slot) => {
          const slotNumber = slot.index + 1;
          const isActive = activeSlotIndex === slot.index;

          return (
            <QuickbarSlot
              key={slot.index}
              slotNumber={slotNumber}
              displayName={slot.displayName}
              equipment={slot.equipment}
              isActive={isActive}
            />
          );
        })}
      </div>
    </div>
  );
}
