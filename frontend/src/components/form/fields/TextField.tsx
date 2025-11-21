import { FieldValues, UseFormReturn } from 'react-hook-form';
import { FieldConfig } from '../../../lib/form/types';
import { FieldWrapper } from './FieldWrapper';

interface TextFieldProps<TFieldValues extends FieldValues> {
  field: FieldConfig<TFieldValues>;
  form: UseFormReturn<TFieldValues>;
  error?: string;
}

export function TextField<TFieldValues extends FieldValues>({
  field,
  form,
  error,
}: TextFieldProps<TFieldValues>) {
  const { register } = form;

  return (
    <FieldWrapper
      label={field.label}
      error={error}
      required={field.required}
      description={field.description}
    >
      <input
        {...register(field.name, {
          onChange: (e) => {
            if (field.onChange) {
              field.onChange(e.target.value, form);
            }
          },
        })}
        type={field.type}
        placeholder={field.placeholder}
        disabled={field.disabled}
        readOnly={field.readonly}
        min={field.min}
        max={field.max}
        step={field.step}
        className={`
          w-full rounded-md border bg-transparent px-3 py-2 text-sm transition-colors
          ${error
            ? 'border-destructive text-destructive placeholder:text-destructive/60 focus:border-destructive focus:ring-1 focus:ring-destructive'
            : 'border-border text-foreground placeholder:text-muted-foreground hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary'
          }
          ${field.disabled || field.readonly ? 'cursor-not-allowed opacity-50' : ''}
          focus:outline-none
          disabled:cursor-not-allowed
          ${field.className || ''}
        `}
      />
    </FieldWrapper>
  );
}
