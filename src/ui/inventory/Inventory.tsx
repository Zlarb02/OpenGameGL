/**
 * Modern Inventory UI - Vertical sidebar design
 * Shows only NON-equipment items (consumables, quest items, etc.)
 * Equipment/weapons are managed by EquipmentContext and displayed in Quickbar
 */

import { useEffect } from 'react';
import { useInventory } from '../../character/player/inventory/InventoryContext';
import { useDragDrop } from '../shared/DragDropContext';
import { useQuickbar } from '../quickbar/QuickbarContext';

export function Inventory() {
  const { items, isOpen } = useInventory();
  const { startDrag, isDragging } = useDragDrop();
  const { showPermanently, hide } = useQuickbar();

  // Show quickbar when inventory is open
  useEffect(() => {
    if (isOpen) {
      showPermanently();
    } else {
      hide();
    }
  }, [isOpen, showPermanently, hide]);

  if (!isOpen) return null;

  // Filter out equipment items - they're managed by EquipmentContext
  const nonEquipmentItems = items.filter(item => !item.isEquipment);

  const handleDragStart = (item: typeof items[0]) => (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    startDrag({
      item,
      source: 'inventory',
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // Dropping back to inventory does nothing
  };

  return (
    <div
      className="fixed right-0 top-0 h-screen w-80 bg-black/40 backdrop-blur-md border-l border-white/10 z-40 flex flex-col"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-light text-white tracking-wider">INVENTORY</h2>
        <p className="text-xs text-gray-400 mt-1">Press [I] to close • Drag outside to drop</p>
      </div>

      {/* Items Grid */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {nonEquipmentItems.length === 0 ? (
          <div className="text-center text-gray-500 py-8 text-sm">
            <p>Empty</p>
            <p className="text-xs mt-2">Equipment is displayed in the quickbar below</p>
          </div>
        ) : (
          nonEquipmentItems.map(item => {
            return (
              <div
                key={item.id}
                className={`
                  flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10
                  rounded p-3 transition-all cursor-grab active:cursor-grabbing
                  ${isDragging ? 'opacity-50' : 'opacity-100'}
                `}
                draggable
                onDragStart={handleDragStart(item)}
              >
                {/* Icon */}
                <div className="w-12 h-12 bg-white/20 rounded flex items-center justify-center overflow-hidden">
                  {item.icon?.startsWith?.('/') ? (
                    <img src={item.icon} alt={item.name} className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-xl">{item.icon || '📦'}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium text-sm truncate">{item.name}</h3>
                  <p className="text-xs text-gray-400">×{item.quantity}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-gray-500">
          {nonEquipmentItems.reduce((sum, item) => sum + item.quantity, 0)} items
        </p>
      </div>
    </div>
  );
}
