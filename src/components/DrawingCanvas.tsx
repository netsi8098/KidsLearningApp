import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ColorPalette from './ColorPalette';
import BrushSizePicker from './BrushSizePicker';
import StampPicker from './StampPicker';

interface DrawingCanvasProps {
  width?: number;
  height?: number;
  templateSvg?: string;
  onSave: (dataUrl: string) => void;
}

type DrawingMode = 'draw' | 'erase' | 'stamp';

const MAX_UNDO = 30;

export default function DrawingCanvas({
  width = 350,
  height = 450,
  templateSvg,
  onSave,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const [mode, setMode] = useState<DrawingMode>('draw');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(4);
  const [selectedStamp, setSelectedStamp] = useState('🐱');

  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);

  // Popover visibility states
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBrushPicker, setShowBrushPicker] = useState(false);
  const [showStampPicker, setShowStampPicker] = useState(false);

  // Close all popovers
  const closePopovers = useCallback(() => {
    setShowColorPicker(false);
    setShowBrushPicker(false);
    setShowStampPicker(false);
  }, []);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas internal resolution
    canvas.width = width;
    canvas.height = height;

    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Draw template SVG if provided
    if (templateSvg) {
      const img = new Image();
      const svgBlob = new Blob([templateSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        // Save initial state to undo stack
        const initialState = ctx.getImageData(0, 0, width, height);
        setUndoStack([initialState]);
      };
      img.src = url;
    } else {
      // Save initial blank state
      const initialState = ctx.getImageData(0, 0, width, height);
      setUndoStack([initialState]);
    }
  }, [width, height, templateSvg]);

  // Save current canvas state to undo stack
  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack((prev) => {
      const newStack = [...prev, imageData];
      if (newStack.length > MAX_UNDO) {
        return newStack.slice(newStack.length - MAX_UNDO);
      }
      return newStack;
    });
    setRedoStack([]);
  }, []);

  // Undo
  const handleUndo = useCallback(() => {
    if (undoStack.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentState = undoStack[undoStack.length - 1];
    const previousState = undoStack[undoStack.length - 2];

    setRedoStack((prev) => [...prev, currentState]);
    setUndoStack((prev) => prev.slice(0, -1));

    ctx.putImageData(previousState, 0, 0);
  }, [undoStack]);

  // Redo
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nextState = redoStack[redoStack.length - 1];

    setUndoStack((prev) => [...prev, nextState]);
    setRedoStack((prev) => prev.slice(0, -1));

    ctx.putImageData(nextState, 0, 0);
  }, [redoStack]);

  // Clear canvas
  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Re-draw template if present
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

  // Save artwork
  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  }, [onSave]);

  // Get pointer position relative to canvas
  const getPos = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    []
  );

  // Place stamp at position
  const placeStamp = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const fontSize = brushSize * 3 + 16;
      ctx.font = `${fontSize}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedStamp, x, y);
      saveState();
    },
    [selectedStamp, brushSize, saveState]
  );

  // Pointer down
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      closePopovers();

      const pos = getPos(e);

      if (mode === 'stamp') {
        placeStamp(pos.x, pos.y);
        return;
      }

      isDrawingRef.current = true;
      lastPosRef.current = pos;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    },
    [mode, getPos, placeStamp, closePopovers]
  );

  // Pointer move
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current || mode === 'stamp') return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const pos = getPos(e);
      const last = lastPosRef.current;
      if (!last) return;

      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = mode === 'erase' ? '#FFFFFF' : color;
      ctx.lineWidth = mode === 'erase' ? brushSize * 3 : brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      lastPosRef.current = pos;
    },
    [mode, color, brushSize, getPos]
  );

  // Pointer up
  const handlePointerUp = useCallback(() => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      lastPosRef.current = null;
      saveState();
    }
  }, [saveState]);

  // Toggle helpers
  function toggleMode(targetMode: DrawingMode) {
    closePopovers();
    setMode((prev) => (prev === targetMode ? 'draw' : targetMode));
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Canvas */}
      <div className="relative w-full" style={{ maxWidth: width }}>
        <canvas
          ref={canvasRef}
          className="w-full rounded-2xl shadow-md bg-white"
          style={{
            touchAction: 'none',
            aspectRatio: `${width} / ${height}`,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />

        {/* Popover panels positioned above the toolbar */}
        <AnimatePresence>
          {showColorPicker && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-white rounded-2xl shadow-lg border border-gray-100 z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <ColorPalette selectedColor={color} onColorChange={(c) => { setColor(c); setMode('draw'); setShowColorPicker(false); }} />
            </motion.div>
          )}

          {showBrushPicker && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-white rounded-2xl shadow-lg border border-gray-100 z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <BrushSizePicker selectedSize={brushSize} onSizeChange={(s) => { setBrushSize(s); setShowBrushPicker(false); }} />
            </motion.div>
          )}

          {showStampPicker && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-white rounded-2xl shadow-lg border border-gray-100 z-10 max-h-52 overflow-y-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <StampPicker onStampSelect={(emoji) => { setSelectedStamp(emoji); setMode('stamp'); setShowStampPicker(false); }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center bg-white rounded-2xl shadow-md px-3 py-2 w-full" style={{ maxWidth: width }}>
        {/* Color picker toggle */}
        <motion.button
          className="w-9 h-9 rounded-full border-2 border-gray-200 cursor-pointer flex items-center justify-center"
          style={{ backgroundColor: color }}
          onClick={() => { closePopovers(); setShowColorPicker(!showColorPicker); }}
          whileTap={{ scale: 0.9 }}
          title="Color"
        />

        {/* Brush size toggle */}
        <motion.button
          className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer ${
            showBrushPicker ? 'bg-teal text-white' : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => { closePopovers(); setShowBrushPicker(!showBrushPicker); }}
          whileTap={{ scale: 0.9 }}
          title="Brush Size"
        >
          <div className="rounded-full bg-current" style={{ width: Math.min(brushSize, 14), height: Math.min(brushSize, 14) }} />
        </motion.button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-0.5" />

        {/* Undo */}
        <motion.button
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm cursor-pointer disabled:opacity-30"
          onClick={handleUndo}
          disabled={undoStack.length <= 1}
          whileTap={{ scale: 0.9 }}
          title="Undo"
        >
          ↩️
        </motion.button>

        {/* Redo */}
        <motion.button
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm cursor-pointer disabled:opacity-30"
          onClick={handleRedo}
          disabled={redoStack.length === 0}
          whileTap={{ scale: 0.9 }}
          title="Redo"
        >
          ↪️
        </motion.button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-0.5" />

        {/* Eraser toggle */}
        <motion.button
          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm cursor-pointer ${
            mode === 'erase' ? 'bg-coral text-white' : 'bg-gray-100'
          }`}
          onClick={() => toggleMode('erase')}
          whileTap={{ scale: 0.9 }}
          title="Eraser"
        >
          🧹
        </motion.button>

        {/* Stamp toggle */}
        <motion.button
          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm cursor-pointer ${
            mode === 'stamp' ? 'bg-grape text-white' : 'bg-gray-100'
          }`}
          onClick={() => {
            if (mode === 'stamp') {
              setMode('draw');
              setShowStampPicker(false);
            } else {
              closePopovers();
              setShowStampPicker(true);
              setMode('stamp');
            }
          }}
          whileTap={{ scale: 0.9 }}
          title="Stamp"
        >
          {selectedStamp}
        </motion.button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-0.5" />

        {/* Clear */}
        <motion.button
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm cursor-pointer"
          onClick={handleClear}
          whileTap={{ scale: 0.9 }}
          title="Clear"
        >
          🗑️
        </motion.button>

        {/* Save */}
        <motion.button
          className="w-9 h-9 rounded-full bg-teal text-white flex items-center justify-center text-sm cursor-pointer shadow-md"
          onClick={handleSave}
          whileTap={{ scale: 0.9 }}
          title="Save"
        >
          💾
        </motion.button>
      </div>
    </div>
  );
}
