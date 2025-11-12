import { ReactNode, useId } from 'react';
import { AlertCircle } from 'lucide-react';
import { createAriaDescribedBy } from '@/utils/accessibility';

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
  const descriptionId = useId();
  const errorId = useId();

  // Pass aria-describedby to children if they accept it
  const childrenWithAria = typeof children === 'object' && children !== null
    ? {
        ...children,
        props: {
          ...(children as any).props,
          'aria-describedby': createAriaDescribedBy(
            description ? descriptionId : undefined,
            error ? errorId : undefined
          ),
          'aria-invalid': error ? 'true' : undefined,
          'aria-required': required ? 'true' : undefined,
        },
      }
    : children;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-foreground"
      >
        {label}
        {required && (
          <span className="ml-1 text-destructive" aria-label="required">
            *
          </span>
        )}
      </label>

      {description && (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}

      {childrenWithAria}

      {error && (
        <div
          id={errorId}
          className="flex items-center gap-1.5 text-xs text-destructive"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
