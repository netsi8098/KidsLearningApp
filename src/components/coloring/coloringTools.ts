/**
 * Coloring Studio — tool definitions, brush types, color palette, sticker data.
 * Central data file for the coloring/drawing experience.
 */

// ── Tool Types ────────────────────────────────────────────

export type ToolId = 'brush' | 'eraser' | 'fill' | 'stamp';

export interface Tool {
  id: ToolId;
  label: string;
}

export const tools: Tool[] = [
  { id: 'brush', label: 'Brush' },
  { id: 'eraser', label: 'Eraser' },
  { id: 'fill', label: 'Fill' },
  { id: 'stamp', label: 'Sticker' },
];

// ── Brush Types ───────────────────────────────────────────

export type BrushId = 'pencil' | 'crayon' | 'marker' | 'airbrush' | 'watercolor' | 'glitter' | 'rainbow' | 'bigsoft';

export interface BrushType {
  id: BrushId;
  label: string;
  /** Preview color for the swatch stroke */
  previewColor: string;
  /** Default opacity (0-1) */
  defaultOpacity: number;
  /** Min/max size range */
  minSize: number;
  maxSize: number;
  defaultSize: number;
}

export const brushes: BrushType[] = [
  { id: 'pencil', label: 'Pencil', previewColor: '#2D2D3A', defaultOpacity: 1, minSize: 1, maxSize: 8, defaultSize: 2 },
  { id: 'crayon', label: 'Crayon', previewColor: '#FF6B6B', defaultOpacity: 0.85, minSize: 4, maxSize: 20, defaultSize: 8 },
  { id: 'marker', label: 'Marker', previewColor: '#4ECDC4', defaultOpacity: 0.9, minSize: 6, maxSize: 28, defaultSize: 12 },
  { id: 'airbrush', label: 'Airbrush', previewColor: '#A78BFA', defaultOpacity: 0.3, minSize: 10, maxSize: 50, defaultSize: 24 },
  { id: 'watercolor', label: 'Watercolor', previewColor: '#45B7D1', defaultOpacity: 0.2, minSize: 12, maxSize: 40, defaultSize: 20 },
  { id: 'glitter', label: 'Glitter', previewColor: '#FFD93D', defaultOpacity: 0.8, minSize: 6, maxSize: 24, defaultSize: 10 },
  { id: 'rainbow', label: 'Rainbow', previewColor: '#FF6B6B', defaultOpacity: 0.7, minSize: 8, maxSize: 30, defaultSize: 14 },
  { id: 'bigsoft', label: 'Soft Brush', previewColor: '#FF8FAB', defaultOpacity: 0.4, minSize: 20, maxSize: 60, defaultSize: 36 },
];

// ── Color Palette ─────────────────────────────────────────

export interface PaletteColor {
  hex: string;
  label: string;
}

export const palette: PaletteColor[] = [
  { hex: '#2D2D3A', label: 'Black' },
  { hex: '#FF6B6B', label: 'Red' },
  { hex: '#FF8C42', label: 'Orange' },
  { hex: '#FFD93D', label: 'Yellow' },
  { hex: '#6BCB77', label: 'Green' },
  { hex: '#4ECDC4', label: 'Teal' },
  { hex: '#45B7D1', label: 'Blue' },
  { hex: '#A78BFA', label: 'Purple' },
  { hex: '#FF8FAB', label: 'Pink' },
  { hex: '#8B6914', label: 'Brown' },
  { hex: '#FFFFFF', label: 'White' },
  { hex: '#9B9BAB', label: 'Gray' },
];

export const extendedPalette: PaletteColor[] = [
  ...palette,
  { hex: '#1A1040', label: 'Navy' },
  { hex: '#E8C5A0', label: 'Skin' },
  { hex: '#C0956A', label: 'Tan' },
  { hex: '#5D4037', label: 'Dark Brown' },
  { hex: '#F5E6C8', label: 'Cream' },
  { hex: '#B0BEC5', label: 'Silver' },
  { hex: '#FFE0B2', label: 'Peach' },
  { hex: '#C8E6C9', label: 'Mint' },
];

// ── Stickers ──────────────────────────────────────────────

export interface StickerDef {
  id: string;
  label: string;
  /** SVG path data or inline SVG string for the sticker */
  svg: string;
}

export const stickers: StickerDef[] = [
  { id: 'star', label: 'Star', svg: '<svg viewBox="0 0 40 40"><polygon points="20,2 25,15 39,15 28,23 32,37 20,29 8,37 12,23 1,15 15,15" fill="#FFD93D" stroke="#E6A817" stroke-width="1"/></svg>' },
  { id: 'heart', label: 'Heart', svg: '<svg viewBox="0 0 40 40"><path d="M20 36C20 36 4 26 4 14C4 8 9 4 14 4C17 4 19 6 20 8C21 6 23 4 26 4C31 4 36 8 36 14C36 26 20 36 20 36Z" fill="#FF6B6B"/></svg>' },
  { id: 'smiley', label: 'Smiley', svg: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="#FFE66D"/><circle cx="14" cy="16" r="2.5" fill="#2D2D3A"/><circle cx="26" cy="16" r="2.5" fill="#2D2D3A"/><path d="M12 24Q20 32 28 24" stroke="#2D2D3A" stroke-width="2" fill="none" stroke-linecap="round"/></svg>' },
  { id: 'flower', label: 'Flower', svg: '<svg viewBox="0 0 40 40"><circle cx="20" cy="17" r="5" fill="#FFE66D"/><circle cx="20" cy="8" r="5" fill="#FF8FAB"/><circle cx="12" cy="13" r="5" fill="#FF8FAB"/><circle cx="28" cy="13" r="5" fill="#FF8FAB"/><circle cx="14" cy="22" r="5" fill="#FF8FAB"/><circle cx="26" cy="22" r="5" fill="#FF8FAB"/><rect x="18.5" y="23" width="3" height="14" rx="1.5" fill="#4CAF50"/></svg>' },
  { id: 'rocket', label: 'Rocket', svg: '<svg viewBox="0 0 40 40"><path d="M20 2C20 2 30 12 30 26L24 32L20 28L16 32L10 26C10 12 20 2 20 2Z" fill="#FF6B6B"/><circle cx="20" cy="16" r="4" fill="#45B7D1"/><path d="M10 26L6 30L10 28Z" fill="#FF8C42"/><path d="M30 26L34 30L30 28Z" fill="#FF8C42"/><path d="M16 32L18 38L20 34L22 38L24 32" fill="#FFD93D"/></svg>' },
  { id: 'crown', label: 'Crown', svg: '<svg viewBox="0 0 40 40"><path d="M6 28L6 14L14 22L20 10L26 22L34 14L34 28Z" fill="#FFD93D" stroke="#E6A817" stroke-width="1"/><circle cx="6" cy="14" r="2.5" fill="#FF6B6B"/><circle cx="20" cy="10" r="2.5" fill="#FF6B6B"/><circle cx="34" cy="14" r="2.5" fill="#FF6B6B"/><rect x="6" y="28" width="28" height="4" rx="1" fill="#E6A817"/></svg>' },
  { id: 'butterfly', label: 'Butterfly', svg: '<svg viewBox="0 0 40 40"><ellipse cx="20" cy="20" rx="2" ry="8" fill="#2D2D3A"/><ellipse cx="12" cy="15" rx="8" ry="6" fill="#A78BFA" opacity="0.8"/><ellipse cx="28" cy="15" rx="8" ry="6" fill="#FF8FAB" opacity="0.8"/><ellipse cx="13" cy="23" rx="6" ry="5" fill="#8B5CF6" opacity="0.6"/><ellipse cx="27" cy="23" rx="6" ry="5" fill="#FF6B6B" opacity="0.6"/><line x1="18" y1="12" x2="14" y2="6" stroke="#2D2D3A" stroke-width="1"/><line x1="22" y1="12" x2="26" y2="6" stroke="#2D2D3A" stroke-width="1"/></svg>' },
  { id: 'paw', label: 'Paw', svg: '<svg viewBox="0 0 40 40"><ellipse cx="20" cy="24" rx="8" ry="7" fill="#8B6914" opacity="0.8"/><ellipse cx="12" cy="14" rx="4" ry="5" fill="#8B6914" opacity="0.8"/><ellipse cx="20" cy="11" rx="4" ry="5" fill="#8B6914" opacity="0.8"/><ellipse cx="28" cy="14" rx="4" ry="5" fill="#8B6914" opacity="0.8"/></svg>' },
];

// ── Rainbow Colors for Rainbow Brush ──────────────────────

export const rainbowColors = [
  '#FF6B6B', '#FF8C42', '#FFD93D', '#6BCB77', '#45B7D1', '#A78BFA', '#FF8FAB',
];

// ── Brush rendering helpers ───────────────────────────────

/** Apply brush-specific canvas context settings before drawing */
export function applyBrushStyle(
  ctx: CanvasRenderingContext2D,
  brush: BrushId,
  color: string,
  size: number,
  opacity: number,
  strokeIndex = 0,
): void {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (brush) {
    case 'pencil':
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.globalCompositeOperation = 'source-over';
      break;

    case 'crayon':
      ctx.globalAlpha = opacity * 0.85;
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.globalCompositeOperation = 'source-over';
      // Crayon gets slight jitter in the draw loop
      break;

    case 'marker':
      ctx.globalAlpha = opacity * 0.9;
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.globalCompositeOperation = 'multiply';
      break;

    case 'airbrush':
      ctx.globalAlpha = opacity * 0.15;
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 2;
      ctx.globalCompositeOperation = 'source-over';
      break;

    case 'watercolor':
      ctx.globalAlpha = opacity * 0.12;
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 1.5;
      ctx.globalCompositeOperation = 'source-over';
      break;

    case 'glitter':
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.globalCompositeOperation = 'source-over';
      // Glitter scatters dots in the draw loop
      break;

    case 'rainbow': {
      const ci = strokeIndex % rainbowColors.length;
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = rainbowColors[ci];
      ctx.lineWidth = size;
      ctx.globalCompositeOperation = 'source-over';
      break;
    }

    case 'bigsoft':
      ctx.globalAlpha = opacity * 0.2;
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 2;
      ctx.globalCompositeOperation = 'source-over';
      break;
  }
}

/** Draw glitter particles around a point */
export function drawGlitterAt(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, opacity: number): void {
  const count = Math.floor(size * 1.5);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * size;
    const px = x + Math.cos(angle) * dist;
    const py = y + Math.sin(angle) * dist;
    const r = Math.random() * 2 + 0.5;
    ctx.globalAlpha = opacity * (0.4 + Math.random() * 0.6);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Draw crayon jitter effect along a line segment */
export function drawCrayonJitter(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, opacity: number): void {
  const count = Math.floor(size * 0.6);
  for (let i = 0; i < count; i++) {
    const ox = (Math.random() - 0.5) * size * 0.6;
    const oy = (Math.random() - 0.5) * size * 0.6;
    ctx.globalAlpha = opacity * (0.1 + Math.random() * 0.2);
    ctx.fillStyle = color;
    ctx.fillRect(x + ox, y + oy, 1 + Math.random(), 1 + Math.random());
  }
}
