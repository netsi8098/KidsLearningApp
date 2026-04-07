import { motion } from 'framer-motion';

interface NavButtonProps {
  onClick: () => void;
  direction: 'back' | 'prev' | 'next';
  disabled?: boolean;
}

function ArrowIcon({ direction }: { direction: 'back' | 'prev' | 'next' }) {
  const isLeft = direction === 'back' || direction === 'prev';
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ transform: isLeft ? 'none' : 'rotate(180deg)' }}>
      <path
        d="M12.5 15L7.5 10L12.5 5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function NavButton({ onClick, direction, disabled = false }: NavButtonProps) {
  return (
    <motion.button
      className="w-11 h-11 rounded-[14px] flex items-center justify-center disabled:opacity-25 cursor-pointer text-gray-600"
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04), inset 0 1px 1px rgba(255,255,255,0.6)',
        border: '1px solid rgba(0,0,0,0.05)',
      }}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.08, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
      whileTap={{ scale: 0.92 }}
    >
      <ArrowIcon direction={direction} />
    </motion.button>
  );
}
