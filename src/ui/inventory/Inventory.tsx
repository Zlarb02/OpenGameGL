/**
 * Composant UI de l'inventaire
 * Affiche les items ramassés et leur quantité
 */

import React from 'react';
import { useInventory } from '../../character/player/inventory/InventoryContext';

export function Inventory() {
  const { items, isOpen } = useInventory();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 pointer-events-auto">
      <div className="bg-gray-900/95 border-2 border-gray-700 rounded-lg p-6 min-w-[400px] max-w-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Inventaire</h2>
          <span className="text-sm text-gray-400">Appuyez sur [I] pour fermer</span>
        </div>

        {/* Items List */}
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Aucun item dans l'inventaire
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-gray-800/50 border border-gray-700 rounded-md p-4 hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Icon placeholder */}
                  <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center text-2xl">
                    {item.icon || '📦'}
                  </div>

                  {/* Item name */}
                  <div>
                    <h3 className="text-white font-medium">{item.name}</h3>
                    <p className="text-xs text-gray-400">ID: {item.id}</p>
                  </div>
                </div>

                {/* Quantity */}
                <div className="text-right">
                  <span className="text-white font-bold text-xl">×{item.quantity}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-700 text-center">
          <p className="text-xs text-gray-500">
            Total items: {items.reduce((sum, item) => sum + item.quantity, 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
