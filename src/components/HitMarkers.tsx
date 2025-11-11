import { useHitDetection } from '../contexts/HitDetectionContext';
import { useWeaponState } from '../hooks/useWeaponState';

export function HitMarkers() {
  const { hitMarkers } = useHitDetection();
  const { weaponEquipped } = useWeaponState();

  if (!weaponEquipped) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-20">
      {hitMarkers.map((marker) => {
        // Calculate age for fade-out animation
        const age = Date.now() - marker.timestamp;
        const maxAge = 1000; // 1 second
        const opacity = Math.max(0, 1 - age / maxAge);
        const scale = 1 + (age / maxAge) * 0.3; // Slightly grow as it fades

        // Position (screen coordinates, 0-1 normalized)
        const x = (marker.position?.x ?? 0.5) * 100;
        const y = (marker.position?.y ?? 0.5) * 100;

        return (
          <div
            key={marker.timestamp}
            className="absolute"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: `translate(-50%, -50%) scale(${scale})`,
              opacity,
              transition: 'opacity 0.1s ease-out, transform 0.1s ease-out'
            }}
          >
            {marker.type === 'HIT' && (
              <div className="text-white font-bold text-xl tracking-wider drop-shadow-lg">
                <span className="text-red-400">✕</span> HIT
              </div>
            )}
            {marker.type === 'KILL' && (
              <div className="text-white font-bold text-2xl tracking-wider drop-shadow-lg">
                <span className="text-red-600">☠</span> KILL
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
