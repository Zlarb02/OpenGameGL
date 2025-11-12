import { useEffect, useRef } from 'react';
import { AnimationMixer, AnimationAction, AnimationClip, Group, LoopOnce } from 'three';
import { FBXLoader } from 'three-stdlib';

/**
 * Hook to play shooting animation as an overlay on upper body only
 * This prevents T-pose issues by filtering animation to upper body bones
 */
export function useShootingAnimation(
  model: Group | null,
  mixer: AnimationMixer | null,
  isShooting: boolean
) {
  const shootingActionRef = useRef<AnimationAction | null>(null);
  const shootingClipRef = useRef<AnimationClip | null>(null);
  const lastShootingState = useRef(false);

  // Load shooting animation once
  useEffect(() => {
    if (!model || !mixer) return;

    const loader = new FBXLoader();
    let mounted = true;

    loader.load('/models/animations/rifle-shooting.fbx', (fbx) => {
      if (!mounted || !fbx.animations[0]) return;

      const originalClip = fbx.animations[0];

      // Define upper body bones to keep
      const upperBodyBones = [
        'spine', 'spine1', 'spine2', 'neck', 'head',
        'leftshoulder', 'leftarm', 'leftforearm', 'lefthand',
        'rightshoulder', 'rightarm', 'rightforearm', 'righthand',
        'mixamorigspine', 'mixamorigspine1', 'mixamorigspine2',
        'mixamorigneck', 'mixamorighead', 'mixamorigheadtop_end',
        'mixamorigleftshoulder', 'mixamorigleftarm', 'mixamorigleftforearm', 'mixamoriglefthand',
        'mixamorigrightshoulder', 'mixamorigrightarm', 'mixamorigrightforearm', 'mixamorigrighthand'
      ];

      // Filter tracks to keep only upper body
      const filteredTracks = originalClip.tracks.filter(track => {
        const trackName = track.name.toLowerCase();
        return upperBodyBones.some(bone => trackName.includes(bone));
      });

      if (filteredTracks.length === 0) {
        console.warn('[ShootingAnimation] No upper body tracks found');
        return;
      }

      // Create filtered clip
      const filteredClip = originalClip.clone();
      filteredClip.tracks = filteredTracks;
      filteredClip.name = 'RIFLE_SHOOTING_OVERLAY';

      // Trim the animation: cut beginning and end for snappier feel
      // Original duration is usually ~1s, we want ~0.4-0.5s
      const originalDuration = filteredClip.duration;
      const trimStart = 0.15; // Cut 150ms from start
      const trimEnd = 0.25;   // Cut 250ms from end

      // Adjust the clip duration
      filteredClip.duration = originalDuration - trimStart - trimEnd;

      // Shift all keyframe times
      filteredClip.tracks.forEach(track => {
        const times = track.times;
        for (let i = 0; i < times.length; i++) {
          times[i] = Math.max(0, times[i] - trimStart);
        }
      });

      shootingClipRef.current = filteredClip;

      console.log(`[ShootingAnimation] Loaded with ${filteredTracks.length} upper body tracks, duration: ${filteredClip.duration.toFixed(2)}s`);
    });

    return () => {
      mounted = false;
    };
  }, [model, mixer]);

  // Play shooting animation when isShooting changes
  useEffect(() => {
    if (!mixer || !shootingClipRef.current || !model) return;

    // Detect shooting start (false -> true transition)
    if (isShooting && !lastShootingState.current) {
      // Stop previous action if exists
      if (shootingActionRef.current) {
        shootingActionRef.current.stop();
      }

      // Create and play new action
      const action = mixer.clipAction(shootingClipRef.current, model);
      action.reset();
      action.setLoop(LoopOnce, 1);
      action.clampWhenFinished = true;
      action.setEffectiveWeight(1);
      action.play();

      shootingActionRef.current = action;

      console.log('[ShootingAnimation] Playing shooting animation');

      // Auto-stop after animation duration
      const duration = shootingClipRef.current.duration * 1000;
      setTimeout(() => {
        if (shootingActionRef.current) {
          shootingActionRef.current.fadeOut(0.1);
        }
      }, duration);
    }

    lastShootingState.current = isShooting;
  }, [isShooting, mixer, model]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (shootingActionRef.current) {
        shootingActionRef.current.stop();
      }
    };
  }, []);
}
