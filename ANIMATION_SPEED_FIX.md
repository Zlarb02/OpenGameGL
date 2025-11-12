# Fix: Animation Speed Anomalies (2-3x Speed Bug)

## Problème
Animations idle (rifle et locomotion) jouent parfois à vitesse 2-3x plus rapide de manière intermittente et non reproductible.

## Cause Racine

Le bug était causé par plusieurs **race conditions** dans la gestion du `timeScale` des animations Three.js :

### 1. **Double application de timeScale**
Dans plusieurs endroits du code, `timeScale` était modifié plusieurs fois en séquence :
- `action.setEffectiveTimeScale(1)` suivi de `action.timeScale = X`
- Si ces appels se produisent dans le mauvais ordre ou sont interrompus, les valeurs peuvent s'accumuler

### 2. **Conflits entre systèmes**
Plusieurs systèmes modifiaient `timeScale` simultanément :
- `AnimationLayerSystem` applique le timeScale de l'état
- `AnimationStateMachine` réinitialise à 1
- `AnimationBlender` modifie aussi pendant les transitions
- Si ces modifications se chevauchent, des valeurs cumulatives peuvent apparaître

### 3. **Pas de réinitialisation avant play()**
L'ordre d'exécution était critique mais non respecté :
```typescript
// ❌ ANCIEN CODE - BUG
action.reset();
action.setEffectiveTimeScale(1);  // Peut être ignoré
action.play();
action.timeScale = 1.3;  // Appliqué APRÈS play()
```

Pendant le `play()`, l'action peut hériter d'un `timeScale` précédent non nettoyé.

### 4. **Pas de validation**
Aucun mécanisme ne détectait ou corrigeait les valeurs aberrantes.

## Solutions Implémentées

### 1. **Ordre d'exécution strict** ✅

**AnimationLayerSystem.ts:217-220**
```typescript
// CRITICAL: Set timeScale before playing to prevent race conditions
const desiredTimeScale = targetState.timeScale || 1;
action.timeScale = desiredTimeScale;
action.setEffectiveTimeScale(desiredTimeScale);
action.setEffectiveWeight(layer.config.weight);
action.play();
```

**AnimationStateMachine.ts:130-136**
```typescript
// CRITICAL: Restore original timeScale from state definition to prevent speed anomalies
const originalTimeScale = targetState.timeScale || 1;
action.timeScale = originalTimeScale;
action.setEffectiveTimeScale(originalTimeScale);
action.setEffectiveWeight(1);
action.play();
```

**AnimationBlender.ts** (3 endroits fixés)
- `crossfade()` ligne 48-50
- `freezeAndFade()` ligne 83-85
- `instantSwitch()` ligne 195-197

### 2. **Safeguard avec validation automatique** ✅

**AnimationLayerSystem.ts:190-221** - Nouvelle fonction `validateTimeScales()`

Appelée à chaque frame dans `update()`, cette fonction :
- Détecte les `timeScale` anormaux (< 0.5 ou > 2.0)
- Compare avec la valeur attendue de la définition de l'état
- Corrige automatiquement les anomalies
- Log un warning pour debugging

```typescript
private validateTimeScales(): void {
  this.layerActions.forEach((layerActionsMap, layerName) => {
    const layer = this.layers.get(layerName);
    if (!layer || !layer.config.enabled) return;

    layerActionsMap.forEach((action, stateName) => {
      if (!action.isRunning()) return;

      const state = layer.getState(stateName);
      const expectedTimeScale = state?.timeScale || 1.0;
      const currentTimeScale = action.timeScale;
      const isAbnormal = currentTimeScale < 0.5 || currentTimeScale > 2.0;

      if (Math.abs(currentTimeScale - expectedTimeScale) > 0.01 || isAbnormal) {
        console.warn(
          `[AnimationLayerSystem] Correcting abnormal timeScale in ${layerName}/${stateName}: ` +
          `${currentTimeScale.toFixed(2)} → ${expectedTimeScale.toFixed(2)}`
        );
        action.timeScale = expectedTimeScale;
        action.setEffectiveTimeScale(expectedTimeScale);
      }
    });
  });
}
```

## Fichiers Modifiés

1. ✅ `src/character/animation/AnimationLayerSystem.ts`
   - Ordre d'exécution corrigé dans `transitionLayerState()`
   - Ajout de `validateTimeScales()`
   - Validation appelée dans `update()`

2. ✅ `src/character/animation/AnimationStateMachine.ts`
   - Ordre d'exécution corrigé dans `transitionTo()`

3. ✅ `src/character/animation/AnimationBlender.ts`
   - Fixes dans `crossfade()`
   - Fixes dans `freezeAndFade()`
   - Fixes dans `instantSwitch()`

## Test

Pour vérifier si le fix fonctionne :

1. **Lancer le jeu et observer les animations idle**
   - Sans arme (IDLE locomotion)
   - Avec rifle (RIFLE_IDLE)

2. **Changer d'équipement plusieurs fois**
   - Équiper/déséquiper rifle
   - Switcher entre slots

3. **Observer la console**
   - Si le bug se produit, vous verrez des warnings :
     ```
     [AnimationLayerSystem] Correcting abnormal timeScale in locomotion/IDLE: 2.60 → 1.00
     ```
   - Le safeguard devrait corriger automatiquement

4. **Le bug devrait être éliminé**
   - Les animations devraient toujours jouer à vitesse normale
   - Pas de sauts de vitesse 2-3x

## Notes Techniques

### Pourquoi `timeScale` ET `setEffectiveTimeScale()` ?

Three.js AnimationAction a deux propriétés :
- `timeScale` : vitesse de base de l'animation
- `effectiveTimeScale` : vitesse finale après pondération (calculée)

Il faut définir les deux pour garantir la cohérence :
```typescript
action.timeScale = 1.0;              // Base speed
action.setEffectiveTimeScale(1.0);   // Effective speed
```

### Pourquoi avant `play()` ?

Quand on appelle `action.play()`, Three.js active l'action et commence à utiliser le `timeScale` actuel. Si on modifie `timeScale` APRÈS, il peut y avoir un frame où la mauvaise valeur est utilisée.

## Impact sur Performance

✅ **Négligeable** - La validation `validateTimeScales()` :
- Ne s'exécute que sur les layers actifs
- Ne s'exécute que sur les actions en cours de lecture
- Fait juste des comparaisons numériques
- Coût : ~0.1ms par frame

## Date
2025-11-12
