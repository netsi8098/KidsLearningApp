interface WaveDividerProps {
  color?: string;
  flip?: boolean;
  height?: number;
  className?: string;
}

export default function WaveDivider({
  color = '#FFF8F0',
  flip = false,
  height = 32,
  className = '',
}: WaveDividerProps) {
  return (
    <div
      className={`w-full leading-[0] ${className}`}
      style={flip ? { transform: 'scaleY(-1)' } : undefined}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height={height}
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={`M0,24 C240,4 480,44 720,24 C960,4 1200,44 1440,24 L1440,48 L0,48 Z`}
          fill={color}
        />
      </svg>
    </div>
  );
}
