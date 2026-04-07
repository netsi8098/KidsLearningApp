import type { ReactNode } from 'react';

interface CompareSide {
  label: string;
  content: ReactNode;
}

interface ComparePanelProps {
  left: CompareSide;
  right: CompareSide;
}

export function ComparePanel({ left, right }: ComparePanelProps) {
  return (
    <div
      className="flex rounded-lg border overflow-hidden"
      style={{ borderColor: '#E1E4E8', backgroundColor: '#FFF' }}
    >
      {/* Left side */}
      <div className="flex-1 flex flex-col min-w-0">
        <div
          className="px-4 py-2 text-sm font-semibold border-b"
          style={{ color: '#24292E', borderColor: '#E1E4E8', backgroundColor: '#FAFBFC' }}
        >
          {left.label}
        </div>
        <div className="p-4 overflow-y-auto flex-1" style={{ maxHeight: '480px' }}>
          {left.content}
        </div>
      </div>

      {/* Divider */}
      <div className="w-px shrink-0" style={{ backgroundColor: '#E1E4E8' }} />

      {/* Right side */}
      <div className="flex-1 flex flex-col min-w-0">
        <div
          className="px-4 py-2 text-sm font-semibold border-b"
          style={{ color: '#24292E', borderColor: '#E1E4E8', backgroundColor: '#FAFBFC' }}
        >
          {right.label}
        </div>
        <div className="p-4 overflow-y-auto flex-1" style={{ maxHeight: '480px' }}>
          {right.content}
        </div>
      </div>
    </div>
  );
}
