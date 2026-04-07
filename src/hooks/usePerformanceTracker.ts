import { useCallback, useRef } from 'react';
import { db } from '../db/database';

const BATCH_SIZE = 10;

export function usePerformanceTracker() {
  const batchRef = useRef<{ name: string; value: number; recordedAt: Date }[]>([]);

  const trackMetric = useCallback(async (name: string, value: number) => {
    const entry = { name, value, recordedAt: new Date() };
    batchRef.current.push(entry);

    // Batch write when we hit the threshold
    if (batchRef.current.length >= BATCH_SIZE) {
      const batch = [...batchRef.current];
      batchRef.current = [];
      await db.performanceMetrics.bulkAdd(batch);
    }
  }, []);

  const flushMetrics = useCallback(async () => {
    if (batchRef.current.length > 0) {
      const batch = [...batchRef.current];
      batchRef.current = [];
      await db.performanceMetrics.bulkAdd(batch);
    }
  }, []);

  const getStartupTime = useCallback((): number => {
    if (typeof performance !== 'undefined' && performance.timing) {
      const timing = performance.timing;
      return timing.domContentLoadedEventEnd - timing.navigationStart;
    }
    // Use Performance API entries as fallback
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      if (nav) {
        return Math.round(nav.domContentLoadedEventEnd);
      }
    }
    return 0;
  }, []);

  const getMetrics = useCallback(async (name?: string) => {
    if (name) {
      return db.performanceMetrics.where('name').equals(name).toArray();
    }
    return db.performanceMetrics.toArray();
  }, []);

  return { trackMetric, flushMetrics, getStartupTime, getMetrics };
}
