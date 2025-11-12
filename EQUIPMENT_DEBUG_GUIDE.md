# Equipment Debug System

## Overview

Le système de debug d'équipement permet d'ajuster en temps réel les positions, rotations et échelles des équipements attachés au personnage (rifles dans le dos, armes à la main, etc.).

## Features

- ✅ Contrôles Leva en temps réel
- ✅ Support multi-slots (BACK_LEFT, BACK_RIGHT, HAND_PRIMARY, etc.)
- ✅ Valeurs par défaut personnalisables
- ✅ Intégration avec le nouveau système EquipmentManager

## Usage

### Debug d'un slot spécifique

```tsx
import { useEquipmentDebug } from './equipment/hooks/useEquipmentDebug';
import { EquipmentDebugger } from './equipment/components/EquipmentDebugger';
import { EquipmentSlotType } from './equipment/types/EquipmentTypes';

function MyComponent() {
  const debugConfig = useEquipmentDebug(
    EquipmentSlotType.BACK_LEFT,
    {
      scale: 80.0,
      position: [-8.2, 6.4, 1.9],
      rotation: [-1.8, 2.7, 1.8],
    }
  );

  return <EquipmentDebugger debugConfig={debugConfig} />;
}
```

### Debug des armes dans le dos (helper)

```tsx
import { useBackWeaponDebug } from './equipment/hooks/useEquipmentDebug';
import { EquipmentDebugger } from './equipment/components/EquipmentDebugger';

function MyComponent() {
  const backLeftDebug = useBackWeaponDebug('left');
  const backRightDebug = useBackWeaponDebug('right');

  return (
    <>
      <EquipmentDebugger debugConfig={backLeftDebug} />
      <EquipmentDebugger debugConfig={backRightDebug} />
    </>
  );
}
```

### Debug de plusieurs slots à la fois

```tsx
import { MultiSlotEquipmentDebugger } from './equipment/components/EquipmentDebugger';

function MyComponent() {
  const configs = [
    useBackWeaponDebug('left'),
    useBackWeaponDebug('right'),
    useEquipmentDebug(EquipmentSlotType.THIGH_RIGHT),
  ];

  return <MultiSlotEquipmentDebugger slots={configs} />;
}
```

## Leva Controls

Chaque slot de debug crée un panneau Leva avec les contrôles suivants :

- **Enable Debug** - Active/désactive le mode debug pour ce slot
- **Use Degrees (°)** - Bascule entre radians et degrés pour les rotations
- **Scale** - Échelle du modèle (0.01 à 200.0)
- **Position X/Y/Z** - Position relative au bone (-500 à 500, step 0.01)
- **Rotation X/Y/Z** - Rotation sur chaque axe
  - Mode radians : -2π à 2π (step 0.01)
  - Mode degrés : -720° à 720° (step 0.1°)

### Workflow recommandé

1. **Activer Debug Mode** - Cochez "Enable Debug"
2. **Choisir votre unité** - Cochez "Use Degrees" si vous préférez les degrés
3. **Ajuster les valeurs** - Déplacez les sliders jusqu'à obtenir la position parfaite
4. **Copier les valeurs** - Les valeurs sont loggées dans la console au format prêt pour EquipmentRegistry
5. **Coller** - Collez directement dans EquipmentRegistry.ts
6. **Désactiver** - Décochez "Enable Debug" pour retourner à la config normale

## Implementation Details

### Hook: `useEquipmentDebug`

```ts
export function useEquipmentDebug(
  slotType: EquipmentSlotType,
  defaultValues?: {
    scale?: number;
    position?: [number, number, number];
    rotation?: [number, number, number];
  }
): EquipmentDebugConfig
```

Retourne une configuration de debug qui peut être passée au composant `EquipmentDebugger`.

### Hook: `useBackWeaponDebug`

```ts
export function useBackWeaponDebug(slot: 'left' | 'right'): EquipmentDebugConfig
```

Helper spécialisé pour les rifles dans le dos, avec des valeurs par défaut appropriées.

### Component: `EquipmentDebugger`

```tsx
interface EquipmentDebuggerProps {
  debugConfig: EquipmentDebugConfig;
}
```

Applique les transformations debug au slot d'équipement via le `AttachmentSystem`.

## Architecture

```
useEquipmentDebug (Leva)
    ↓
EquipmentDebugger (React Component)
    ↓
EquipmentContext.updateTransform()
    ↓
AttachmentSystem.updateTransform()
    ↓
Three.js Object3D (Equipment Model)
```

## How to Enable Debug Mode

Par défaut, le système de debug est **désactivé** pour ne pas affecter les performances. Les valeurs calibrées dans `EquipmentRegistry.ts` sont appliquées automatiquement.

Pour activer le debug dans `PlayerCharacter.tsx` :

1. **Décommenter les imports** (lignes 18-19) :
```tsx
import { useBackWeaponDebug } from './equipment/hooks/useEquipmentDebug';
import { EquipmentDebugger } from './equipment/components/EquipmentDebugger';
```

2. **Décommenter les hooks** (lignes 57-58) :
```tsx
const backLeftDebug = useBackWeaponDebug('left');
const backRightDebug = useBackWeaponDebug('right');
```

3. **Remplacer le return** (ligne 156) par la version commentée (lignes 180-186) :
```tsx
return (
  <>
    <Character {...props} />
    <EquipmentDebugger debugConfig={backLeftDebug} />
    <EquipmentDebugger debugConfig={backRightDebug} />
  </>
);
```

4. **Activer dans Leva** : Cochez "🔧 Enable Debug" dans les panneaux Leva

## Next Steps

1. ✅ Activer le panneau debug dans Leva
2. Ajuster les valeurs position/rotation/scale jusqu'à ce que le rifle soit bien positionné
3. Copier les valeurs finales dans `EquipmentRegistry.ts` dans la config du slot
4. Désactiver le debug mode

## Configuration persistante

Une fois les valeurs debug trouvées, les mettre à jour dans [EquipmentRegistry.ts](src/character/player/equipment/config/EquipmentRegistry.ts):

```ts
[EquipmentSlotType.BACK_LEFT]: {
  attachmentConfig: {
    position: [-8.2, 6.4, 1.9],  // Valeurs du debug
    rotation: [-1.8, 2.7, 1.8],  // Valeurs du debug
    scale: 80.0,                  // Valeur du debug
    // ...
  }
}
```
