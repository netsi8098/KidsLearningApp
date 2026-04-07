interface ToggleProps {
  label?: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  label,
  enabled,
  onChange,
  disabled = false,
  className = '',
}: ToggleProps) {
  return (
    <label
      className={`inline-flex items-center gap-3 select-none
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}`}
    >
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full
          transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30
          ${enabled ? 'bg-primary' : 'bg-border'}
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm
            transform transition-transform duration-200
            ${enabled ? 'translate-x-[22px]' : 'translate-x-0.5'} mt-0.5`}
        />
      </button>
      {label && <span className="text-sm text-text">{label}</span>}
    </label>
  );
}
