import { motion } from 'framer-motion';

interface BrushSizePickerProps {
  selectedSize: number;
  onSizeChange: (size: number) => void;
}

const sizes = [4, 8, 14, 22];

export default function BrushSizePicker({ selectedSize, onSizeChange }: BrushSizePickerProps) {
  return (
    <div className="flex items-center justify-center gap-4 p-3">
      {sizes.map((size) => {
        const isSelected = selectedSize === size;

        return (
          <motion.button
            key={size}
            className={`flex items-center justify-center cursor-pointer rounded-full ${
              isSelected ? 'ring-3 ring-offset-2 ring-teal' : ''
            }`}
            style={{ width: 40, height: 40 }}
            onClick={() => onSizeChange(size)}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1 }}
          >
            <div
              className="rounded-full bg-gray-800"
              style={{ width: size, height: size }}
            />
          </motion.button>
        );
      })}
    </div>
  );
}
