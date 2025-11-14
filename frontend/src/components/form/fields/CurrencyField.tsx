import { FieldValues, UseFormReturn } from 'react-hook-form';
import { FieldConfig } from '../../../lib/form/types';
import { FieldWrapper } from './FieldWrapper';
import { Percent } from 'lucide-react';
import { usePreferencesStore } from '../../../stores/preferencesStore';

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
  const currencyInfo = usePreferencesStore((state) => state.getCurrencyInfo());
  const currencySymbol = isCurrency ? currencyInfo.symbol : '%';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent invalid characters for number input
    const invalidChars = ['e', 'E', '+'];
    if (invalidChars.includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <FieldWrapper
      label={field.label}
      error={error}
      required={field.required}
      description={field.description}
    >
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          {isCurrency ? (
            <span className="text-sm font-medium text-gray-500">{currencySymbol}</span>
          ) : (
            <Percent className="h-4 w-4 text-gray-400" />
          )}
        </div>
        <input
          {...register(field.name, {
            required: field.required ? `${field.label} is required` : false,
            valueAsNumber: true,
            validate: {
              positive: (value) => {
                if (field.min !== undefined && Number(value) < field.min) {
                  return `${field.label} must be at least ${field.min}`;
                }
                return true;
              },
              maximum: (value) => {
                if (field.max !== undefined && Number(value) > field.max) {
                  return `${field.label} must be at most ${field.max}`;
                }
                return true;
              },
              validNumber: (value) => {
                if (value !== undefined && value !== null && value !== '' && isNaN(Number(value))) {
                  return `${field.label} must be a valid number`;
                }
                return true;
              },
            },
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
          onKeyDown={handleKeyDown}
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
