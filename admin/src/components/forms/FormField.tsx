import { type ReactNode } from 'react';
import { useFormContext } from './FormContext';

interface ChildProps {
  value: any;
  onChange: (value: any) => void;
  error?: string;
  touched: boolean;
}

interface FormFieldProps {
  name: string;
  label: string;
  required?: boolean;
  hint?: string;
  children: (props: ChildProps) => ReactNode;
}

export function FormField({ name, label, required, hint, children }: FormFieldProps) {
  const { values, errors, touched, setValue } = useFormContext();

  const error = touched[name] ? errors[name] : undefined;

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-text">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>
      {children({
        value: values[name],
        onChange: (v: any) => setValue(name, v),
        error,
        touched: !!touched[name],
      })}
      {error && <p className="text-xs text-danger">{error}</p>}
      {!error && hint && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  );
}
