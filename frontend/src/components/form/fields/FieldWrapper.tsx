import { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface FieldWrapperProps {
  label: string;
  error?: string;
  required?: boolean;
  description?: string;
  children: ReactNode;
  htmlFor?: string;
}

export function FieldWrapper({
  label,
  error,
  required,
  description,
  children,
  htmlFor,
}: FieldWrapperProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-foreground"
      >
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {children}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
