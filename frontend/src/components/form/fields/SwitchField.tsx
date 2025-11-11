import { FieldValues, UseFormReturn } from 'react-hook-form';
import { FieldConfig } from '../../../lib/form/types';

interface SwitchFieldProps<TFieldValues extends FieldValues> {
  field: FieldConfig<TFieldValues>;
  form: UseFormReturn<TFieldValues>;
  error?: string;
}

export function SwitchField<TFieldValues extends FieldValues>({
  field,
  form,
  error,
}: SwitchFieldProps<TFieldValues>) {
  const { register, watch } = form;
  const value = watch(field.name);

  return (
    <div className="flex items-start justify-between gap-4">
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
      <button
        type="button"
        role="switch"
        aria-checked={value}
        disabled={field.disabled}
        onClick={() => {
          const newValue = !value;
          form.setValue(field.name, newValue as any, { shouldValidate: true });
          if (field.onChange) {
            field.onChange(newValue, form);
          }
        }}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${value ? 'bg-blue-600' : 'bg-gray-300'}
          ${field.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${value ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
      <input
        {...register(field.name)}
        type="checkbox"
        className="sr-only"
      />
    </div>
  );
}
