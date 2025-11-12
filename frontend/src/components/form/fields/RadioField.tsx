import { FieldValues, UseFormReturn } from 'react-hook-form';
import { FieldConfig } from '../../../lib/form/types';
import { FieldWrapper } from './FieldWrapper';

interface RadioFieldProps<TFieldValues extends FieldValues> {
  field: FieldConfig<TFieldValues>;
  form: UseFormReturn<TFieldValues>;
  error?: string;
}

export function RadioField<TFieldValues extends FieldValues>({
  field,
  form,
  error,
}: RadioFieldProps<TFieldValues>) {
  const { register } = form;

  return (
    <FieldWrapper
      label={field.label}
      error={error}
      required={field.required}
      description={field.description}
    >
      <div className="space-y-2">
        {field.options?.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 transition-all hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
          >
            <input
              {...register(field.name, {
                onChange: (e) => {
                  if (field.onChange) {
                    field.onChange(e.target.value, form);
                  }
                },
              })}
              type="radio"
              value={option.value}
              disabled={field.disabled}
              className="h-4 w-4 cursor-pointer border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900">
                {option.label}
              </span>
            </div>
          </label>
        ))}
      </div>
    </FieldWrapper>
  );
}
