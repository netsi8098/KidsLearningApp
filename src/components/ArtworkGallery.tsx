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

export default function ArtworkGallery({ artworks, onDelete }: ArtworkGalleryProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  if (artworks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-5xl mb-3">🖼️</p>
        <p className="text-gray-500 font-medium">No artworks yet</p>
        <p className="text-gray-400 text-sm mt-1">
          Your saved drawings will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {artworks.map((artwork, i) => (
        <motion.div
          key={artwork.id ?? i}
          className="bg-white rounded-2xl shadow-md overflow-hidden relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
        >
          {/* Artwork image */}
          <img
            src={artwork.dataUrl}
            alt={artwork.title}
            className="w-full aspect-square object-contain bg-gray-50"
            loading="lazy"
          />

          {/* Info bar */}
          <div className="p-2">
            <p className="text-xs font-bold text-gray-700 truncate">{artwork.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(artwork.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Delete button */}
          <motion.button
            className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-xs cursor-pointer"
            onClick={() => {
              if (confirmDeleteId === artwork.id) {
                if (artwork.id !== undefined) {
                  onDelete(artwork.id);
                }
                setConfirmDeleteId(null);
              } else {
                setConfirmDeleteId(artwork.id ?? null);
                // Auto-reset confirmation after 3s
                setTimeout(() => setConfirmDeleteId(null), 3000);
              }
            }}
            whileTap={{ scale: 0.8 }}
          >
            {confirmDeleteId === artwork.id ? '✓' : '🗑️'}
          </motion.button>

          {/* Delete confirmation overlay */}
          {confirmDeleteId === artwork.id && (
            <motion.div
              className="absolute inset-0 bg-black/20 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-xs font-bold text-white bg-coral px-3 py-1 rounded-full shadow">
                Tap again to delete
              </p>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
