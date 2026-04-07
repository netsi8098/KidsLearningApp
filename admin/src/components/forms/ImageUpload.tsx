import { useRef, useState, useCallback } from 'react';

interface ImageUploadProps {
  value: string | null;
  onChange: (value: string | null) => void;
  accept?: string;
}

export function ImageUpload({ value, onChange, accept = 'image/*' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const readFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => onChange(reader.result as string);
      reader.readAsDataURL(file);
    },
    [onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) readFile(file);
    },
    [readFile],
  );

  return (
    <div>
      {value ? (
        <div className="relative group">
          <img src={value} alt="Preview" className="w-full max-h-48 object-cover rounded-md border border-border" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 bg-danger text-white text-xs px-2 py-1 rounded
              opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Remove
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center h-36 border-2 border-dashed rounded-md
            cursor-pointer transition-colors
            ${dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
        >
          <p className="text-sm text-text-muted">Click or drag image here</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) readFile(e.target.files[0]); }}
      />
    </div>
  );
}
