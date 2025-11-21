import { useForm, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { FormConfig } from '../../lib/form/types';
import { FormField } from './FormField';
import { Loader2 } from 'lucide-react';

interface ConfigurableFormProps<TFieldValues extends FieldValues> {
  config: FormConfig<TFieldValues>;
  onSubmit: (data: TFieldValues) => Promise<void> | void;
  isLoading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  className?: string;
  /**
   * Callback that fires when form dirty state changes
   * Use this with useFormProtection hook to prevent accidental close
   */
  onDirtyChange?: (isDirty: boolean) => void;
  /**
   * If true, buttons will not be rendered (useful when modal footer handles them)
   */
  hideButtons?: boolean;
  /**
   * Function to render extra content for a specific field
   */
  renderFieldExtra?: (name: string) => React.ReactNode;
  children?: React.ReactNode;
}

export function ConfigurableForm<TFieldValues extends FieldValues>({
  config,
  onSubmit,
  isLoading = false,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  onCancel,
  className = '',
  onDirtyChange,
  hideButtons = false,
  renderFieldExtra,
  children,
}: ConfigurableFormProps<TFieldValues>) {
  const form = useForm<TFieldValues>({
    resolver: zodResolver(config.schema),
    defaultValues: config.defaultValues as any,
    mode: 'onChange',
  });

  const {
    handleSubmit,
    formState: { isDirty },
    watch,
  } = form;

  // Notify parent of dirty state changes for form protection
  useEffect(() => {
    if (onDirtyChange) {
      onDirtyChange(isDirty);
    }
  }, [isDirty, onDirtyChange]);

  const onFormSubmit = handleSubmit(async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  });

  return (
    <form onSubmit={onFormSubmit} className={`space-y-6 ${className}`}>
      {config.sections.map((section, sectionIndex) => {
        // Check section condition
        if (section.condition) {
          const values = watch() as Partial<TFieldValues>;
          if (!section.condition(values)) {
            return null;
          }
        }

        return (
          <div key={sectionIndex} className="space-y-4">
            {section.title && (
              <div className="border-b border-border pb-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {section.title}
                </h3>
                {section.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {section.description}
                  </p>
                )}
              </div>
            )}

            <div
              className={`
                grid gap-4
                ${section.columns ? `grid-cols-${section.columns}` : 'grid-cols-1'}
              `}
              style={{
                gridTemplateColumns: section.columns
                  ? `repeat(${section.columns}, minmax(0, 1fr))`
                  : undefined,
              }}
            >
              {section.fields.map((field, fieldIndex) => (
                <div
                  key={`${sectionIndex}-${fieldIndex}`}
                  style={{
                    gridColumn: field.grid?.colSpan
                      ? `span ${field.grid.colSpan}`
                      : undefined,
                    gridRow: field.grid?.rowSpan
                      ? `span ${field.grid.rowSpan}`
                      : undefined,
                  }}
                >
                  <FormField
                    field={field}
                    form={form}
                    renderFieldExtra={renderFieldExtra}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {children}

      {/* Form Actions - only render if not hidden */}
      {!hideButtons && (
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !isDirty}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? 'Saving...' : submitLabel}
          </button>
        </div>
      )}
    </form>
  );
}
