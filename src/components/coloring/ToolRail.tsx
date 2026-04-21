/**
 * ToolRail — Vertical or horizontal tool selection bar for the coloring studio.
 * Uses SVG icons (no emoji). Mobile-first, 44px+ touch targets.
 */
import { motion } from 'framer-motion';
import type { ToolId } from './coloringTools';

interface ToolRailProps {
  activeTool: ToolId;
  onToolChange: (tool: ToolId) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onSave: () => void;
  onClose: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const iconSize = 20;

function BrushIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 3a3 3 0 0 0-3 3v1l-8 8-3 3h6l8-8V9a3 3 0 0 0-3-3z" />
    </svg>
  );
}

function EraserIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 20H7L3 16c-.6-.6-.6-1.5 0-2.1L14.6 2.3c.6-.6 1.5-.6 2.1 0L21.7 7.3c.6.6.6 1.5 0 2.1L12 19" />
    </svg>
  );
}

function FillIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 22l1-1h3l7-7" />
      <path d="M13 14l-1.5-1.5L16 8l5 5-4.5 4.5" />
      <path d="M22 22c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z" />
    </svg>
  );
}

function StickerIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v6h6" /><path d="M3 13a9 9 0 1 0 3-7.7L3 7" />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 7v6h-6" /><path d="M21 13a9 9 0 1 1-3-7.7L21 7" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,6 5,6 21,6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17,21 17,13 7,13 7,21" /><polyline points="7,3 7,8 15,8" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

interface ToolBtnProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  accent?: string;
  onClick: () => void;
}

function ToolBtn({ icon, label, active, disabled, accent, onClick }: ToolBtnProps) {
  return (
    <motion.button
      className="w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
      style={{
        background: active ? (accent || 'rgba(255,255,255,0.95)') : 'rgba(255,255,255,0.08)',
        color: active ? '#2D2D3A' : disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
        boxShadow: active ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
      }}
      onClick={onClick}
      whileTap={disabled ? undefined : { scale: 0.9 }}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
    >
      {icon}
    </motion.button>
  );
}

export default function ToolRail({
  activeTool,
  onToolChange,
  onUndo,
  onRedo,
  onClear,
  onSave,
  onClose,
  canUndo,
  canRedo,
}: ToolRailProps) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-2 rounded-2xl" style={{ background: 'rgba(45,45,58,0.85)', backdropFilter: 'blur(12px)' }}>
      {/* Drawing tools */}
      <ToolBtn icon={<BrushIcon />} label="Brush" active={activeTool === 'brush'} onClick={() => onToolChange('brush')} />
      <ToolBtn icon={<EraserIcon />} label="Eraser" active={activeTool === 'eraser'} onClick={() => onToolChange('eraser')} />
      <ToolBtn icon={<FillIcon />} label="Fill" active={activeTool === 'fill'} onClick={() => onToolChange('fill')} />
      <ToolBtn icon={<StickerIcon />} label="Sticker" active={activeTool === 'stamp'} onClick={() => onToolChange('stamp')} />

      {/* Divider */}
      <div className="w-px h-6 mx-0.5" style={{ background: 'rgba(255,255,255,0.15)' }} />

      {/* History */}
      <ToolBtn icon={<UndoIcon />} label="Undo" disabled={!canUndo} onClick={onUndo} />
      <ToolBtn icon={<RedoIcon />} label="Redo" disabled={!canRedo} onClick={onRedo} />

      {/* Divider */}
      <div className="w-px h-6 mx-0.5" style={{ background: 'rgba(255,255,255,0.15)' }} />

      {/* Actions */}
      <ToolBtn icon={<TrashIcon />} label="Clear canvas" onClick={onClear} />
      <ToolBtn icon={<SaveIcon />} label="Save artwork" accent="#6BCB77" onClick={onSave} />
      <ToolBtn icon={<CloseIcon />} label="Exit studio" onClick={onClose} />
    </div>
  );
}
