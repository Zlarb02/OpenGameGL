# Notes sur les correctifs d'animation

## Problèmes identifiés et résolus

### 1. T-Pose lors du tir ❌ → ✅

**Problème :**
- L'animation de tir jouait sur tout le corps dans le TPSLayer
- Créait une T-pose car l'animation entière du corps interférait avec la locomotion

**Cause :**
- Le TPSLayer est un layer ADDITIVE qui joue sur tout le squelette
- L'animation RIFLE_SHOOTING contient des données pour tout le corps
- Pas de filtrage des bones pour ne garder que le haut du corps

**Solution appliquée :**
- Retrait complet de la gestion du shooting du TPSLayer
- L'animation de tir ne sera pas jouée pour le moment
- Le système de hit markers et de dégâts fonctionne toujours normalement

**Solution future (à implémenter) :**
Pour avoir l'animation de tir, il faudra :
1. Créer un système d'overlay pour le haut du corps uniquement
2. Filtrer les tracks d'animation pour ne garder que :
   - Spine, Spine1, Spine2
   - Neck, Head
   - Shoulders, Arms, Forearms, Hands
3. Jouer l'animation en parallèle avec la locomotion

**Référence :** Voir l'ancien système dans `AnimatedModelRifle.tsx` lignes 301-349

### 2. Animation de tir lors de la transition arme ✅

**Problème :**
- Une animation de tir se jouait pendant la transition équiper/déséquiper

**Cause :**
- Le state `isShooting` restait true pendant la transition
- Le TPSLayer gérait le shooting même pendant les transitions

**Solution :**
- Retrait du shooting du TPSLayer
- Plus d'animation de tir parasites

## État actuel du système

### ✅ Fonctionnel
- Système de Health complet
- Hit markers colorés selon le type de cible
- Détection des tirs et application des dégâts
- Cooldown de tir (600ms)
- Suppression des objets détruits
- Animations de locomotion (idle, walk, run, sprint, crouch)
- Transitions équiper/déséquiper

### ⏸️ Temporairement désactivé
- **Animation visuelle de tir** (feedback gameplay toujours présent via hit markers)

### 🔜 À implémenter
- Système d'overlay d'animation pour le haut du corps
- Animation de tir filtrée sur upper body uniquement

## Approche recommandée pour l'animation de tir

### Option 1: Système d'overlay manuel (Recommandé)
```typescript
// Dans Character.tsx ou un nouveau hook
const playShootingAnimation = () => {
  const shootAction = mixer.clipAction(shootingClip);

  // Filtrer pour upper body seulement
  const upperBodyBones = [
    'spine', 'spine1', 'spine2', 'neck', 'head',
    'leftshoulder', 'leftarm', 'leftforearm', 'lefthand',
    'rightshoulder', 'rightarm', 'rightforearm', 'righthand'
  ];

  const filteredTracks = shootingClip.tracks.filter(track => {
    const trackName = track.name.toLowerCase();
    return upperBodyBones.some(bone => trackName.includes(bone));
  });

  const filteredClip = shootingClip.clone();
  filteredClip.tracks = filteredTracks;

  const filteredAction = mixer.clipAction(filteredClip);
  filteredAction.setLoop(LoopRepeat, 1);
  filteredAction.clampWhenFinished = true;
  filteredAction.setEffectiveWeight(1);
  filteredAction.play();
};
```

### Option 2: Créer un ActionLayer dédié
- Layer avec priorité OVERRIDE
- Poids limité au haut du corps via `affectedBones`
- Gestion des animations one-shot

### Option 3: Utiliser AnimationLayerSystem avec masking
- Implémenter un système de bone masking dans AnimationLayerSystem
- Permettre aux layers de spécifier quels bones ils affectent

## Références

### Fichiers modifiés
- `src/character/animation/layers/TPSLayer.ts`
  - Retrait de la gestion du shooting
  - Nettoyage des variables de tracking
  - Retrait du chargement de RIFLE_SHOOTING

### Fichiers à consulter pour la future implémentation
- `src/character/player/tps/weapons/AnimatedModelRifle.tsx` (ancien système)
- `src/character/animation/layers/ActionLayer.ts` (ébauche du layer d'action)

## Notes importantes

### Pourquoi ne pas garder l'animation dans TPSLayer ?
1. **Blending incorrect** : Layer additive + animation full body = artefacts visuels
2. **T-pose** : Les tracks de position du root bone créent des poses incorrectes
3. **Architecture** : TPSLayer est fait pour la locomotion, pas les actions one-shot

### Pourquoi le cooldown fonctionne quand même ?
- Le cooldown est géré dans `useWeaponState.ts`
- Indépendant de l'animation visuelle
- Basé sur un timer de 600ms

### Pourquoi les hit markers fonctionnent ?
- Système complètement séparé
- Basé sur les résultats de raycast + health
- Pas de dépendance aux animations

## Prochaines étapes recommandées

1. Implémenter le système d'overlay pour le shooting
2. Ajouter des sons de tir
3. Ajouter des effets de particules (muzzle flash, shells)
4. Ajouter l'animation de reload
5. Améliorer le feedback visuel du recul de l'arme
