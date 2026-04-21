/**
 * DrawingCanvas — Studio-grade HTML5 Canvas drawing component.
 *
 * Supports multiple brush types, eraser, sticker stamps, undo/redo.
 * All UI chrome (toolbar, color picker, brush drawer) is external —
 * this component exposes its API via the onReady callback.
 */
import { useRef, useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { type BrushId, type StickerDef, applyBrushStyle, drawGlitterAt, drawCrayonJitter, rainbowColors } from './coloring/coloringTools';

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
  /** Active drawing tool */
  tool: 'brush' | 'eraser' | 'fill' | 'stamp';
  /** Active brush type */
  brush: BrushId;
  /** Active color */
  color: string;
  /** Brush size in px */
  brushSize: number;
  /** Brush opacity 0-1 */
  brushOpacity: number;
  /** Active sticker for stamp mode */
  activeSticker?: StickerDef | null;
  /** Called when undo/redo state changes */
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
  /** Called when save is triggered externally */
  onSave?: (dataUrl: string) => void;
}

const MAX_UNDO = 30;

const DrawingCanvas = forwardRef<CanvasApi, DrawingCanvasProps>(function DrawingCanvas(
  {
    width = 350,
    height = 450,
    templateSvg,
    tool,
    brush,
    color,
    brushSize,
    brushOpacity,
    activeSticker,
    onHistoryChange,
    onSave,
  },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const strokeIndexRef = useRef(0);

  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);

  // Notify parent of history changes
  useEffect(() => {
    onHistoryChange?.(undoStack.length > 1, redoStack.length > 0);
  }, [undoStack.length, redoStack.length, onHistoryChange]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    if (templateSvg) {
      const img = new Image();
      const svgBlob = new Blob([templateSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        const initialState = ctx.getImageData(0, 0, width, height);
        setUndoStack([initialState]);
        setRedoStack([]);
      };
      img.src = url;
    } else {
      const initialState = ctx.getImageData(0, 0, width, height);
      setUndoStack([initialState]);
      setRedoStack([]);
    }
  }, [width, height, templateSvg]);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack((prev) => {
      const next = [...prev, imageData];
      return next.length > MAX_UNDO ? next.slice(next.length - MAX_UNDO) : next;
    });
    setRedoStack([]);
  }, []);

  const handleUndo = useCallback(() => {
    if (undoStack.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const current = undoStack[undoStack.length - 1];
    const prev = undoStack[undoStack.length - 2];
    setRedoStack((r) => [...r, current]);
    setUndoStack((u) => u.slice(0, -1));
    ctx.putImageData(prev, 0, 0);
  }, [undoStack]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((u) => [...u, next]);
    setRedoStack((r) => r.slice(0, -1));
    ctx.putImageData(next, 0, 0);
  }, [redoStack]);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (templateSvg) {
      const img = new Image();
      const svgBlob = new Blob([templateSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        saveState();
      };
      img.src = url;
    } else {
      saveState();
    }
  }, [templateSvg, saveState]);

  const handleSave = useCallback((): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const dataUrl = canvas.toDataURL('image/png');
    onSave?.(dataUrl);
    return dataUrl;
  }, [onSave]);

  // Expose API via ref
  useImperativeHandle(ref, () => ({
    undo: handleUndo,
    redo: handleRedo,
    clear: handleClear,
    save: handleSave,
    get canUndo() { return undoStack.length > 1; },
    get canRedo() { return redoStack.length > 0; },
  }), [handleUndo, handleRedo, handleClear, handleSave, undoStack.length, redoStack.length]);

  const getPos = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  }, []);

  // Place SVG sticker at position
  const placeSticker = useCallback((x: number, y: number) => {
    if (!activeSticker) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = brushSize * 3 + 20;
    const img = new Image();
    const svgBlob = new Blob([activeSticker.svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
      URL.revokeObjectURL(url);
      saveState();
    };
    img.src = url;
  }, [activeSticker, brushSize, saveState]);

  // Pointer handlers
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const pos = getPos(e);

    if (tool === 'stamp') {
      placeSticker(pos.x, pos.y);
      return;
    }

    if (tool === 'fill') {
      // TODO: Implement flood fill. For now, save state as placeholder.
      saveState();
      return;
    }

    isDrawingRef.current = true;
    lastPosRef.current = pos;
    strokeIndexRef.current = 0;

    // Draw a dot at the starting point
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, brushSize * 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (brush === 'glitter') {
      drawGlitterAt(ctx, pos.x, pos.y, brushSize, color, brushOpacity);
    } else if (brush === 'crayon') {
      drawCrayonJitter(ctx, pos.x, pos.y, brushSize, color, brushOpacity);
    }
  }, [tool, brush, color, brushSize, brushOpacity, getPos, placeSticker, saveState]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || tool === 'stamp' || tool === 'fill') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e);
    const last = lastPosRef.current;
    if (!last) return;

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = brushSize * 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (brush === 'glitter') {
      // Scatter particles along the stroke
      const dist = Math.hypot(pos.x - last.x, pos.y - last.y);
      const steps = Math.max(1, Math.floor(dist / 3));
      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const px = last.x + (pos.x - last.x) * t;
        const py = last.y + (pos.y - last.y) * t;
        drawGlitterAt(ctx, px, py, brushSize * 0.6, color, brushOpacity);
      }
    } else if (brush === 'crayon') {
      // Normal stroke + jitter
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
      // Standard brush rendering
      applyBrushStyle(ctx, brush, color, brushSize, brushOpacity);
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;

    lastPosRef.current = pos;
  }, [tool, brush, color, brushSize, brushOpacity, getPos]);

  const handlePointerUp = useCallback(() => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      lastPosRef.current = null;
      saveState();
    }
  }, [saveState]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-xl"
      style={{
        touchAction: 'none',
        aspectRatio: `${width} / ${height}`,
        maxWidth: width,
        boxShadow: '0 4px 24px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.1)',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  );
});

export default DrawingCanvas;
