/**
 * Gestionnaire centralisé pour les objets interactibles
 * Permet d'enregistrer/désenregistrer des objets et de suivre l'objet sélectionné
 */

import { create } from 'zustand';
import { Object3D } from 'three';

export interface InteractableObject {
  id: string;
  object3D: Object3D;
  onInteract: () => void;
  interactionRange: number;
  rigidBodyRef?: React.RefObject<any>; // Optionnel : référence au RigidBody pour obtenir la vraie position
}

interface InteractableStore {
  // Map d'objets interactibles enregistrés
  interactables: Map<string, InteractableObject>;

  // Objet actuellement sélectionné au regard
  selectedId: string | null;
  selectedDistance: number | null; // Distance de l'objet sélectionné
  canInteract: boolean; // Est-ce qu'on peut interagir (assez proche)

  // Actions
  register: (interactable: InteractableObject) => void;
  unregister: (id: string) => void;
  setSelected: (id: string | null, distance?: number, canInteract?: boolean) => void;
  getSelected: () => InteractableObject | null;
  interact: () => void;
}

export const useInteractableStore = create<InteractableStore>((set, get) => ({
  interactables: new Map(),
  selectedId: null,
  selectedDistance: null,
  canInteract: false,

  register: (interactable: InteractableObject) => {
    set((state) => {
      const newInteractables = new Map(state.interactables);
      newInteractables.set(interactable.id, interactable);
      return { interactables: newInteractables };
    });
  },

  unregister: (id: string) => {
    set((state) => {
      const newInteractables = new Map(state.interactables);
      newInteractables.delete(id);
      return {
        interactables: newInteractables,
        selectedId: state.selectedId === id ? null : state.selectedId,
        selectedDistance: state.selectedId === id ? null : state.selectedDistance,
        canInteract: state.selectedId === id ? false : state.canInteract,
      };
    });
  },

  setSelected: (id: string | null, distance: number = 0, canInteract: boolean = false) => {
    set({ selectedId: id, selectedDistance: distance, canInteract });
  },

  getSelected: () => {
    const state = get();
    if (!state.selectedId) return null;
    return state.interactables.get(state.selectedId) || null;
  },

  interact: () => {
    const selected = get().getSelected();
    if (selected) {
      selected.onInteract();
    }
  }
}));
