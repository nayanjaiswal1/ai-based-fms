import { FieldValues, UseFormReturn } from 'react-hook-form';
import { FieldConfig } from '../../../lib/form/types';
import { FieldWrapper } from './FieldWrapper';
import { DollarSign, Percent } from 'lucide-react';

interface CurrencyFieldProps<TFieldValues extends FieldValues> {
  field: FieldConfig<TFieldValues>;
  form: UseFormReturn<TFieldValues>;
  error?: string;
}

export function CurrencyField<TFieldValues extends FieldValues>({
  field,
  form,
  error,
}: CurrencyFieldProps<TFieldValues>) {
  const { register } = form;
  const isCurrency = field.type === 'currency';
  const Icon = isCurrency ? DollarSign : Percent;

  return (
    <FieldWrapper
      label={field.label}
      error={error}
      required={field.required}
      description={field.description}
    >
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Icon className="h-4 w-4 text-gray-400" />
        </div>
        <input
          {...register(field.name, {
            onChange: (e) => {
              if (field.onChange) {
                field.onChange(e.target.value, form);
              }
            },
          })}
          type="number"
          step={field.step || '0.01'}
          min={field.min}
          max={field.max}
          placeholder={field.placeholder}
          disabled={field.disabled}
          readOnly={field.readonly}
          className={`
            w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm transition-all
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
      </div>
    </FieldWrapper>
  );
}
