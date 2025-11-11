import { useEffect, useState } from 'react';
import { AnimationClip, Group } from 'three';
import { FBXLoader } from 'three-stdlib';

export const useXBotAnimations = () => {
  const [idleAnim, setIdleAnim] = useState<AnimationClip | null>(null);
  const [walkAnim, setWalkAnim] = useState<AnimationClip | null>(null);
  const [runAnim, setRunAnim] = useState<AnimationClip | null>(null);
  const [jumpAnim, setJumpAnim] = useState<AnimationClip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loader = new FBXLoader();
    let mounted = true;

    const loadAnimations = async () => {
      try {
        console.log('🤖 Loading X Bot animations...');
        
        // Charger idle.fbx
        const idleFbx = await new Promise<Group>((resolve, reject) => {
          loader.load(
            '/models/xbot/idle.fbx',
            (fbx) => resolve(fbx),
            undefined,
            (error) => reject(error)
          );
        });

        // Charger walking.fbx
        const walkFbx = await new Promise<Group>((resolve, reject) => {
          loader.load(
            '/models/xbot/walking.fbx',
            (fbx) => resolve(fbx),
            undefined,
            (error) => reject(error)
          );
        });

        // Charger standard run.fbx
        const runFbx = await new Promise<Group>((resolve, reject) => {
          loader.load(
            '/models/xbot/standard run.fbx',
            (fbx) => resolve(fbx),
            undefined,
            (error) => reject(error)
          );
        });

        // Charger jump.fbx
        const jumpFbx = await new Promise<Group>((resolve, reject) => {
          loader.load(
            '/models/xbot/jump.fbx',
            (fbx) => resolve(fbx),
            undefined,
            (error) => reject(error)
          );
        });

        if (!mounted) return;

        if (idleFbx.animations?.[0]) {
          const clip = idleFbx.animations[0].clone();
          clip.name = 'IDLE';
          setIdleAnim(clip);
          console.log('✅ Idle animation loaded');
        }

        if (walkFbx.animations?.[0]) {
          const clip = walkFbx.animations[0].clone();
          clip.name = 'WALK';
          setWalkAnim(clip);
          console.log('✅ Walk animation loaded');
        }

        if (runFbx.animations?.[0]) {
          const clip = runFbx.animations[0].clone();
          clip.name = 'RUN';
          setRunAnim(clip);
          console.log('✅ Run animation loaded');
        }

        if (jumpFbx.animations?.[0]) {
          const clip = jumpFbx.animations[0].clone();
          clip.name = 'JUMP';
          setJumpAnim(clip);
          console.log('✅ Jump animation loaded');
        }

        setLoading(false);
      } catch (error) {
        console.error('❌ Error loading X Bot animations:', error);
        setLoading(false);
      }
    };

    loadAnimations();

    return () => {
      mounted = false;
    };
  }, []);

  return { idleAnim, walkAnim, runAnim, jumpAnim, loading };
};
