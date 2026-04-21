/**
 * LearningAsset — renders a generated image with emoji/SVG fallback.
 *
 * Priority: src (generated image) → emoji fallback → placeholder
 * Handles missing images gracefully — no broken icons, no layout shift.
 */
import { useState } from 'react';

interface LearningAssetProps {
  /** Path to generated asset (e.g. /assets/generated/objects/alphabet/apple_v1.webp) */
  src?: string;
  /** Emoji fallback if image is missing or fails to load */
  emoji?: string;
  /** Accessible alt text */
  alt: string;
  /** Size in pixels (used for width and height) */
  size?: number;
  /** Additional CSS classes */
  className?: string;
  /** Optional React node to render instead of emoji (e.g. an SVG component) */
  icon?: React.ReactNode;
}

export default function LearningAsset({
  src,
  emoji,
  alt,
  size = 80,
  className = '',
  icon,
}: LearningAssetProps) {
  const [imgError, setImgError] = useState(false);

  // If we have a valid src and it hasn't errored, show the image
  if (src && !imgError) {
    return (
      <div
        className={`flex items-center justify-center overflow-hidden ${className}`}
        style={{ width: size, height: size, aspectRatio: '1 / 1' }}
      >
        <img
          src={src}
          alt={alt}
          width={size}
          height={size}
          loading="lazy"
          className="w-full h-full object-contain"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Fallback: icon component → emoji → placeholder
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size, aspectRatio: '1 / 1' }}
      role="img"
      aria-label={alt}
    >
      {icon || (
        <span
          style={{ fontSize: size * 0.6 }}
          className="select-none"
          aria-hidden="true"
        >
          {emoji || '📦'}
        </span>
      )}
    </div>
  );
}
