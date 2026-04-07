import { createContext, useContext } from 'react';

export interface FormContextValue {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  setValue: (field: string, value: any) => void;
  setTouched: (field: string) => void;
  isSubmitting: boolean;
  isDirty: boolean;
}

export const FormContext = createContext<FormContextValue | null>(null);

export function useFormContext(): FormContextValue {
  const ctx = useContext(FormContext);
  if (!ctx) {
    throw new Error('useFormContext must be used within a FormContext.Provider');
  }
  return ctx;
}
