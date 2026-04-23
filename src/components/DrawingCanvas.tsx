/**
 * DrawingCanvas — Layered canvas drawing component.
 *
 * Architecture (bottom → top):
 *   1. White paper background (CSS)
 *   2. Paint canvas — user strokes, fill, stickers (transparent bg)
 *   3. Template overlay canvas — line art (transparent bg, pointer-events: none)
 *
 * Eraser uses destination-out on paint layer only — template is never touched.
 * Undo/redo snapshots only the paint layer.
 * Save composites: white bg + paint + template overlay.
 * Clear resets paint to transparent — template stays.
 * Flood fill uses combined paint+template for boundary detection, applies to paint only.
 */
import { useRef, useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { type BrushId, type StickerDef, applyBrushStyle, drawGlitterAt, drawCrayonJitter } from './coloring/coloringTools';

export interface CanvasApi {
  undo: () => void;
  redo: () => void;
  clear: () => void;
  save: () => string | null;
  canUndo: boolean;
  canRedo: boolean;
}

interface DrawingCanvasProps {
  width?: number;
  height?: number;
  templateSvg?: string;
  tool: 'brush' | 'eraser' | 'fill' | 'stamp';
  brush: BrushId;
  color: string;
  brushSize: number;
  brushOpacity: number;
  activeSticker?: StickerDef | null;
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
  onSave?: (dataUrl: string) => void;
}

const MAX_UNDO = 30;

const DrawingCanvas = forwardRef<CanvasApi, DrawingCanvasProps>(function DrawingCanvas(
  { width = 350, height = 450, templateSvg, tool, brush, color, brushSize, brushOpacity, activeSticker, onHistoryChange, onSave },
  ref
) {
  // Paint layer — user strokes, fill, stickers
  const paintRef = useRef<HTMLCanvasElement>(null);
  // Template overlay — line art, never modified after init
  const templateRef = useRef<HTMLCanvasElement>(null);
  // Interaction container for pointer position calc
  const containerRef = useRef<HTMLDivElement>(null);

  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const strokeIndexRef = useRef(0);
  // Cache template ImageData for flood fill boundary detection
  const templateDataRef = useRef<ImageData | null>(null);

  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);

  useEffect(() => {
    onHistoryChange?.(undoStack.length > 1, redoStack.length > 0);
  }, [undoStack.length, redoStack.length, onHistoryChange]);

  // ── Initialize canvases ──────────────────────────────────
  useEffect(() => {
    const paint = paintRef.current;
    const tmpl = templateRef.current;
    if (!paint || !tmpl) return;

    // Set internal resolution
    paint.width = width;
    paint.height = height;
    tmpl.width = width;
    tmpl.height = height;

    // Paint starts fully transparent
    const pCtx = paint.getContext('2d')!;
    pCtx.clearRect(0, 0, width, height);

    // Template starts transparent
    const tCtx = tmpl.getContext('2d')!;
    tCtx.clearRect(0, 0, width, height);

    // Always initialize undo stack immediately (don't wait for async image loads)
    const initial = pCtx.getImageData(0, 0, width, height);
    setUndoStack([initial]);
    setRedoStack([]);
    templateDataRef.current = null;


    if (templateSvg) {
      // Create outline-only version for the visible overlay (no white fills blocking paint)
      const outlineSvg = templateSvg
        .replace(/fill\s*=\s*"#fff"/gi, 'fill="none"')
        .replace(/fill\s*=\s*"#ffffff"/gi, 'fill="none"')
        .replace(/fill\s*=\s*"white"/gi, 'fill="none"');

      // Render outline-only on the visible overlay canvas
      const outlineImg = new Image();
      const outlineBlob = new Blob([outlineSvg], { type: 'image/svg+xml' });
      const outlineUrl = URL.createObjectURL(outlineBlob);
      outlineImg.onload = () => {
        tCtx.drawImage(outlineImg, 0, 0, width, height);
        URL.revokeObjectURL(outlineUrl);
      };
      outlineImg.src = outlineUrl;

      // Render full template into temp canvas for fill boundary detection
      const fullImg = new Image();
      const fullBlob = new Blob([templateSvg], { type: 'image/svg+xml' });
      const fullUrl = URL.createObjectURL(fullBlob);
      fullImg.onload = () => {
        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = width;
        tmpCanvas.height = height;
        const tmpCtx = tmpCanvas.getContext('2d')!;
        tmpCtx.drawImage(fullImg, 0, 0, width, height);
        URL.revokeObjectURL(fullUrl);
        templateDataRef.current = tmpCtx.getImageData(0, 0, width, height);
      };
      fullImg.src = fullUrl;
    }
  }, [width, height, templateSvg]);

  // ── History helpers ──────────────────────────────────────
  const savePaintState = useCallback(() => {
    const paint = paintRef.current;
    if (!paint) return;
    const ctx = paint.getContext('2d');
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, paint.width, paint.height);
    setUndoStack((prev) => {
      const next = [...prev, imageData];
      return next.length > MAX_UNDO ? next.slice(next.length - MAX_UNDO) : next;
    });
    setRedoStack([]);
  }, []);

  const handleUndo = useCallback(() => {
    if (undoStack.length <= 1) return;
    const paint = paintRef.current;
    if (!paint) return;
    const ctx = paint.getContext('2d');
    if (!ctx) return;
    const current = undoStack[undoStack.length - 1];
    const prev = undoStack[undoStack.length - 2];
    setRedoStack((r) => [...r, current]);
    setUndoStack((u) => u.slice(0, -1));
    ctx.putImageData(prev, 0, 0);
  }, [undoStack]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const paint = paintRef.current;
    if (!paint) return;
    const ctx = paint.getContext('2d');
    if (!ctx) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((u) => [...u, next]);
    setRedoStack((r) => r.slice(0, -1));
    ctx.putImageData(next, 0, 0);
  }, [redoStack]);

  // Clear paint layer only — template stays
  const handleClear = useCallback(() => {
    const paint = paintRef.current;
    if (!paint) return;
    const ctx = paint.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, paint.width, paint.height);
    savePaintState();
  }, [savePaintState]);

  // Composite save: white bg + paint + template
  const handleSave = useCallback((): string | null => {
    const paint = paintRef.current;
    const tmpl = templateRef.current;
    if (!paint) return null;

    const comp = document.createElement('canvas');
    comp.width = width;
    comp.height = height;
    const ctx = comp.getContext('2d')!;

    // 1. White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    // 2. Paint layer
    ctx.drawImage(paint, 0, 0);
    // 3. Template overlay
    if (tmpl) ctx.drawImage(tmpl, 0, 0);

    const dataUrl = comp.toDataURL('image/png');
    onSave?.(dataUrl);
    return dataUrl;
  }, [width, height, onSave]);

  useImperativeHandle(ref, () => ({
    undo: handleUndo,
    redo: handleRedo,
    clear: handleClear,
    save: handleSave,
    get canUndo() { return undoStack.length > 1; },
    get canRedo() { return redoStack.length > 0; },
  }), [handleUndo, handleRedo, handleClear, handleSave, undoStack.length, redoStack.length]);

  // ── Pointer position ────────────────────────────────────
  const getPos = useCallback((e: React.PointerEvent) => {
    const paint = paintRef.current;
    if (!paint) return { x: 0, y: 0 };
    const rect = paint.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (paint.width / rect.width),
      y: (e.clientY - rect.top) * (paint.height / rect.height),
    };
  }, []);

  // ── Sticker stamp ───────────────────────────────────────
  const placeSticker = useCallback((x: number, y: number) => {
    if (!activeSticker) return;
    const paint = paintRef.current;
    if (!paint) return;
    const ctx = paint.getContext('2d');
    if (!ctx) return;
    const size = brushSize * 3 + 20;
    const img = new Image();
    const svgBlob = new Blob([activeSticker.svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
      URL.revokeObjectURL(url);
      savePaintState();
    };
    img.src = url;
  }, [activeSticker, brushSize, savePaintState]);

  // ── Flood fill on paint layer, template as boundary ─────
  const floodFill = useCallback((startX: number, startY: number) => {
    const paint = paintRef.current;
    if (!paint) return;
    const ctx = paint.getContext('2d');
    if (!ctx) return;

    const w = paint.width;
    const h = paint.height;
    const paintData = ctx.getImageData(0, 0, w, h);
    const pd = paintData.data;
    const tmplData = templateDataRef.current?.data;

    const sx = Math.round(startX);
    const sy = Math.round(startY);
    if (sx < 0 || sx >= w || sy < 0 || sy >= h) return;

    // Get the color at the start point on the paint layer
    const si = (sy * w + sx) * 4;
    const sR = pd[si], sG = pd[si + 1], sB = pd[si + 2], sA = pd[si + 3];

    // Parse fill color
    const fR = parseInt(color.slice(1, 3), 16);
    const fG = parseInt(color.slice(3, 5), 16);
    const fB = parseInt(color.slice(5, 7), 16);
    const fA = Math.round(brushOpacity * 255);

    // Skip if already same color
    if (Math.abs(sR - fR) < 10 && Math.abs(sG - fG) < 10 && Math.abs(sB - fB) < 10 && Math.abs(sA - fA) < 30) return;

    const tolerance = 40;
    const visited = new Uint8Array(w * h);

    // A pixel is fillable if it matches the start color on paint AND is not a dark template line
    function canFill(idx: number): boolean {
      // Check template boundary — dark pixels block fill
      if (tmplData) {
        const tR = tmplData[idx], tG = tmplData[idx + 1], tB = tmplData[idx + 2], tA = tmplData[idx + 3];
        if (tA > 80 && (tR + tG + tB) < 400) return false; // Dark opaque template pixel = boundary
      }
      // Check paint layer matches start color
      return (
        Math.abs(pd[idx] - sR) <= tolerance &&
        Math.abs(pd[idx + 1] - sG) <= tolerance &&
        Math.abs(pd[idx + 2] - sB) <= tolerance &&
        Math.abs(pd[idx + 3] - sA) <= tolerance
      );
    }

    // Scanline fill
    const stack: [number, number][] = [[sx, sy]];
    while (stack.length > 0) {
      const [cx, cy] = stack.pop()!;
      if (cx < 0 || cx >= w || cy < 0 || cy >= h) continue;
      const vi = cy * w + cx;
      if (visited[vi]) continue;
      const idx = vi * 4;
      if (!canFill(idx)) continue;

      let lx = cx;
      while (lx > 0 && canFill(((cy * w) + lx - 1) * 4) && !visited[cy * w + lx - 1]) lx--;

      let rx = lx;
      while (rx < w && canFill((cy * w + rx) * 4) && !visited[cy * w + rx]) {
        const pi = (cy * w + rx) * 4;
        pd[pi] = fR;
        pd[pi + 1] = fG;
        pd[pi + 2] = fB;
        pd[pi + 3] = fA;
        visited[cy * w + rx] = 1;

        if (cy > 0 && !visited[(cy - 1) * w + rx]) stack.push([rx, cy - 1]);
        if (cy < h - 1 && !visited[(cy + 1) * w + rx]) stack.push([rx, cy + 1]);
        rx++;
      }
    }

    ctx.putImageData(paintData, 0, 0);
    savePaintState();
  }, [color, brushOpacity, savePaintState]);

  // ── Pointer handlers ────────────────────────────────────
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const pos = getPos(e);

    if (tool === 'stamp') { placeSticker(pos.x, pos.y); return; }
    if (tool === 'fill') { floodFill(pos.x, pos.y); return; }

    isDrawingRef.current = true;
    lastPosRef.current = pos;
    strokeIndexRef.current = 0;

    const paint = paintRef.current;
    if (!paint) return;
    const ctx = paint.getContext('2d');
    if (!ctx) return;

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, brushSize * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    } else if (brush === 'glitter') {
      drawGlitterAt(ctx, pos.x, pos.y, brushSize, color, brushOpacity);
    } else if (brush === 'crayon') {
      drawCrayonJitter(ctx, pos.x, pos.y, brushSize, color, brushOpacity);
    }
  }, [tool, brush, color, brushSize, brushOpacity, getPos, placeSticker, floodFill]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDrawingRef.current || tool === 'stamp' || tool === 'fill') return;

    const paint = paintRef.current;
    if (!paint) return;
    const ctx = paint.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e);
    const last = lastPosRef.current;
    if (!last) return;

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 1;
      ctx.lineWidth = brushSize * 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(0,0,0,1)'; // color doesn't matter for destination-out
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    } else if (brush === 'glitter') {
      const dist = Math.hypot(pos.x - last.x, pos.y - last.y);
      const steps = Math.max(1, Math.floor(dist / 3));
      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        drawGlitterAt(ctx, last.x + (pos.x - last.x) * t, last.y + (pos.y - last.y) * t, brushSize * 0.6, color, brushOpacity);
      }
    } else if (brush === 'crayon') {
      applyBrushStyle(ctx, brush, color, brushSize, brushOpacity);
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      drawCrayonJitter(ctx, pos.x, pos.y, brushSize, color, brushOpacity);
    } else if (brush === 'rainbow') {
      strokeIndexRef.current++;
      applyBrushStyle(ctx, brush, color, brushSize, brushOpacity, strokeIndexRef.current);
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else {
      applyBrushStyle(ctx, brush, color, brushSize, brushOpacity);
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    lastPosRef.current = pos;
  }, [tool, brush, color, brushSize, brushOpacity, getPos]);

  const handlePointerUp = useCallback(() => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      lastPosRef.current = null;
      savePaintState();
    }
  }, [savePaintState]);

  // ── Render stacked canvases ─────────────────────────────
  return (
    <div
      ref={containerRef}
      className="relative rounded-xl overflow-hidden"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        background: '#FFFFFF',
        boxShadow: '0 4px 24px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.1)',
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Paint layer — user strokes (below template visually) */}
      <canvas
        ref={paintRef}
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'none' }}
      />
      {/* Template overlay — line art on top, not interactive */}
      <canvas
        ref={templateRef}
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
});

export default DrawingCanvas;
