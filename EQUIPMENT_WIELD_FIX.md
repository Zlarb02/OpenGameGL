# Equipment Wield Implementation Fix

## Problem
The rifle doesn't appear in hands because `wield()` and `stow()` methods in `EquipmentManager.ts` only track state but don't actually attach/detach from hand bone.

## Solution
Complete the TODO sections in `EquipmentManager.ts` to properly attach to `HAND_PRIMARY` bone.

## Changes to `src/character/player/equipment/systems/EquipmentManager.ts`

### 1. Replace `wield()` method (lines 256-264):

**Old code:**
```typescript
// Hide the stowed visual (on back)
this.attachmentSystem.setVisible(slot, false);

// TODO: In Phase 7, attach to hand bone with animation
// For now, just track the wielded state
this.wieldedSlot = slot;

console.log(`[EquipmentManager] Wielded ${equipment.id} from ${slot}`);
return true;
```

**New code:**
```typescript
// Detach from back/stowed position
this.attachmentSystem.detach(slot);

// Load model and attach to hand (HAND_PRIMARY)
const model = await this.renderer.loadModel(equipment);
if (!model) {
  console.error(`[EquipmentManager] Failed to load model for wielding`);
  return false;
}

const attachedToHand = this.attachmentSystem.attach(
  equipment,
  EquipmentSlotType.HAND_PRIMARY,
  model
);

if (!attachedToHand) {
  console.error(`[EquipmentManager] Failed to attach to hand`);
  // Re-attach to original slot on failure
  const backupModel = await this.renderer.loadModel(equipment);
  if (backupModel) {
    this.attachmentSystem.attach(equipment, slot, backupModel);
  }
  return false;
}

this.wieldedSlot = slot;

console.log(`[EquipmentManager] Wielded ${equipment.id} from ${slot} to hand`);
return true;
```

### 2. Replace `stow()` method (lines 279-287):

**Old code:**
```typescript
// Show the stowed visual (on back) again
this.attachmentSystem.setVisible(slot, true);

// TODO: In Phase 7, handle hand attachment removal with animation

this.wieldedSlot = null;

console.log(`[EquipmentManager] Stowed weapon back to ${slot}`);
return true;
```

**New code:**
```typescript
// Detach from hand
this.attachmentSystem.detach(EquipmentSlotType.HAND_PRIMARY);

// Re-attach to original stowed position (back)
const model = await this.renderer.loadModel(equipment);
if (!model) {
  console.error(`[EquipmentManager] Failed to load model for stowing`);
  return false;
}

const reattached = this.attachmentSystem.attach(equipment, slot, model);
if (!reattached) {
  console.error(`[EquipmentManager] Failed to re-attach to ${slot}`);
  return false;
}

this.wieldedSlot = null;

console.log(`[EquipmentManager] Stowed weapon back to ${slot}`);
return true;
```

## Why this works

1. **wield()**: Detaches rifle from back bone → Loads model → Attaches to HAND_PRIMARY bone
2. **stow()**: Detaches rifle from hand bone → Loads model → Re-attaches to back bone
3. Uses existing `AttachmentSystem.attach()` which properly handles bone attachment with correct position/rotation/scale from registry
4. HAND_PRIMARY config already has correct values (scale: 80, position: [-0.08, 0.06, 0.02], rotation: [-1.8, 2.7, 1.8])

## Next Step

Apply these changes manually or I can write the code using sed/patch command.
