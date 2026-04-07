interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { spinner: 'h-5 w-5', text: 'text-xs' },
  md: { spinner: 'h-8 w-8', text: 'text-sm' },
  lg: { spinner: 'h-12 w-12', text: 'text-base' },
};

export function LoadingState({ message = 'Loading...', size = 'md' }: LoadingStateProps) {
  const s = sizeMap[size];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 gap-3">
      <div
        className={`${s.spinner} rounded-full border-2 animate-spin`}
        style={{
          borderColor: '#E1E4E8',
          borderTopColor: '#3B82F6',
        }}
      />
      {message && (
        <p className={`${s.text} font-medium`} style={{ color: '#57606A' }}>
          {message}
        </p>
      )}
    </div>
  );
}
