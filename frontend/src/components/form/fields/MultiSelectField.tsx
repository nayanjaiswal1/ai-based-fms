import { FieldValues, UseFormReturn } from 'react-hook-form';
import { FieldConfig } from '../../../lib/form/types';
import { FieldWrapper } from './FieldWrapper';
import { X } from 'lucide-react';

interface MultiSelectFieldProps<TFieldValues extends FieldValues> {
  field: FieldConfig<TFieldValues>;
  form: UseFormReturn<TFieldValues>;
  error?: string;
}

export function MultiSelectField<TFieldValues extends FieldValues>({
  field,
  form,
  error,
}: MultiSelectFieldProps<TFieldValues>) {
  const { watch, setValue } = form;
  const value = (watch(field.name) as Array<string | number>) || [];

  const toggleOption = (optionValue: string | number) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];

    setValue(field.name, newValue as any, { shouldValidate: true });

    if (field.onChange) {
      field.onChange(newValue, form);
    }
  };

  return (
    <FieldWrapper
      label={field.label}
      error={error}
      required={field.required}
      description={field.description}
    >
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {field.options?.map((option) => {
            const isSelected = value.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleOption(option.value)}
                disabled={field.disabled}
                className={`
                  inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all
                  ${
                    isSelected
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                  ${field.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                `}
                style={
                  isSelected && option.color
                    ? { backgroundColor: option.color }
                    : undefined
                }
              >
                {option.icon}
                {option.label}
                {isSelected && <X className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>
      </div>
    </FieldWrapper>
  );
}
