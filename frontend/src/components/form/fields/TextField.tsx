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
              ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500'
          }
          ${field.disabled || field.readonly ? 'cursor-not-allowed bg-gray-50 text-gray-500' : ''}
          focus:outline-none focus:ring-2 focus:ring-opacity-50
          disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
          ${field.className || ''}
        `}
      />
    </FieldWrapper>
  );
}
