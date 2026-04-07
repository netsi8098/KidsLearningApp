import { useCallback, useState } from 'react';

export function useFilters<T extends Record<string, unknown>>(initial: T) {
  const [filters, setFilters] = useState<T>(initial);

  const setFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => setFilters(initial), [initial]);

  const activeCount = Object.values(filters).filter((v) => v !== undefined && v !== '' && v !== null).length;

  return { filters, setFilter, clearFilters, setFilters, activeCount };
}
