import { FieldValues, UseFormReturn } from 'react-hook-form';
import { FieldConfig } from '../../../lib/form/types';
import { FieldWrapper } from './FieldWrapper';

interface TextAreaFieldProps<TFieldValues extends FieldValues> {
  field: FieldConfig<TFieldValues>;
  form: UseFormReturn<TFieldValues>;
  error?: string;
}

export function TextAreaField<TFieldValues extends FieldValues>({
  field,
  form,
  error,
}: TextAreaFieldProps<TFieldValues>) {
  const { register } = form;

  return (
    <FieldWrapper
      label={field.label}
      error={error}
      required={field.required}
      description={field.description}
    >
      <textarea
        {...register(field.name, {
          onChange: (e) => {
            if (field.onChange) {
              field.onChange(e.target.value, form);
            }
          },
        })}
        placeholder={field.placeholder}
        disabled={field.disabled}
        readOnly={field.readonly}
        rows={field.rows || 3}
        className={`
          w-full rounded-lg border px-4 py-2.5 text-sm transition-all
          ${
            error
              ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500'
          }
          ${field.disabled || field.readonly ? 'cursor-not-allowed bg-gray-50 text-gray-500' : ''}
          focus:outline-none focus:ring-2 focus:ring-opacity-50
          resize-y
          ${field.className || ''}
        `}
      />
    </FieldWrapper>
  );
}
