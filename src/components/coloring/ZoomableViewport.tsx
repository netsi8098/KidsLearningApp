/**
 * ZoomableViewport — Wraps content in a pinch-to-zoom, drag-to-pan container.
 * Uses CSS transforms for visual zoom; provides coordinate transform helpers.
 *
 * On touch: pinch-to-zoom, two-finger pan.
 * On desktop: wheel/trackpad zoom, middle-click or space+drag pan.
 * Drawing tools work at any zoom via coordinate mapping in DrawingCanvas.
 */
import { useRef, useState, useCallback, useEffect, type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ZoomableViewportProps {
  children: ReactNode;
  /** Current zoom level — controlled by parent */
  zoom: number;
  onZoomChange: (zoom: number) => void;
  /** Pan offset in viewport pixels */
  panX: number;
  panY: number;
  onPanChange: (x: number, y: number) => void;
  minZoom?: number;
  maxZoom?: number;
}

export default function ZoomableViewport({
  children,
  zoom,
  onZoomChange,
  panX,
  panY,
  onPanChange,
  minZoom = 1,
  maxZoom = 5,
}: ZoomableViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isPinchingRef = useRef(false);
  const lastDistRef = useRef(0);
  const lastMidRef = useRef({ x: 0, y: 0 });

  // Wheel zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.002;
      const newZoom = Math.min(maxZoom, Math.max(minZoom, zoom + delta));
      onZoomChange(newZoom);
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [zoom, minZoom, maxZoom, onZoomChange]);

  // Touch pinch zoom + pan
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      isPinchingRef.current = true;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastDistRef.current = Math.hypot(dx, dy);
      lastMidRef.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && isPinchingRef.current) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const mid = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };

      // Zoom based on pinch distance change
      const scale = dist / lastDistRef.current;
      const newZoom = Math.min(maxZoom, Math.max(minZoom, zoom * scale));
      onZoomChange(newZoom);

      // Pan based on midpoint movement
      const panDx = mid.x - lastMidRef.current.x;
      const panDy = mid.y - lastMidRef.current.y;
      onPanChange(panX + panDx, panY + panDy);

      lastDistRef.current = dist;
      lastMidRef.current = mid;
    }
  }, [zoom, panX, panY, minZoom, maxZoom, onZoomChange, onPanChange]);

  const handleTouchEnd = useCallback(() => {
    isPinchingRef.current = false;
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isPinchingRef.current ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Zoom control buttons — floating glass UI */
export function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}) {
  const glass = { background: 'rgba(30,30,45,0.75)', backdropFilter: 'blur(12px)' };
  return (
    <div className="flex flex-col gap-1 p-1 rounded-xl" style={glass}>
      <motion.button
        className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer text-white/70"
        onClick={onZoomIn}
        whileTap={{ scale: 0.9 }}
        aria-label="Zoom in"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
      </motion.button>
      <motion.button
        className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer text-white/50 text-[9px] font-bold"
        onClick={onReset}
        whileTap={{ scale: 0.9 }}
        aria-label="Reset zoom"
      >
        {Math.round(zoom * 100)}%
      </motion.button>
      <motion.button
        className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer text-white/70"
        onClick={onZoomOut}
        whileTap={{ scale: 0.9 }}
        aria-label="Zoom out"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
      </motion.button>
    </div>
  );
}
