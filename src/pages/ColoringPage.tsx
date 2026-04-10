import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useArtwork } from '../hooks/useArtwork';
import { coloringTemplates, coloringCategories, type ColoringTemplate } from '../data/coloringData';
import CategoryFilterBar from '../components/CategoryFilterBar';
import DrawingCanvas from '../components/DrawingCanvas';
import ArtworkGallery from '../components/ArtworkGallery';
import NavButton from '../components/NavButton';
import AnimatedBackground from '../components/svg/AnimatedBackground';

type TabKey = 'templates' | 'free-draw' | 'gallery';

export default function ColoringPage() {
  const navigate = useNavigate();
  const { currentPlayer } = useApp();
  const playerId = currentPlayer?.id;
  const { artworks, saveArtwork, deleteArtwork } = useArtwork(playerId);

  const [activeTab, setActiveTab] = useState<TabKey>('templates');
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

  // Save artwork from canvas
  const handleSave = useCallback(
    (dataUrl: string) => {
      const title = activeTemplate
        ? `${activeTemplate.title} - Coloring`
        : `Free Draw - ${new Date().toLocaleDateString()}`;
      saveArtwork(title, dataUrl, activeTemplate?.id);
      exitDrawing();
      setActiveTab('gallery');
    },
    [activeTemplate, saveArtwork, exitDrawing]
  );

  if (!currentPlayer) return <Navigate to="/" replace />;

  const tabs: { key: TabKey; label: string; emoji: string }[] = [
    { key: 'templates', label: 'Templates', emoji: '🖼️' },
    { key: 'free-draw', label: 'Free Draw', emoji: '✏️' },
    { key: 'gallery', label: 'Gallery', emoji: '🎨' },
  ];

  // ===== DRAWING MODE =====
  if (drawingMode) {
    return (
      <div className="min-h-dvh bg-[#FFF8F0] flex flex-col">
        {/* Drawing header */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <motion.button
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg cursor-pointer"
            style={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', boxShadow: '0 2px 8px rgba(45,45,58,0.06)' }}
            onClick={exitDrawing}
            whileTap={{ scale: 0.9 }}
          >
            ✕
          </motion.button>
          <h3 className="text-sm font-bold truncate mx-3 flex-1 text-center" style={{ color: '#2D2D3A' }}>
            {activeTemplate ? activeTemplate.title : 'Free Draw'}
          </h3>
          <div className="w-10" />
        </div>

        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center px-4 pb-4">
          <DrawingCanvas
            templateSvg={activeTemplate?.svgOutline}
            onSave={handleSave}
          />
        </div>
      </div>
    );
  }

  // ===== MAIN PAGE =====
  return (
    <div className="min-h-dvh px-4 pt-4 pb-8 relative">
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
            {tab.emoji} {tab.label}
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
                }))}
                activeCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>

            {/* Template cards grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredTemplates.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-5xl mb-3">🖼️</p>
                  <p className="font-medium" style={{ color: '#6B6B7B' }}>No templates found</p>
                </div>
              ) : (
                filteredTemplates.map((template, i) => (
                  <motion.button
                    key={template.id}
                    className="rounded-[20px] p-4 text-center cursor-pointer"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid #F0EAE0', boxShadow: '0 2px 12px rgba(45,45,58,0.06)' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => openTemplate(template)}
                  >
                    <div className="text-4xl mb-2">{template.emoji}</div>
                    <h3 className="font-bold text-sm" style={{ color: '#2D2D3A' }}>{template.title}</h3>
                    <span
                      className="inline-block mt-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold"
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
                  </motion.button>
                ))
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
    </div>
  );
}
