# Patch Notes - Système de Combat & Santé

## 🎯 Nouveautés

### Système de Santé Complet
- Composant `Health` modulaire et léger
- 6 types d'entités (Enemy, Ally, Neutral, Environment, Destructible, Pickup)
- Callbacks pour mort et dégâts
- Intégration facile sur n'importe quel objet

### Hit Markers Redesign
- **Design** : X creux animé autour du réticule +
- **Couleurs différenciées** :
  - Ennemi : Blanc → Gris (mort)
  - Environnement : Jaune → Marron (destruction)
  - Objet ramassable : Vert → Bleu
  - Allié/Neutre : Orange → Rouge (mort)

### Nouveau Réticule
- Croix simple en + au centre
- Minimal, propre, classique FPS
- Personnalisable (taille, gap, épaisseur, couleur)

### Animation de Tir
- **Upper body overlay** : Animation jouée uniquement sur le haut du corps
- Évite la T-pose
- Continue la locomotion pendant le tir
- **Optimisée** : Début et fin coupés pour plus de réactivité (~0.4s au lieu de ~1s)

## ⚙️ Paramètres de Combat

### Dégâts & Santé
- **Rifle** : 10 points de dégâts par tir
- **Balles** : 30 PV (3 tirs pour détruire)
- **Cooldown** : 600ms entre chaque tir

### Contrôles d'Arme
- **Clic gauche** : Tirer
- **Touche 1** : Quick slot (équiper/déséquiper instantané)
- **R maintenue (300ms)** : Sortir/Ranger dernière arme

## 🔧 Corrections Techniques

### Animation de Tir
**Avant** : T-pose ou pas d'animation
**Après** : Animation fluide sur haut du corps uniquement

**Implémentation** :
- Hook `useShootingAnimation`
- Filtrage des bones (spine, shoulders, arms, hands, head)
- Trim de 150ms au début + 250ms à la fin
- Overlay non-bloquant

**Fichiers** :
- `src/character/animation/useShootingAnimation.ts` (nouveau)
- `src/character/components/Character.tsx` (modifié)

### Touche R Maintenue
**Avant** : Action se répétait en boucle
**Après** : Une seule exécution

**Fix** :
- Arrêt de l'intervalle AVANT exécution de l'action
- Détection du relâchement pendant la vérification
- Logs de debug ajoutés

**Fichier** :
- `src/character/player/tps/weapons/useWeaponState.ts`

### Suppression des Objets Détruits
**Avant** : Les objets morts restaient dans la scène
**Après** : Suppression automatique après 500ms

**Implémentation** :
- State management avec `activeBalls`
- Callback `onDestroy`
- Physique désactivée immédiatement
- Fade out puis retrait du DOM

**Fichier** :
- `src/environment/components/Balls.tsx`

## 📁 Architecture

### Nouveaux Modules
```
src/
├── core/health/                    # Système de santé
│   ├── Health.tsx
│   ├── HealthTypes.ts
│   └── index.ts
├── ui/hud/
│   ├── crosshair/                  # Nouveau réticule
│   │   ├── Crosshair.tsx
│   │   └── Crosshair.css
│   └── hitmarker/                  # Nouveaux hit markers
│       ├── HitMarker.tsx
│       ├── HitMarker.css
│       ├── HitMarkerContext.tsx
│       ├── HitMarkerOverlay.tsx
│       ├── HitMarkerTypes.ts
│       └── useHitMarkerFeedback.ts
├── character/
│   ├── animation/
│   │   └── useShootingAnimation.ts # Animation de tir
│   └── player/tps/
│       ├── shooting/
│       │   └── useShootingWithHealth.ts
│       └── weapons/
│           └── useShootingCooldown.ts
└── examples/
    ├── HealthTestScene.tsx         # Scène de test
    └── TargetBall.tsx              # Cibles de test
```

## 🧪 Tests Recommandés

### 1. Animation de Tir
1. Équiper rifle (touche 1)
2. Tirer en étant immobile
3. Tirer en marchant/courant
4. Vérifier que les jambes continuent de bouger

### 2. Système de Santé
1. Tirer 3 fois sur une balle bleue
2. Observer les hit markers jaunes (normal)
3. Au 3ème tir : hit marker marron (destruction)
4. La balle disparaît après 500ms

### 3. Touche R Maintenue
1. Maintenir R > 300ms avec arme rangée
2. Observer les logs console
3. Vérifier qu'il n'y a qu'UNE seule exécution
4. Arme doit sortir
5. Maintenir R à nouveau > 300ms
6. Arme doit se ranger

### 4. Scène de Test
- Visiter `HealthTestScene` pour voir tous les types de cibles
- Tester chaque couleur de hit marker

## 🐛 Debug

### Logs Disponibles
Tous les logs commencent par `[STOW_WEAPON]` pour faciliter le debug :

```javascript
[STOW_WEAPON] Hold detected (300ms+), currentWieldedSlot: null
[STOW_WEAPON] Back slots - LEFT: {...}, RIGHT: null
[STOW_WEAPON] Wielding weapon from BACK_LEFT
[STOW_WEAPON] Wield BACK_LEFT result: true
```

### Si l'action R ne fonctionne pas
1. Vérifier les logs console
2. Si "Hold detected" n'apparaît pas : Problème de binding
3. Si "Back slots" sont vides : Pas d'arme dans l'inventaire
4. Si "Wield result: false" : Problème dans le système d'équipement

## 📊 Performances

### Optimisations
- Animation de tir : ~400ms au lieu de ~1s
- Filtrage des tracks : Seulement upper body (~40% des bones)
- Cooldown indépendant de l'animation
- Suppression automatique des objets morts

### Métriques
- 300 balles avec Health component
- ~2285 modules compilés
- Build: ~12s
- Taille bundle: ~3.7MB (gzip: ~1.3MB)

## 🔜 Prochaines Étapes

### Court terme
1. Vérifier les logs de la touche R en jeu
2. Tester avec plusieurs armes dans l'inventaire
3. Optimiser si nécessaire

### Moyen terme
1. Sons de tir et d'impact
2. Muzzle flash
3. Douilles éjectées
4. Animation de rechargement

### Long terme
1. Santé du joueur
2. UI de santé (barre de vie)
3. Différents types de munitions
4. Système de recul de l'arme

## 📚 Documentation

- [HEALTH_SYSTEM_GUIDE.md](HEALTH_SYSTEM_GUIDE.md) - Guide complet du système
- [ANIMATION_FIX_NOTES.md](ANIMATION_FIX_NOTES.md) - Notes sur les problèmes d'animation
- [FINAL_FIXES.md](FINAL_FIXES.md) - Correctifs détaillés

## ✅ Checklist Build

- [x] Compilation sans erreur
- [x] Système de santé fonctionnel
- [x] Hit markers colorés
- [x] Animation de tir (upper body)
- [x] Cooldown de tir
- [x] Suppression objets détruits
- [x] Logs de debug pour touche R
- [x] Documentation complète
