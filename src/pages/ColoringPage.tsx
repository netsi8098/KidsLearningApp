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
import { getColoringPreview } from '../components/svg/ColoringPreviews';
import { getColoringCategoryIcon } from '../components/svg/CategoryIcons';
import ToolRail from '../components/coloring/ToolRail';
import ColorRail from '../components/coloring/ColorRail';
import BrushDrawer from '../components/coloring/BrushDrawer';
import StickerPicker from '../components/coloring/StickerPicker';
import { brushes, type ToolId, type BrushId, type StickerDef } from '../components/coloring/coloringTools';

type TabKey = 'templates' | 'free-draw' | 'gallery';

export default function ColoringPage() {
  const navigate = useNavigate();
  const { currentPlayer } = useApp();
  const playerId = currentPlayer?.id;
  const { artworks, saveArtwork, deleteArtwork } = useArtwork(playerId);

  const [activeTab, setActiveTab] = useState<TabKey>('templates');
  const [saveToast, setSaveToast] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
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

  // Close all drawers/modals — including color expanded panel
  const closeAllDrawers = useCallback(() => {
    setShowBrushDrawer(false);
    setShowStickerPicker(false);
    setShowColorExpanded(false);
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

  // ===== DRAWING STUDIO MODE =====
  if (drawingMode) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(180deg, #1A1A2E 0%, #16213E 50%, #1A1A2E 100%)' }}>
        {/* Studio header — title + brush indicator */}
        <div className="flex-shrink-0 flex items-center justify-between px-3 pt-3 pb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: activeColor, boxShadow: `0 0 6px ${activeColor}50` }} />
            <h3 className="text-xs font-bold text-white/60 truncate">
              {activeTemplate ? activeTemplate.title : 'Free Draw'}
            </h3>
          </div>
          <motion.button
            className="px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
            onClick={() => { closeAllDrawers(); setTimeout(() => setShowBrushDrawer(true), 50); }}
            whileTap={{ scale: 0.95 }}
            aria-label="Open brush settings"
          >
            {brushes.find((b) => b.id === activeBrush)?.label || 'Brush'} &middot; {studioBrushSize}px
          </motion.button>
        </div>

        {/* Canvas area — centered artboard on dark easel */}
        <div className="flex-1 flex items-center justify-center px-4 py-2 min-h-0">
          {/* Artboard frame — explicit width so canvas doesn't collapse */}
          <div
            className="w-full"
            style={{
              maxWidth: 350,
              padding: '5px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
              borderRadius: '14px',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.05), 0 6px 30px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <DrawingCanvas
              ref={canvasApiRef}
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
        </div>

        {/* Bottom controls — always above drawers */}
        <div className="flex-shrink-0 relative z-30">
          {/* Tool rail */}
          <div className="flex justify-center px-3 pb-1.5">
            <ToolRail
              activeTool={activeTool}
              onToolChange={handleToolChange}
              onUndo={() => { closeAllDrawers(); canvasApiRef.current?.undo(); }}
              onRedo={() => { closeAllDrawers(); canvasApiRef.current?.redo(); }}
              onClear={() => { closeAllDrawers(); canvasApiRef.current?.clear(); }}
              onSave={() => { closeAllDrawers(); canvasApiRef.current?.save(); }}
              onClose={() => { closeAllDrawers(); exitDrawing(); }}
              canUndo={canUndo}
              canRedo={canRedo}
            />
          </div>

          {/* Color rail */}
          <div className="px-3 pb-3">
            <ColorRail
              activeColor={activeColor}
              onColorChange={handleColorChange}
              recentColors={recentColors}
              expanded={showColorExpanded}
              onExpandedChange={(open) => {
                if (open) { setShowBrushDrawer(false); setShowStickerPicker(false); }
                setShowColorExpanded(open);
              }}
            />
          </div>
        </div>

        {/* Brush drawer — z-20 so it slides under the tool rail */}
        <BrushDrawer
          open={showBrushDrawer}
          onClose={() => setShowBrushDrawer(false)}
          activeBrush={activeBrush}
          onBrushChange={handleBrushChange}
          brushSize={studioBrushSize}
          onSizeChange={setStudioBrushSize}
          brushOpacity={studioOpacity}
          onOpacityChange={setStudioOpacity}
          activeColor={activeColor}
        />

        {/* Sticker picker — z-20 so it slides under the tool rail */}
        <StickerPicker
          open={showStickerPicker}
          onClose={() => setShowStickerPicker(false)}
          activeSticker={activeSticker?.id || null}
          onStickerSelect={(s) => { setActiveSticker(s); setActiveTool('stamp'); }}
        />
      </div>
    );
  }

  // ===== MAIN PAGE =====
  return (
    <div style={{ maxWidth: "1024px", margin: "0 auto" }} className="min-h-dvh px-4 pt-4 pb-8 relative page-with-bg">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 relative z-10 rounded-2xl p-2 -mx-2" style={{ background: 'rgba(255,248,240,0.5)', backdropFilter: 'blur(4px)' }}>
              {filteredTemplates.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-5xl mb-3"><svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{display:'inline-block'}}><rect x="6" y="6" width="36" height="36" rx="4" stroke="#A78BFA" strokeWidth="2.5" fill="#F3EFFE"/><path d="M12 30L20 22L28 30L36 20" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="16" cy="16" r="3" fill="#FFE66D"/></svg></p>
                  <p className="font-medium" style={{ color: '#6B6B7B' }}>No templates found</p>
                </div>
              ) : (
                filteredTemplates.map((template, i) => {
                  const cardBg = template.category === 'animals' ? '#FFF3E0' :
                    template.category === 'alphabet' ? '#EDE7F6' :
                    template.category === 'numbers' ? '#E3F2FD' :
                    template.category === 'holidays' ? '#FFF8E1' :
                    template.category === 'nature' ? '#E8F5E9' :
                    '#FCE4EC';
                  return (
                  <motion.button
                    key={template.id}
                    className="rounded-[20px] text-center cursor-pointer overflow-hidden"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid #F0EAE0', boxShadow: '0 3px 16px rgba(45,45,58,0.08)' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ scale: 1.03, y: -2, boxShadow: '0 6px 24px rgba(45,45,58,0.12)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => openTemplate(template)}
                  >
                    {/* Colored preview area */}
                    <div className="w-full aspect-square flex items-center justify-center p-3" style={{ background: cardBg }}>
                      <div className="w-full h-full max-w-[80px] max-h-[80px]">
                        {getColoringPreview(template.id) || <span className="text-5xl block text-center leading-[80px]">{template.emoji}</span>}
                      </div>
                    </div>
                    <div className="px-3 py-2.5">
                      <h3 className="font-bold text-sm" style={{ color: '#2D2D3A' }}>{template.title}</h3>
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
