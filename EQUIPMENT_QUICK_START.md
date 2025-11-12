# Equipment System - Quick Start

## ✅ Valeurs Calibrées Appliquées

Les rifles sont maintenant **correctement positionnés par défaut** grâce aux valeurs calibrées dans `EquipmentRegistry.ts`.

### Valeurs appliquées automatiquement :

**BACK_LEFT** :
```ts
position: [-9, 5, -18]
rotation: [-4.64, -3.31, -4.97]
scale: 80.0
```

**BACK_RIGHT** :
```ts
position: [5, 5, -14]
rotation: [-4.82, -2.97, 4.80]
scale: 80.0
```

## Usage Normal

**Les corrections sont activées par défaut !**

Les rifles apparaîtront correctement positionnés dans le dos du personnage dès le lancement.

Pour **désactiver** les corrections, décochez "✅ Enable Correction" dans les panneaux Leva (`🔧 Debug - BACK_LEFT` et `🔧 Debug - BACK_RIGHT`).

## Debug Mode (Optionnel)

Si vous voulez ajuster les positions :

### 1. Activer le debug dans PlayerCharacter.tsx

Décommenter ces 3 sections :
- Imports (lignes 18-19)
- Hooks (lignes 57-58)
- Return avec debuggers (lignes 180-186)

### 2. Lancer l'app

```bash
npm run dev
```

### 3. Ouvrir Leva

Cherchez les panneaux :
- `🔧 Debug - BACK_LEFT`
- `🔧 Debug - BACK_RIGHT`

### 4. Ajuster

- Les corrections sont déjà activées par défaut (✅ Enable Correction)
- Ajustez position/rotation/scale avec les sliders
- Les valeurs sont loggées dans la console en temps réel

### 5. Sauvegarder les nouvelles valeurs

Copiez les valeurs de la console dans `EquipmentRegistry.ts` et `useEquipmentDebug.ts`.

## Fichiers Importants

- **[EquipmentRegistry.ts](src/character/player/equipment/config/EquipmentRegistry.ts)** - Configuration principale (valeurs par défaut)
- **[PlayerCharacter.tsx](src/character/player/PlayerCharacter.tsx)** - Activation du mode debug
- **[useEquipmentDebug.ts](src/character/player/equipment/hooks/useEquipmentDebug.ts)** - Hook debug avec valeurs par défaut

## Documentation Complète

- [EQUIPMENT_DEBUG_GUIDE.md](EQUIPMENT_DEBUG_GUIDE.md) - Guide complet du système
- [EQUIPMENT_CALIBRATION_NOTES.md](EQUIPMENT_CALIBRATION_NOTES.md) - Notes de calibration
