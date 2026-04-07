import type { ReactNode } from 'react';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: EmptyStateAction;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="mb-4 text-4xl" style={{ color: '#8B949E' }}>
          {icon}
        </div>
      )}

      <h3 className="text-lg font-semibold" style={{ color: '#24292E' }}>
        {title}
      </h3>

      {description && (
        <p className="mt-1 text-sm max-w-sm" style={{ color: '#57606A' }}>
          {description}
        </p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90 cursor-pointer"
          style={{ backgroundColor: '#3B82F6' }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
