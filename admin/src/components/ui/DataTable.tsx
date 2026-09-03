import { type ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  /**
   * Derives a stable key for each row. Defaults to `item.id` when the row has
   * one, falling back to the row index.
   *
   * Row types without an `id` (an API result keyed by name, say) should pass
   * this explicitly — and must pass it to use selection, since selection is
   * tracked by these keys.
   */
  getRowId?: (item: T, index: number) => string;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-bg rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

export function DataTable<T>({
  columns,
  data,
  loading,
  emptyMessage = 'No data found.',
  onRowClick,
  getRowId,
  selectedIds,
  onSelectionChange,
}: DataTableProps<T>) {
  const rowId = (item: T, index: number): string =>
    getRowId?.(item, index) ?? (item as { id?: string }).id ?? String(index);

  const hasSelection = selectedIds !== undefined && onSelectionChange !== undefined;
  const allSelected = data.length > 0 && data.every((item, i) => selectedIds?.has(rowId(item, i)));

  const toggleAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(data.map((item, i) => rowId(item, i))));
    }
  };

  const toggleRow = (id: string) => {
    if (!onSelectionChange || !selectedIds) return;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-bg border-b border-border sticky top-0 z-10">
              {hasSelection && (
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded" />
                </th>
              )}
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left font-medium text-text-secondary">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} cols={columns.length + (hasSelection ? 1 : 0)} />
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (hasSelection ? 1 : 0)} className="px-4 py-12 text-center text-text-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={rowId(item, index)}
                  onClick={() => onRowClick?.(item)}
                  className={`transition-colors
                    ${onRowClick ? 'cursor-pointer hover:bg-bg' : ''}
                    ${selectedIds?.has(rowId(item, index)) ? 'bg-primary/5' : 'bg-surface'}`}
                >
                  {hasSelection && (
                    <td className="w-10 px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds?.has(rowId(item, index)) ?? false}
                        onChange={() => toggleRow(rowId(item, index))}
                        className="rounded"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-text">
                      {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key] as ReactNode}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
