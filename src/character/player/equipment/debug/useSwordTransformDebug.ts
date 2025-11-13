/**
 * Sword Transform Debug Menu
 * Real-time position/rotation adjustment for sword in back slots
 * Only overrides when debug is enabled
 */

import { useControls } from 'leva';
import { useEffect } from 'react';
import { WeaponTransformOverrides } from '../config/WeaponTransformOverrides';
import { WeaponType, EquipmentSlotType } from '../types/EquipmentTypes';
import { createSectionControls } from '../../../../utils/levaSectionManager';

export function useSwordTransformDebug() {
  const controls = useControls('⚔️ Debug - Sword', {
    enableSwordDebug: {
      value: false,
      label: '⚔️ Enable Sword Debug'
    },

    // === BACK LEFT ===
    swordBackLeftPosX: {
      value: 6.0,
      min: -20,
      max: 20,
      step: 0.1,
      label: 'Back Left - Pos X'
    },
    swordBackLeftPosY: {
      value: -13.2,
      min: -20,
      max: 20,
      step: 0.1,
      label: 'Back Left - Pos Y'
    },
    swordBackLeftPosZ: {
      value: -14.5,
      min: -20,
      max: 20,
      step: 0.1,
      label: 'Back Left - Pos Z'
    },
    swordBackLeftRotX: {
      value: -0.29,
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
      label: 'Back Left - Rot X (rad)'
    },
    swordBackLeftRotY: {
      value: -1.43,
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
      label: 'Back Left - Rot Y (rad)'
    },
    swordBackLeftRotZ: {
      value: 1.15,
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
      label: 'Back Left - Rot Z (rad)'
    },

    // === BACK RIGHT ===
    swordBackRightPosX: {
      value: -9.1,
      min: -20,
      max: 20,
      step: 0.1,
      label: 'Back Right - Pos X'
    },
    swordBackRightPosY: {
      value: -14.5,
      min: -20,
      max: 20,
      step: 0.1,
      label: 'Back Right - Pos Y'
    },
    swordBackRightPosZ: {
      value: -15.7,
      min: -20,
      max: 20,
      step: 0.1,
      label: 'Back Right - Pos Z'
    },
    swordBackRightRotX: {
      value: -2.88,
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
      label: 'Back Right - Rot X (rad)'
    },
    swordBackRightRotY: {
      value: 1.32,
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
      label: 'Back Right - Rot Y (rad)'
    },
    swordBackRightRotZ: {
      value: -1.74,
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
      label: 'Back Right - Rot Z (rad)'
    },

    // Scale (common for both)
    swordScale: {
      value: 80.0,
      min: 1,
      max: 200.0,
      step: 1,
      label: 'Scale'
    },

    // Section controls
    ...createSectionControls('Debug - Sword', 'leva__⚔️ Debug - Sword'),
  }, { collapsed: true });

  // ONLY update overrides when debug is ENABLED
  useEffect(() => {
    if (!controls.enableSwordDebug) return;

    // Back Left
    WeaponTransformOverrides.set(WeaponType.SWORD, EquipmentSlotType.BACK_LEFT, {
      position: [controls.swordBackLeftPosX, controls.swordBackLeftPosY, controls.swordBackLeftPosZ],
      rotation: [controls.swordBackLeftRotX, controls.swordBackLeftRotY, controls.swordBackLeftRotZ],
      scale: controls.swordScale,
    });

    // Back Right
    WeaponTransformOverrides.set(WeaponType.SWORD, EquipmentSlotType.BACK_RIGHT, {
      position: [controls.swordBackRightPosX, controls.swordBackRightPosY, controls.swordBackRightPosZ],
      rotation: [controls.swordBackRightRotX, controls.swordBackRightRotY, controls.swordBackRightRotZ],
      scale: controls.swordScale,
    });
  }, [
    controls.enableSwordDebug,
    controls.swordBackLeftPosX,
    controls.swordBackLeftPosY,
    controls.swordBackLeftPosZ,
    controls.swordBackLeftRotX,
    controls.swordBackLeftRotY,
    controls.swordBackLeftRotZ,
    controls.swordBackRightPosX,
    controls.swordBackRightPosY,
    controls.swordBackRightPosZ,
    controls.swordBackRightRotX,
    controls.swordBackRightRotY,
    controls.swordBackRightRotZ,
    controls.swordScale,
  ]);

  return controls;
}
