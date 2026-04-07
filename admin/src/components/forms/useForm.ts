import { useState, useCallback, useRef, useEffect } from 'react';
import type { ZodSchema } from 'zod';

interface UseFormOptions<T extends Record<string, any>> {
  initialValues: T;
  zodSchema?: ZodSchema<T>;
  onSubmit: (values: T) => void | Promise<void>;
  autosave?: boolean;
  autosaveMs?: number;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  zodSchema,
  onSubmit,
  autosave = false,
  autosaveMs = 2000,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouchedMap] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validate = useCallback(
    (vals: T): Record<string, string> => {
      if (!zodSchema) return {};
      const result = zodSchema.safeParse(vals);
      if (result.success) return {};
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join('.');
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return fieldErrors;
    },
    [zodSchema],
  );

  const setValue = useCallback((field: string, value: any) => {
    setValues((prev) => {
      const next = { ...prev, [field]: value } as T;
      setIsDirty(true);
      return next;
    });
  }, []);

  const setTouched = useCallback((field: string) => {
    setTouchedMap((prev) => ({ ...prev, [field]: true }));
  }, []);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const fieldErrors = validate(values);
      setErrors(fieldErrors);
      if (Object.keys(fieldErrors).length > 0) return;
      setIsSubmitting(true);
      try {
        await onSubmit(values);
        setIsDirty(false);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate, onSubmit],
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouchedMap({});
    setIsDirty(false);
  }, [initialValues]);

  // Autosave debounce
  useEffect(() => {
    if (!autosave || !isDirty) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      handleSubmit();
    }, autosaveMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autosave, isDirty, values, autosaveMs, handleSubmit]);

  return {
    values,
    errors,
    touched,
    setValue,
    setTouched,
    handleSubmit,
    isSubmitting,
    isDirty,
    reset,
  };
}
