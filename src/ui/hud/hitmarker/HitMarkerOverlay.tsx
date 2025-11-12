import { useHitMarker } from './HitMarkerContext';
import { HitMarker } from './HitMarker';

/**
 * Overlay that displays all active hit markers
 */
export function HitMarkerOverlay() {
  const { hitMarkers } = useHitMarker();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 1000
    }}>
      {hitMarkers.map(marker => (
        <HitMarker key={marker.id} marker={marker} />
      ))}
    </div>
  );
}
