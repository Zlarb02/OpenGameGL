# 🎬 Modular Animation System

## Overview

A modular, scalable animation system using **layers** and **state machines**. Designed to be reusable across Player, NPCs, Enemies, and any other characters.

## Architecture

```
src/character/
├── animation/                    # Core animation system (REUSABLE)
│   ├── AnimationTypes.ts         # Types & interfaces
│   ├── AnimationStateMachine.ts  # State machine with transitions
│   ├── AnimationLayerSystem.ts   # Multi-layer management
│   ├── AnimationBlender.ts       # Advanced blending utilities
│   └── layers/                   # Composable animation layers
│       ├── LocomotionLayer.ts    # Base locomotion (ALL characters)
│       └── TPSLayer.ts           # TPS-specific (aim, shoot, strafe)
├── components/
│   └── Character.tsx             # Generic character component
└── player/
    ├── PlayerCharacter.tsx       # Player-specific wrapper
    └── equipment/
        └── EquipmentAnimationBridge.ts  # Equipment ↔ Animation integration
```

## Key Concepts

### 1. **One Model, Multiple Layers**

Instead of switching between models (AnimatedModel ↔ AnimatedModelRifle), we use **ONE model** with **multiple layers** that can be enabled/disabled dynamically.

**Benefits:**
- ✅ No model remounting (smooth transitions)
- ✅ Continuous animation (no breaks)
- ✅ Better performance
- ✅ Easier to maintain

### 2. **Composable Layers**

Layers are **independent** and **composable**:

- **LocomotionLayer**: Base locomotion (idle, walk, run, sprint, jump, fall)
  - Used by: Player, NPCs, Enemies, etc.

- **TPSLayer**: TPS-specific animations (aim, shoot, 8-way strafe, crouch)
  - Used by: Player with rifle equipped

- **CombatLayer** *(future)*: Melee combat animations
  - Used by: Enemies, NPCs

- **InteractionLayer** *(future)*: Interaction animations (pickup, open door, etc.)

### 3. **Layer Priority & Blending**

Layers have priorities and blend modes:

```typescript
enum LayerPriority {
  BASE = 0,        // LocomotionLayer
  ADDITIVE = 1,    // TPSLayer (upper body)
  OVERRIDE = 2,    // Full body animations
}
```

## Usage

### Creating a Character

```tsx
import { Character } from '../components/Character';
import { LocomotionLayer, TPSLayer } from '../animation';

const layers = [
  new LocomotionLayer(),  // Always active
  new TPSLayer(),         // Conditionally active
];

<Character
  modelPath="/models/character.glb"
  scale={0.01}
  layers={layers}
  isMoving={isMoving}
  isSprinting={isSprinting}
  isGrounded={isGrounded}
  // ... other props
/>
```

### PlayerCharacter Example

```tsx
// PlayerCharacter.tsx
export function PlayerCharacter(props) {
  const layers = useMemo(() => [
    new LocomotionLayer({ enableSprint: true }),
    new TPSLayer({ enable8Way: true, enableCrouch: true }),
  ], []);

  return <Character modelPath={modelPath} layers={layers} {...props} />;
}
```

### Enabling/Disabling Layers

Layers are enabled/disabled automatically based on context:

```typescript
// When rifle is equipped
layerSystem.enableLayer('tps', { fadeInDuration: 0.2 });

// When rifle is stowed
layerSystem.disableLayer('tps', { fadeOutDuration: 0.2 });
```

## Equipment Integration

The `EquipmentAnimationBridge` connects the equipment system with animations:

```typescript
// When weapon is wielded (drawn to hands)
equipmentAnimationBridge.onWeaponWielded(slot);
// → Enables TPSLayer

// When weapon is stowed (back on back)
equipmentAnimationBridge.onWeaponStowed(slot);
// → Disables TPSLayer
```

## Transitions

### Simple Crossfade (default)

```typescript
animationBlender.crossfade({
  from: idleAction,
  to: rifleIdleAction,
  duration: 0.2,
});
```

### Freeze + Fade (smooth equipment transition)

```typescript
animationBlender.freezeAndFade(
  currentAction,
  rifleIdleAction,
  0.2,  // fade duration
  () => equipment.setVisible('back_left', false)
);
```

## Adding New Layers

1. Create a new layer class implementing `IAnimationLayer`:

```typescript
export class MagicLayer implements IAnimationLayer {
  config: AnimationLayerConfig = {
    name: 'magic',
    priority: LayerPriority.ADDITIVE,
    weight: 1.0,
    enabled: false,
    blendMode: 'additive',
  };

  async initialize() {
    // Load magic animations
  }

  update(deltaTime, context) {
    // Return target state based on context
  }
}
```

2. Add layer to character:

```typescript
const layers = [
  new LocomotionLayer(),
  new MagicLayer(),  // New layer!
];
```

## Migration from Old System

### Old (AnimatedModel switch)
```tsx
{weaponEquipped ? (
  <AnimatedModelRifle {...props} />
) : (
  <AnimatedModel {...props} />
)}
```

### New (Unified with layers)
```tsx
<PlayerCharacter {...props} />
```

**Deprecated files** (kept as reference):
- `AnimatedModel.deprecated.tsx`
- `AnimatedModelRifle.deprecated.tsx`

## Animation Context

All layers receive an `AnimationContext` for decision-making:

```typescript
interface AnimationContext {
  isGrounded: boolean;
  isMoving: boolean;
  isSprinting: boolean;
  isCrouching: boolean;
  isAiming: boolean;
  isShooting: boolean;
  movementInput: { forward, backward, left, right };
  velocity: { x, y, z };
  characterRotation: number;
  cameraPhi: number;
}
```

## Future Enhancements

- [ ] Animation state machine with custom transitions
- [ ] IK (Inverse Kinematics) for foot placement
- [ ] Root motion support
- [ ] Animation events/callbacks
- [ ] Pose matching for smooth equipment transitions
- [ ] Animation retargeting for different skeletons

## Performance

- ✅ **Single model instance** (no remounting)
- ✅ **Lazy layer loading** (animations loaded on demand)
- ✅ **Efficient blending** (only active layers updated)
- ✅ **Optimized crossfades** (using Three.js AnimationMixer)

## Credits

Built with:
- Three.js AnimationMixer
- React Three Fiber
- Modular layer architecture inspired by Unreal Engine's Animation Blueprints
