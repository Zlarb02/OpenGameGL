# 📋 Guide du Menu Leva & Système de Sauvegarde

## 🎯 Organisation du Menu

Le menu Leva a été réorganisé de manière logique et hiérarchique avec des emojis pour une meilleure lisibilité :

### 1. 🎮 **Contrôles**
- **Input Settings** - Paramètres d'entrée (souris, gamepad, comportements)
- **🎮 Key Bindings** - Configuration complète des touches

### 2. 🔧 **Debug**
- **🔧 Debug - Aim** - Debug de la visée manuelle
- **🔧 Debug - Rifle Position** - Ajustement de la position/rotation du fusil

### 3. 🎯 **Character & Gameplay**
- **🎯 Character** - Sélection du modèle, offset et échelle
- **🎯 Character Physics** - Paramètres de physique (vitesse, saut, friction)

### 4. 📷 **Camera**
- **📷 Camera Settings** - Paramètres avancés de la caméra

### 5. 🎨 **Visual & Effects**
- **🎨 Lighting** - Contrôle de l'éclairage
- **🎨 Post Processing** - Effets de post-traitement
- **🎨 Balls** - Propriétés des balles (physique, shader)

### 6. 💾 **Config Manager**
- Système complet de sauvegarde et chargement des configurations

---

## 💾 Système de Sauvegarde/Chargement

### ✨ Fonctionnalités

#### 1. **Sauvegarde Complète**
- **Bouton** : `💾 Télécharger config complète`
- **Action** : Télécharge un fichier JSON contenant **toutes** les configurations du menu Leva
- **Format** : `leva-config-YYYY-MM-DD.json`
- **Contenu** : Toutes les sections organisées avec versioning

#### 2. **Chargement Complet**
- **Bouton** : `📂 Charger config complète`
- **Action** : Ouvre un sélecteur de fichier pour charger une configuration complète
- **Effet** : Restaure toutes les options sauvegardées
- **⚠️ Important** : Nécessite un rafraîchissement de la page (F5) pour appliquer

#### 3. **Sauvegardes par Section**
Permet de sauvegarder individuellement chaque section pour éviter de tout perdre lors des mises à jour du menu :

- `💾 Input` - Input Settings
- `💾 Bindings` - Key Bindings
- `💾 Character` - Sélection du personnage
- `💾 Physics` - Physique du personnage
- `💾 Camera` - Paramètres caméra
- `💾 Lighting` - Éclairage
- `💾 Post-FX` - Post-traitement
- `💾 Debug` - Tous les menus debug

#### 4. **Réinitialisation**
- **Bouton** : `↻ Reset ALL`
- **Action** : Réinitialise **toutes** les configurations Leva
- **⚠️ Attention** : Irréversible, demande confirmation

---

## 🔄 Workflow Recommandé

### Cas d'usage 1 : Sauvegarde avant expérimentation
```
1. Cliquer sur "💾 Télécharger config complète"
2. Expérimenter avec différents paramètres
3. Si résultat insatisfaisant : "📂 Charger config complète" + F5
4. Si résultat satisfaisant : "💾 Télécharger config complète" (nouvelle sauvegarde)
```

### Cas d'usage 2 : Partage de configurations
```
1. Créer une configuration optimale
2. "💾 Télécharger config complète"
3. Partager le fichier JSON avec votre équipe
4. Les autres chargent avec "📂 Charger config complète" + F5
```

### Cas d'usage 3 : Sauvegardes partielles pour versioning
```
1. Sauvegarder chaque section individuellement (💾 Input, 💾 Camera, etc.)
2. Lors d'une mise à jour du menu Leva qui ajoute de nouveaux paramètres
3. Charger uniquement les sections nécessaires
4. Les nouvelles options auront leurs valeurs par défaut
```

---

## 📁 Structure du Fichier de Configuration

### Configuration Complète
```json
{
  "version": "1.0.0",
  "timestamp": "2025-11-11T...",
  "sections": {
    "inputSettings": { ... },
    "keyBindings": { ... },
    "debugAim": { ... },
    "debugRifle": { ... },
    "character": { ... },
    "characterPhysics": { ... },
    "cameraSettings": { ... },
    "lighting": { ... },
    "postProcessing": { ... },
    "balls": { ... }
  }
}
```

### Configuration de Section
```json
{
  "version": "1.0.0",
  "timestamp": "2025-11-11T...",
  "section": "character",
  "data": { ... }
}
```

---

## 🛠️ Technique : Comment ça marche ?

### Stockage
Leva stocke ses configurations dans le `localStorage` du navigateur avec le préfixe `leva__`.

### Sauvegarde
1. Récupère toutes les clés du `localStorage` commençant par `leva__`
2. Parse les valeurs JSON
3. Organise par section
4. Ajoute versioning et timestamp
5. Télécharge en fichier JSON

### Chargement
1. Parse le fichier JSON uploadé
2. Identifie le type (complet ou section)
3. Écrit dans le `localStorage` avec les bonnes clés
4. Demande un refresh pour appliquer (Leva lit le localStorage au démarrage)

### Extensibilité
Le système est conçu pour s'adapter aux futures modifications du menu :
- Les sections manquantes dans un fichier ancien sont ignorées
- Les nouvelles sections utilisent leurs valeurs par défaut
- Le versioning permet de gérer les migrations futures

---

## 🎓 Bonnes Pratiques

### ✅ À Faire
- Sauvegarder régulièrement vos configurations favorites
- Nommer vos fichiers de manière descriptive (ex: `leva-config-high-quality.json`)
- Utiliser les sauvegardes par section pour des ajustements spécifiques
- Tester une configuration chargée avant de supprimer l'ancienne

### ❌ À Éviter
- Ne pas modifier manuellement les fichiers JSON (sauf si vous savez ce que vous faites)
- Ne pas charger des fichiers de configuration d'autres projets
- Ne pas oublier de rafraîchir (F5) après un chargement

---

## 🔮 Évolutions Futures Possibles

- Export/Import depuis le cloud
- Préréglages intégrés (Low/Medium/High quality)
- Comparateur de configurations
- Historique des modifications
- Partage via URL

---

## 🐛 Dépannage

**Problème** : Les changements ne s'appliquent pas après le chargement
**Solution** : Assurez-vous de rafraîchir la page (F5)

**Problème** : Erreur "Fichier de configuration invalide"
**Solution** : Vérifiez que le fichier est un JSON valide généré par ce système

**Problème** : Certaines options ne se chargent pas
**Solution** : Normal si le fichier est ancien et que de nouvelles options ont été ajoutées. Les nouvelles options auront leurs valeurs par défaut.

---

## 📝 Notes Techniques

### Hooks Impliqués
- `useLevaConfigManager.ts` - Gestion centrale
- `useInputControls.ts` - Input Settings
- `useInputRebind.ts` - Key Bindings
- `useAimDebug.ts` - Debug Aim
- `useRifleDebug.ts` - Debug Rifle
- `useCharacterSelector.ts` - Character
- `useCharacterControls.ts` - Character Physics
- `useCameraControls.ts` - Camera
- `useLightingControls.ts` - Lighting
- `usePostProcessingControls.ts` - Post Processing
- `Balls.tsx` - Balls

### Ordre d'Appel dans App.tsx
L'ordre d'appel des hooks détermine l'ordre d'affichage dans le menu Leva.
