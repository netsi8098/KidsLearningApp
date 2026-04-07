interface AutosaveIndicatorProps {
  isDirty: boolean;
  isSubmitting: boolean;
  lastSaved?: Date;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function AutosaveIndicator({ isDirty, isSubmitting, lastSaved }: AutosaveIndicatorProps) {
  if (isSubmitting) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        Saving...
      </span>
    );
  }

  if (isDirty) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-warning">
        <span className="h-1.5 w-1.5 rounded-full bg-warning" />
        Unsaved changes
      </span>
    );
  }

  if (lastSaved) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-success">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        Saved at {formatTime(lastSaved)}
      </span>
    );
  }

  return null;
}
