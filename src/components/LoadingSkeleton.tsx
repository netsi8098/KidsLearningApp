// -- Loading Skeletons -----------------------------------------------
// Animated shimmer skeleton variants with warm cream tinting.

interface SkeletonProps {
  className?: string;
}

function Pulse({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`rounded-xl relative overflow-hidden ${className}`}
      style={{ backgroundColor: '#F0EAE0' }}
    >
      {/* Shimmer sweep */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
          animation: 'shimmer 1.8s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div
      className="rounded-[20px] p-4 space-y-3 border border-[#E8E0D4]/40"
      style={{ backgroundColor: '#FFF8F0' }}
    >
      <div className="flex items-center gap-3">
        <Pulse className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Pulse className="h-4 w-3/4 rounded-lg" />
          <Pulse className="h-3 w-1/2 rounded-lg" />
        </div>
      </div>
      <Pulse className="h-2 w-full rounded-full" />
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Pulse className="w-10 h-10 rounded-xl" />
          <div className="flex-1 space-y-1.5">
            <Pulse className="h-3.5 w-2/3 rounded-lg" />
            <Pulse className="h-2.5 w-1/3 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="rounded-[20px] overflow-hidden border border-[#E8E0D4]/40" style={{ backgroundColor: '#FFF8F0' }}>
      <Pulse className="h-40 w-full rounded-none" />
      <div className="p-4 space-y-2.5">
        <Pulse className="h-5 w-2/3 rounded-lg" />
        <Pulse className="h-3 w-full rounded-lg" />
        <Pulse className="h-3 w-4/5 rounded-lg" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }, (_, i) => (
        <Pulse key={i} className="h-28 w-full rounded-2xl" />
      ))}
    </div>
  );
}

export default function LoadingSkeleton({ variant = 'card' }: { variant?: 'card' | 'list' | 'hero' | 'grid' }) {
  switch (variant) {
    case 'list': return <ListSkeleton />;
    case 'hero': return <HeroSkeleton />;
    case 'grid': return <GridSkeleton />;
    default: return <CardSkeleton />;
  }
}
