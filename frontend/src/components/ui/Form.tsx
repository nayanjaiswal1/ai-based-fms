import { ReactNode } from 'react';
import { useForm, UseFormReturn, FieldValues, DefaultValues } from 'react-hook-form';

export interface FormField<T extends FieldValues = any> {
  name: keyof T;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'color';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

interface FormProps<T extends FieldValues> {
  fields: FormField<T>[];
  onSubmit: (data: T) => void | Promise<void>;
  defaultValues?: DefaultValues<T>;
  isLoading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  renderCustomField?: (field: FormField<T>, form: UseFormReturn<T>) => ReactNode;
}

export default function Form<T extends FieldValues>({
  fields,
  onSubmit,
  defaultValues,
  isLoading = false,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  onCancel,
  renderCustomField,
}: FormProps<T>) {
  const form = useForm<T>({ defaultValues });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const renderField = (field: FormField<T>) => {
    // Allow custom rendering for complex fields
    if (renderCustomField) {
      const custom = renderCustomField(field, form);
      if (custom) return custom;
    }

    const baseClasses =
      'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

    const fieldName = String(field.name);
    const error = errors[field.name];

    return (
      <div key={fieldName}>
        <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-red-600"> *</span>}
        </label>

        {field.type === 'select' ? (
          <select
            {...register(field.name, { required: field.required })}
            id={fieldName}
            disabled={field.disabled}
            className={baseClasses}
          >
            {!field.required && <option value="">Select {field.label}</option>}
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : field.type === 'textarea' ? (
          <textarea
            {...register(field.name, { required: field.required })}
            id={fieldName}
            placeholder={field.placeholder}
            disabled={field.disabled}
            rows={4}
            className={baseClasses}
          />
        ) : field.type === 'color' ? (
          <input
            {...register(field.name, { required: field.required })}
            type="color"
            id={fieldName}
            disabled={field.disabled}
            className="mt-1 block h-10 w-full rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        ) : (
          <input
            {...register(field.name, {
              required: field.required,
              min: field.min,
              max: field.max,
              valueAsNumber: field.type === 'number',
            })}
            type={field.type}
            id={fieldName}
            placeholder={field.placeholder}
            disabled={field.disabled}
            step={field.step || (field.type === 'number' ? '0.01' : undefined)}
            className={baseClasses}
          />
        )}

        {error && (
          <p className="mt-1 text-sm text-red-600">
            {error.message || `${field.label} is required`}
          </p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {fields.map(renderField)}

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {cancelLabel}
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
