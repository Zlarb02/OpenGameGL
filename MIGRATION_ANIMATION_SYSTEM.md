# 🔄 Migration Guide: New Animation System

## Summary of Changes

The character animation system has been completely refactored to use a **modular layer-based architecture** instead of switching between different model components.

## What Changed?

### ❌ Old System (Deprecated)
```tsx
// CharacterController.tsx (OLD)
{weaponEquipped ? (
  <AnimatedModelRifle {...props} />  // Separate model with rifle
) : (
  <AnimatedModel {...props} />       // Separate model without rifle
)}
```

**Problems:**
- 💔 Model gets unmounted/remounted when equipping weapon
- 💔 Animation continuity breaks
- 💔 Duplicate code between AnimatedModel and AnimatedModelRifle
- 💔 Hard to extend (how to add new weapons? new states?)
- 💔 Not reusable for NPCs/Enemies

### ✅ New System
```tsx
// CharacterController.tsx (NEW)
<PlayerCharacter {...props} />  // ONE component, multiple layers
```

**Benefits:**
- ✅ **Single model** - No remounting, smooth transitions
- ✅ **Modular layers** - LocomotionLayer (base) + TPSLayer (additive)
- ✅ **Reusable** - NPCs/Enemies can use LocomotionLayer too
- ✅ **Scalable** - Easy to add new layers (MagicLayer, CombatLayer, etc.)
- ✅ **Clean** - Separation of concerns (locomotion vs TPS-specific)

## New Architecture

```
src/character/
├── animation/                          # Core system (REUSABLE)
│   ├── AnimationStateMachine.ts        # State machine
│   ├── AnimationLayerSystem.ts         # Layer management
│   ├── AnimationBlender.ts             # Blending utilities
│   ├── AnimationTypes.ts               # Types
│   └── layers/
│       ├── LocomotionLayer.ts          # Base (ALL characters use this)
│       └── TPSLayer.ts                 # TPS-specific (Player only)
├── components/
│   ├── Character.tsx                   # Generic character
│   ├── CharacterController.tsx         # Physics controller (updated)
│   ├── AnimatedModel.deprecated.tsx    # OLD (reference only)
│   └── ...
└── player/
    ├── PlayerCharacter.tsx             # Player wrapper (NEW)
    ├── tps/
    │   └── weapons/
    │       ├── AnimatedModelRifle.deprecated.tsx  # OLD (reference only)
    │       └── ...
    └── equipment/
        └── EquipmentAnimationBridge.ts # Equipment ↔ Animation integration
```

## How It Works

### Layer System

The new system uses **composable animation layers**:

1. **LocomotionLayer** (Base - Priority 0)
   - Handles: IDLE, WALK, RUN, SPRINT, JUMP, FALL
   - Always active
   - Reusable by ALL characters (Player, NPCs, Enemies)

2. **TPSLayer** (Additive - Priority 1)
   - Handles: TPS-specific animations (AIM, SHOOT, 8-way strafe, CROUCH)
   - Enabled when weapon is wielded
   - Disabled when weapon is stowed
   - Blends on top of LocomotionLayer

### Transitions

When you equip/unequip a weapon:

```typescript
// Old system: Remounts entire model ❌
weaponEquipped ? <AnimatedModelRifle /> : <AnimatedModel />

// New system: Enables/disables layer ✅
layerSystem.enableLayer('tps', { fadeInDuration: 0.2 });
layerSystem.disableLayer('tps', { fadeOutDuration: 0.2 });
```

**Result:** Smooth 200ms crossfade instead of jarring remount!

## What You Need to Know

### For Development

1. **CharacterController.tsx** now uses `<PlayerCharacter />` instead of the conditional switch

2. **PlayerCharacter.tsx** composes:
   - `Character.tsx` (generic)
   - `LocomotionLayer` (always active)
   - `TPSLayer` (conditional)

3. **Old components** are deprecated but kept as reference:
   - `AnimatedModel.deprecated.tsx`
   - `AnimatedModelRifle.deprecated.tsx`

### For Adding New Features

#### Add a new weapon type (e.g., pistol)?
```typescript
// Create PistolLayer (or extend TPSLayer)
export class PistolLayer extends TPSLayer {
  // Override with pistol-specific animations
}

// Add to PlayerCharacter
const layers = [
  new LocomotionLayer(),
  weaponType === 'rifle' ? new TPSLayer() : new PistolLayer(),
];
```

#### Add NPC/Enemy?
```typescript
// NPCCharacter.tsx
const layers = [
  new LocomotionLayer(),     // Reuse!
  new CombatLayer(),         // NPC-specific
];

<Character modelPath="/models/npc.glb" layers={layers} />
```

## API Reference

### Character Component
```tsx
<Character
  modelPath="/models/character.glb"  // Model to load
  scale={0.01}                       // Model scale
  layers={[...]}                     // Animation layers
  isMoving={boolean}                 // Locomotion state
  isSprinting={boolean}
  isGrounded={boolean}
  isAiming={boolean}                 // TPS state
  isShooting={boolean}
  isCrouching={boolean}
  movementInput={{ forward, ... }}   // Input state
  characterRotation={number}         // For 8-way strafe
  cameraPhi={number}                 // For aim offset
/>
```

### Creating a Layer
```typescript
export class MyLayer implements IAnimationLayer {
  config: AnimationLayerConfig = {
    name: 'my_layer',
    priority: LayerPriority.ADDITIVE,
    weight: 1.0,
    enabled: true,
    blendMode: 'additive',
  };

  async initialize() {
    // Load animations
  }

  update(deltaTime, context: AnimationContext) {
    // Return target animation state name
    return context.isMoving ? 'MOVE' : 'IDLE';
  }
}
```

## Testing

The system compiles successfully! ✅

```bash
npm run build
# ✓ built in 9.31s
```

To test in browser:
```bash
npm run dev
```

**Expected behavior:**
- Character loads once (no reload when equipping weapon)
- Smooth 200ms fade when pressing "1" to equip/unequip rifle
- All animations work as before, but smoother

## Rollback (if needed)

If you need to rollback temporarily:

1. Restore old imports in CharacterController.tsx:
```tsx
import { AnimatedModel } from './AnimatedModel.deprecated';
import { AnimatedModelRifle } from '../player/tps/weapons/AnimatedModelRifle.deprecated';
```

2. Restore conditional rendering:
```tsx
{weaponEquipped ? (
  <AnimatedModelRifle {...props} />
) : (
  <AnimatedModel {...props} />
)}
```

## Future Enhancements

Planned improvements:
- [ ] Animation state machine with custom transitions
- [ ] IK for foot placement
- [ ] Root motion support
- [ ] Animation events (footstep sounds, etc.)
- [ ] Pose matching for ultra-smooth transitions
- [ ] More layers: MagicLayer, VehicleLayer, EmoteLayer

## Questions?

Check the detailed documentation:
- `src/character/animation/README.md` - System overview
- `src/character/animation/AnimationTypes.ts` - Type definitions

---

**Status:** ✅ Complete and ready to test!

**Breaking Changes:** None - old components deprecated, not deleted

**Performance Impact:** 🚀 Improved (single model instance)
