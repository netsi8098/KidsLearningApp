import { type InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export function Checkbox({
  label,
  checked = false,
  onChange,
  disabled,
  className = '',
  id,
  ...rest
}: CheckboxProps) {
  const checkboxId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <label
      htmlFor={checkboxId}
      className={`inline-flex items-center gap-2 select-none
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}`}
    >
      <input
        id={checkboxId}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="h-4 w-4 rounded-sm border-border text-primary
          focus:ring-2 focus:ring-primary/30 focus:ring-offset-0
          disabled:cursor-not-allowed accent-primary"
        {...rest}
      />
      <span className="text-sm text-text">{label}</span>
    </label>
  );
}
