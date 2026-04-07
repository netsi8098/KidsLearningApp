import { useState, useRef } from 'react';
import { Badge } from '../ui';

interface TagSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  availableTags?: string[];
  allowCreate?: boolean;
}

export function TagSelector({ value = [], onChange, availableTags, allowCreate = true }: TagSelectorProps) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const suggestions = availableTags?.filter(
    (t) => !value.includes(t) && t.toLowerCase().includes(input.toLowerCase()),
  );

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setInput('');
  };

  const removeTag = (tag: string) => onChange(value.filter((t) => t !== tag));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (allowCreate && input.trim()) addTag(input);
    }
    if (e.key === 'Backspace' && !input && value.length) {
      const last = value[value.length - 1];
      if (last) removeTag(last);
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1.5 p-2 border border-border rounded-md bg-surface min-h-[38px]">
        {value.map((tag) => (
          <Badge key={tag} variant="primary" className="gap-1">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="ml-0.5 hover:text-danger">
              x
            </button>
          </Badge>
        ))}
        <input
          ref={ref}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder={value.length ? '' : 'Add tag...'}
          className="flex-1 min-w-[80px] text-sm bg-transparent outline-none text-text placeholder:text-text-muted"
        />
      </div>
      {open && suggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-surface border border-border rounded-md shadow-md max-h-40 overflow-y-auto">
          {suggestions.map((tag) => (
            <li key={tag}>
              <button
                type="button"
                onMouseDown={() => addTag(tag)}
                className="w-full text-left px-3 py-1.5 text-sm text-text hover:bg-bg"
              >
                {tag}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
