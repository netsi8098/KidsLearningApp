import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useArtwork } from '../hooks/useArtwork';
import { coloringTemplates, coloringCategories, type ColoringTemplate } from '../data/coloringData';
import CategoryFilterBar from '../components/CategoryFilterBar';
import DrawingCanvas, { type CanvasApi } from '../components/DrawingCanvas';
import ArtworkGallery from '../components/ArtworkGallery';
import NavButton from '../components/NavButton';
import AnimatedBackground from '../components/svg/AnimatedBackground';
// ColoringPreviews no longer used — cards show real SVG outline directly
import { getColoringCategoryIcon } from '../components/svg/CategoryIcons';
import ToolRail from '../components/coloring/ToolRail';
import ColorRail from '../components/coloring/ColorRail';
import BrushDrawer from '../components/coloring/BrushDrawer';
import StickerPicker from '../components/coloring/StickerPicker';
import { brushes, extendedPalette, type ToolId, type BrushId, type StickerDef } from '../components/coloring/coloringTools';
import ZoomableViewport, { ZoomControls } from '../components/coloring/ZoomableViewport';
import ColorWheelModal from '../components/coloring/ColorWheelModal';

type TabKey = 'templates' | 'free-draw' | 'gallery';

export default function ColoringPage() {
  const navigate = useNavigate();
  const { currentPlayer } = useApp();
  const playerId = currentPlayer?.id;
  const { artworks, saveArtwork, deleteArtwork } = useArtwork(playerId);

  const [activeTab, setActiveTab] = useState<TabKey>('templates');
  const [saveToast, setSaveToast] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('featured');
  const [drawingMode, setDrawingMode] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<ColoringTemplate | null>(null);

  // Filtered templates
  const filteredTemplates =
    selectedCategory === 'all'
      ? coloringTemplates
      : coloringTemplates.filter((t) => t.category === selectedCategory);

  // Open template for drawing
  const openTemplate = useCallback((template: ColoringTemplate) => {
    setActiveTemplate(template);
    setDrawingMode(true);
  }, []);

  // Open free draw
  const openFreeDraw = useCallback(() => {
    setActiveTemplate(null);
    setDrawingMode(true);
    setActiveTab('free-draw');
  }, []);

  // Exit drawing mode
  const exitDrawing = useCallback(() => {
    setDrawingMode(false);
    setActiveTemplate(null);
  }, []);

  // Save artwork from canvas — saves to artworks + scrapbook
  const handleSave = useCallback(
    (dataUrl: string) => {
      const title = activeTemplate
        ? `${activeTemplate.title} - Coloring`
        : `Free Draw - ${new Date().toLocaleDateString()}`;
      saveArtwork(title, dataUrl, activeTemplate?.id);
      exitDrawing();
      setActiveTab('gallery');
      // In-app toast celebration
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
    },
    [activeTemplate, saveArtwork, exitDrawing]
  );

  // ── Studio state (drawing mode) ──────────────────────────
  const canvasApiRef = useRef<CanvasApi>(null);
  const [activeTool, setActiveTool] = useState<ToolId>('brush');
  const [activeBrush, setActiveBrush] = useState<BrushId>('crayon');
  const [activeColor, setActiveColor] = useState('#FF6B6B');
  const [studioBrushSize, setStudioBrushSize] = useState(8);
  const [studioOpacity, setStudioOpacity] = useState(0.85);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [showBrushDrawer, setShowBrushDrawer] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showColorExpanded, setShowColorExpanded] = useState(false);
  const [activeSticker, setActiveSticker] = useState<StickerDef | null>(null);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  // Canvas resolution adapts to screen size — larger on desktop
  const canvasW = typeof window !== 'undefined' && window.innerWidth >= 768 ? 600 : 400;
  const canvasH = Math.round(canvasW * 1.3); // maintain aspect ratio

  // Compute fit-to-screen zoom
  const [zoom, setZoom] = useState(() => {
    if (typeof window === 'undefined') return 0.8;
    const availW = window.innerWidth - 60;
    const availH = window.innerHeight - 56;
    const fitW = availW / canvasW;
    const fitH = availH / canvasH;
    return Math.min(fitW, fitH, 1);
  });
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [showColorWheel, setShowColorWheel] = useState(false);
  const [savedColors, setSavedColors] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(`klf-saved-colors-${currentPlayer?.id}`);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const handleSaveColor = useCallback((hex: string) => {
    setSavedColors((prev) => {
      const next = [hex, ...prev.filter((c) => c !== hex)].slice(0, 20);
      try { localStorage.setItem(`klf-saved-colors-${currentPlayer?.id}`, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [currentPlayer?.id]);

  const handleColorChange = useCallback((hex: string) => {
    setActiveColor(hex);
    if (activeTool !== 'eraser' && activeTool !== 'fill') setActiveTool('brush');
    setRecentColors((prev) => {
      const next = [hex, ...prev.filter((c) => c !== hex)];
      return next.slice(0, 8);
    });
  }, [activeTool]);

  const handleBrushChange = useCallback((id: BrushId) => {
    setActiveBrush(id);
    setActiveTool('brush');
    const b = brushes.find((br) => br.id === id);
    if (b) {
      setStudioBrushSize(b.defaultSize);
      setStudioOpacity(b.defaultOpacity);
    }
  }, []);

  // Close all drawers/modals
  const closeAllDrawers = useCallback(() => {
    setShowBrushDrawer(false);
    setShowStickerPicker(false);
    setShowColorExpanded(false);
    setShowColorWheel(false);
  }, []);

  const handleToolChange = useCallback((tool: ToolId) => {
    // Close any open drawer first, then open the relevant one
    closeAllDrawers();
    setActiveTool(tool);
    // Delay opening so close animation completes
    if (tool === 'brush') setTimeout(() => setShowBrushDrawer(true), 50);
    if (tool === 'stamp') setTimeout(() => setShowStickerPicker(true), 50);
  }, [closeAllDrawers]);

  const handleHistoryChange = useCallback((u: boolean, r: boolean) => {
    setCanUndo(u);
    setCanRedo(r);
  }, []);

  if (!currentPlayer) return <Navigate to="/" replace />;

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'templates', label: 'Templates', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M2 10L6 7L9 10L13 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="10" cy="5" r="1.5" fill="currentColor" opacity="0.5"/></svg> },
    { key: 'free-draw', label: 'Free Draw', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M11 2L14 5L5 14H2V11L11 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg> },
    { key: 'gallery', label: 'Gallery', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="3" fill="currentColor" opacity="0.3"/><circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3"/>{[0,60,120,180,240,300].map(a=><circle key={a} cx={8+Math.cos(a*Math.PI/180)*5.5} cy={8+Math.sin(a*Math.PI/180)*5.5} r="1.2" fill="currentColor" opacity="0.5"/>)}</svg> },
  ];

  // ===== IMMERSIVE COLORING STUDIO =====
  if (drawingMode) {
    const glass = { background: 'rgba(30,30,45,0.75)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' } as const;
    return (
      <div className="fixed inset-0 z-50" style={{ background: '#1A1A2E' }} onClick={() => closeAllDrawers()}>
        {/* ── Zoomable canvas viewport ── */}
        <ZoomableViewport zoom={zoom} onZoomChange={setZoom} panX={panX} panY={panY} onPanChange={(x, y) => { setPanX(x); setPanY(y); }}>
          <div onClick={(e) => e.stopPropagation()}>
            <DrawingCanvas
              ref={canvasApiRef}
              width={canvasW}
              height={canvasH}
              templateSvg={activeTemplate?.svgOutline}
              tool={activeTool}
              brush={activeBrush}
              color={activeColor}
              brushSize={studioBrushSize}
              brushOpacity={studioOpacity}
              activeSticker={activeSticker}
              onHistoryChange={handleHistoryChange}
              onSave={handleSave}
            />
          </div>
        </ZoomableViewport>

        {/* ── Top-left: Close ── */}
        <div className="fixed top-3 left-3 z-30" onClick={(e) => e.stopPropagation()}>
          <motion.button className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer" style={glass} onClick={() => { closeAllDrawers(); exitDrawing(); }} whileTap={{ scale: 0.9 }} aria-label="Exit studio">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </motion.button>
        </div>

        {/* ── Top-right: Undo, Redo, Save ── */}
        <div className="fixed top-3 right-3 z-30 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
          <motion.button className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-30" style={glass} onClick={() => { closeAllDrawers(); canvasApiRef.current?.undo(); }} disabled={!canUndo} whileTap={{ scale: 0.9 }} aria-label="Undo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M3 7v6h6"/><path d="M3 13a9 9 0 1 0 3-7.7L3 7"/></svg>
          </motion.button>
          <motion.button className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-30" style={glass} onClick={() => { closeAllDrawers(); canvasApiRef.current?.redo(); }} disabled={!canRedo} whileTap={{ scale: 0.9 }} aria-label="Redo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M21 7v6h-6"/><path d="M21 13a9 9 0 1 1-3-7.7L21 7"/></svg>
          </motion.button>
          <motion.button className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer" style={{ ...glass, background: 'rgba(107,203,119,0.8)' }} onClick={() => { closeAllDrawers(); canvasApiRef.current?.save(); }} whileTap={{ scale: 0.9 }} aria-label="Save artwork">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>
          </motion.button>
        </div>

        {/* ── Right: Tool rail + size slider + zoom ── */}
        <div className="fixed right-2 top-16 bottom-16 z-30 flex flex-col items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Collapse/expand toggle */}
          <motion.button
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
            style={glass}
            onClick={() => setRailCollapsed(!railCollapsed)}
            whileTap={{ scale: 0.9 }}
            aria-label={railCollapsed ? 'Show tools' : 'Hide tools'}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round">
              {railCollapsed ? <><line x1="4" y1="12" x2="20" y2="12"/><line x1="12" y1="4" x2="12" y2="20"/></> : <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>}
            </svg>
          </motion.button>

          {!railCollapsed && <>
          {/* Tool buttons */}
          <div className="flex flex-col gap-1 p-1.5 rounded-2xl" style={glass}>
            {([
              { id: 'brush' as const, label: 'Brush', d: 'M18 3a3 3 0 0 0-3 3v1l-8 8-3 3h6l8-8V9a3 3 0 0 0-3-3z' },
              { id: 'eraser' as const, label: 'Eraser', d: 'M20 20H7L3 16c-.6-.6-.6-1.5 0-2.1L14.6 2.3c.6-.6 1.5-.6 2.1 0L21.7 7.3c.6.6.6 1.5 0 2.1L12 19' },
              { id: 'fill' as const, label: 'Fill', d: 'M2 22l1-1h3l7-7M13 14l-1.5-1.5L16 8l5 5-4.5 4.5' },
              { id: 'stamp' as const, label: 'Sticker', d: 'M12 2l3 7h7l-5.5 5 2.5 7L12 17l-7 4 2.5-7L2 9h7z' },
            ] as const).map((t) => (
              <motion.button key={t.id} className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer" style={{ background: activeTool === t.id ? 'rgba(255,255,255,0.2)' : 'transparent' }} onClick={() => handleToolChange(t.id)} whileTap={{ scale: 0.9 }} aria-label={t.label} aria-pressed={activeTool === t.id}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={activeTool === t.id ? '#FFE66D' : 'rgba(255,255,255,0.6)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={t.d}/></svg>
              </motion.button>
            ))}
            <div className="w-6 h-px mx-auto" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <motion.button className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer" onClick={() => { closeAllDrawers(); canvasApiRef.current?.clear(); }} whileTap={{ scale: 0.9 }} aria-label="Clear">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </motion.button>
          </div>

          {/* Vertical size slider */}
          <div className="flex flex-col items-center gap-1 p-1.5 rounded-xl" style={glass}>
            <div className="w-3 h-3 rounded-full" style={{ background: activeColor }} />
            <input
              type="range"
              min={1}
              max={40}
              value={studioBrushSize}
              onChange={(e) => setStudioBrushSize(Number(e.target.value))}
              className="h-20 cursor-pointer"
              style={{ writingMode: 'vertical-lr', direction: 'rtl', accentColor: activeColor, width: 20 }}
              aria-label="Brush size"
            />
            <div className="w-5 h-5 rounded-full" style={{ background: activeColor }} />
          </div>

          {/* Zoom controls */}
          <ZoomControls
            zoom={zoom}
            onZoomIn={() => setZoom((z) => Math.min(5, z + 0.25))}
            onZoomOut={() => setZoom((z) => Math.max(0.3, z - 0.25))}
            onReset={() => {
              setZoom(Math.min((window.innerWidth - 60) / canvasW, (window.innerHeight - 56) / canvasH, 1));
              setPanX(0); setPanY(0);
            }}
          />
          </>}
        </div>

        {/* ── Bottom-left: Compact color control ── */}
        <div className="fixed bottom-3 left-3 z-30 flex items-center gap-1.5 p-1.5 rounded-2xl" style={glass} onClick={(e) => e.stopPropagation()}>
          {/* Active color preview */}
          <motion.button
            className="w-10 h-10 rounded-xl cursor-pointer border-2"
            style={{ background: activeColor, borderColor: 'rgba(255,255,255,0.2)', boxShadow: `0 0 8px ${activeColor}40` }}
            onClick={() => { closeAllDrawers(); setTimeout(() => setShowColorWheel(true), 50); }}
            whileTap={{ scale: 0.9 }}
            aria-label="Open color picker"
          />
          {/* Color wheel button */}
          <motion.button
            className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #FF6B6B, #FFD93D, #6BCB77, #45B7D1, #A78BFA)', padding: '1.5px' }}
            onClick={() => { closeAllDrawers(); setTimeout(() => setShowColorWheel(true), 50); }}
            whileTap={{ scale: 0.9 }}
            aria-label="Color wheel"
          >
            <div className="w-full h-full rounded-[9px] flex items-center justify-center" style={{ background: 'rgba(30,30,45,0.85)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
          </motion.button>
        </div>

        {/* ── Drawers ── */}
        <BrushDrawer open={showBrushDrawer} onClose={() => setShowBrushDrawer(false)} activeBrush={activeBrush} onBrushChange={handleBrushChange} brushSize={studioBrushSize} onSizeChange={setStudioBrushSize} brushOpacity={studioOpacity} onOpacityChange={setStudioOpacity} activeColor={activeColor} />
        <StickerPicker open={showStickerPicker} onClose={() => setShowStickerPicker(false)} activeSticker={activeSticker?.id || null} onStickerSelect={(s) => { setActiveSticker(s); setActiveTool('stamp'); }} />
        <ColorWheelModal open={showColorWheel} onClose={() => setShowColorWheel(false)} activeColor={activeColor} onColorChange={handleColorChange} savedColors={savedColors} onSaveColor={handleSaveColor} recentColors={recentColors} />
      </div>
    );
  }

  // ===== MAIN PAGE =====
  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto" }} className="min-h-dvh px-4 pt-4 pb-8 relative page-with-bg md:px-8 lg:px-12">
      <AnimatedBackground theme="create" />
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <NavButton onClick={() => navigate('/menu')} direction="back" />
        <h2 className="text-xl font-extrabold tracking-tight" style={{ color: '#FF6B6B' }}>
          Coloring Studio
        </h2>
        <div className="w-14" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <motion.button
            key={tab.key}
            className={`flex-1 py-2.5 rounded-[14px] font-bold text-sm cursor-pointer transition-colors ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white'
                : 'bg-white text-[#6B6B7B] border border-[#F0EAE0]'
            }`}
            style={
              activeTab === tab.key
                ? { boxShadow: '0 4px 20px rgba(255,107,107,0.25)' }
                : { boxShadow: '0 2px 8px rgba(45,45,58,0.04)' }
            }
            onClick={() => {
              if (tab.key === 'free-draw') {
                openFreeDraw();
              } else {
                setActiveTab(tab.key);
              }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="flex items-center gap-1.5">{tab.icon} {tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <motion.div
            key="templates"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Category filter */}
            <div className="mb-4">
              <CategoryFilterBar
                categories={coloringCategories.map((c) => ({
                  key: c.key,
                  label: c.label,
                  emoji: c.emoji,
                  icon: getColoringCategoryIcon(c.key, 14),
                }))}
                activeCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>

            {/* Template cards grid — with subtle backdrop to reduce background noise */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 relative z-10 rounded-2xl p-2 -mx-2" style={{ background: 'rgba(255,248,240,0.5)', backdropFilter: 'blur(4px)' }}>
              {filteredTemplates.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-5xl mb-3"><svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{display:'inline-block'}}><rect x="6" y="6" width="36" height="36" rx="4" stroke="#A78BFA" strokeWidth="2.5" fill="#F3EFFE"/><path d="M12 30L20 22L28 30L36 20" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="16" cy="16" r="3" fill="#FFE66D"/></svg></p>
                  <p className="font-medium" style={{ color: '#6B6B7B' }}>No templates found</p>
                </div>
              ) : (
                filteredTemplates.map((template, i) => {
                  return (
                  <motion.button
                    key={template.id}
                    className="rounded-[16px] text-left cursor-pointer overflow-hidden"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid #F0EAE0', boxShadow: '0 2px 12px rgba(45,45,58,0.06)' }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.3) }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => openTemplate(template)}
                  >
                    {/* Real SVG outline preview */}
                    <div
                      className="w-full bg-white flex items-center justify-center overflow-hidden"
                      style={{ aspectRatio: '4 / 3', padding: '8px' }}
                      aria-hidden="true"
                      dangerouslySetInnerHTML={{ __html: template.svgOutline }}
                    />
                    <div className="px-2.5 py-2">
                      <h3 className="font-bold text-[12px] leading-tight truncate" style={{ color: '#2D2D3A' }}>{template.title}</h3>
                      <span
                        className="inline-block mt-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                        style={
                          template.difficulty === 'easy'
                            ? { backgroundColor: '#EDFAEF', color: '#6BCB77' }
                            : template.difficulty === 'medium'
                            ? { backgroundColor: '#FFFCE8', color: '#E6A817' }
                            : { backgroundColor: '#FFF0F0', color: '#FF6B6B' }
                        }
                      >
                        {template.difficulty}
                      </span>
                    </div>
                  </motion.button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <motion.div
            key="gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ArtworkGallery
              artworks={artworks.map((a) => ({
                id: a.id,
                title: a.title,
                dataUrl: a.dataUrl,
                createdAt: a.createdAt,
              }))}
              onDelete={deleteArtwork}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save toast — replaces native alert */}
      {saveToast && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full font-display text-sm text-white animate-bounce-in"
          style={{ background: 'linear-gradient(135deg, #4CAF50, #66BB6A)', boxShadow: '0 4px 20px rgba(76,175,80,0.3)' }}
        >
          Saved to your Scrapbook!
        </div>
      )}
    </div>
  );
}
