import { FieldValues, UseFormReturn } from 'react-hook-form';
import { FieldConfig } from '../../../lib/form/types';
import { FieldWrapper } from './FieldWrapper';
import { ChevronDown } from 'lucide-react';

interface SelectFieldProps<TFieldValues extends FieldValues> {
  field: FieldConfig<TFieldValues>;
  form: UseFormReturn<TFieldValues>;
  error?: string;
}

export function SelectField<TFieldValues extends FieldValues>({
  field,
  form,
  error,
}: SelectFieldProps<TFieldValues>) {
  const { register } = form;

  return (
    <FieldWrapper
      label={field.label}
      error={error}
      required={field.required}
      description={field.description}
    >
      <div className="relative">
        <select
          {...register(field.name, {
            onChange: (e) => {
              if (field.onChange) {
                field.onChange(e.target.value, form);
              }
            },
          })}
          disabled={field.disabled}
          className={`
            w-full appearance-none rounded-lg border px-4 py-2.5 pr-10 text-sm transition-all
            ${
              error
                ? 'border-destructive/50 bg-destructive/10 text-foreground focus:border-destructive focus:ring-destructive'
                : 'border-input bg-background text-foreground focus:border-ring focus:ring-ring'
            }
            ${field.disabled ? 'cursor-not-allowed bg-muted text-muted-foreground' : 'cursor-pointer'}
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            ${field.className || ''}
          `}
        >
          <option value="" className="bg-background text-foreground">
            {field.placeholder || `Select ${field.label}`}
          </option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value} className="bg-background text-foreground">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </FieldWrapper>
  );
}
