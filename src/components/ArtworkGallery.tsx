/**
 * ArtworkGallery — Sketchbook-style gallery for saved coloring artworks.
 * Compact cards, SVG icons (no emoji), double-tap delete.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';

interface ArtworkItem {
  id?: number;
  title: string;
  dataUrl: string;
  createdAt: Date;
}

interface ArtworkGalleryProps {
  artworks: ArtworkItem[];
  onDelete: (id: number) => void;
}

function TrashSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3,6 5,6 21,6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" /><path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function CheckSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  );
}

function EmptyGallerySvg() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
      <rect x="6" y="10" width="44" height="36" rx="4" stroke="#D4D4E8" strokeWidth="2" fill="#F5F3FF" />
      <path d="M6 34L18 24L28 32L38 22L50 34" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      <circle cx="18" cy="20" r="4" fill="#FFE66D" opacity="0.5" />
      <rect x="22" y="6" width="12" height="8" rx="2" fill="#FF8FAB" opacity="0.3" />
    </svg>
  );
}

export default function ArtworkGallery({ artworks, onDelete }: ArtworkGalleryProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  if (artworks.length === 0) {
    return (
      <div className="text-center py-12">
        <EmptyGallerySvg />
        <p className="font-bold mt-3" style={{ color: '#6B6B7B' }}>No artworks yet</p>
        <p className="text-sm mt-1" style={{ color: '#9B9BAB' }}>
          Your saved drawings will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {artworks.map((artwork, i) => (
        <motion.div
          key={artwork.id ?? i}
          className="rounded-2xl overflow-hidden relative"
          style={{
            background: '#FFFFFF',
            border: '1px solid #F0EAE0',
            boxShadow: '0 2px 10px rgba(45,45,58,0.06)',
          }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
        >
          {/* Artwork preview — 4:3 ratio, compact */}
          <div className="w-full relative" style={{ aspectRatio: '4 / 3', background: '#FAFAF8' }}>
            <img
              src={artwork.dataUrl}
              alt={artwork.title}
              className="w-full h-full object-contain"
              loading="lazy"
            />

            {/* Delete button — top-right corner */}
            <motion.button
              className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
              style={{
                background: confirmDeleteId === artwork.id ? '#FF6B6B' : 'rgba(255,255,255,0.9)',
                color: confirmDeleteId === artwork.id ? 'white' : '#9B9BAB',
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              }}
              onClick={() => {
                if (confirmDeleteId === artwork.id) {
                  if (artwork.id !== undefined) onDelete(artwork.id);
                  setConfirmDeleteId(null);
                } else {
                  setConfirmDeleteId(artwork.id ?? null);
                  setTimeout(() => setConfirmDeleteId(null), 3000);
                }
              }}
              whileTap={{ scale: 0.85 }}
              aria-label={confirmDeleteId === artwork.id ? 'Confirm delete' : 'Delete artwork'}
            >
              {confirmDeleteId === artwork.id ? <CheckSvg /> : <TrashSvg />}
            </motion.button>
          </div>

          {/* Info footer */}
          <div className="px-2.5 py-2">
            <p className="text-[11px] font-bold truncate" style={{ color: '#2D2D3A' }}>{artwork.title}</p>
            <p className="text-[10px] mt-0.5" style={{ color: '#9B9BAB' }}>
              {new Date(artwork.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Delete confirmation overlay */}
          {confirmDeleteId === artwork.id && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ background: 'rgba(0,0,0,0.15)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-[11px] font-bold text-white px-3 py-1.5 rounded-full" style={{ background: '#FF6B6B', boxShadow: '0 2px 8px rgba(255,107,107,0.3)' }}>
                Tap again to delete
              </p>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
