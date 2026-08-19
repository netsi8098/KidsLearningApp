/**
 * WorldPlate — renders a painted world layer if its file exists.
 *
 * Probes the asset and renders nothing until it is confirmed available, so the
 * code-built layer underneath stays visible when art has not been produced yet.
 * That makes the code worlds the fallback rather than a thing to tear out.
 */
import { useEffect, useState } from 'react';
import { worldAssetPath, LAYER_PLACEMENT, type WorldLayerKey } from './worldAssets';

export interface WorldPlateProps {
  theme: string;
  layer: WorldLayerKey;
  /** object-fit for the plate; scenery usually wants cover. */
  fit?: 'cover' | 'contain';
  /** Called once availability is known, so a world can hide its code layer. */
  onResolved?: (available: boolean) => void;
}

export default function WorldPlate({ theme, layer, fit = 'cover', onResolved }: WorldPlateProps) {
  const src = worldAssetPath(theme, layer);
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => { if (!cancelled) { setAvailable(true); onResolved?.(true); } };
    img.onerror = () => { if (!cancelled) { setAvailable(false); onResolved?.(false); } };
    img.src = src;
    return () => { cancelled = true; };
  }, [src, onResolved]);

  if (!available) return null;

  const place = LAYER_PLACEMENT[layer];
  return (
    <div className={`${place.className} pointer-events-none overflow-hidden`} style={{ zIndex: place.zIndex }} aria-hidden="true">
      <img src={src} alt="" className="w-full h-full" style={{ objectFit: fit }} draggable={false} />
    </div>
  );
}

/**
 * Convenience: returns whether a painted plate exists for a layer, so a world
 * can skip drawing its code equivalent when real art is present.
 */
export function useWorldPlate(theme: string, layer: WorldLayerKey): boolean | null {
  const src = worldAssetPath(theme, layer);
  const [available, setAvailable] = useState<boolean | null>(null);
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => !cancelled && setAvailable(true);
    img.onerror = () => !cancelled && setAvailable(false);
    img.src = src;
    return () => { cancelled = true; };
  }, [src]);
  return available;
}
