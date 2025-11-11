import { useEffect, useRef, useState } from 'react';
import { Group } from 'three';
import { FBXLoader } from 'three-stdlib';
import { useGLTF, useAnimations } from '@react-three/drei';

type CharacterModelProps = {
  isMoving: boolean;
  isSprinting: boolean;
  isGrounded: boolean;
  modelPath: string;
};

export function CharacterModelFBX({ isMoving, isSprinting, isGrounded, modelPath }: CharacterModelProps) {
  const group = useRef<Group>(null);
  const [currentAnimation, setCurrentAnimation] = useState<string | null>(null);
  const [fbxModel, setFbxModel] = useState<Group | null>(null);
  
  // Charge TOUJOURS les animations du modèle par défaut
  const defaultAnimations = useGLTF('/models/character.glb').animations;
  const { actions } = useAnimations(defaultAnimations, group);

  // Charge le modèle FBX
  useEffect(() => {
    // Reset le modèle lors du changement
    setFbxModel(null);
    setCurrentAnimation(null);
    
    if (modelPath.endsWith('.fbx')) {
      const loader = new FBXLoader();
      loader.load(
        modelPath,
        (object) => {
          // Ajuste l'échelle (les modèles Mixamo sont souvent 100x trop grands)
          object.scale.setScalar(0.01);
          
          // Redresse le modèle (Mixamo FBX est souvent couché)
          object.rotation.x = Math.PI / 2; // 90° pour le redresser (essai inverse)
          
          // Configure les ombres
          object.traverse((child) => {
            if ('material' in child) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          setFbxModel(object);
        },
        undefined,
        (error) => {
          console.error('Erreur chargement FBX:', error);
        }
      );
    }
    
    // Cleanup lors du démontage
    return () => {
      setFbxModel(null);
      setCurrentAnimation(null);
    };
  }, [modelPath]);

  useEffect(() => {
    // Ne lance pas d'animation si le modèle n'est pas chargé
    if (!fbxModel) return;
    
    // Utilise TOUJOURS les animations du modèle Default (IDLE, RUN, FALL)
    let targetAnimation = 'IDLE';
    if (!isGrounded) {
      targetAnimation = 'FALL';
    } else if (isMoving) {
      targetAnimation = 'RUN';
    }
    
    // Vérifier si l'animation existe
    const action = actions[targetAnimation];
    if (!action) {
      console.warn(`Animation "${targetAnimation}" not found. Available:`, Object.keys(actions));
      return;
    }
    
    // If it's the first animation or same animation, just play it
    if (!currentAnimation || currentAnimation === targetAnimation) {
      action.reset().play();
      action.timeScale = isMoving && isSprinting ? 1.25 : 1;
      setCurrentAnimation(targetAnimation);
      return;
    }
    
    // Crossfade to new animation
    const prevAction = actions[currentAnimation];
    const nextAction = actions[targetAnimation];
    
    if (prevAction && nextAction) {
      // Start new animation
      nextAction.reset().play();
      nextAction.timeScale = isMoving && isSprinting ? 1.25 : 1;
      
      // Crossfade with the previous animation
      prevAction.crossFadeTo(nextAction, 0.15, true);
      
      setCurrentAnimation(targetAnimation);
    }
    
  }, [actions, isMoving, isSprinting, isGrounded, currentAnimation, fbxModel]);
  
  if (!fbxModel) return null;
  
  return <primitive ref={group} object={fbxModel} />;
}
