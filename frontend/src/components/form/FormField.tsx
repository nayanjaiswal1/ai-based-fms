import { FieldValues, UseFormReturn } from 'react-hook-form';
import { FieldConfig } from '../../lib/form/types';
import { TextField } from './fields/TextField';
import { SelectField } from './fields/SelectField';
import { SearchableSelectField } from './fields/SearchableSelectField';
import { MultiSelectField } from './fields/MultiSelectField';
import { CreatableMultiSelectField } from './fields/CreatableMultiSelectField';
import { TextAreaField } from './fields/TextAreaField';
import { CheckboxField } from './fields/CheckboxField';
import { SwitchField } from './fields/SwitchField';
import { DateField } from './fields/DateField';
import { ColorField } from './fields/ColorField';
import { CurrencyField } from './fields/CurrencyField';
import { RadioField } from './fields/RadioField';

interface FormFieldProps<TFieldValues extends FieldValues> {
  field: FieldConfig<TFieldValues>;
  form: UseFormReturn<TFieldValues>;
  renderFieldExtra?: (name: string) => React.ReactNode;
}

export function FormField<TFieldValues extends FieldValues>({
  field,
  form,
  renderFieldExtra,
}: FormFieldProps<TFieldValues>) {
  const {
    formState: { errors },
    watch,
  } = form;

  // Handle conditional rendering
  if (field.condition) {
    const values = watch() as Partial<TFieldValues>;
    if (!field.condition(values)) {
      return null;
    }
  }

  const error = errors[field.name];
  const errorMessage = error?.message as string | undefined;

  const commonProps = {
    field,
    form,
    error: errorMessage,
  };

  const fieldComponent = (() => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
        return <TextField {...commonProps} />;

      case 'currency':
      case 'percentage':
        return <CurrencyField {...commonProps} />;

      case 'date':
      case 'datetime-local':
        return <DateField {...commonProps} />;

      case 'select':
        return <SelectField {...commonProps} />;

      case 'searchable-select':
        return <SearchableSelectField {...commonProps} onCreateNew={field.onCreateNew} />;

      case 'multiselect':
        return <MultiSelectField {...commonProps} />;

      case 'creatable-multiselect':
        return <CreatableMultiSelectField {...commonProps} onCreateNew={field.onCreateNew} />;

      case 'textarea':
        return <TextAreaField {...commonProps} />;

      case 'checkbox':
        return <CheckboxField {...commonProps} />;

      case 'switch':
        return <SwitchField {...commonProps} />;

      case 'radio':
        return <RadioField {...commonProps} />;

      case 'color':
        return <ColorField {...commonProps} />;

      default:
        return null;
    }
  })();

  return (
    <>
      {fieldComponent}
      {renderFieldExtra?.(field.name)}
    </>
  );
}
