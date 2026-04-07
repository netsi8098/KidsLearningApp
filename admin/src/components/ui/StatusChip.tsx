type Status = 'draft' | 'in_review' | 'approved' | 'published' | 'archived' | 'rejected';

interface StatusChipProps {
  status: Status;
}

const statusConfig: Record<Status, { label: string; classes: string }> = {
  draft: { label: 'Draft', classes: 'bg-gray-100 text-gray-600' },
  in_review: { label: 'In Review', classes: 'bg-warning/10 text-warning' },
  approved: { label: 'Approved', classes: 'bg-info/10 text-info' },
  published: { label: 'Published', classes: 'bg-success/10 text-success' },
  archived: { label: 'Archived', classes: 'bg-gray-100 text-text-muted' },
  rejected: { label: 'Rejected', classes: 'bg-danger/10 text-danger' },
};

export function StatusChip({ status }: StatusChipProps) {
  const { label, classes } = statusConfig[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      {label}
    </span>
  );
}
