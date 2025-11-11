import { useEffect, useRef, useState } from 'react';
import { Group, LoopRepeat, AnimationClip } from 'three';
import { useAnimations } from '@react-three/drei';
import { FBXLoader, GLTFLoader } from 'three-stdlib';
import { useCharacterSelector } from '../hooks/useCharacterSelector';

interface AnimatedModelProps {
  isMoving: boolean;
  isSprinting: boolean;
  isGrounded: boolean;
}

/**
 * AnimatedModel - Composant de base pour personnage sans arme
 * Gère les animations: IDLE, RUN, WALK, FALLING_IDLE, LANDING
 */
export function AnimatedModel({ isMoving, isSprinting, isGrounded }: AnimatedModelProps) {
  const group = useRef<Group>(null);
  const [model, setModel] = useState<Group | null>(null);
  const [animations, setAnimations] = useState<AnimationClip[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState<string>('IDLE');
  const { modelPath } = useCharacterSelector();

  // Charger le modèle sélectionné ET les animations
  useEffect(() => {
    const loader = new FBXLoader();
    let mounted = true;
    
    setLoading(true);
    setModel(null);

    const loadModelAndAnimations = async () => {
      try {
        let modelFbx: Group;

        // Charger le modèle selon son format
        if (modelPath.endsWith('.glb')) {
          const gltfLoader = new GLTFLoader();
          const gltf = await new Promise<{ scene: Group }>((resolve, reject) => {
            gltfLoader.load(
              modelPath,
              (gltf) => resolve(gltf),
              undefined,
              (error) => reject(error)
            );
          });
          modelFbx = gltf.scene.clone();
        } else {
          modelFbx = await new Promise<Group>((resolve, reject) => {
            loader.load(
              modelPath,
              (fbx) => resolve(fbx),
              undefined,
              (error) => reject(error)
            );
          });
        }

        if (!mounted) return;

        modelFbx.scale.setScalar(0.01);
        setModel(modelFbx);

        // Charger les animations
        const loadedAnims: AnimationClip[] = [];

        // Idle
        const idleFbx = await new Promise<Group>((resolve, reject) => {
          loader.load('/models/xbot/idle-new.fbx', (fbx) => resolve(fbx), undefined, (error) => reject(error));
        });
        if (idleFbx.animations?.[0]) {
          const clip = idleFbx.animations[0].clone();
          clip.name = 'IDLE';
          loadedAnims.push(clip);
        }

        // Walking
        const walkFbx = await new Promise<Group>((resolve, reject) => {
          loader.load('/models/xbot/walking.fbx', (fbx) => resolve(fbx), undefined, (error) => reject(error));
        });
        if (walkFbx.animations?.[0]) {
          const clip = walkFbx.animations[0].clone();
          clip.name = 'WALK';
          loadedAnims.push(clip);
        }

        // Run
        const runFbx = await new Promise<Group>((resolve, reject) => {
          loader.load('/models/xbot/standard run.fbx', (fbx) => resolve(fbx), undefined, (error) => reject(error));
        });
        if (runFbx.animations?.[0]) {
          const clip = runFbx.animations[0].clone();
          clip.name = 'RUN';
          clip.tracks = clip.tracks.filter(track => !track.name.includes('.position'));
          loadedAnims.push(clip);
        }

        // Falling Idle
        const fallingIdleFbx = await new Promise<Group>((resolve, reject) => {
          loader.load('/models/xbot/falling-idle.fbx', (fbx) => resolve(fbx), undefined, (error) => reject(error));
        });
        if (fallingIdleFbx.animations?.[0]) {
          const clip = fallingIdleFbx.animations[0].clone();
          clip.name = 'FALLING_IDLE';
          loadedAnims.push(clip);
        }

        // Falling To Landing
        const fallingToLandingFbx = await new Promise<Group>((resolve, reject) => {
          loader.load('/models/xbot/falling-to-landing.fbx', (fbx) => resolve(fbx), undefined, (error) => reject(error));
        });
        if (fallingToLandingFbx.animations?.[0]) {
          const clip = fallingToLandingFbx.animations[0].clone();
          clip.name = 'LANDING';
          loadedAnims.push(clip);
        }

        if (!mounted) return;

        setAnimations(loadedAnims);
        setLoading(false);
      } catch (error) {
        console.error('❌ Error loading model:', error);
        setLoading(false);
      }
    };

    loadModelAndAnimations();

    return () => {
      mounted = false;
    };
  }, [modelPath]);

  const { actions } = useAnimations(animations, group);

  // Démarrer l'animation IDLE dès que les animations sont chargées
  useEffect(() => {
    if (!actions || loading || animations.length === 0) return;

    const idleAction = actions['IDLE'];
    if (idleAction && currentAnimation === 'IDLE') {
      idleAction.reset().play();
      idleAction.setLoop(LoopRepeat, Infinity);
    }
  }, [actions, loading, animations, currentAnimation]);

  // Gérer le changement d'animation
  useEffect(() => {
    if (!actions || loading || animations.length === 0) return;

    let targetAnimation = 'IDLE';

    // Logique d'animation simple (sans arme)
    if (!isGrounded) {
      targetAnimation = 'FALLING_IDLE';
    } else if (isMoving) {
      targetAnimation = 'RUN';
    } else {
      targetAnimation = 'IDLE';
    }

    if (targetAnimation !== currentAnimation && actions[targetAnimation]) {
      const current = actions[currentAnimation];
      const target = actions[targetAnimation];

      if (current) {
        current.enabled = true;
        current.setEffectiveWeight(1);
      }

      if (target) {
        target.enabled = true;
        target.setEffectiveTimeScale(1);
        target.setEffectiveWeight(1);
        target.reset();
        target.play();
        target.setLoop(LoopRepeat, Infinity);
        target.timeScale = isSprinting && targetAnimation === 'RUN' ? 1.3 : 1.0;
      }

      // Crossfade
      if (current && target) {
        const fadeTime = 0.15;
        target.crossFadeFrom(current, fadeTime, true);
      }

      setCurrentAnimation(targetAnimation);
    }
  }, [isMoving, isSprinting, isGrounded, actions, currentAnimation, loading, animations]);

  if (!model || loading) {
    return null;
  }

  return (
    <group ref={group}>
      <primitive object={model} />
    </group>
  );
};
