import { useRef } from 'react';
import { Button } from '../ui';

interface RichTextFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function insertMarkdown(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  placeholder: string,
  onChange: (v: string) => void,
) {
  const { selectionStart, selectionEnd, value } = textarea;
  const selected = value.slice(selectionStart, selectionEnd) || placeholder;
  const next = value.slice(0, selectionStart) + before + selected + after + value.slice(selectionEnd);
  onChange(next);
  requestAnimationFrame(() => {
    textarea.focus();
    const cursor = selectionStart + before.length + selected.length;
    textarea.setSelectionRange(cursor, cursor);
  });
}

export function RichTextField({ value, onChange, placeholder }: RichTextFieldProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const actions = [
    { label: 'B', before: '**', after: '**', ph: 'bold' },
    { label: 'I', before: '*', after: '*', ph: 'italic' },
    { label: 'Link', before: '[', after: '](url)', ph: 'text' },
    { label: 'H', before: '# ', after: '', ph: 'heading' },
  ];

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div className="flex gap-1 p-1.5 bg-bg border-b border-border">
        {actions.map((a) => (
          <Button
            key={a.label}
            variant="ghost"
            size="sm"
            onClick={() => ref.current && insertMarkdown(ref.current, a.before, a.after, a.ph, onChange)}
          >
            {a.label}
          </Button>
        ))}
      </div>
      <textarea
        ref={ref}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={6}
        className="w-full px-3 py-2 text-sm text-text bg-surface resize-y
          focus:outline-none placeholder:text-text-muted"
      />
    </div>
  );
}
