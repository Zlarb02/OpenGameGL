/**
 * Composant pour afficher l'icône d'une action
 * S'adapte automatiquement au périphérique détecté
 */

import React from 'react';
import { GameAction } from '../actions/ActionDefinitions';
import { useInput } from '../core/InputContext';
import { getActionIcon, getActionLabel } from './InputIconMap';

interface InputIconProps {
  action: GameAction;
  size?: number | string;
  className?: string;
  showLabel?: boolean;
  fallbackToText?: boolean; // Afficher du texte si pas d'icône
}

/**
 * Composant d'icône d'input
 */
export function InputIcon({
  action,
  size = 32,
  className = '',
  showLabel = false,
  fallbackToText = true,
}: InputIconProps) {
  const { activeDevice } = useInput();

  // Obtenir le chemin de l'icône
  const icon = getActionIcon(
    action,
    activeDevice.type,
    activeDevice.gamepadType,
    activeDevice.keyboardLayout
  );

  // Obtenir le label texte
  const label = getActionLabel(
    action,
    activeDevice.type,
    activeDevice.gamepadType,
    activeDevice.keyboardLayout
  );

  // Si pas d'icône, afficher du texte
  if (!icon) {
    if (fallbackToText) {
      return (
        <span
          className={`inline-flex items-center justify-center font-bold bg-gray-800 text-white rounded px-2 py-1 ${className}`}
          style={{
            minWidth: typeof size === 'number' ? `${size}px` : size,
            minHeight: typeof size === 'number' ? `${size}px` : size,
            fontSize: typeof size === 'number' ? `${size * 0.5}px` : '1rem',
          }}
        >
          {label}
        </span>
      );
    }
    return null;
  }

  return (
    <div className={`inline-flex flex-col items-center gap-1 ${className}`}>
      <img
        src={icon.path}
        alt={icon.alt}
        style={{
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        className="object-contain"
      />
      {showLabel && (
        <span className="text-xs text-gray-300 font-medium">{label}</span>
      )}
    </div>
  );
}

/**
 * Composant pour afficher une combinaison d'actions
 * Ex: "L1 + R1" pour freelook
 */
interface InputComboProps {
  actions: GameAction[];
  separator?: string;
  size?: number;
  className?: string;
}

export function InputCombo({
  actions,
  separator = '+',
  size = 32,
  className = '',
}: InputComboProps) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {actions.map((action, index) => (
        <React.Fragment key={action}>
          {index > 0 && (
            <span className="text-white font-bold text-lg">{separator}</span>
          )}
          <InputIcon action={action} size={size} />
        </React.Fragment>
      ))}
    </div>
  );
}

/**
 * Composant pour afficher une aide contextuelle
 * Ex: [E] Ramasser
 */
interface InputPromptProps {
  action: GameAction;
  text: string;
  size?: number;
  className?: string;
}

export function InputPrompt({
  action,
  text,
  size = 28,
  className = '',
}: InputPromptProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg ${className}`}
    >
      <InputIcon action={action} size={size} fallbackToText />
      <span className="text-white font-medium text-sm">{text}</span>
    </div>
  );
}

/**
 * Liste d'aides (ex: dans un menu pause)
 */
interface InputHelpListProps {
  items: Array<{ action: GameAction; description: string }>;
  size?: number;
  className?: string;
}

export function InputHelpList({
  items,
  size = 28,
  className = '',
}: InputHelpListProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {items.map(({ action, description }) => (
        <div
          key={action}
          className="flex items-center gap-3 text-white"
        >
          <div className="w-12 flex justify-center">
            <InputIcon action={action} size={size} fallbackToText />
          </div>
          <span className="text-sm">{description}</span>
        </div>
      ))}
    </div>
  );
}
