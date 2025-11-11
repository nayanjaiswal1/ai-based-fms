import { FieldValues, UseFormReturn } from 'react-hook-form';
import { FieldConfig } from '../../../lib/form/types';
import { FieldWrapper } from './FieldWrapper';
import { Calendar } from 'lucide-react';

interface DateFieldProps<TFieldValues extends FieldValues> {
  field: FieldConfig<TFieldValues>;
  form: UseFormReturn<TFieldValues>;
  error?: string;
}

export function DateField<TFieldValues extends FieldValues>({
  field,
  form,
  error,
}: DateFieldProps<TFieldValues>) {
  const { register } = form;

  return (
    <FieldWrapper
      label={field.label}
      error={error}
      required={field.required}
      description={field.description}
    >
      <div className="relative">
        <input
          {...register(field.name, {
            onChange: (e) => {
              if (field.onChange) {
                field.onChange(e.target.value, form);
              }
            },
          })}
          type={field.type}
          disabled={field.disabled}
          readOnly={field.readonly}
          min={field.min}
          max={field.max}
          className={`
            w-full rounded-lg border px-4 py-2.5 pr-10 text-sm transition-all
            ${
              error
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500'
            }
            ${field.disabled || field.readonly ? 'cursor-not-allowed bg-gray-50 text-gray-500' : ''}
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            ${field.className || ''}
          `}
        />
        <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
    </FieldWrapper>
  );
}
