/**
 * Equipment Debugger Component
 * Applies debug transforms to equipment in real-time
 */

import { useEffect } from 'react';
import { useEquipment } from '../EquipmentContext';
import { EquipmentDebugConfig } from '../hooks/useEquipmentDebug';

interface EquipmentDebuggerProps {
  debugConfig: EquipmentDebugConfig;
}

/**
 * Component that applies debug transforms to a specific equipment slot
 */
export function EquipmentDebugger({ debugConfig }: EquipmentDebuggerProps) {
  const { updateTransform, equippedItemsVersion } = useEquipment();

  useEffect(() => {
    if (!debugConfig.enabled) return;

    // Small delay to ensure equipment is attached before applying transform
    const timeoutId = setTimeout(() => {
      // Apply debug transform
      const success = updateTransform(
        debugConfig.slot,
        debugConfig.position,
        debugConfig.rotation,
        debugConfig.scale
      );

      if (success) {
        console.log(`[EquipmentDebugger] Applied debug transform to ${debugConfig.slot}`, {
          position: debugConfig.position,
          rotation: debugConfig.rotation,
          scale: debugConfig.scale,
        });
      }
    }, 100); // 100ms delay to ensure equipment is attached

    return () => clearTimeout(timeoutId);
  }, [
    updateTransform,
    debugConfig.enabled,
    debugConfig.slot,
    debugConfig.scale,
    debugConfig.position[0],
    debugConfig.position[1],
    debugConfig.position[2],
    debugConfig.rotation[0],
    debugConfig.rotation[1],
    debugConfig.rotation[2],
    equippedItemsVersion, // React when equipment is equipped/unequipped
  ]);

  return null;
}

/**
 * Multi-slot equipment debugger
 */
interface MultiSlotDebuggerProps {
  slots: EquipmentDebugConfig[];
}

export function MultiSlotEquipmentDebugger({ slots }: MultiSlotDebuggerProps) {
  return (
    <>
      {slots.map((config) => (
        <EquipmentDebugger key={config.slot} debugConfig={config} />
      ))}
    </>
  );
}
