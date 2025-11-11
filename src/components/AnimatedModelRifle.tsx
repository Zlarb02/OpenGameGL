import { useEffect, useRef, useState } from 'react';
import { Group, LoopRepeat, AnimationClip, Bone } from 'three';
import { useAnimations, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { FBXLoader, GLTFLoader } from 'three-stdlib';
import { useCharacterSelector } from '../hooks/useCharacterSelector';
import { useAimDebug } from '../hooks/useAimDebug';
import { useRifleDebug } from '../hooks/useRifleDebug';

interface AnimatedModelRifleProps {
  isMoving: boolean;
  isSprinting: boolean;
  isGrounded: boolean;
  movementInput: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    sprint: boolean;
    jump: boolean;
  };
  characterRotation: number;
  cameraPhi: number; // Angle vertical de la caméra pour orientation du buste
  isAiming: boolean;
  isShooting: boolean;
  isCrouching: boolean;
  isReloading: boolean;
}

/**
 * AnimatedModelRifle - Personnage avec rifle et 8-way locomotion
 * Gère: IDLE, IDLE_AIM, WALK (8 directions), RUN (8 directions), SPRINT, SHOOTING
 * Contrôles: Clic droit = viser, Clic gauche = tirer, C = s'accroupir
 */
export function AnimatedModelRifle({
  isMoving,
  isSprinting,
  isGrounded,
  movementInput,
  characterRotation,
  cameraPhi,
  isAiming,
  isShooting,
  isCrouching,
  isReloading
}: AnimatedModelRifleProps) {
  const group = useRef<Group>(null);
  const [model, setModel] = useState<Group | null>(null);
  const [animations, setAnimations] = useState<AnimationClip[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState<string>('RIFLE_IDLE');
  const { modelPath } = useCharacterSelector();
  const { enableManualAim, manualAimAngle } = useAimDebug();
  const rifleDebug = useRifleDebug();

  // Référence directe vers l'os spine pour le debug
  const spineBoneRef = useRef<Bone | null>(null);


  // Charger le modèle ET les animations rifle
  useEffect(() => {
    const loader = new FBXLoader();
    let mounted = true;
    
    setLoading(true);
    setModel(null);

    const loadModelAndAnimations = async () => {
      try {
        let modelFbx: Group;

        // Charger le modèle
        if (modelPath.endsWith('.glb')) {
          const gltfLoader = new GLTFLoader();
          const gltf = await new Promise<{ scene: Group }>((resolve, reject) => {
            gltfLoader.load(modelPath, (gltf) => resolve(gltf), undefined, (error) => reject(error));
          });
          modelFbx = gltf.scene.clone();
        } else {
          modelFbx = await new Promise<Group>((resolve, reject) => {
            loader.load(modelPath, (fbx) => resolve(fbx), undefined, (error) => reject(error));
          });
        }

        if (!mounted) return;

        modelFbx.scale.setScalar(0.01);
        setModel(modelFbx);

        // Charger les animations rifle essentielles
        const loadedAnims: AnimationClip[] = [];

        // Helper pour charger une animation
        const loadAnim = async (
          path: string,
          name: string,
          filterMode: 'none' | 'all' | 'rootOnly' = 'none'
        ) => {
          try {
            const fbx = await new Promise<Group>((resolve, reject) => {
              loader.load(path, (fbx) => resolve(fbx), undefined, (error) => reject(error));
            });
            if (fbx.animations?.[0]) {
              const clip = fbx.animations[0].clone();
              clip.name = name;

              // Filtrage des positions selon le mode
              if (filterMode === 'all') {
                // Supprimer toutes les positions (pour animations normales)
                clip.tracks = clip.tracks.filter(track => !track.name.includes('.position'));
              } else if (filterMode === 'rootOnly') {
                // Supprimer uniquement la position du root bone (Hips) pour éviter translation au sol
                // mais garder les positions Y des autres bones pour l'accroupi
                clip.tracks = clip.tracks.filter(track => {
                  const trackName = track.name.toLowerCase();
                  const isRootPosition = trackName.includes('hips.position') ||
                                        trackName.includes('mixamorighips.position');
                  return !isRootPosition;
                });
              }

              loadedAnims.push(clip);
            }
          } catch (error) {
            // Silently fail for optional animations
          }
        };

        // Idle animations
        await loadAnim('/models/rifle-pack/idle.fbx', 'RIFLE_IDLE');
        await loadAnim('/models/rifle-pack/idle aiming.fbx', 'RIFLE_IDLE_AIM');
        await loadAnim('/models/rifle-pack/Rifle Aiming Idle.fbx', 'RIFLE_AIMING_IDLE_ALT');
        
        // Walk animations (8-way)
        await loadAnim('/models/rifle-pack/walk forward.fbx', 'RIFLE_WALK_FORWARD', 'all');
        await loadAnim('/models/rifle-pack/walk backward.fbx', 'RIFLE_WALK_BACKWARD', 'all');
        await loadAnim('/models/rifle-pack/walk left.fbx', 'RIFLE_WALK_LEFT', 'all');
        await loadAnim('/models/rifle-pack/walk right.fbx', 'RIFLE_WALK_RIGHT', 'all');
        await loadAnim('/models/rifle-pack/walk forward left.fbx', 'RIFLE_WALK_FORWARD_LEFT', 'all');
        await loadAnim('/models/rifle-pack/walk forward right.fbx', 'RIFLE_WALK_FORWARD_RIGHT', 'all');
        await loadAnim('/models/rifle-pack/walk backward left.fbx', 'RIFLE_WALK_BACKWARD_LEFT', 'all');
        await loadAnim('/models/rifle-pack/walk backward right.fbx', 'RIFLE_WALK_BACKWARD_RIGHT', 'all');

        // Run animations (8-way)
        await loadAnim('/models/rifle-pack/run forward.fbx', 'RIFLE_RUN_FORWARD', 'all');
        await loadAnim('/models/rifle-pack/run backward.fbx', 'RIFLE_RUN_BACKWARD', 'all');
        await loadAnim('/models/rifle-pack/run left.fbx', 'RIFLE_RUN_LEFT', 'all');
        await loadAnim('/models/rifle-pack/run right.fbx', 'RIFLE_RUN_RIGHT', 'all');
        await loadAnim('/models/rifle-pack/run forward left.fbx', 'RIFLE_RUN_FORWARD_LEFT', 'all');
        await loadAnim('/models/rifle-pack/run forward right.fbx', 'RIFLE_RUN_FORWARD_RIGHT', 'all');
        await loadAnim('/models/rifle-pack/run backward left.fbx', 'RIFLE_RUN_BACKWARD_LEFT', 'all');
        await loadAnim('/models/rifle-pack/run backward right.fbx', 'RIFLE_RUN_BACKWARD_RIGHT', 'all');

        // Sprint animations (principaux)
        await loadAnim('/models/rifle-pack/sprint forward.fbx', 'RIFLE_SPRINT_FORWARD', 'all');
        await loadAnim('/models/rifle-pack/sprint backward.fbx', 'RIFLE_SPRINT_BACKWARD', 'all');

        // Shooting
        await loadAnim('/models/rifle-shooting.fbx', 'RIFLE_SHOOTING');

        // Crouch animations - pas de translation du tout
        await loadAnim('/models/rifle-pack/idle crouching.fbx', 'RIFLE_CROUCH_IDLE', 'all');
        await loadAnim('/models/rifle-pack/idle crouching aiming.fbx', 'RIFLE_CROUCH_IDLE_AIM', 'all');
        await loadAnim('/models/rifle-pack/walk crouching forward.fbx', 'RIFLE_CROUCH_WALK_FORWARD', 'all');
        await loadAnim('/models/rifle-pack/walk crouching backward.fbx', 'RIFLE_CROUCH_WALK_BACKWARD', 'all');
        await loadAnim('/models/rifle-pack/walk crouching left.fbx', 'RIFLE_CROUCH_WALK_LEFT', 'all');
        await loadAnim('/models/rifle-pack/walk crouching right.fbx', 'RIFLE_CROUCH_WALK_RIGHT', 'all');
        await loadAnim('/models/rifle-pack/walk crouching forward left.fbx', 'RIFLE_CROUCH_WALK_FORWARD_LEFT', 'all');
        await loadAnim('/models/rifle-pack/walk crouching forward right.fbx', 'RIFLE_CROUCH_WALK_FORWARD_RIGHT', 'all');
        await loadAnim('/models/rifle-pack/walk crouching backward left.fbx', 'RIFLE_CROUCH_WALK_BACKWARD_LEFT', 'all');
        await loadAnim('/models/rifle-pack/walk crouching backward right.fbx', 'RIFLE_CROUCH_WALK_BACKWARD_RIGHT', 'all');

        if (!mounted) return;

        setAnimations(loadedAnims);
        setLoading(false);
      } catch (error) {
        console.error('❌ Rifle model loading failed:', error);
        setLoading(false);
      }
    };

    loadModelAndAnimations();

    return () => {
      mounted = false;
    };
  }, [modelPath]);

  const { actions, mixer } = useAnimations(animations, group);

  // Référence pour l'action de tir en overlay
  const shootingOverlayRef = useRef<any>(null);

  // Référence pour l'os de la main droite pour attacher le rifle
  const rightHandBoneRef = useRef<Bone | null>(null);

  // Charger le modèle du rifle
  const { scene: rifleScene } = useGLTF('/models/rifle.glb');
  const rifleGroupRef = useRef<Group | null>(null);

  // TROUVER ET STOCKER LES OS (SPINE POUR AIM + MAIN DROITE POUR RIFLE)
  useEffect(() => {
    if (!model) return;

    model.traverse((child: any) => {
      if (child.isBone) {
        const boneName = child.name.toLowerCase();

        // Chercher le premier spine (bas du ventre/torse)
        if (!spineBoneRef.current && (boneName.includes('spine1') || boneName === 'spine')) {
          spineBoneRef.current = child;
        }

        // Chercher la main droite - plusieurs variations possibles
        if (!rightHandBoneRef.current && (
          boneName === 'righthand' ||
          boneName === 'right_hand' ||
          boneName === 'mixamorigrighthand' ||
          boneName.includes('righthand') ||
          boneName.includes('right_hand')
        )) {
          rightHandBoneRef.current = child;
        }
      }
    });

    if (!rightHandBoneRef.current) {
      console.error('❌ Rifle: Right hand bone not found');
    }
  }, [model]);

  // Attacher le rifle à la main droite (une fois que l'os est trouvé)
  useEffect(() => {
    if (!rightHandBoneRef.current) return;

    // Créer un nouveau groupe pour le rifle
    const rifleGroup = new Group();
    const rifleClone = rifleScene.clone();

    // Configurer les ombres
    rifleClone.traverse((child) => {
      if ('castShadow' in child) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Ajouter le rifle au groupe
    rifleGroup.add(rifleClone);

    // Ajustements de position/rotation/échelle (valeurs par défaut ou debug)
    const scale = rifleDebug.enableRifleDebug ? rifleDebug.rifleScale : 80.0;
    const posX = rifleDebug.enableRifleDebug ? rifleDebug.riflePosX : -8.2;
    const posY = rifleDebug.enableRifleDebug ? rifleDebug.riflePosY : 6.4;
    const posZ = rifleDebug.enableRifleDebug ? rifleDebug.riflePosZ : 1.9;
    const rotX = rifleDebug.enableRifleDebug ? rifleDebug.rifleRotX : -1.8;
    const rotY = rifleDebug.enableRifleDebug ? rifleDebug.rifleRotY : 2.7;
    const rotZ = rifleDebug.enableRifleDebug ? rifleDebug.rifleRotZ : 1.8;

    rifleGroup.scale.setScalar(scale);
    rifleGroup.rotation.set(rotX, rotY, rotZ);
    rifleGroup.position.set(posX, posY, posZ);

    // ATTACHER LE RIFLE À L'OS DE LA MAIN
    rightHandBoneRef.current.add(rifleGroup);
    rifleGroupRef.current = rifleGroup;

    // Cleanup: détacher quand le composant unmount ou que les dépendances changent
    return () => {
      if (rifleGroup && rifleGroup.parent) {
        rifleGroup.parent.remove(rifleGroup);
      }
      rifleGroupRef.current = null;
    };
  }, [rifleScene, model, rifleDebug]);


  // Auto-start idle
  useEffect(() => {
    if (!actions || loading || animations.length === 0) return;

    const idleAction = actions['RIFLE_IDLE'];
    if (idleAction && currentAnimation === 'RIFLE_IDLE') {
      idleAction.reset().play();
      idleAction.setLoop(LoopRepeat, Infinity);
    }
  }, [actions, loading, animations, currentAnimation]);

  // Gérer le tir en overlay (haut du corps uniquement)
  useEffect(() => {
    if (!actions || loading || animations.length === 0 || !mixer || !model) return;

    if (isShooting && actions['RIFLE_SHOOTING']) {
      const shootAction = actions['RIFLE_SHOOTING'];

      // Stop l'overlay précédent si existant
      if (shootingOverlayRef.current) {
        shootingOverlayRef.current.stop();
      }

      // Filtrer les tracks pour ne garder que le haut du corps
      // On garde: Spine, Spine1, Spine2, Neck, Head, LeftShoulder, RightShoulder, et leurs enfants
      const upperBodyBones = [
        'spine', 'spine1', 'spine2', 'neck', 'head',
        'leftshoulder', 'leftarm', 'leftforearm', 'lefthand',
        'rightshoulder', 'rightarm', 'rightforearm', 'righthand',
        'mixamorigspine', 'mixamorigspine1', 'mixamorigspine2',
        'mixamorigneck', 'mixamorighead', 'mixamorigheadtop_end',
        'mixamorigleftshoulder', 'mixamorigleftarm', 'mixamorigleftforearm', 'mixamoriglefthand',
        'mixamorigrightshoulder', 'mixamorigrightarm', 'mixamorigrightforearm', 'mixamorigrighthand'
      ];

      // Filtrer les tracks de l'animation de tir
      if (shootAction.getClip()) {
        const clip = shootAction.getClip();
        const filteredTracks = clip.tracks.filter(track => {
          const trackName = track.name.toLowerCase();
          // Garder uniquement les tracks du haut du corps
          return upperBodyBones.some(bone => trackName.includes(bone));
        });

        // Si on a des tracks filtrés, créer un nouveau clip
        if (filteredTracks.length > 0) {
          const filteredClip = clip.clone();
          filteredClip.tracks = filteredTracks;

          // Créer une nouvelle action avec le clip filtré
          const filteredAction = mixer.clipAction(filteredClip, group.current);

          // Configurer l'action de tir en overlay
          filteredAction.reset();
          filteredAction.setLoop(LoopRepeat, 1);
          filteredAction.clampWhenFinished = true;
          filteredAction.timeScale = 1.0;
          filteredAction.setEffectiveWeight(1);
          filteredAction.play();

          shootingOverlayRef.current = filteredAction;
        }
      }
    } else {
      // Arrêter progressivement l'overlay quand on ne tire plus
      if (shootingOverlayRef.current) {
        shootingOverlayRef.current.fadeOut(0.15);
        shootingOverlayRef.current = null;
      }
    }
  }, [isShooting, actions, loading, animations, mixer, model]);

  // Gérer l'aim vertical (MODE DEBUG MANUEL OU AUTOMATIQUE)
  useFrame(() => {
    if (!spineBoneRef.current) return;

    if (enableManualAim) {
      // MODE DEBUG MANUEL: Appliquer la rotation du slider
      spineBoneRef.current.rotation.x = manualAimAngle;
    } else {
      // MODE AUTOMATIQUE: Calculer l'angle basé sur cameraPhi
      const neutralPhi = Math.PI / 2; // 90° = regarder droit devant
      const phiDelta = cameraPhi - neutralPhi;

      // Convertir phiDelta en angle de rotation pour le spine (INVERSÉ)
      const maxPhiDelta = Math.PI / 3; // 60° max de mouvement caméra
      const maxSpineRotation = 0.8; // 0.8 rad = ~45° de rotation du spine

      // Calculer la rotation proportionnelle (avec inversion du signe)
      const spineRotation = -(phiDelta / maxPhiDelta) * maxSpineRotation;

      // Appliquer la rotation directement à l'os
      spineBoneRef.current.rotation.x = spineRotation;
    }
  });

  // Gérer les animations avec 8-way locomotion
  useEffect(() => {
    if (!actions || loading || animations.length === 0) return;

    let targetAnimation = 'RIFLE_IDLE';

    // Ne plus gérer le tir ici car il est géré en overlay
    // Priorité 1: Mouvement avec système strafe 8-way
    if (isMoving && isGrounded) {
      // Calculer la direction relative à l'orientation du personnage
      // Quand rifle équipé, le personnage regarde vers la caméra
      // Les inputs sont dans le repère monde, on doit les convertir en repère local

      // Direction absolue du mouvement souhaité (inputs)
      const inputAngle = Math.atan2(
        movementInput.right ? 1 : (movementInput.left ? -1 : 0),
        movementInput.forward ? 1 : (movementInput.backward ? -1 : 0)
      );

      // Différence entre la direction du personnage et la direction du mouvement
      let relativeAngle = inputAngle - characterRotation;

      // Normaliser l'angle entre -PI et PI
      while (relativeAngle > Math.PI) relativeAngle -= Math.PI * 2;
      while (relativeAngle < -Math.PI) relativeAngle += Math.PI * 2;

      // Déterminer la direction en 8-way basé sur l'angle relatif
      let direction = 'FORWARD';
      const angle45 = Math.PI / 4;

      if (relativeAngle >= -angle45 && relativeAngle < angle45) {
        direction = 'FORWARD';
      } else if (relativeAngle >= angle45 && relativeAngle < angle45 * 3) {
        direction = 'RIGHT';
      } else if (relativeAngle >= angle45 * 3 || relativeAngle < -angle45 * 3) {
        direction = 'BACKWARD';
      } else if (relativeAngle >= -angle45 * 3 && relativeAngle < -angle45) {
        direction = 'LEFT';
      }

      // Ajouter les diagonales si deux touches sont pressées
      if (movementInput.forward && movementInput.left) direction = 'FORWARD_LEFT';
      else if (movementInput.forward && movementInput.right) direction = 'FORWARD_RIGHT';
      else if (movementInput.backward && movementInput.left) direction = 'BACKWARD_LEFT';
      else if (movementInput.backward && movementInput.right) direction = 'BACKWARD_RIGHT';

      // Mode: Crouch > Walk (aiming) > Sprint > Run
      if (isCrouching) {
        // Accroupi: toujours en walk crouch (pas de sprint/run)
        targetAnimation = `RIFLE_CROUCH_WALK_${direction}`;
      } else if (isAiming) {
        // Viser: walk standard
        targetAnimation = `RIFLE_WALK_${direction}`;
      } else if (isSprinting && (direction === 'FORWARD' || direction === 'BACKWARD')) {
        // Sprint uniquement vers l'avant/arrière
        targetAnimation = `RIFLE_SPRINT_${direction}`;
      } else {
        // Run par défaut
        targetAnimation = `RIFLE_RUN_${direction}`;
      }
    }
    // Priorité 2: Idle (crouch > aiming > standard)
    else {
      if (isCrouching) {
        targetAnimation = isAiming ? 'RIFLE_CROUCH_IDLE_AIM' : 'RIFLE_CROUCH_IDLE';
      } else {
        targetAnimation = isAiming ? 'RIFLE_IDLE_AIM' : 'RIFLE_IDLE';
      }
    }

    // Fallback si l'animation n'existe pas
    if (!actions[targetAnimation]) {
      targetAnimation = 'RIFLE_IDLE';
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
        
        // Shooting joue une fois, le reste en boucle
        if (targetAnimation === 'RIFLE_SHOOTING') {
          target.setLoop(LoopRepeat, 1);
          target.clampWhenFinished = true;
        } else {
          target.setLoop(LoopRepeat, Infinity);
        }
        
        // Vitesse d'animation selon le mode
        if (targetAnimation.includes('SPRINT')) {
          target.timeScale = 1.3;
        } else {
          target.timeScale = 1.0;
        }
      }

      // Crossfade
      if (current && target) {
        // Transitions rapides
        let fadeTime = 0.15;
        if (targetAnimation === 'RIFLE_SHOOTING') {
          fadeTime = 0.1;
        } else if (targetAnimation.includes('CROUCH') || currentAnimation.includes('CROUCH')) {
          fadeTime = 0.2; // Transition rapide pour accroupi
        }
        target.crossFadeFrom(current, fadeTime, true);
      }

      setCurrentAnimation(targetAnimation);
    }
  }, [isMoving, isSprinting, isGrounded, isAiming, isShooting, isCrouching, movementInput, characterRotation, actions, currentAnimation, loading, animations]);

  if (!model || loading) {
    return null;
  }

  return (
    <group ref={group}>
      <primitive object={model} />
      {/* Rifle attaché directement à l'os via useEffect */}
    </group>
  );
}
