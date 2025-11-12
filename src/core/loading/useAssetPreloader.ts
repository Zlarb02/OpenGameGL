/**
 * useAssetPreloader
 * React hook for preloading assets with progress tracking
 */

import { useState, useEffect } from 'react';
import { assetPreloader, LoadProgress } from './AssetPreloader';

interface PreloadState {
  loading: boolean;
  progress: number;
  message: string;
  error: Error | null;
  ready: boolean;
}

export function useAssetPreloader(modelPath: string) {
  const [state, setState] = useState<PreloadState>({
    loading: true,
    progress: 0,
    message: 'Initializing...',
    error: null,
    ready: false,
  });

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        await assetPreloader.preloadAll(modelPath, (progress: LoadProgress) => {
          if (!mounted) return;

          setState({
            loading: true,
            progress: progress.percentage,
            message: `Loading ${progress.currentAsset || 'assets'}...`,
            error: null,
            ready: false,
          });
        });

        if (!mounted) return;

        // Mark as ready - character will continue loading in background
        setState({
          loading: false,
          progress: 100,
          message: 'Ready!',
          error: null,
          ready: true,
        });
      } catch (error) {
        if (!mounted) return;

        console.error('[useAssetPreloader] Failed to preload assets:', error);
        setState({
          loading: false,
          progress: 0,
          message: 'Failed to load assets',
          error: error as Error,
          ready: false,
        });
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [modelPath]);

  return state;
}
