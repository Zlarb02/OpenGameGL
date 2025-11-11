/**
 * Composant de prompt d'interaction contextuel
 * Affiche dynamiquement la bonne touche/bouton selon le périphérique actif
 */

import React from 'react';
import { InputPrompt, GameAction } from '../systems/input';

interface InteractPromptProps {
  visible: boolean;
  text: string;
  action?: GameAction;
}

/**
 * Affiche un prompt flottant pour les interactions
 */
export function InteractPrompt({
  visible,
  text,
  action = GameAction.USE,
}: InteractPromptProps) {
  if (!visible) return null;

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 mt-32">
      <InputPrompt action={action} text={text} size={32} />
    </div>
  );
}
