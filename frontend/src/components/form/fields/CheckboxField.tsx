import { FieldValues, UseFormReturn } from 'react-hook-form';
import { FieldConfig } from '../../../lib/form/types';
import { Check } from 'lucide-react';

interface CheckboxFieldProps<TFieldValues extends FieldValues> {
  field: FieldConfig<TFieldValues>;
  form: UseFormReturn<TFieldValues>;
  error?: string;
}

export function CheckboxField<TFieldValues extends FieldValues>({
  field,
  form,
  error,
}: CheckboxFieldProps<TFieldValues>) {
  const { register } = form;

  return (
    <div className="flex items-start gap-3">
      <div className="relative flex h-5 items-center">
        <input
          {...register(field.name, {
            onChange: (e) => {
              if (field.onChange) {
                field.onChange(e.target.checked, form);
              }
            },
          })}
          type="checkbox"
          disabled={field.disabled}
          className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-gray-300 bg-white transition-all checked:border-blue-600 checked:bg-blue-600 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-100"
        />
        <Check className="pointer-events-none absolute left-0.5 h-4 w-4 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {field.description && (
          <p className="mt-0.5 text-xs text-gray-500">{field.description}</p>
        )}
        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}
