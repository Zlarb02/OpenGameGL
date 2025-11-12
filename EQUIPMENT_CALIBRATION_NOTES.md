# Equipment Calibration Notes

## Calibrated Values (2025-11-12)

### Back Weapon Slots

#### BACK_LEFT
- **Scale**: 80.0
- **Position**: [-9, 5, -18]
- **Rotation**: [-4.64, -3.31, -4.97] (radians)
- **Rotation (degrees)**: [-265.8°, -189.6°, -284.7°]
- **Status**: ✅ Calibrated and tested

#### BACK_RIGHT
- **Scale**: 80.0
- **Position**: [5, 5, -14]
- **Rotation**: [-4.82, -2.97, 4.80] (radians)
- **Rotation (degrees)**: [-276.2°, -170.2°, 275.0°]
- **Status**: ✅ Calibrated and tested

### Notes

- Ces valeurs ont été calibrées manuellement avec le système de debug Leva
- Les rifles sont maintenant correctement positionnés dans le dos du personnage
- Les valeurs sont appliquées automatiquement via `EquipmentRegistry.ts`
- Pour modifier ces valeurs, utilisez les panneaux Leva "🔧 Debug - BACK_LEFT" et "🔧 Debug - BACK_RIGHT"

## Debug System Usage

Pour ajuster d'autres équipements :

1. Activer le mode debug dans Leva
2. Ajuster position/rotation/scale
3. Copier les valeurs de la console
4. Mettre à jour `EquipmentRegistry.ts`
5. Mettre à jour les valeurs par défaut dans `useEquipmentDebug.ts`

## Files Updated

- [x] `src/character/player/equipment/config/EquipmentRegistry.ts` - Configuration principale
- [x] `src/character/player/equipment/hooks/useEquipmentDebug.ts` - Valeurs par défaut debug
