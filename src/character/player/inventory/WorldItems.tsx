/**
 * WorldItems - Affiche les items droppés dans le monde 3D
 */

import { useWorldItemManager } from './WorldItemManager';
import { WeaponPickup } from '../tps/weapons/WeaponPickup';
import { EquipmentRegistry } from '../equipment/config/EquipmentRegistry';
import { EquipmentSlotType } from '../equipment/types/EquipmentTypes';

export function WorldItems() {
  const { worldItems, removeItem } = useWorldItemManager();

  return (
    <>
      {worldItems.map(worldItem => {
        // Get equipment data from registry
        const equipment = EquipmentRegistry.getEquipment(worldItem.item.id);

        if (!equipment) {
          console.warn('[WorldItems] Equipment not found in registry:', worldItem.item.id);
          return null;
        }

        // Determine auto-equip slot based on equipment type
        const autoEquipSlot = equipment.compatibleSlots?.[0] || EquipmentSlotType.INVENTORY_ONLY;

        return (
          <WeaponPickup
            key={worldItem.id}
            position={worldItem.position}
            weaponId={worldItem.item.id}
            weaponName={worldItem.item.name}
            weaponType={worldItem.item.equipmentType || 'unknown'}
            modelPath={equipment.modelPath}
            autoEquipSlot={autoEquipSlot}
            onPickup={() => removeItem(worldItem.id)}
          />
        );
      })}
    </>
  );
}
