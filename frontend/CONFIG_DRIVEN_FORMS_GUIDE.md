# Config-Driven Forms Library - Implementation Guide

## Overview

This project now uses a **config-driven approach** for all forms using React Hook Form, Zod validation, and a centralized component system. This dramatically reduces code duplication, improves maintainability, and provides a consistent UX across the application.

## Architecture

### Core Components

```
src/
├── lib/form/
│   └── types.ts                      # TypeScript types for form configs
├── components/form/
│   ├── ConfigurableForm.tsx         # Main form renderer
│   ├── FormField.tsx                # Field type router
│   └── fields/                      # Individual field components
│       ├── TextField.tsx
│       ├── SelectField.tsx
│       ├── MultiSelectField.tsx
│       ├── TextAreaField.tsx
│       ├── CheckboxField.tsx
│       ├── SwitchField.tsx
│       ├── DateField.tsx
│       ├── ColorField.tsx
│       ├── CurrencyField.tsx
│       ├── RadioField.tsx
│       └── FieldWrapper.tsx         # Common field layout
├── components/ui/
│   └── ModernModal.tsx              # Improved modal component
├── hooks/
│   ├── useFormSubmit.ts             # Generic form submission
│   ├── useEntityForm.ts             # CRUD operations
│   └── useFilters.ts                # Filtering and search
└── features/[feature]/config/
    └── [entity]FormConfig.ts        # Form configurations
```

## Features

### 1. **Config-Driven Architecture**
Forms are defined using configuration objects instead of hardcoded JSX:

```typescript
export function getAccountFormConfig(account?: any): FormConfig<AccountFormData> {
  return {
    title: account ? 'Edit Account' : 'Add Account',
    sections: [
      {
        fields: [
          {
            name: 'name',
            label: 'Account Name',
            type: 'text',
            required: true,
          },
          {
            name: 'type',
            label: 'Account Type',
            type: 'select',
            options: [
              { value: 'bank', label: 'Bank Account' },
              { value: 'card', label: 'Credit/Debit Card' },
            ],
          },
        ],
        columns: 2,
      },
    ],
    schema: accountSchema,
    defaultValues: { /* ... */ },
  };
}
```

### 2. **Zod Schema Validation**
All forms use Zod for type-safe validation:

```typescript
export const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(100),
  type: z.enum(['bank', 'card', 'wallet', 'cash']),
  balance: z.number().positive(),
  currency: z.string().length(3),
  description: z.string().optional(),
});

export type AccountFormData = z.infer<typeof accountSchema>;
```

### 3. **Reusable Field Components**
14 field types available out of the box:
- **Text** - text, email, password, number
- **Currency** - with $ icon
- **Percentage** - with % icon
- **Select** - dropdown with custom options
- **MultiSelect** - tag-style multi-selection
- **TextArea** - multi-line text
- **Date/DateTime** - date pickers
- **Checkbox** - single checkbox
- **Switch** - toggle switch
- **Radio** - radio button groups
- **Color** - color picker with preview

### 4. **Modern UI/UX Improvements**

#### Before (Old Modals):
- Basic overlay styling
- Inconsistent spacing
- No descriptions
- Generic errors
- Hard-to-read forms

#### After (New System):
- 🎨 **Modern glass-morphism modals** with blur effects
- 📏 **Consistent spacing** - proper padding/margins throughout
- 📝 **Field descriptions** - helpful hints below inputs
- ⚠️ **Field-level validation** - errors shown next to fields
- 🎯 **Better focus states** - clear visual feedback
- 🔘 **Improved selects** - with chevron icons
- 📅 **Date fields** - with calendar icons
- 🎨 **Color pickers** - visual preview
- 💰 **Currency fields** - with $ icon
- ✅ **Better checkboxes** - custom styled with check icon
- 🔀 **Toggle switches** - smooth animations
- 📋 **Multi-select** - beautiful tag-style selection

### 5. **Separation of Concerns**

#### Before:
```tsx
// 186 lines of mixed concerns
export default function AccountModal({ account, onClose }) {
  const [formData, setFormData] = useState({...});
  const createMutation = useMutation({...});
  const updateMutation = useMutation({...});
  const handleSubmit = async (e) => {...};
  const handleChange = (e) => {...};

  return (
    <div className="fixed inset-0..."> {/* modal code */}
      <form onSubmit={handleSubmit}>
        {/* 150+ lines of form fields */}
      </form>
    </div>
  );
}
```

#### After:
```tsx
// 35 lines - clean and focused
export default function AccountModal({ account, isOpen, onClose }) {
  const formConfig = getAccountFormConfig(account);

  const { handleSubmit, isLoading } = useEntityForm({
    api: accountsApi,
    queryKey: ['accounts'],
    entityId: account?.id,
    onSuccess: onClose,
  });

  return (
    <ModernModal isOpen={isOpen} onClose={onClose} title={formConfig.title}>
      <ConfigurableForm
        config={formConfig}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </ModernModal>
  );
}
```

**Separation achieved:**
- ✅ **API logic** → `useEntityForm` hook
- ✅ **Form config** → separate config file
- ✅ **Validation** → Zod schemas
- ✅ **UI components** → reusable field components
- ✅ **Modal wrapper** → ModernModal component

### 6. **Smart Features**

#### Conditional Fields
Fields can show/hide based on other field values:

```typescript
{
  name: 'password',
  label: 'Password',
  type: 'password',
  condition: (values) => values.authMethod === 'basic',
}
```

#### Dynamic Calculations
Fields can trigger calculations:

```typescript
{
  name: 'period',
  type: 'select',
  onChange: (value, form) => {
    const startDate = form.getValues('startDate');
    const newEndDate = calculateEndDate(startDate, value);
    form.setValue('endDate', newEndDate);
  },
}
```

#### Grid Layouts
Responsive grid layouts with custom column spans:

```typescript
{
  fields: [
    { name: 'amount', label: 'Amount', type: 'currency' },
    { name: 'date', label: 'Date', type: 'date' },
  ],
  columns: 2, // Creates a 2-column grid
}
```

## Usage Examples

### Creating a New Form

1. **Define the Zod schema:**

```typescript
// features/myfeature/config/myFormConfig.ts
import { z } from 'zod';
import { FormConfig } from '../../../lib/form/types';

export const mySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  amount: z.number().positive(),
});

export type MyFormData = z.infer<typeof mySchema>;
```

2. **Create the form config:**

```typescript
export function getMyFormConfig(entity?: any): FormConfig<MyFormData> {
  return {
    title: entity ? 'Edit' : 'Create',
    sections: [
      {
        fields: [
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'amount', label: 'Amount', type: 'currency' },
        ],
      },
    ],
    schema: mySchema,
    defaultValues: {
      name: entity?.name || '',
      email: entity?.email || '',
      amount: entity?.amount || 0,
    },
  };
}
```

3. **Create the modal component:**

```typescript
import { ModernModal } from '@components/ui/ModernModal';
import { ConfigurableForm } from '@components/form/ConfigurableForm';
import { useEntityForm } from '@hooks/useEntityForm';
import { getMyFormConfig, MyFormData } from '../config/myFormConfig';
import { myApi } from '@services/api';

interface MyModalProps {
  entity?: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function MyModal({ entity, isOpen, onClose }: MyModalProps) {
  const formConfig = getMyFormConfig(entity);

  const { handleSubmit, isLoading } = useEntityForm<MyFormData>({
    api: myApi,
    queryKey: ['my-entities'],
    entityId: entity?.id,
    onSuccess: onClose,
  });

  return (
    <ModernModal isOpen={isOpen} onClose={onClose} title={formConfig.title}>
      <ConfigurableForm
        config={formConfig}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitLabel={entity ? 'Update' : 'Create'}
      />
    </ModernModal>
  );
}
```

## Custom Hooks

### useEntityForm
Handles create/update operations:

```typescript
const { handleSubmit, isLoading, isEditMode } = useEntityForm({
  api: {
    create: myApi.create,
    update: (id, data) => myApi.update(id, data),
  },
  queryKey: ['my-entities'],
  entityId: entity?.id,
  onSuccess: () => console.log('Success!'),
  onError: (error) => console.error(error),
  transform: (data) => ({
    ...data,
    amount: parseFloat(data.amount),
  }),
});
```

### useFilters
Client-side filtering:

```typescript
const { filteredData, filterValues, updateFilter, clearFilters } = useFilters({
  data: myData,
  filters: [
    { key: 'type', type: 'select', label: 'Type', options: [...] },
    { key: 'date', type: 'dateRange', label: 'Date Range' },
  ],
});
```

## Refactored Forms

### Completed ✅
1. **AccountModal** - Banking accounts with currency support
2. **AccountsPage** - Updated to use new modal API

### Form Configs Created ✅
1. **accountFormConfig** - Account creation/editing
2. **transactionFormConfig** - Transaction entry with tags
3. **budgetFormConfig** - Budget management with auto-calculation
4. **categoryFormConfig** - Category hierarchy with colors
5. **tagFormConfig** - Tag management
6. **authFormConfigs** - Login and registration

### To Be Refactored
- TransactionModal
- BudgetModal
- CategoryModal
- TagModal
- ReminderModal
- GroupModal
- LendBorrowModal
- PaymentModal
- EmailModal
- InvestmentModal
- FilterModal
- LoginPage
- RegisterPage

## Benefits

### Code Reduction
- **AccountModal**: 186 lines → 35 lines (**81% reduction**)
- Similar savings expected across all forms
- **Estimated total**: 2,000+ lines → ~500 lines

### Maintainability
- ✅ Single source of truth for validation
- ✅ Centralized field components
- ✅ Easy to add new field types
- ✅ Consistent error handling
- ✅ Type-safe throughout

### Developer Experience
- 🚀 Faster form creation (hours → minutes)
- 🎯 Autocomplete for all config options
- 🔍 Easy debugging with clear separation
- 📝 Self-documenting config structure
- ♻️ Maximum code reuse

### User Experience
- 🎨 Consistent, modern UI/UX
- ⚡ Better performance (less re-renders)
- ✅ Clear validation messages
- 📱 Responsive layouts
- ♿ Better accessibility

## Next Steps

1. **Refactor remaining modals** - Apply the same pattern to all 13 remaining modals
2. **Add more field types** - File upload, rich text, date range, etc.
3. **Create form builder UI** - Visual form configuration tool
4. **Add field dependencies** - Complex validation rules
5. **Internationalization** - Multi-language support
6. **Form state persistence** - Auto-save drafts
7. **Analytics** - Track form interactions

## Migration Guide

### For Existing Forms

1. Create Zod schema in `features/[feature]/config/[entity]FormConfig.ts`
2. Create form config function
3. Replace modal component with new pattern
4. Update parent component to pass `isOpen` prop
5. Remove old form state management code
6. Test thoroughly

### Breaking Changes
- Modal props changed: Added `isOpen` prop (required)
- Form submission now async by default
- Validation errors now field-level, not form-level

## Support

For questions or issues with the new form system:
1. Check this guide
2. Review existing refactored forms (AccountModal, etc.)
3. Check TypeScript types in `lib/form/types.ts`
4. Review field component implementations

---

**Built with:** React Hook Form, Zod, TypeScript, Tailwind CSS, Radix UI
