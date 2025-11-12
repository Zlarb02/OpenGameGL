import { useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

interface PerformanceData {
  fps: number;
  frameTime: number;
  triangles: number;
  geometries: number;
  textures: number;
  drawCalls: number;
}

// Shared state outside React for cross-boundary communication
let sharedStats: PerformanceData = {
  fps: 0,
  frameTime: 0,
  triangles: 0,
  geometries: 0,
  textures: 0,
  drawCalls: 0,
};

const listeners = new Set<() => void>();

function updateSharedStats(newStats: PerformanceData) {
  sharedStats = newStats;
  listeners.forEach(listener => listener());
}

function subscribeToStats(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Component that collects data INSIDE Canvas
export function PerformanceStatsCollector() {
  const { gl } = useThree();
  const frames: number[] = [];
  let lastTime = performance.now();

  useFrame(() => {
    const now = performance.now();
    const delta = now - lastTime;
    lastTime = now;

    // Calculer FPS (moyenne sur 60 frames)
    frames.push(1000 / delta);
    if (frames.length > 60) frames.shift();
    const avgFps = frames.reduce((a, b) => a + b, 0) / frames.length;

    // Récupérer les infos du renderer
    const info = gl.info;

    updateSharedStats({
      fps: Math.round(avgFps),
      frameTime: Math.round(delta * 10) / 10,
      triangles: info.render.triangles,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      drawCalls: info.render.calls,
    });
  });

  return null;
}

// Component that displays the UI OUTSIDE Canvas
export function PerformanceStats() {
  const [stats, setStats] = useState<PerformanceData>(sharedStats);
  const [visible, setVisible] = useState(true);

  // Subscribe to stats updates
  useEffect(() => {
    const unsubscribe = subscribeToStats(() => {
      setStats({ ...sharedStats });
    });
    return unsubscribe;
  }, []);

  // Toggle avec F3 (comme Minecraft)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F3') {
        e.preventDefault();
        setVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!visible) return null;

  // Couleur selon les FPS
  const getFpsColor = (fps: number) => {
    if (fps >= 60) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed top-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs font-mono p-3 rounded-lg shadow-lg pointer-events-none select-none space-y-1 z-50">
      <div className="font-bold text-sm mb-2 text-gray-300">Performance Stats</div>

      <div className="flex justify-between gap-4">
        <span className="text-gray-400">FPS:</span>
        <span className={`font-bold ${getFpsColor(stats.fps)}`}>{stats.fps}</span>
      </div>

      <div className="flex justify-between gap-4">
        <span className="text-gray-400">Frame Time:</span>
        <span className="text-blue-400">{stats.frameTime}ms</span>
      </div>

      <div className="border-t border-gray-700 my-2"></div>

      <div className="flex justify-between gap-4">
        <span className="text-gray-400">Triangles:</span>
        <span className="text-purple-400">{stats.triangles.toLocaleString()}</span>
      </div>

      <div className="flex justify-between gap-4">
        <span className="text-gray-400">Draw Calls:</span>
        <span className="text-purple-400">{stats.drawCalls}</span>
      </div>

      <div className="flex justify-between gap-4">
        <span className="text-gray-400">Geometries:</span>
        <span className="text-cyan-400">{stats.geometries}</span>
      </div>

      <div className="flex justify-between gap-4">
        <span className="text-gray-400">Textures:</span>
        <span className="text-cyan-400">{stats.textures}</span>
      </div>

      <div className="border-t border-gray-700 my-2"></div>

      <div className="text-gray-500 text-[10px] mt-2">Press F3 to toggle</div>
    </div>
  );
}
