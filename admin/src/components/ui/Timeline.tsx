type TimelineType = 'create' | 'update' | 'delete' | 'publish' | 'review';

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  user?: string;
  type?: TimelineType;
}

interface TimelineProps {
  items: TimelineItem[];
}

const dotColors: Record<TimelineType, string> = {
  create: '#22C55E',
  update: '#3B82F6',
  delete: '#EF4444',
  publish: '#8B5CF6',
  review: '#F59E0B',
};

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="relative pl-8">
      {/* Vertical line */}
      <div
        className="absolute left-3 top-2 bottom-2 w-0.5"
        style={{ backgroundColor: '#E1E4E8' }}
      />

      <div className="flex flex-col gap-6">
        {items.map((item) => {
          const type = item.type ?? 'update';
          const color = dotColors[type];

          return (
            <div key={item.id} className="relative">
              {/* Dot */}
              <div
                className="absolute -left-5 top-1.5 h-3 w-3 rounded-full border-2 border-white"
                style={{ backgroundColor: color, boxShadow: `0 0 0 2px ${color}40` }}
              />

              <div>
                <p className="text-sm font-medium" style={{ color: '#24292E' }}>
                  {item.title}
                </p>
                {item.description && (
                  <p className="mt-0.5 text-sm" style={{ color: '#57606A' }}>
                    {item.description}
                  </p>
                )}
                <div className="mt-1 flex items-center gap-2 text-xs" style={{ color: '#8B949E' }}>
                  <span>{item.timestamp}</span>
                  {item.user && (
                    <>
                      <span>·</span>
                      <span>{item.user}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
