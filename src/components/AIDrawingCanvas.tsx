import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AIDrawingCanvasProps {
  onSubmit: (imageBase64: string) => void;
  onClose: () => void;
  color: string;
}

const COLORS = [
  '#1a1a1a', '#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA',
  '#6BCB77', '#FF8C42', '#F472B6', '#38BDF8', '#FFFFFF',
];

const BRUSH_SIZES = [4, 8, 14, 22];

export default function AIDrawingCanvas({ onSubmit, onClose, color }: AIDrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#1a1a1a');
  const [brushSize, setBrushSize] = useState(8);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    lastPoint.current = getPos(e);
  }, [getPos]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDrawing || !lastPoint.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPoint.current = pos;
  }, [isDrawing, brushColor, brushSize, getPos]);

  const handlePointerUp = useCallback(() => {
    setIsDrawing(false);
    lastPoint.current = null;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const submitDrawing = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          onSubmit(base64);
        };
        reader.readAsDataURL(blob);
      },
      'image/jpeg',
      0.85
    );
  }, [onSubmit]);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <button onClick={onClose} className="text-2xl p-1">✕</button>
        <span className="text-lg font-bold">Draw Something!</span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={submitDrawing}
          className="px-4 py-2 rounded-xl text-white font-bold"
          style={{ backgroundColor: color }}
        >
          Done!
        </motion.button>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative touch-none">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="w-full h-full cursor-crosshair"
          style={{ touchAction: 'none' }}
        />
      </div>

      {/* Toolbar */}
      <div className="p-3 border-t border-gray-200 flex items-center gap-3">
        <div className="flex gap-1.5 flex-1 flex-wrap justify-center">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setBrushColor(c)}
              className="w-8 h-8 rounded-full border-2 transition-transform"
              style={{
                backgroundColor: c,
                borderColor: c === brushColor ? color : '#ddd',
                transform: c === brushColor ? 'scale(1.2)' : 'scale(1)',
              }}
            />
          ))}
        </div>
        <div className="flex gap-1.5 items-center">
          {BRUSH_SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setBrushSize(s)}
              className="flex items-center justify-center w-8 h-8"
            >
              <div
                className="rounded-full transition-all"
                style={{
                  width: s,
                  height: s,
                  backgroundColor: brushSize === s ? color : '#999',
                }}
              />
            </button>
          ))}
        </div>
        <button
          onClick={clearCanvas}
          className="text-xl p-2 rounded-xl bg-gray-100 active:bg-gray-200"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
