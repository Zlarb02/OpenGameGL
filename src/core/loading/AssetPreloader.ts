/**
 * AssetPreloader
 * Preloads critical assets to prevent T-pose and improve initial experience
 */

import { FBXLoader, GLTFLoader } from 'three-stdlib';
import { Group, AnimationClip } from 'three';

export interface PreloadedAsset {
  model?: Group;
  animations?: AnimationClip[];
}

export interface LoadProgress {
  loaded: number;
  total: number;
  percentage: number;
  currentAsset?: string;
}

export type ProgressCallback = (progress: LoadProgress) => void;

export class AssetPreloader {
  private fbxLoader = new FBXLoader();
  private gltfLoader = new GLTFLoader();
  private loadedAssets = new Map<string, PreloadedAsset>();

  /**
   * Preload character model and base animations
   */
  async preloadCharacter(
    modelPath: string,
    onProgress?: ProgressCallback
  ): Promise<void> {
    const animationPaths = [
      '/models/characters/xbot/idle-new.fbx',
      '/models/characters/xbot/walking.fbx',
      '/models/characters/xbot/standard run.fbx',
      '/models/characters/xbot/falling-idle.fbx',
      '/models/characters/xbot/falling-to-landing.fbx',
    ];

    const total = 1 + animationPaths.length; // model + animations
    let loaded = 0;

    const updateProgress = (assetName: string) => {
      loaded++;
      if (onProgress) {
        onProgress({
          loaded,
          total,
          percentage: (loaded / total) * 100,
          currentAsset: assetName,
        });
      }
    };

    try {
      // Load model
      const model = await this.loadModel(modelPath);
      this.loadedAssets.set(modelPath, { model });
      updateProgress('Character Model');

      // Load animations
      const animations: AnimationClip[] = [];
      for (const animPath of animationPaths) {
        const animModel = await this.loadModel(animPath);
        if (animModel.animations?.[0]) {
          animations.push(animModel.animations[0]);
        }
        updateProgress(this.getAssetName(animPath));
      }

      // Store all animations with model
      this.loadedAssets.set(modelPath, { model, animations });

      console.log('[AssetPreloader] Character preloaded:', modelPath);
    } catch (error) {
      console.error('[AssetPreloader] Failed to preload character:', error);
      throw error;
    }
  }

  /**
   * Preload TPS/weapon animations
   */
  async preloadTPSAnimations(onProgress?: ProgressCallback): Promise<void> {
    const tpsAnimationPaths = [
      '/models/characters/xbot/tps-rifle/rifle-idle.fbx',
      '/models/characters/xbot/tps-rifle/rifle-walk-forward.fbx',
      '/models/characters/xbot/tps-rifle/rifle-walk-backward.fbx',
      '/models/characters/xbot/tps-rifle/rifle-walk-left.fbx',
      '/models/characters/xbot/tps-rifle/rifle-walk-right.fbx',
      '/models/characters/xbot/tps-rifle/rifle-run-forward.fbx',
      '/models/characters/xbot/tps-rifle/rifle-run-backward.fbx',
      '/models/characters/xbot/tps-rifle/rifle-run-left.fbx',
      '/models/characters/xbot/tps-rifle/rifle-run-right.fbx',
      '/models/characters/xbot/tps-rifle/rifle-aiming-idle.fbx',
      '/models/characters/xbot/tps-rifle/rifle-shoot.fbx',
      '/models/characters/xbot/tps-rifle/rifle-reload.fbx',
      '/models/characters/xbot/tps-rifle/rifle-crouch-idle.fbx',
      '/models/characters/xbot/tps-rifle/rifle-crouch-walk.fbx',
    ];

    const total = tpsAnimationPaths.length;
    let loaded = 0;

    const updateProgress = (assetName: string) => {
      loaded++;
      if (onProgress) {
        onProgress({
          loaded,
          total,
          percentage: (loaded / total) * 100,
          currentAsset: assetName,
        });
      }
    };

    const animations: AnimationClip[] = [];

    // Load animations with error handling - don't fail if some are missing
    for (const animPath of tpsAnimationPaths) {
      try {
        const animModel = await this.loadModel(animPath);
        if (animModel.animations?.[0]) {
          animations.push(animModel.animations[0]);
        }
        updateProgress(this.getAssetName(animPath));
      } catch (error) {
        console.warn(`[AssetPreloader] Failed to load TPS animation: ${animPath}`, error);
        // Continue loading other animations
        updateProgress(this.getAssetName(animPath));
      }
    }

    this.loadedAssets.set('tps-animations', { animations });

    console.log(`[AssetPreloader] TPS animations preloaded (${animations.length}/${total})`);
  }

  /**
   * Preload all critical assets
   */
  async preloadAll(
    modelPath: string,
    onProgress?: ProgressCallback
  ): Promise<void> {
    // Only preload character model and base animations
    // Layer-specific animations will load on-demand when layers initialize
    await this.preloadCharacter(modelPath, onProgress);

    console.log('[AssetPreloader] All assets preloaded');
  }

  /**
   * Get preloaded asset
   */
  getAsset(path: string): PreloadedAsset | undefined {
    return this.loadedAssets.get(path);
  }

  /**
   * Check if asset is preloaded
   */
  isPreloaded(path: string): boolean {
    return this.loadedAssets.has(path);
  }

  /**
   * Clear all preloaded assets
   */
  clear(): void {
    this.loadedAssets.clear();
  }

  /**
   * Load a model (FBX or GLB)
   */
  private async loadModel(path: string): Promise<Group> {
    if (path.endsWith('.glb') || path.endsWith('.gltf')) {
      return new Promise((resolve, reject) => {
        this.gltfLoader.load(
          path,
          (gltf) => resolve(gltf.scene),
          undefined,
          reject
        );
      });
    } else {
      return new Promise((resolve, reject) => {
        this.fbxLoader.load(
          path,
          (fbx) => resolve(fbx),
          undefined,
          reject
        );
      });
    }
  }

  /**
   * Extract readable asset name from path
   */
  private getAssetName(path: string): string {
    const parts = path.split('/');
    const filename = parts[parts.length - 1];
    return filename.replace('.fbx', '').replace('.glb', '').replace('-', ' ');
  }
}

// Singleton instance
export const assetPreloader = new AssetPreloader();
