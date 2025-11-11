/**
 * Hook Leva pour configurer les options d'input
 */

import { useControls } from 'leva';
import { useInput } from '../systems/input';
import { useEffect, useRef } from 'react';
import { createSectionControls } from '../utils/levaSectionManager';

export function useInputControls() {
  const { options, setOptions, activeDevice } = useInput();

  const controls = useControls('Input Settings', {
    // Informations (lecture seule)
    deviceType: {
      value: activeDevice.type,
      label: 'Active Device',
      disabled: true,
    },
    gamepadType: {
      value: activeDevice.gamepadType || 'none',
      label: 'Gamepad Type',
      disabled: true,
    },
    keyboardLayout: {
      value: activeDevice.keyboardLayout || 'unknown',
      label: 'Keyboard Layout',
      disabled: true,
    },

    // Séparateur
    '---General---': { value: '---', disabled: true },

    autoDetectDevice: {
      value: options.autoDetectDevice,
      label: 'Auto-Detect Device',
    },

    // Séparateur
    '---Mouse Settings---': { value: '---', disabled: true },

    mouseSensitivity: {
      value: options.mouseSensitivity,
      min: 0.0001,
      max: 0.01,
      step: 0.0001,
      label: 'Mouse Sensitivity',
    },
    invertY: {
      value: options.invertY,
      label: 'Invert Y-Axis (Mouse)',
    },

    // Séparateur
    '---Gamepad Settings---': { value: '---', disabled: true },

    gamepadSensitivity: {
      value: options.gamepadSensitivity,
      min: 0.1,
      max: 3,
      step: 0.1,
      label: 'Gamepad Sensitivity',
    },
    gamepadInvertY: {
      value: options.gamepadInvertY,
      label: 'Invert Y-Axis (Gamepad)',
    },
    leftStickDeadzone: {
      value: options.leftStickDeadzone,
      min: 0,
      max: 0.5,
      step: 0.01,
      label: 'Left Stick Deadzone',
    },
    rightStickDeadzone: {
      value: options.rightStickDeadzone,
      min: 0,
      max: 0.5,
      step: 0.01,
      label: 'Right Stick Deadzone',
    },

    // Séparateur
    '---Behavior Modes---': { value: '---', disabled: true },

    sprintMode: {
      value: options.sprintMode,
      options: ['hold', 'toggle'],
      label: 'Sprint Mode',
    },
    crouchMode: {
      value: options.crouchMode,
      options: ['hold', 'toggle'],
      label: 'Crouch Mode',
    },
    freelookMode: {
      value: options.freelookMode,
      options: ['hold', 'toggle'],
      label: 'Freelook Mode',
    },
    aimMode: {
      value: options.aimMode,
      options: ['hold', 'toggle'],
      label: 'Aim Mode',
    },

    // Section controls
    ...createSectionControls('Input Settings', 'leva__Input Settings'),
  }, { collapsed: true });

  // Utiliser useRef pour éviter les mises à jour en boucle
  const prevControlsRef = useRef<string>();

  // Mettre à jour les options quand les contrôles changent
  useEffect(() => {
    const newOptions = {
      autoDetectDevice: controls.autoDetectDevice,
      mouseSensitivity: controls.mouseSensitivity,
      invertY: controls.invertY,
      gamepadSensitivity: controls.gamepadSensitivity,
      gamepadInvertY: controls.gamepadInvertY,
      leftStickDeadzone: controls.leftStickDeadzone,
      rightStickDeadzone: controls.rightStickDeadzone,
      sprintMode: controls.sprintMode as 'hold' | 'toggle',
      crouchMode: controls.crouchMode as 'hold' | 'toggle',
      freelookMode: controls.freelookMode as 'hold' | 'toggle',
      aimMode: controls.aimMode as 'hold' | 'toggle',
    };

    // Ne mettre à jour que si les valeurs ont vraiment changé
    const newControlsStr = JSON.stringify(newOptions);
    if (prevControlsRef.current !== newControlsStr) {
      prevControlsRef.current = newControlsStr;
      console.log('[InputControls] Options updated:', newOptions);
      setOptions(newOptions);
    }
  }, [
    controls.autoDetectDevice,
    controls.mouseSensitivity,
    controls.invertY,
    controls.gamepadSensitivity,
    controls.gamepadInvertY,
    controls.leftStickDeadzone,
    controls.rightStickDeadzone,
    controls.sprintMode,
    controls.crouchMode,
    controls.freelookMode,
    controls.aimMode,
    setOptions,
  ]);

  return controls;
}
