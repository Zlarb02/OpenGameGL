# Système d'Input Unifié

Système de contrôles modulaire, multi-périphérique, multi-langue et rebindable pour jeux WebGL.

## 🎯 Caractéristiques

### ✅ Fonctionnalités Actuelles

- **Détection automatique des périphériques**
  - Clavier/souris (QWERTY, AZERTY, QWERTZ)
  - Manettes (Xbox, PlayStation, Nintendo Switch)
  - Support mobile tactile (à venir)

- **Système d'actions abstrait**
  - 60+ actions définies (locomotion, combat, menus)
  - Bindings personnalisables
  - Support tap/hold/toggle pour chaque action

- **UI Dynamique**
  - Icônes Kenney Input Prompts intégrées
  - Affichage automatique selon le périphérique actif
  - Composants React réutilisables

- **Sauvegarde des préférences**
  - LocalStorage automatique
  - Options de sensibilité, inversion d'axes
  - Modes de comportement (hold/toggle)

### 🚧 Fonctionnalités Planifiées

- [ ] Système de rebinding complet dans l'UI
- [ ] Support des combos de touches complexes
- [ ] Contrôles tactiles mobile avancés
- [ ] Profiles de contrôles multiples
- [ ] Support des contextes (menus vs gameplay)

## 📁 Architecture

```
src/systems/input/
├── actions/
│   └── ActionDefinitions.ts      # Toutes les actions du jeu
├── bindings/
│   ├── DefaultKeyboardBindings.ts # Bindings clavier par défaut
│   └── DefaultGamepadBindings.ts  # Bindings manette par défaut
├── core/
│   ├── InputTypes.ts              # Types TypeScript
│   ├── InputManager.ts            # Gestionnaire principal
│   └── InputContext.tsx           # Contexte React
├── devices/
│   └── (futurs détecteurs)
├── ui/
│   ├── InputIcon.tsx              # Composants d'icônes
│   └── InputIconMap.ts            # Mapping actions → icônes
├── utils/
│   ├── KeyboardLayoutDetector.ts  # Détection AZERTY/QWERTY
│   └── GamepadDetector.ts         # Détection type de manette
└── hooks/
    └── useCharacterInput.ts       # Hook pour contrôles personnage
```

## 🚀 Utilisation

### 1. Initialisation dans App

```tsx
import { InputProvider } from './systems/input';

function App() {
  return (
    <InputProvider>
      {/* Votre application */}
    </InputProvider>
  );
}
```

### 2. Utiliser les actions dans les composants

```tsx
import { useInput, GameAction } from './systems/input';

function MyComponent() {
  const { inputManager } = useInput();

  useFrame(() => {
    // Vérifier si une action est pressée
    if (inputManager.isActionPressed(GameAction.JUMP)) {
      jump();
    }

    // Vérifier un appui momentané
    if (inputManager.isActionJustPressed(GameAction.FIRE)) {
      shoot();
    }
  });
}
```

### 3. Hook pour contrôles de personnage

```tsx
import { useCharacterInput } from './systems/input';

function CharacterController() {
  const input = useCharacterInput();

  // Compatible avec l'ancien système
  if (input.forward) moveForward();
  if (input.jump) jump();
  if (input.sprint) sprint();
}
```

### 4. Afficher des icônes d'input

```tsx
import { InputIcon, InputPrompt, GameAction } from './systems/input';

// Icône simple
<InputIcon action={GameAction.JUMP} size={32} />

// Prompt contextuel
<InputPrompt action={GameAction.USE} text="Ramasser" />

// Liste d'aides
<InputHelpList
  items={[
    { action: GameAction.JUMP, description: 'Sauter' },
    { action: GameAction.SPRINT, description: 'Courir' },
  ]}
/>
```

## 🎮 Bindings Par Défaut

### Clavier/Souris

| Action | Touche (QWERTY) | Touche (AZERTY) |
|--------|----------------|----------------|
| Avancer | W | Z |
| Reculer | S | S |
| Gauche | A | Q |
| Droite | D | D |
| Sauter | Space | Space |
| Sprint | Shift | Shift |
| S'accroupir | C | C |
| Viser | Clic droit | Clic droit |
| Tirer | Clic gauche | Clic gauche |
| Utiliser | E | E |
| Recharger | R | R |
| Inventaire | I | I |
| Carte | M | M |

### Manette

| Action | Xbox | PlayStation |
|--------|------|-------------|
| Sauter | A | X (Cross) |
| S'accroupir | B | Circle |
| Sprint | L3 (clic stick) | L3 |
| Viser | LT | L2 |
| Tirer | RT | R2 |
| Recharger | Y | Triangle |
| Utiliser | X | Square |
| Couteau | R3 | R3 |
| Arme suivante | RB | R1 |
| Soin rapide | D-Pad ↑ | D-Pad ↑ |

## ⚙️ Configuration

### Options disponibles dans Leva

```typescript
interface ControlOptions {
  // Général
  autoDetectDevice: boolean;
  forceDeviceType?: DeviceType;

  // Souris
  mouseSensitivity: number;
  invertY: boolean;

  // Manette
  gamepadSensitivity: number;
  gamepadInvertY: boolean;
  leftStickDeadzone: number;
  rightStickDeadzone: number;

  // Modes
  sprintMode: 'hold' | 'toggle';
  crouchMode: 'hold' | 'toggle';
  freelookMode: 'hold' | 'toggle';
  aimMode: 'hold' | 'toggle';
}
```

### Modifier les options

```tsx
const { setOptions } = useInput();

setOptions({
  mouseSensitivity: 0.003,
  invertY: true,
  crouchMode: 'toggle',
});
```

## 🔧 Ajouter une nouvelle action

1. **Définir l'action dans `ActionDefinitions.ts`**

```typescript
export enum GameAction {
  // ... actions existantes
  MY_NEW_ACTION = 'my_new_action',
}

export const ACTION_METADATA: Record<GameAction, ActionMetadata> = {
  // ... métadonnées existantes
  [GameAction.MY_NEW_ACTION]: {
    action: GameAction.MY_NEW_ACTION,
    group: ActionGroup.COMBAT,
    label: 'Mon Action',
    description: 'Description de mon action',
    supportsTap: true,
    supportsHold: false,
    supportsToggle: false,
    defaultMode: 'tap',
    implemented: true,
  },
};
```

2. **Ajouter les bindings par défaut**

Dans `DefaultKeyboardBindings.ts`:
```typescript
{
  action: GameAction.MY_NEW_ACTION,
  primary: { type: 'keyboard', key: 'KeyG' },
  mode: 'tap',
}
```

Dans `DefaultGamepadBindings.ts`:
```typescript
{
  action: GameAction.MY_NEW_ACTION,
  primary: { type: 'gamepad', button: BTN.dpadDown },
  mode: 'tap',
}
```

3. **Ajouter l'icône dans `InputIconMap.ts`**

```typescript
case GameAction.MY_NEW_ACTION:
  return { path: `${basePath}/Double/G_Key_Dark.png`, alt: 'G' };
```

4. **Utiliser l'action**

```tsx
if (inputManager.isActionJustPressed(GameAction.MY_NEW_ACTION)) {
  doSomething();
}
```

## 📦 Icônes Kenney

Les icônes sont situées dans `/public/assets/` et incluent:

- `Keyboard & Mouse/` - Toutes les touches clavier et souris
- `Xbox Series/` - Boutons Xbox
- `PlayStation Series/` - Boutons PlayStation
- `Nintendo Switch/` - Boutons Switch
- `Touch/` - Gestes tactiles

Format: Double et Simple, Dark et Light

## 🎯 Cas d'usage

### Exemple 1: Ramasser un objet

```tsx
import { useInput, GameAction, InputPrompt } from './systems/input';

function PickupSystem({ isNearItem }) {
  const { inputManager } = useInput();

  useFrame(() => {
    if (isNearItem && inputManager.isActionJustPressed(GameAction.USE)) {
      pickupItem();
    }
  });

  return isNearItem ? (
    <InputPrompt action={GameAction.USE} text="Ramasser" />
  ) : null;
}
```

### Exemple 2: Menu avec navigation

```tsx
function PauseMenu() {
  const { inputManager } = useInput();

  useEffect(() => {
    const handleInput = () => {
      if (inputManager.isActionJustPressed(GameAction.MENU_UP)) {
        navigateUp();
      }
      if (inputManager.isActionJustPressed(GameAction.MENU_DOWN)) {
        navigateDown();
      }
      if (inputManager.isActionJustPressed(GameAction.MENU_CONFIRM)) {
        confirm();
      }
    };

    const interval = setInterval(handleInput, 16);
    return () => clearInterval(interval);
  }, []);
}
```

## 🚀 Prochaines étapes

1. **Système de rebinding UI**
   - Interface pour redéfinir les touches
   - Détection de conflits
   - Import/export de profiles

2. **Contextes d'input**
   - Différents bindings selon le contexte (gameplay/menu/construction)
   - Switching automatique
   - Stack de contextes

3. **Mobile tactile**
   - Joysticks virtuels
   - Boutons contextuels
   - Gestes (swipe, pinch)

4. **Accessibilité**
   - Support une main
   - Remapping complet
   - Aide visuelle améliorée

## 📝 Notes de design

### Principes
- **Abstraction**: Les actions sont indépendantes des périphériques
- **Modularité**: Chaque partie est isolée et remplaçable
- **Scalabilité**: Facile d'ajouter de nouvelles actions/périphériques
- **UX First**: L'UI s'adapte automatiquement au joueur

### Patterns utilisés
- **Singleton** pour InputManager
- **Provider/Context** pour React
- **Observer** pour les événements d'input
- **Strategy** pour les différents périphériques

## 🐛 Debug

Activer les logs:
```typescript
// Dans InputManager.ts, décommenter:
console.log('[InputManager] Action pressed:', action, state);
```

Voir les informations de périphérique:
```tsx
const { activeDevice } = useInput();
console.log(activeDevice); // { type, gamepadType, keyboardLayout, os }
```

## 📄 License

Ce système d'input est conçu pour être réutilisable dans tout projet WebGL/React.
Les icônes Kenney Input Prompts sont sous license CC0 (domaine public).
