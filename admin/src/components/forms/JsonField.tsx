import { useState, useCallback } from 'react';

interface JsonFieldProps {
  value: any;
  onChange: (value: any) => void;
  label?: string;
}

export function JsonField({ value, onChange, label }: JsonFieldProps) {
  const [raw, setRaw] = useState(() => JSON.stringify(value ?? {}, null, 2));
  const [error, setError] = useState<string | null>(null);

  const handleBlur = useCallback(() => {
    try {
      const parsed = JSON.parse(raw);
      setError(null);
      onChange(parsed);
    } catch (e) {
      setError('Invalid JSON');
    }
  }, [raw, onChange]);

  return (
    <div>
      {label && <label className="block text-sm font-medium text-text mb-1.5">{label}</label>}
      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        onBlur={handleBlur}
        rows={8}
        spellCheck={false}
        className={`w-full px-3 py-2 text-sm font-mono text-text bg-surface border rounded-md
          resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
          ${error ? 'border-danger' : 'border-border'}`}
      />
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}
