import { FieldValues, UseFormReturn } from 'react-hook-form';
import { FieldConfig } from '../../../lib/form/types';
import { FieldWrapper } from './FieldWrapper';
import { Palette } from 'lucide-react';

interface ColorFieldProps<TFieldValues extends FieldValues> {
  field: FieldConfig<TFieldValues>;
  form: UseFormReturn<TFieldValues>;
  error?: string;
}

export function ColorField<TFieldValues extends FieldValues>({
  field,
  form,
  error,
}: ColorFieldProps<TFieldValues>) {
  const { register, watch } = form;
  const value = watch(field.name) as string;

  return (
    <FieldWrapper
      label={field.label}
      error={error}
      required={field.required}
      description={field.description}
    >
      <div className="flex gap-3">
        <div className="relative flex-1">
          <input
            {...register(field.name, {
              onChange: (e) => {
                if (field.onChange) {
                  field.onChange(e.target.value, form);
                }
              },
            })}
            type="text"
            placeholder={field.placeholder || '#000000'}
            disabled={field.disabled}
            readOnly={field.readonly}
            className={`
              w-full rounded-lg border px-4 py-2.5 pr-10 text-sm transition-all
              ${
                error
                  ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500'
              }
              ${field.disabled || field.readonly ? 'cursor-not-allowed bg-gray-50 text-gray-500' : ''}
              focus:outline-none focus:ring-2 focus:ring-opacity-50
            `}
          />
          <Palette className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
        <div className="relative">
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => {
              form.setValue(field.name, e.target.value as any, { shouldValidate: true });
              if (field.onChange) {
                field.onChange(e.target.value, form);
              }
            }}
            disabled={field.disabled}
            className="h-full w-16 cursor-pointer rounded-lg border-2 border-gray-300 transition-all hover:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>
    </FieldWrapper>
  );
}
