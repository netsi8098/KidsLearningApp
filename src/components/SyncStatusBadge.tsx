import { motion } from 'framer-motion';
import { useSync, type SyncStatus } from '../hooks/useSync';

const statusConfig: Record<SyncStatus, { color: string; label: string; pulse: boolean }> = {
  synced: { color: 'bg-leaf', label: 'Synced', pulse: false },
  syncing: { color: 'bg-sunny', label: 'Syncing...', pulse: true },
  offline: { color: 'bg-gray-400', label: 'Offline', pulse: false },
  error: { color: 'bg-coral', label: 'Sync Error', pulse: true },
};

interface SyncStatusBadgeProps {
  showLabel?: boolean;
  className?: string;
}

export default function SyncStatusBadge({ showLabel = true, className = '' }: SyncStatusBadgeProps) {
  const { syncStatus } = useSync();
  const config = statusConfig[syncStatus];

  return (
    <motion.div
      className={`flex items-center gap-1.5 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <span className="relative flex h-2.5 w-2.5">
        {config.pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.color} opacity-75`} />
        )}
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${config.color}`} />
      </span>
      {showLabel && (
        <span className="text-xs font-medium text-gray-500">{config.label}</span>
      )}
    </motion.div>
  );
}
