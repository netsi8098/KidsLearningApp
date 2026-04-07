import { motion, AnimatePresence } from 'framer-motion';
import { useInbox } from '../hooks/useInbox';

interface InboxBadgeProps {
  className?: string;
}

export default function InboxBadge({ className = '' }: InboxBadgeProps) {
  const { unreadCount } = useInbox();

  return (
    <span className={`relative inline-flex ${className}`}>
      <span className="text-2xl">📬</span>
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.span
            className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] bg-coral text-white text-[10px] font-bold rounded-full px-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
