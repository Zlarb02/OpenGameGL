import { useGLTF, useAnimations } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import { Group, Bone, LoopRepeat } from 'three';
import { useCharacterSelector } from '../hooks/useCharacterSelector';
import { useWeaponState } from '../hooks/useWeaponState';
import { useRifleAnimations } from '../hooks/useRifleAnimations';
import { CharacterModelFBX } from './CharacterModelFBX';

type CharacterModelProps = {
  isMoving: boolean;
  isSprinting: boolean;
  isGrounded: boolean;
  onSkeletonReady?: (rightHand: Bone | null) => void;
};

export function CharacterModel(props: CharacterModelProps) {
  const { modelPath } = useCharacterSelector();
  
  // Si c'est un FBX, utilise le composant FBX dédié
  if (modelPath.endsWith('.fbx')) {
    return <CharacterModelFBX key={modelPath} {...props} modelPath={modelPath} />;
  }
  
  return <CharacterModelGLB key={modelPath} {...props} modelPath={modelPath} />;
}

function CharacterModelGLB({ isMoving, isSprinting, isGrounded, modelPath, onSkeletonReady }: CharacterModelProps & { modelPath: string }) {
  const group = useRef<Group>(null);
  const [currentAnimation, setCurrentAnimation] = useState<string | null>(null);
  const { weaponEquipped } = useWeaponState();
  const { rifleIdle, rifleRun, loading } = useRifleAnimations();
  
  // Charge le modèle visuel sélectionné (on ignore ses animations)
  const { scene } = useGLTF(modelPath);
  
  // Charge les animations du modèle par défaut
  const defaultAnimations = useGLTF('/models/character.glb').animations;
  
  // Utilise les animations rifle si équipé ET chargées, sinon animations normales
  const animations = weaponEquipped && !loading && rifleIdle.length > 0 && rifleRun.length > 0
    ? [...rifleIdle, ...rifleRun, ...defaultAnimations]
    : defaultAnimations;
  
  const { actions } = useAnimations(animations, group);

  // Reset l'animation lors du changement de modèle UNIQUEMENT
  useEffect(() => {
    setCurrentAnimation(null);
    // Arrête toutes les animations
    Object.values(actions).forEach((action) => action?.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelPath]); // On ne met pas actions ici pour éviter le reset lors du chargement des animations rifle
  
  // Cherche l'os de la main droite (une seule fois par modèle)
  useEffect(() => {
    let rightHandBone: Bone | null = null;
    scene.traverse((child) => {
      if (child instanceof Bone) {
        const name = child.name.toLowerCase();
        // Prend le premier os de la main trouvé (pas tous les doigts)
        if (!rightHandBone && (name === 'mixamorigrighthand' || name === 'righthand' || name === 'right_hand' || name === 'hand_r')) {
          rightHandBone = child;
          console.log('✅ Main droite trouvée:', child.name);
        }
      }
    });
    
    if (onSkeletonReady) {
      onSkeletonReady(rightHandBone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelPath, scene]); // onSkeletonReady volontairement exclu

  useEffect(() => {
    // Détermine quelle animation jouer
    let targetAnimation = 'IDLE';
    
    // Si weapon équipé et animations chargées
    if (weaponEquipped && !loading && rifleIdle.length > 0) {
      // Utilise les animations rifle si au sol, sinon revient aux animations normales pour FALL
      if (!isGrounded) {
        // Pas d'animation rifle pour la chute, utilise l'animation normale
        targetAnimation = 'FALL';
      } else if (isMoving) {
        targetAnimation = 'RIFLE_RUN';
      } else {
        targetAnimation = 'RIFLE_IDLE';
      }
    } else {
      // Animations normales
      if (!isGrounded) {
        targetAnimation = 'FALL';
      } else if (isMoving) {
        targetAnimation = 'RUN';
      }
    }
    
    const action = actions[targetAnimation];
    
    if (!action) {
      console.warn(`Animation "${targetAnimation}" not found. Available:`, Object.keys(actions));
      return;
    }
    
    // Configure l'action en mode loop si ce n'est pas déjà fait
    if (action.loop !== LoopRepeat) {
      action.setLoop(LoopRepeat, Infinity); // Loop infiniment
    }
    
    // Si c'est la première animation ou la même, juste la jouer
    if (!currentAnimation || currentAnimation === targetAnimation) {
      // Ne reset que si c'est vraiment un changement d'animation
      if (currentAnimation !== targetAnimation) {
        action.reset().fadeIn(0.2).play();
        action.timeScale = isMoving && isSprinting ? 1.25 : 1;
        setCurrentAnimation(targetAnimation);
        console.log(`▶️ Animation ${targetAnimation} started (reset), paused: ${action.paused}, timeScale: ${action.timeScale}`);
      } else {
        // Juste mettre à jour le timeScale si c'est la même animation
        action.timeScale = isMoving && isSprinting ? 1.25 : 1;
        // Ne pas relancer si elle tourne déjà
      }
      return;
    }
    
    // Sinon faire un crossfade
    const prevAction = actions[currentAnimation];
    if (prevAction) {
      action.reset().fadeIn(0.2).play();
      action.timeScale = isMoving && isSprinting ? 1.25 : 1;
      prevAction.fadeOut(0.2);
      setCurrentAnimation(targetAnimation);
      console.log(`🔄 Crossfade from ${currentAnimation} to ${targetAnimation}, timeScale: ${action.timeScale}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMoving, isSprinting, isGrounded, actions, currentAnimation, weaponEquipped, loading]);
  // rifleIdle et rifleRun volontairement exclus pour éviter la boucle infinie

  scene.traverse((child) => {
    if ('material' in child) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  
  return <primitive ref={group} object={scene} />;
}