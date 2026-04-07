import { motion } from 'framer-motion';

interface ColorPaletteProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const colors = [
  '#000000', // black
  '#FF6B6B', // red
  '#FF8C42', // orange
  '#FFD93D', // yellow
  '#6BCB77', // green
  '#4ECDC4', // teal
  '#74B9FF', // blue
  '#A78BFA', // purple
  '#FD79A8', // pink
  '#8B4513', // brown
  '#FFFFFF', // white
  '#808080', // gray
];

export default function ColorPalette({ selectedColor, onColorChange }: ColorPaletteProps) {
  return (
    <div className="grid grid-cols-4 gap-2.5 p-3">
      {colors.map((color) => {
        const isSelected = selectedColor === color;
        const isWhite = color === '#FFFFFF';

        return (
          <motion.button
            key={color}
            className={`w-10 h-10 rounded-full cursor-pointer ${
              isWhite ? 'border border-gray-300' : ''
            } ${isSelected ? 'ring-3 ring-offset-2 ring-teal' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => onColorChange(color)}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1 }}
          />
        );
      })}
    </div>
  );
}
