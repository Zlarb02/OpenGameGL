import React from 'react';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, MathUtils, Group } from 'three';
import { CapsuleCollider, RigidBody, RapierRigidBody, useRapier } from '@react-three/rapier';
import { useCharacterControls } from '../hooks/useCharacterControls';
import { calculateMovement, createJumpImpulse, createFallForce, createMovementVelocity } from '../../core/physics/physics';
import { useMobileControls } from '../../ui/mobile/MobileControlsContext';
import { PlayerCharacter } from '../player/PlayerCharacter';
import { useWeaponState } from '../player/tps/weapons/useWeaponState';
import { useCharacterSelector } from '../hooks/useCharacterSelector';
import { useCharacterInput } from '../../core/input';
import { useCharacterTransform } from './CharacterTransformContext';

export type CharacterState = {
  moveSpeed: number;
  jumpForce: number;
  airControl: number;
  isGrounded: boolean;
  velocity: { x: number; y: number; z: number };
};

export const CharacterController = React.forwardRef<unknown>((_, ref) => {
  const rigidBody = useRef<RapierRigidBody>(null);
  const modelRef = useRef<Group>(null);
  const weaponState = useWeaponState();
  const { weaponEquipped, isCrouching, isAiming, isShooting, isReloading } = weaponState;
  const { rapier, world } = useRapier();
  const { isJumping: isMobileJumping, movement: mobileMovement } = useMobileControls();
  const input = useCharacterInput(); // Nouveau système d'input
  const { updateTransform } = useCharacterTransform();
  const [isSprinting, setIsSprinting] = useState(false);
  const prevPosition = useRef(new Vector3());
  const [isMoving, setIsMoving] = useState(false);
  const targetRotation = useRef(0);
  const currentRotation = useRef(0);
  const cameraAngle = useRef(0); // Store camera angle for movement calculation
  const cameraPhi = useRef(Math.PI / 2); // Store camera vertical angle for upper body aim
  const { modelYOffset, modelScale } = useCharacterSelector();
  const currentCrouchOffset = useRef(0); // Pour animer le crouch progressivement
  const [state, setState] = useState<CharacterState>({
    moveSpeed: 0,
    jumpForce: 0,
    airControl: 0,
    isGrounded: false,
    velocity: { x: 0, y: 0, z: 0 },
  });

  // Stocker les inputs pour les passer à PlayerCharacter
  const [movementInput, setMovementInput] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    jump: false
  });

  const controls = useCharacterControls();

  useFrame(() => {
    if (!rigidBody.current) return;

    // Cast multiple rays for better ground detection
    const translation = rigidBody.current.translation();
    const rayLength = 1.5; // Increased length for better detection
    const rayDir = { x: 0, y: -1, z: 0 };
    
    // Cast rays from multiple points around the character
    const rayOffsets = [
      { x: 0, z: 0 },      // Center
      { x: 0.3, z: 0 },    // Right
      { x: -0.3, z: 0 },   // Left
      { x: 0, z: 0.3 },    // Front
      { x: 0, z: -0.3 },   // Back
    ];
    
    let isGrounded = false;
    let closestHit = null;
    
    for (const offset of rayOffsets) {
      const ray = new rapier.Ray(
        { 
          x: translation.x + offset.x, 
          y: translation.y, 
          z: translation.z + offset.z 
        },
        rayDir
      );
      
      const hit = world.castRay(
        ray,
        rayLength,
        true,
        undefined,
        undefined,
        undefined,
        rigidBody.current
      );
      
      if (hit && (!closestHit || hit.timeOfImpact < closestHit.timeOfImpact)) {
        closestHit = hit;
        isGrounded = true;
      }
    }


    const shouldJump = input.jump || isMobileJumping;
    const linvel = rigidBody.current.linvel();
    const currentPos = new Vector3(
      translation.x,
      translation.y,
      translation.z
    );

    // Mettre à jour movementInput pour AnimatedModelRifle
    setMovementInput({
      forward: input.forward,
      backward: input.backward,
      left: input.left,
      right: input.right,
      sprint: input.sprint,
      jump: input.jump
    });

    // Update movement state - basé sur l'INPUT plutôt que la vitesse pour plus de réactivité
    const hasMovementInput = input.forward || input.backward || input.left || input.right ||
                            Math.abs(mobileMovement.x) > 0 || Math.abs(mobileMovement.y) > 0;
    const horizontalSpeed = Math.sqrt(linvel.x * linvel.x + linvel.z * linvel.z);

    // isMoving continue même en l'air pour garder l'animation de course pendant le saut
    setIsMoving(hasMovementInput && horizontalSpeed > 0.05);
    // Sprint désactivé en l'air ET en accroupi
    setIsSprinting(input.sprint && hasMovementInput && horizontalSpeed > 0.05 && isGrounded && !isCrouching);

    // Animer progressivement la position Y du crouch
    const targetCrouchOffset = isCrouching ? (isMoving ? -0.2 : -0.4) : 0;
    currentCrouchOffset.current = MathUtils.lerp(
      currentCrouchOffset.current,
      targetCrouchOffset,
      0.35 // Transition rapide
    );

    // Update rotation
    if (modelRef.current) {
      if (weaponEquipped) {
        // AVEC RIFLE: Rotation suit INSTANTANÉMENT la direction de la caméra
        // L'angle de la caméra (theta) représente sa rotation AUTOUR du personnage
        // Le personnage doit donc regarder dans la direction OPPOSÉE (+ PI)
        targetRotation.current = cameraAngle.current + Math.PI;

        // Rotation instantanée pour éviter tout pivotement de caméra
        currentRotation.current = targetRotation.current;
      } else {
        // SANS RIFLE: Rotation suit la direction de déplacement (locomotion classique)
        if (Math.abs(linvel.x) > 0.1 || Math.abs(linvel.z) > 0.1) {
          targetRotation.current = Math.atan2(linvel.x, linvel.z);
          
          // Normalize angle difference to ensure shortest rotation path
          let angleDiff = targetRotation.current - currentRotation.current;
          if (angleDiff > Math.PI) {
            angleDiff -= Math.PI * 2;
          } else if (angleDiff < -Math.PI) {
            angleDiff += Math.PI * 2;
          }
          targetRotation.current = currentRotation.current + angleDiff;
        }
        
        currentRotation.current = MathUtils.lerp(
          currentRotation.current,
          targetRotation.current,
          0.2
        );
      }

      modelRef.current.rotation.y = currentRotation.current;

      // Force model matrix update for synchronization with camera
      modelRef.current.updateMatrixWorld(true);
    }

    // Handle movement
    let movement = calculateMovement(
      {
        forward: input.forward,
        backward: input.backward,
        left: input.left,
        right: input.right,
        sprint: input.sprint
      }, 
      controls.moveSpeed
    );
    
    // Override keyboard movement with mobile joystick if active
    if (Math.abs(mobileMovement.x) > 0 || Math.abs(mobileMovement.y) > 0) {
      movement = {
        sprint: false,
        normalizedX: mobileMovement.x,
        normalizedZ: mobileMovement.y
      };
    }
    
    if (movement) {
      // Modificateurs de vitesse
      const sprintMultiplier = movement.sprint ? controls.sprintMultiplier : 1;
      const crouchMultiplier = isCrouching ? 0.5 : 1; // 50% de vitesse en accroupi
      const moveForce = controls.moveSpeed * (isGrounded ? 1 : controls.airControl) * crouchMultiplier;
      
      // Rotate movement based on camera angle (TPS style)
      const angle = cameraAngle.current;
      const rotatedX = movement.normalizedX * Math.cos(angle) + movement.normalizedZ * Math.sin(angle);
      const rotatedZ = -movement.normalizedX * Math.sin(angle) + movement.normalizedZ * Math.cos(angle);
      
      const velocity = createMovementVelocity(
        rotatedX,
        rotatedZ,
        moveForce * sprintMultiplier,
        linvel.y
      );

      rigidBody.current.setLinvel(velocity, true);
    } else if (isGrounded && !hasMovementInput) {
      // Freinage actif quand on lâche les touches au sol
      const brakingForce = 0.85; // Force de freinage (0.85 = conserve 15% de la vitesse)
      rigidBody.current.setLinvel(
        { x: linvel.x * brakingForce, y: linvel.y, z: linvel.z * brakingForce },
        true
      );
    }

    // Handle jumping
    if (shouldJump && isGrounded) {
      // Reset vertical velocity before jumping
      rigidBody.current.setLinvel(
        { x: linvel.x, y: 0, z: linvel.z },
        true
      );
      rigidBody.current.applyImpulse(
        createJumpImpulse(controls.jumpForce, { y: linvel.y }),
        true
      );
    }

    // Ground snapping
    if (isGrounded && !input.jump) {
      const snapForce = createFallForce(0.5);
      rigidBody.current.applyImpulse(snapForce, true);
    }
    
    // Store position for next frame
    if (isGrounded) {
      prevPosition.current.copy(currentPos);
    }

    setState({
      moveSpeed: controls.moveSpeed,
      jumpForce: controls.jumpForce,
      airControl: controls.airControl,
      isGrounded,
      velocity: linvel
    });

    // Update character transform for other systems (drop, etc.)
    updateTransform(currentPos, currentRotation.current);
  });

  // Update ref for camera
  React.useImperativeHandle(ref, () => ({
    position: {
      clone: () => {
        const translation = rigidBody.current?.translation();
        return new Vector3(
          translation?.x || 0,
          translation?.y || 0,
          translation?.z || 0
        );
      }
    },
    cameraAngle: cameraAngle,
    cameraPhi: cameraPhi
  }), []);

  return (
    <RigidBody
      ref={rigidBody}
      colliders={false}
      mass={10}
      position={[0, 6, 1]}
      enabledRotations={[false, false, false]}
      lockRotations
      gravityScale={3}
      friction={controls.friction}
      linearDamping={controls.linearDamping}
      angularDamping={controls.angularDamping}
      restitution={0}
      ccd={true}
      type="dynamic"
    >
      <CapsuleCollider args={[0.8, 0.4]} position={[0, 1.2, 0]} />
      <group
        ref={modelRef}
        position={[0, modelYOffset + currentCrouchOffset.current, 0]}
        scale={modelScale}
      >
        <PlayerCharacter
          isMoving={isMoving}
          isSprinting={isSprinting}
          isGrounded={state.isGrounded}
          movementInput={movementInput}
          characterRotation={currentRotation.current}
          cameraPhi={cameraPhi.current}
          velocity={state.velocity}
        />
      </group>
    </RigidBody>
  );
});