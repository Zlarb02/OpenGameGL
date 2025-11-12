/**
 * Character - Generic character component
 * Reusable for Player, NPCs, Enemies, etc.
 * Uses AnimationLayerSystem with composable layers
 */

import { useEffect, useRef, useState } from 'react';
import { Group, AnimationMixer, Bone } from 'three';
import { FBXLoader, GLTFLoader } from 'three-stdlib';
import { useFrame } from '@react-three/fiber';
import { AnimationLayerSystem } from '../animation/AnimationLayerSystem';
import { IAnimationLayer, AnimationContext } from '../animation/AnimationTypes';
import { AimOffsetLayer } from '../animation/layers/AimOffsetLayer';
import { useEquipment } from '../player/equipment/EquipmentContext';
import { useCharacterReady } from './CharacterReadyContext';
import { useShootingAnimation } from '../animation/useShootingAnimation';

export interface CharacterProps {
  modelPath: string;
  layers: IAnimationLayer[];
  isMoving: boolean;
  isSprinting: boolean;
  isGrounded: boolean;
  isAiming?: boolean;
  isShooting?: boolean;
  isCrouching?: boolean;
  isReloading?: boolean;
  movementInput?: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
  };
  characterRotation?: number;
  cameraPhi?: number;
  velocity?: { x: number; y: number; z: number };
  onModelLoaded?: (model: Group) => void;
  onLayerSystemReady?: (layerSystem: AnimationLayerSystem) => void;
}

/**
 * Character Component - ONE model, multiple layers
 */
export function Character({
  modelPath,
  layers,
  isMoving,
  isSprinting,
  isGrounded,
  isAiming = false,
  isShooting = false,
  isCrouching = false,
  isReloading = false,
  movementInput = { forward: false, backward: false, left: false, right: false },
  characterRotation = 0,
  cameraPhi = Math.PI / 2,
  velocity = { x: 0, y: 0, z: 0 },
  onModelLoaded,
  onLayerSystemReady,
}: CharacterProps) {
  const groupRef = useRef<Group>(null);
  const [model, setModel] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [animationsReady, setAnimationsReady] = useState(false);
  const mixerRef = useRef<AnimationMixer | null>(null);
  const layerSystemRef = useRef<AnimationLayerSystem | null>(null);
  const initializedRef = useRef(false);
  const spineBoneRef = useRef<Bone | null>(null); // For aim rotation
  const firstAnimationStartedRef = useRef(false);
  const readySignaledRef = useRef(false);

  // Equipment system integration
  const { initializeSkeleton } = useEquipment();

  // Character ready signaling
  const { setCharacterReady } = useCharacterReady();

  // Shooting animation overlay (upper body only)
  useShootingAnimation(model, mixerRef.current, isShooting);

  // Load model (ONCE)
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const loadModel = async () => {
      try {
        let loadedModel: Group;

        // Load based on file extension
        if (modelPath.endsWith('.glb') || modelPath.endsWith('.gltf')) {
          const gltfLoader = new GLTFLoader();
          const gltf = await new Promise<{ scene: Group }>((resolve, reject) => {
            gltfLoader.load(
              modelPath,
              (result) => resolve(result),
              undefined,
              (error) => reject(error)
            );
          });
          loadedModel = gltf.scene.clone();
        } else {
          // FBX
          const fbxLoader = new FBXLoader();
          loadedModel = await new Promise<Group>((resolve, reject) => {
            fbxLoader.load(
              modelPath,
              (result) => resolve(result),
              undefined,
              (error) => reject(error)
            );
          });
        }

        if (!mounted) return;

        // Apply scale (hardcoded like in old system)
        loadedModel.scale.setScalar(0.01);

        // Setup shadows
        loadedModel.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        setModel(loadedModel);
        setLoading(false);

        // Initialize equipment skeleton
        initializeSkeleton(loadedModel);

        if (onModelLoaded) {
          onModelLoaded(loadedModel);
        }

        console.log('[Character] Model loaded:', modelPath);
      } catch (error) {
        console.error('[Character] Failed to load model:', error);
        setLoading(false);
      }
    };

    loadModel();

    return () => {
      mounted = false;
    };
  }, [modelPath, initializeSkeleton, onModelLoaded]);

  // Initialize AnimationLayerSystem when model is loaded
  useEffect(() => {
    if (!model || !groupRef.current || initializedRef.current) return;

    const initializeSystem = async () => {
      // Create mixer
      const mixer = new AnimationMixer(model);
      mixerRef.current = mixer;

      // Create layer system
      const layerSystem = new AnimationLayerSystem(mixer);
      layerSystemRef.current = layerSystem;

      // Initialize and register all layers
      for (const layer of layers) {
        await layer.initialize();
        layerSystem.registerLayer(layer);

        // Set spine bone reference for AimOffsetLayer
        if (layer instanceof AimOffsetLayer && spineBoneRef.current) {
          layer.setSpineBone(spineBoneRef.current);
        }
      }

      // CRITICAL: Start the first enabled layer immediately to prevent T-pose
      // Find the first enabled layer and force it to start
      const firstEnabledLayer = layers.find(layer => layer.config.enabled);
      if (firstEnabledLayer) {
        console.log('[Character] Starting first layer immediately:', firstEnabledLayer.config.name);

        // Determine initial state based on layer type
        let initialState = 'IDLE';
        if (firstEnabledLayer.config.name === 'tps') {
          initialState = 'RIFLE_IDLE';
        }

        // Force immediate transition to prevent T-pose
        const state = firstEnabledLayer.getState(initialState);
        if (state) {
          firstEnabledLayer.currentState = initialState;
          const action = mixer.clipAction(state.clip);
          action.reset();
          action.setEffectiveWeight(firstEnabledLayer.config.weight);
          action.play();

          // Mark animations as ready immediately
          setAnimationsReady(true);
          firstAnimationStartedRef.current = true;

          console.log('[Character] First animation started immediately:', initialState);

          // CRITICAL: Signal character is ready NOW, not in useFrame
          // useFrame won't run until Canvas is visible, causing a deadlock
          if (!readySignaledRef.current) {
            readySignaledRef.current = true;
            setCharacterReady(true);
            console.log('[Character] Character ready signal sent');
          }
        }
      }

      initializedRef.current = true;

      // Notify parent that layer system is ready
      if (onLayerSystemReady) {
        onLayerSystemReady(layerSystem);
      }

      console.log('[Character] AnimationLayerSystem initialized with', layers.length, 'layers');
    };

    initializeSystem();
  }, [model, layers, onLayerSystemReady]);

  // Find spine bone for aim rotation
  useEffect(() => {
    if (!model) return;

    model.traverse((child: any) => {
      if (child.isBone) {
        const boneName = child.name.toLowerCase();
        // Find spine1 bone (first spine above hips)
        if (!spineBoneRef.current && (boneName.includes('spine1') || boneName === 'spine')) {
          spineBoneRef.current = child;
          console.log('[Character] Found spine bone for aim:', child.name);

          // Set spine bone for any AimOffsetLayer in layers
          if (layerSystemRef.current) {
            const aimOffsetLayer = layerSystemRef.current.getLayer('aimOffset');
            if (aimOffsetLayer && aimOffsetLayer instanceof AimOffsetLayer) {
              aimOffsetLayer.setSpineBone(child);
            }
          }
        }
      }
    });
  }, [model]);

  // Update animation system every frame
  useFrame((_, delta) => {
    if (!layerSystemRef.current || !initializedRef.current) return;

    // Build animation context
    const context: AnimationContext = {
      isGrounded,
      isMoving,
      isSprinting,
      isCrouching,
      isAiming,
      isShooting,
      isReloading,
      movementInput,
      velocity,
      characterRotation,
      cameraPhi,
    };

    // Update layer system
    layerSystemRef.current.update(delta, context);

    // TODO: Spine bone rotation for vertical aiming (TPS rifle)
    // Temporarily disabled - conflicts with rifle animations
    // Need to investigate proper implementation
    /*
    const tpsLayerActive = layerSystemRef.current?.isLayerEnabled('tps');

    if (spineBoneRef.current && tpsLayerActive) {
      const neutralPhi = Math.PI / 2;
      const phiDelta = cameraPhi - neutralPhi;
      const maxPhiDelta = Math.PI / 3;
      const maxSpineRotation = 0.8;
      const spineRotation = -(phiDelta / maxPhiDelta) * maxSpineRotation;
      spineBoneRef.current.rotation.x = spineRotation;
    } else if (spineBoneRef.current) {
      spineBoneRef.current.rotation.x = 0;
    }
    */
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
      if (layerSystemRef.current) {
        layerSystemRef.current.reset();
      }
      initializedRef.current = false;
    };
  }, []);

  if (!model || loading) {
    return null;
  }

  return (
    <group ref={groupRef}>
      {/* Only show model when animations are ready to prevent T-pose */}
      <primitive object={model} visible={animationsReady} />
    </group>
  );
}
