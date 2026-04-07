import { useCallback, useRef, useState } from 'react';

interface UseMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseMutationResult<T, V> {
  data: T | undefined;
  error: Error | null;
  loading: boolean;
  mutate: (variables: V) => Promise<T | undefined>;
  reset: () => void;
}

export function useMutation<T, V = void>(
  mutationFn: (variables: V) => Promise<T>,
  options: UseMutationOptions<T> = {},
): UseMutationResult<T, V> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  const mutate = useCallback(async (variables: V) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mutationFn(variables);
      if (mountedRef.current) {
        setData(result);
        options.onSuccess?.(result);
      }
      return result;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      if (mountedRef.current) {
        setError(e);
        options.onError?.(e);
      }
      return undefined;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutationFn]);

  const reset = useCallback(() => {
    setData(undefined);
    setError(null);
    setLoading(false);
  }, []);

  return { data, error, loading, mutate, reset };
}
