import { type ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ title, children, className = '', padding = true }: CardProps) {
  return (
    <div
      className={`bg-surface border border-border rounded-lg shadow-sm
        ${className}`}
    >
      {title && (
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-text">{title}</h3>
        </div>
      )}
      <div className={padding ? 'p-5' : ''}>{children}</div>
    </div>
  );
}
