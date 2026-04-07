import { type ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: ReactNode;
  className?: string;
}

export function StatsCard({ title, value, change, icon, className = '' }: StatsCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className={`bg-surface border border-border rounded-lg p-5 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary">{title}</p>
          <p className="text-2xl font-semibold text-text mt-1">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? 'text-success' : 'text-danger'}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={isPositive ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
                />
              </svg>
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <span className="p-2 bg-primary/10 text-primary rounded-lg">{icon}</span>
        )}
      </div>
    </div>
  );
}
