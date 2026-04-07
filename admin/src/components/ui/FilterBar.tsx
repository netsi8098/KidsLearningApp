import { type ReactNode } from 'react';

interface FilterBarProps {
  children: ReactNode;
  onReset: () => void;
}

export function FilterBar({ children, onReset }: FilterBarProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap bg-surface border border-border rounded-lg px-4 py-3">
      {children}
      <button
        onClick={onReset}
        className="ml-auto text-sm text-text-secondary hover:text-text transition-colors"
      >
        Reset
      </button>
    </div>
  );
}
