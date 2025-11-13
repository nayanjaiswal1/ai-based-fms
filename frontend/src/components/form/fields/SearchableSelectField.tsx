import { FieldValues, UseFormReturn } from 'react-hook-form';
import { FieldConfig } from '../../../lib/form/types';
import { FieldWrapper } from './FieldWrapper';
import { SearchableSelect, SearchableSelectOption } from './SearchableSelect';

interface SearchableSelectFieldProps<TFieldValues extends FieldValues> {
  field: FieldConfig<TFieldValues>;
  form: UseFormReturn<TFieldValues>;
  error?: string;
  onCreateNew?: (searchQuery: string) => Promise<string> | string;
}

export function SearchableSelectField<TFieldValues extends FieldValues>({
  field,
  form,
  error,
  onCreateNew,
}: SearchableSelectFieldProps<TFieldValues>) {
  const { watch, setValue } = form;
  const value = watch(field.name) as string;

  const options: SearchableSelectOption[] = field.options?.map((opt) => ({
    value: opt.value,
    label: opt.label,
    color: opt.color,
  })) || [];

  const handleChange = (newValue: string) => {
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
      <SearchableSelect
        value={value || ''}
        onChange={handleChange}
        options={options}
        placeholder={field.placeholder}
        disabled={field.disabled}
        error={error}
        onCreateNew={onCreateNew}
        allowCreate={!!onCreateNew}
      />
    </FieldWrapper>
  );
}
