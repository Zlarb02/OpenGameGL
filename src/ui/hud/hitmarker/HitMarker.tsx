import { useEffect, useState } from 'react';
import { HitMarkerData, HIT_MARKER_COLORS } from './HitMarkerTypes';
import './HitMarker.css';

interface HitMarkerProps {
  marker: HitMarkerData;
}

/**
 * Individual hit marker - X shape animated around crosshair
 */
export function HitMarker({ marker }: HitMarkerProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const colors = HIT_MARKER_COLORS[marker.targetType];
  const color = marker.isKill ? colors.kill : colors.normal;

  return (
    <div
      className={`hit-marker ${visible ? 'visible' : ''}`}
      style={{ '--hit-marker-color': color } as React.CSSProperties}
    >
      {/* Top-left diagonal */}
      <div className="hit-marker-line hit-marker-tl" />

      {/* Top-right diagonal */}
      <div className="hit-marker-line hit-marker-tr" />

      {/* Bottom-left diagonal */}
      <div className="hit-marker-line hit-marker-bl" />

      {/* Bottom-right diagonal */}
      <div className="hit-marker-line hit-marker-br" />
    </div>
  );
}
