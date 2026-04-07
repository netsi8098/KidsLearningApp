import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface HelpButtonProps {
  articleSlug?: string;
  className?: string;
}

export default function HelpButton({ articleSlug, className = '' }: HelpButtonProps) {
  const navigate = useNavigate();

  function handleClick() {
    if (articleSlug) {
      navigate(`/help?article=${articleSlug}`);
    } else {
      navigate('/help');
    }
  }

  return (
    <motion.button
      className={`w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-sm font-bold text-grape cursor-pointer ${className}`}
      onClick={handleClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Help"
    >
      ?
    </motion.button>
  );
}
