import { type TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label?: string;
  error?: string;
  hint?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function TextArea({
  label,
  error,
  hint,
  rows = 4,
  disabled,
  className = '',
  id,
  ...rest
}: TextAreaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={className}>
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-text mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        disabled={disabled}
        className={`w-full px-3 py-2 text-sm text-text bg-surface border rounded-md
          placeholder:text-text-muted transition-colors resize-y
          focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
          ${error ? 'border-danger' : 'border-border'}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-bg' : ''}`}
        {...rest}
      />
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      {!error && hint && <p className="mt-1.5 text-xs text-text-muted">{hint}</p>}
    </div>
  );
}
