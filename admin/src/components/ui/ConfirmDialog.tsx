import { Modal } from './Modal';

type Variant = 'danger' | 'primary';

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: Variant;
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-primary hover:bg-primary-hover',
  danger: 'bg-danger hover:opacity-90',
};

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'primary',
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm">
      <p className="text-sm text-text-secondary mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-text bg-surface border border-border rounded-md hover:bg-bg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${variantStyles[variant]}`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
