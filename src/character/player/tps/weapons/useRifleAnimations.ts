import { useEffect, useState } from 'react';
import { AnimationClip, Group } from 'three';
import { FBXLoader } from 'three-stdlib';

export type RifleAnimationType = 
  | 'RIFLE_IDLE'
  | 'RIFLE_IDLE_AIM'
  | 'RIFLE_AIM_TO_DOWN'
  | 'RIFLE_DOWN_TO_AIM'
  | 'RIFLE_WALK_FORWARD'
  | 'RIFLE_WALK_BACKWARD'
  | 'RIFLE_WALK_LEFT'
  | 'RIFLE_WALK_RIGHT'
  | 'RIFLE_WALK_FORWARD_LEFT'
  | 'RIFLE_WALK_FORWARD_RIGHT'
  | 'RIFLE_WALK_BACKWARD_LEFT'
  | 'RIFLE_WALK_BACKWARD_RIGHT'
  | 'RIFLE_RUN_FORWARD'
  | 'RIFLE_RUN_BACKWARD'
  | 'RIFLE_RUN_LEFT'
  | 'RIFLE_RUN_RIGHT'
  | 'RIFLE_RUN_FORWARD_LEFT'
  | 'RIFLE_RUN_FORWARD_RIGHT'
  | 'RIFLE_RUN_BACKWARD_LEFT'
  | 'RIFLE_RUN_BACKWARD_RIGHT'
  | 'RIFLE_SPRINT_FORWARD'
  | 'RIFLE_SPRINT_BACKWARD'
  | 'RIFLE_SPRINT_LEFT'
  | 'RIFLE_SPRINT_RIGHT'
  | 'RIFLE_SPRINT_FORWARD_LEFT'
  | 'RIFLE_SPRINT_FORWARD_RIGHT'
  | 'RIFLE_SPRINT_BACKWARD_LEFT'
  | 'RIFLE_SPRINT_BACKWARD_RIGHT'
  | 'RIFLE_CROUCH_IDLE'
  | 'RIFLE_CROUCH_IDLE_AIM'
  | 'RIFLE_CROUCH_WALK_FORWARD'
  | 'RIFLE_CROUCH_WALK_BACKWARD'
  | 'RIFLE_CROUCH_WALK_LEFT'
  | 'RIFLE_CROUCH_WALK_RIGHT'
  | 'RIFLE_CROUCH_WALK_FORWARD_LEFT'
  | 'RIFLE_CROUCH_WALK_FORWARD_RIGHT'
  | 'RIFLE_CROUCH_WALK_BACKWARD_LEFT'
  | 'RIFLE_CROUCH_WALK_BACKWARD_RIGHT'
  | 'RIFLE_SHOOTING';

const RIFLE_ANIMATION_FILES: Record<RifleAnimationType, string> = {
  RIFLE_IDLE: '/models/weapons/rifle-pack/idle.fbx',
  RIFLE_IDLE_AIM: '/models/weapons/rifle-pack/idle aiming.fbx',
  RIFLE_AIM_TO_DOWN: '/models/weapons/rifle-pack/Rifle Aim To Down.fbx',
  RIFLE_DOWN_TO_AIM: '/models/weapons/rifle-pack/Rifle Down To Aim.fbx',
  
  // Walk animations
  RIFLE_WALK_FORWARD: '/models/weapons/rifle-pack/walk forward.fbx',
  RIFLE_WALK_BACKWARD: '/models/weapons/rifle-pack/walk backward.fbx',
  RIFLE_WALK_LEFT: '/models/weapons/rifle-pack/walk left.fbx',
  RIFLE_WALK_RIGHT: '/models/weapons/rifle-pack/walk right.fbx',
  RIFLE_WALK_FORWARD_LEFT: '/models/weapons/rifle-pack/walk forward left.fbx',
  RIFLE_WALK_FORWARD_RIGHT: '/models/weapons/rifle-pack/walk forward right.fbx',
  RIFLE_WALK_BACKWARD_LEFT: '/models/weapons/rifle-pack/walk backward left.fbx',
  RIFLE_WALK_BACKWARD_RIGHT: '/models/weapons/rifle-pack/walk backward right.fbx',
  
  // Run animations
  RIFLE_RUN_FORWARD: '/models/weapons/rifle-pack/run forward.fbx',
  RIFLE_RUN_BACKWARD: '/models/weapons/rifle-pack/run backward.fbx',
  RIFLE_RUN_LEFT: '/models/weapons/rifle-pack/run left.fbx',
  RIFLE_RUN_RIGHT: '/models/weapons/rifle-pack/run right.fbx',
  RIFLE_RUN_FORWARD_LEFT: '/models/weapons/rifle-pack/run forward left.fbx',
  RIFLE_RUN_FORWARD_RIGHT: '/models/weapons/rifle-pack/run forward right.fbx',
  RIFLE_RUN_BACKWARD_LEFT: '/models/weapons/rifle-pack/run backward left.fbx',
  RIFLE_RUN_BACKWARD_RIGHT: '/models/weapons/rifle-pack/run backward right.fbx',
  
  // Sprint animations
  RIFLE_SPRINT_FORWARD: '/models/weapons/rifle-pack/sprint forward.fbx',
  RIFLE_SPRINT_BACKWARD: '/models/weapons/rifle-pack/sprint backward.fbx',
  RIFLE_SPRINT_LEFT: '/models/weapons/rifle-pack/sprint left.fbx',
  RIFLE_SPRINT_RIGHT: '/models/weapons/rifle-pack/sprint right.fbx',
  RIFLE_SPRINT_FORWARD_LEFT: '/models/weapons/rifle-pack/sprint forward left.fbx',
  RIFLE_SPRINT_FORWARD_RIGHT: '/models/weapons/rifle-pack/sprint forward right.fbx',
  RIFLE_SPRINT_BACKWARD_LEFT: '/models/weapons/rifle-pack/sprint backward left.fbx',
  RIFLE_SPRINT_BACKWARD_RIGHT: '/models/weapons/rifle-pack/sprint backward right.fbx',
  
  // Crouch animations
  RIFLE_CROUCH_IDLE: '/models/weapons/rifle-pack/idle crouching.fbx',
  RIFLE_CROUCH_IDLE_AIM: '/models/weapons/rifle-pack/idle crouching aiming.fbx',
  RIFLE_CROUCH_WALK_FORWARD: '/models/weapons/rifle-pack/walk crouching forward.fbx',
  RIFLE_CROUCH_WALK_BACKWARD: '/models/weapons/rifle-pack/walk crouching backward.fbx',
  RIFLE_CROUCH_WALK_LEFT: '/models/weapons/rifle-pack/walk crouching left.fbx',
  RIFLE_CROUCH_WALK_RIGHT: '/models/weapons/rifle-pack/walk crouching right.fbx',
  RIFLE_CROUCH_WALK_FORWARD_LEFT: '/models/weapons/rifle-pack/walk crouching forward left.fbx',
  RIFLE_CROUCH_WALK_FORWARD_RIGHT: '/models/weapons/rifle-pack/walk crouching forward right.fbx',
  RIFLE_CROUCH_WALK_BACKWARD_LEFT: '/models/weapons/rifle-pack/walk crouching backward left.fbx',
  RIFLE_CROUCH_WALK_BACKWARD_RIGHT: '/models/weapons/rifle-pack/walk crouching backward right.fbx',
  
  // Shooting
  RIFLE_SHOOTING: '/models/animations/rifle-shooting.fbx',
};

export function useRifleAnimations() {
  const [animations, setAnimations] = useState<AnimationClip[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loader = new FBXLoader();
    let mounted = true;

    setLoading(true);

    const loadAnimations = async () => {
      try {
        const loadedAnims: AnimationClip[] = [];

        // Charger toutes les animations
        for (const [name, path] of Object.entries(RIFLE_ANIMATION_FILES)) {
          try {
            const fbx = await new Promise<Group>((resolve, reject) => {
              loader.load(path, (fbx) => resolve(fbx), undefined, (error) => reject(error));
            });

            if (fbx.animations?.[0]) {
              const clip = fbx.animations[0].clone();
              clip.name = name;

              // Filtrer les positions pour les animations de mouvement (in-place)
              if (name.includes('WALK') || name.includes('RUN') || name.includes('SPRINT')) {
                clip.tracks = clip.tracks.filter(track => !track.name.includes('.position'));
              }

              loadedAnims.push(clip);
            }
          } catch (error) {
            // Silent fail for missing animation files
          }
        }

        if (!mounted) return;

        setAnimations(loadedAnims);
        setLoading(false);
      } catch (error) {
        console.error('❌ Error loading rifle animations:', error);
        setLoading(false);
      }
    };

    loadAnimations();

    return () => {
      mounted = false;
    };
  }, []);

  return { animations, loading };
}
