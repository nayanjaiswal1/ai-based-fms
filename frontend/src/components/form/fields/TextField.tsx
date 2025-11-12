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
          w-full rounded-lg border px-4 py-2.5 text-sm transition-all
          ${
            error
              ? 'border-destructive/50 bg-destructive/10 text-foreground focus:border-destructive focus:ring-destructive'
              : 'border-input bg-background text-foreground focus:border-ring focus:ring-ring'
          }
          ${field.disabled || field.readonly ? 'cursor-not-allowed bg-muted text-muted-foreground' : ''}
          focus:outline-none focus:ring-2 focus:ring-opacity-50
          disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground
          placeholder:text-muted-foreground
          ${field.className || ''}
        `}
      />
    </FieldWrapper>
  );
}
