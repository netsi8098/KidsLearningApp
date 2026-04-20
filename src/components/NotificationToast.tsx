/**
 * NotificationToast — in-app notification system.
 * Shows toast notifications for badges, content updates, achievements.
 */
import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'badge' | 'star' | 'info' | 'success';
  duration?: number;
}

interface NotificationContextValue {
  notify: (notification: Omit<Notification, 'id'>) => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  notify: () => {},
});

export function useNotification() {
  return useContext(NotificationContext);
}

const TYPE_COLORS = {
  badge: { bg: '#FFD93D', icon: '🏅', border: '#F59E0B' },
  star: { bg: '#FFE66D', icon: '⭐', border: '#F59E0B' },
  info: { bg: '#45B7D1', icon: 'ℹ️', border: '#2196F3' },
  success: { bg: '#4CAF50', icon: '✓', border: '#388E3C' },
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    const newNotif = { ...notification, id };
    setNotifications((prev) => [...prev, newNotif]);

    // Auto-dismiss
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, notification.duration || 3000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}

      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[9998] flex flex-col gap-2 max-w-xs">
        <AnimatePresence>
          {notifications.map((n) => {
            const config = TYPE_COLORS[n.type];
            return (
              <motion.div
                key={n.id}
                className="rounded-2xl p-3 flex items-center gap-3 cursor-pointer"
                style={{
                  background: 'white',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  borderLeft: `4px solid ${config.border}`,
                }}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                onClick={() => dismiss(n.id)}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: `${config.bg}20` }}
                >
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm text-[#2D2D3A]">{n.title}</p>
                  <p className="text-xs text-[#6B6B7B] truncate">{n.message}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}
