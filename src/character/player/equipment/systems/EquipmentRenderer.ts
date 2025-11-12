/**
 * Equipment Renderer
 * Manages loading and rendering equipment models
 */

import { Object3D } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Equipment } from '../types/EquipmentTypes';

/**
 * Manages loading and rendering equipment models
 */
export class EquipmentRenderer {
  private modelCache: Map<string, Object3D> = new Map();
  private loadingPromises: Map<string, Promise<Object3D>> = new Map();
  private loader: GLTFLoader;

  constructor() {
    this.loader = new GLTFLoader();
  }

  /**
   * Load equipment model
   */
  async loadModel(equipment: Equipment): Promise<Object3D | null> {
    // Check category-specific model path
    let modelPath: string | undefined;

    if ('modelPath' in equipment && equipment.modelPath) {
      modelPath = equipment.modelPath;
    }

    if (!modelPath) {
      console.warn(`[EquipmentRenderer] No model path for equipment: ${equipment.id}`);
      return null;
    }

    // Return cached model (cloned)
    if (this.modelCache.has(modelPath)) {
      const cached = this.modelCache.get(modelPath)!;
      return cached.clone();
    }

    // Return existing loading promise
    if (this.loadingPromises.has(modelPath)) {
      const model = await this.loadingPromises.get(modelPath)!;
      return model.clone();
    }

    // Load new model
    const loadPromise = this.loadGLTF(modelPath);
    this.loadingPromises.set(modelPath, loadPromise);

    try {
      const model = await loadPromise;
      this.modelCache.set(modelPath, model);
      this.loadingPromises.delete(modelPath);
      console.log(`[EquipmentRenderer] Loaded model: ${modelPath}`);
      return model.clone();
    } catch (error) {
      console.error(`[EquipmentRenderer] Failed to load model: ${modelPath}`, error);
      this.loadingPromises.delete(modelPath);
      return null;
    }
  }

  /**
   * Load GLTF/GLB model
   */
  private async loadGLTF(path: string): Promise<Object3D> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => {
          // Configure shadows
          gltf.scene.traverse((child) => {
            if ('castShadow' in child) {
              (child as any).castShadow = true;
              (child as any).receiveShadow = true;
            }
          });
          resolve(gltf.scene);
        },
        undefined,
        reject
      );
    });
  }

  /**
   * Preload multiple equipment models
   */
  async preloadModels(equipment: Equipment[]): Promise<void> {
    const promises = equipment.map(eq => this.loadModel(eq));
    await Promise.allSettled(promises);
    console.log(`[EquipmentRenderer] Preloaded ${equipment.length} models`);
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.modelCache.clear();
    this.loadingPromises.clear();
    console.log('[EquipmentRenderer] Cache cleared');
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      cached: this.modelCache.size,
      loading: this.loadingPromises.size,
    };
  }
}
