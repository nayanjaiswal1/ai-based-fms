# Clean Architecture Guide - Hook-Based Pattern

## Overview

All components in this project follow a **clean architecture** pattern where:
- ✅ **API logic is in hooks**
- ✅ **UI logic is in components**
- ✅ **Business logic is in services**
- ✅ **Utilities are in utils**

This separation makes code:
- 📖 Easy to read and understand
- 🧪 Easy to test
- ♻️ Highly reusable
- 🔧 Easy to maintain

---

## Architecture Layers

```
┌─────────────────────────────────────────┐
│          COMPONENTS (UI)                │
│  - Only presentation logic              │
│  - Use hooks for data                   │
│  - No direct API calls                  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          HOOKS (Data Layer)             │
│  - useCrud (generic CRUD)               │
│  - useAccounts, useTransactions, etc.   │
│  - useFilters, useFormSubmit            │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          SERVICES (API Layer)           │
│  - api.ts with all API endpoints        │
│  - accountsApi, transactionsApi, etc.   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          BACKEND REST API               │
└─────────────────────────────────────────┘
```

---

## Hook System

### 1. Generic CRUD Hook (`useCrud`)

The foundation - provides all CRUD operations for any entity:

```typescript
// hooks/useCrud.ts
export function useCrud<T>({ queryKey, api }) {
  return {
    // Data
    data: T[],           // List of entities
    isLoading: boolean,  // Loading state
    error: Error,        // Error state

    // Actions
    create: (data) => Promise<T>,
    update: (id, data) => Promise<T>,
    delete: (id) => Promise<void>,
    refetch: () => void,

    // Mutation states
    isCreating: boolean,
    isUpdating: boolean,
    isDeleting: boolean,
    isMutating: boolean, // Any mutation in progress
  };
}
```

### 2. Feature-Specific Hooks

Each feature has its own hook that uses `useCrud`:

```typescript
// features/accounts/hooks/useAccounts.ts
import { useCrud } from '@hooks/useCrud';
import { accountsApi } from '@services/api';

export interface Account {
  id: string;
  name: string;
  type: 'bank' | 'card' | 'wallet' | 'cash';
  balance: number;
  currency: string;
  description?: string;
}

export function useAccounts() {
  return useCrud<Account>({
    queryKey: 'accounts',
    api: accountsApi,
  });
}
```

**Available hooks:**
- `useAccounts()` - Account management
- `useTransactions()` - Transaction management
- `useBudgets()` - Budget management
- `useCategories()` - Category management
- `useTags()` - Tag management

---

## Component Pattern

### ❌ OLD WAY (Don't do this)

```typescript
// BAD: Direct API calls in component
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsApi } from '@services/api';

export default function AccountsPage() {
  const queryClient = useQueryClient();

  // ❌ Direct API call
  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountsApi.getAll,
  });

  // ❌ Manual mutation setup
  const deleteMutation = useMutation({
    mutationFn: accountsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  // ❌ Manual delete handler
  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  // ❌ Accessing nested data
  const items = accounts?.data || [];

  return <div>{/* UI code */}</div>;
}
```

### ✅ NEW WAY (Clean Architecture)

```typescript
// GOOD: Using hooks
import { useAccounts } from '../hooks/useAccounts';

export default function AccountsPage() {
  // ✅ Clean hook usage - all API logic abstracted
  const {
    data: accounts,    // Already unwrapped
    isLoading,
    delete: deleteAccount,
    isDeleting,
  } = useAccounts();

  // ✅ Simple delete handler
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      await deleteAccount(id);
    }
  };

  // ✅ Direct access to data
  const items = accounts || [];

  return <div>{/* UI code */}</div>;
}
```

**Benefits:**
- 📉 **Less code**: No query client, no manual invalidation
- 🎯 **Focused**: Component only handles UI
- ♻️ **Reusable**: Hook can be used anywhere
- 🧪 **Testable**: Easy to mock hooks

---

## Complete Example

### Feature: Account Management

```
features/accounts/
├── hooks/
│   └── useAccounts.ts        # ← Hook (data layer)
├── components/
│   └── AccountModal.tsx      # ← Modal (UI)
├── config/
│   └── accountFormConfig.ts  # ← Form config
└── pages/
    └── AccountsPage.tsx      # ← Page (UI)
```

#### 1. Hook (`useAccounts.ts`)

```typescript
import { useCrud } from '@hooks/useCrud';
import { accountsApi } from '@services/api';

export interface Account {
  id: string;
  name: string;
  type: 'bank' | 'card' | 'wallet' | 'cash';
  balance: number;
  currency: string;
}

export function useAccounts() {
  return useCrud<Account>({
    queryKey: 'accounts',
    api: accountsApi,
  });
}
```

#### 2. Page Component (`AccountsPage.tsx`)

```typescript
import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useAccounts } from '../hooks/useAccounts';
import AccountModal from '../components/AccountModal';

export default function AccountsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // ✅ Clean hook - all API logic abstracted
  const {
    data: accounts,
    isLoading,
    delete: deleteAccount
  } = useAccounts();

  const handleEdit = (account) => {
    setSelectedAccount(account);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this account?')) {
      await deleteAccount(id);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>
        <Plus /> Add Account
      </button>

      <div className="grid gap-4">
        {accounts?.map((account) => (
          <div key={account.id}>
            <h3>{account.name}</h3>
            <p>${account.balance}</p>
            <button onClick={() => handleEdit(account)}>
              <Edit />
            </button>
            <button onClick={() => handleDelete(account.id)}>
              <Trash2 />
            </button>
          </div>
        ))}
      </div>

      <AccountModal
        account={selectedAccount}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAccount(null);
        }}
      />
    </div>
  );
}
```

#### 3. Modal Component (`AccountModal.tsx`)

```typescript
import { useEntityForm } from '@hooks/useEntityForm';
import { useAccounts } from '../hooks/useAccounts';
import { ModernModal } from '@components/ui/ModernModal';
import { ConfigurableForm } from '@components/form/ConfigurableForm';
import { getAccountFormConfig } from '../config/accountFormConfig';

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

---

## Usage Patterns

### Pattern 1: List Page

```typescript
export default function ListPage() {
  const { data, isLoading, delete: deleteItem } = useMyHook();

  return (
    <div>
      {isLoading ? (
        <Loading />
      ) : data?.length === 0 ? (
        <EmptyState />
      ) : (
        <ItemList items={data} onDelete={deleteItem} />
      )}
    </div>
  );
}
```

### Pattern 2: Form Modal

```typescript
export default function FormModal({ item, isOpen, onClose }) {
  const config = getFormConfig(item);

  const { handleSubmit, isLoading } = useEntityForm({
    api: myApi,
    queryKey: ['my-items'],
    entityId: item?.id,
    onSuccess: onClose,
  });

  return (
    <ModernModal isOpen={isOpen} onClose={onClose}>
      <ConfigurableForm
        config={config}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </ModernModal>
  );
}
```

### Pattern 3: With Filters

```typescript
export default function FilterablePage() {
  const { data, isLoading } = useMyHook();

  const {
    filteredData,
    searchQuery,
    setSearchQuery,
    updateFilter
  } = useFilters({
    data,
    filters: [
      { key: 'type', type: 'select', label: 'Type', options: [...] },
      { key: 'date', type: 'dateRange', label: 'Date' },
    ],
  });

  return (
    <div>
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <FilterPanel onUpdate={updateFilter} />
      <ItemList items={filteredData} />
    </div>
  );
}
```

---

## Creating a New Feature

### Step 1: Define the Interface

```typescript
// features/myfeature/hooks/useMyFeature.ts
export interface MyEntity {
  id: string;
  name: string;
  // ... other fields
}
```

### Step 2: Create the Hook

```typescript
import { useCrud } from '@hooks/useCrud';
import { myApi } from '@services/api';

export function useMyFeature() {
  return useCrud<MyEntity>({
    queryKey: 'my-entities',
    api: myApi,
  });
}
```

### Step 3: Use in Components

```typescript
import { useMyFeature } from '../hooks/useMyFeature';

export default function MyPage() {
  const { data, isLoading, create, update, delete: remove } = useMyFeature();

  // Now use the data and actions!
}
```

---

## Best Practices

### ✅ DO

1. **Use feature hooks in components**
   ```typescript
   const { data, isLoading } = useAccounts();
   ```

2. **Keep components focused on UI**
   ```typescript
   // Component only handles rendering and user interactions
   export default function MyComponent() {
     const hook = useMyHook();
     return <div>{/* UI */}</div>;
   }
   ```

3. **Use TypeScript interfaces**
   ```typescript
   export interface Account {
     id: string;
     name: string;
   }
   ```

4. **Handle loading and empty states**
   ```typescript
   if (isLoading) return <Loading />;
   if (!data?.length) return <EmptyState />;
   ```

### ❌ DON'T

1. **Don't use useQuery/useMutation directly in components**
   ```typescript
   // ❌ BAD
   const { data } = useQuery({ queryKey: ['items'], queryFn: api.getAll });
   ```

2. **Don't manage queryClient in components**
   ```typescript
   // ❌ BAD
   const queryClient = useQueryClient();
   queryClient.invalidateQueries(...);
   ```

3. **Don't put business logic in components**
   ```typescript
   // ❌ BAD - Move to hook or util
   const calculateTotal = () => {
     // complex logic
   };
   ```

4. **Don't access nested API responses**
   ```typescript
   // ❌ BAD
   const items = data?.data?.items;

   // ✅ GOOD - Hook unwraps it
   const items = data;
   ```

---

## Testing

### Testing Hooks

```typescript
import { renderHook } from '@testing-library/react-hooks';
import { useAccounts } from '../useAccounts';

test('should fetch accounts', async () => {
  const { result, waitForNextUpdate } = renderHook(() => useAccounts());

  await waitForNextUpdate();

  expect(result.current.data).toBeDefined();
  expect(result.current.isLoading).toBe(false);
});
```

### Testing Components with Mocked Hooks

```typescript
import { render } from '@testing-library/react';
import AccountsPage from '../AccountsPage';

// Mock the hook
jest.mock('../hooks/useAccounts');

test('should render accounts', () => {
  useAccounts.mockReturnValue({
    data: [{ id: '1', name: 'Test Account' }],
    isLoading: false,
  });

  const { getByText } = render(<AccountsPage />);
  expect(getByText('Test Account')).toBeInTheDocument();
});
```

---

## Migration Checklist

When refactoring an existing component:

- [ ] Create feature hook if it doesn't exist
- [ ] Replace `useQuery` with feature hook
- [ ] Replace `useMutation` with hook methods
- [ ] Remove `useQueryClient` imports
- [ ] Remove manual invalidation logic
- [ ] Update data access (remove `.data` nesting)
- [ ] Test the component
- [ ] Delete old code

---

## Benefits Summary

| Aspect | Old Way | New Way |
|--------|---------|---------|
| **Lines of code** | 150+ | 50-70 |
| **API calls** | In component | In hook |
| **Reusability** | None | High |
| **Testing** | Hard | Easy |
| **Maintenance** | Difficult | Simple |
| **Type safety** | Partial | Complete |

---

## Available Hooks

- `useCrud<T>` - Generic CRUD operations
- `useAccounts()` - Account management
- `useTransactions()` - Transaction management
- `useBudgets()` - Budget management
- `useCategories()` - Category management
- `useTags()` - Tag management
- `useFilters()` - Filtering and search
- `useEntityForm()` - Form submission
- `useFormSubmit()` - Generic form submit

---

**Next Steps:**
1. Use these hooks in all new components
2. Gradually refactor existing components
3. Create new hooks for new features
4. Keep components clean and focused

**Questions?** Check the example components or review the hook implementations in `src/hooks/`.
