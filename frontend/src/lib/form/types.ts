import { z } from 'zod';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';

export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'date'
  | 'datetime-local'
  | 'color'
  | 'select'
  | 'multiselect'
  | 'textarea'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'currency'
  | 'percentage';

export interface SelectOption {
  value: string | number;
  label: string;
  color?: string;
  icon?: React.ReactNode;
}

export interface FieldConfig<TFieldValues extends FieldValues = FieldValues> {
  name: Path<TFieldValues>;
  label: string;
  type: FieldType;
  placeholder?: string;
  description?: string;
  defaultValue?: any;
  options?: SelectOption[];
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  className?: string;
  onChange?: (value: any, form: UseFormReturn<TFieldValues>) => void;
  condition?: (values: Partial<TFieldValues>) => boolean;
  grid?: {
    col?: number;
    row?: number;
    colSpan?: number;
    rowSpan?: number;
  };
}

export interface FormSection<TFieldValues extends FieldValues = FieldValues> {
  title?: string;
  description?: string;
  fields: FieldConfig<TFieldValues>[];
  columns?: number;
  condition?: (values: Partial<TFieldValues>) => boolean;
}

export interface FormConfig<TFieldValues extends FieldValues = FieldValues> {
  title?: string;
  description?: string;
  sections: FormSection<TFieldValues>[];
  schema: z.ZodSchema<TFieldValues>;
  defaultValues?: Partial<TFieldValues>;
  mode?: 'create' | 'edit';
}

export interface FormSubmitOptions<TFieldValues extends FieldValues = FieldValues> {
  onSuccess?: (data: TFieldValues) => void;
  onError?: (error: Error) => void;
  transform?: (data: TFieldValues) => any;
}
