/**
 * DropZone - Zone de drop pour jeter des items dans le monde 3D
 * Détecte quand un item est drag hors de l'inventaire/quickbar
 */

import { useEffect, useRef } from 'react';
import { useDragDrop } from './DragDropContext';

export function DropZone() {
  const { onDrop, isDragging } = useDragDrop();
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    console.log('[DropZone] Item dropped to world');
    onDrop('world');
  };

  // Show visual feedback when dragging
  return (
    <div
      ref={dropZoneRef}
      className={`
        fixed inset-0 pointer-events-none z-30
        ${isDragging ? 'pointer-events-auto' : ''}
      `}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 bg-red-500/10 border-4 border-dashed border-red-500/30 flex items-center justify-center">
          <div className="bg-black/60 backdrop-blur-sm px-6 py-3 rounded-lg border border-red-500/50">
            <p className="text-red-400 text-lg font-medium">Drop here to discard item</p>
          </div>
        </div>
      )}
    </div>
  );
}
