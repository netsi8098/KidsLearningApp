type Size = 'sm' | 'md' | 'lg';

interface AvatarProps {
  name: string;
  size?: Size;
  src?: string;
}

const sizeStyles: Record<Size, string> = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
};

const bgColors = [
  'bg-primary', 'bg-success', 'bg-warning', 'bg-danger', 'bg-info',
];

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return bgColors[Math.abs(hash) % bgColors.length] ?? 'bg-primary';
}

export function Avatar({ name, size = 'md', src }: AvatarProps) {
  const initial = name.charAt(0).toUpperCase();
  const sizeClass = sizeStyles[size];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClass} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} ${getColorFromName(name)} rounded-full flex items-center justify-center text-white font-medium`}
      title={name}
    >
      {initial}
    </div>
  );
}
