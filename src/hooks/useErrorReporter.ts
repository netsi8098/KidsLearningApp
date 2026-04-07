import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type ErrorLog } from '../db/database';

const MAX_STORED_ERRORS = 50;

export function useErrorReporter() {
  const lastErrors = useLiveQuery(
    () =>
      db.errorLogs
        .orderBy('reportedAt')
        .reverse()
        .limit(20)
        .toArray(),
    [],
    [] as ErrorLog[]
  );

  const reportError = useCallback(async (error: Error | string, context?: string) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;

    await db.errorLogs.add({
      message: errorObj.message,
      stack: errorObj.stack,
      context,
      reportedAt: new Date(),
    });

    // Trim old errors to prevent unbounded growth
    const count = await db.errorLogs.count();
    if (count > MAX_STORED_ERRORS) {
      const oldest = await db.errorLogs
        .orderBy('reportedAt')
        .limit(count - MAX_STORED_ERRORS)
        .toArray();
      await db.errorLogs.bulkDelete(oldest.map((e) => e.id!));
    }
  }, []);

  const clearErrors = useCallback(async () => {
    await db.errorLogs.clear();
  }, []);

  return { reportError, lastErrors, clearErrors };
}
