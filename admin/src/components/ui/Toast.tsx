type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onDismiss: () => void;
}

const typeConfig: Record<ToastType, { bg: string; icon: string }> = {
  success: { bg: 'bg-success', icon: 'M5 13l4 4L19 7' },
  error: { bg: 'bg-danger', icon: 'M6 18L18 6M6 6l12 12' },
  warning: { bg: 'bg-warning', icon: 'M12 9v2m0 4h.01M12 3l9.5 16.5H2.5L12 3z' },
  info: { bg: 'bg-info', icon: 'M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z' },
};

export function Toast({ message, type, onDismiss }: ToastProps) {
  const { bg, icon } = typeConfig[type];

  return (
    <div className="fixed top-4 right-4 z-[60] animate-[slideInRight_0.2s_ease-out]">
      <div className="flex items-center gap-3 bg-surface border border-border rounded-lg shadow-lg px-4 py-3 min-w-72 max-w-md">
        <span className={`shrink-0 w-6 h-6 ${bg} rounded-full flex items-center justify-center`}>
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </span>
        <p className="flex-1 text-sm text-text">{message}</p>
        <button
          onClick={onDismiss}
          className="shrink-0 p-1 text-text-muted hover:text-text rounded transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
