# Custom React Hooks

## Overview
This directory contains custom React hooks that encapsulate reusable logic for the Finance Management System. Hooks follow React best practices and are fully typed with TypeScript.

## Hook Categories

### Authentication Hooks
- `useAuth` - Authentication state and methods

### Data Fetching Hooks
- `useAccounts` - Fetch and manage accounts
- `useTransactions` - Fetch and manage transactions
- `useBudgets` - Fetch and manage budgets
- `useCategories` - Fetch and manage categories
- `useTags` - Fetch and manage tags

### Form Hooks
- `useEntityForm` - Generic entity form management
- `useCrud` - Generic CRUD operations

### Filter & Search Hooks
- `useFilters` - Advanced filtering logic
- `usePagination` - Pagination state
- `useDebounce` - Debounce values

### UI Hooks
- `useTheme` - Theme management
- `useI18n` - Internationalization
- `useWebSocket` - WebSocket connection
- `useFeatureAccess` - Subscription feature gating

### Performance Hooks
- `useVirtualScroll` - Virtual scrolling
- `useInfiniteScroll` - Infinite scrolling
- `useLazyLoad` - Lazy load images/components

## Hooks Documentation

### useAuth

Manages authentication state and provides auth methods.

**Returns:**
```typescript
{
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}
```

**Usage:**
```typescript
import { useAuth } from '@/hooks/useAuth';

function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();

  const handleUpdate = async (data) => {
    await updateProfile(data);
  };

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### useTransactions

Fetch and manage transactions with filtering and pagination.

**Parameters:**
```typescript
interface UseTransactionsOptions {
  filters?: TransactionFilters;
  pagination?: { page: number; limit: number };
  enabled?: boolean;
}
```

**Returns:**
```typescript
{
  data: Transaction[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
}
```

**Usage:**
```typescript
import { useTransactions } from '@/hooks/useTransactions';

function TransactionList() {
  const { data, isLoading, error } = useTransactions({
    filters: {
      type: 'EXPENSE',
      startDate: '2025-01-01'
    },
    pagination: { page: 1, limit: 50 }
  });

  if (isLoading) return <Skeleton />;
  if (error) return <Error message={error.message} />;

  return (
    <ul>
      {data.map((transaction) => (
        <li key={transaction.id}>{transaction.description}</li>
      ))}
    </ul>
  );
}
```

### useFilters

Manages filter state with URL synchronization.

**Parameters:**
```typescript
interface UseFiltersOptions<T> {
  defaultFilters?: T;
  syncWithUrl?: boolean;
  onFilterChange?: (filters: T) => void;
}
```

**Returns:**
```typescript
{
  filters: T;
  setFilter: (key: keyof T, value: any) => void;
  setFilters: (filters: Partial<T>) => void;
  clearFilters: () => void;
  clearFilter: (key: keyof T) => void;
  activeFilterCount: number;
  hasActiveFilters: boolean;
}
```

**Usage:**
```typescript
import { useFilters } from '@/hooks/useFilters';

interface TransactionFilters {
  type?: string[];
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

function FilterPanel() {
  const {
    filters,
    setFilter,
    clearFilters,
    activeFilterCount
  } = useFilters<TransactionFilters>({
    syncWithUrl: true
  });

  return (
    <div>
      <button onClick={() => setFilter('type', ['EXPENSE'])}>
        Expenses Only
      </button>
      <button onClick={clearFilters}>
        Clear Filters ({activeFilterCount})
      </button>
    </div>
  );
}
```

### useDebounce

Debounces a value to reduce re-renders and API calls.

**Parameters:**
- `value` - Value to debounce
- `delay` - Delay in milliseconds (default: 300)

**Returns:**
- Debounced value

**Usage:**
```typescript
import { useDebounce } from '@/hooks/useDebounce';

function SearchInput() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // This effect runs only when debouncedSearchTerm changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      // Make API call
      searchTransactions(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### usePagination

Manages pagination state.

**Parameters:**
```typescript
interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  totalItems?: number;
}
```

**Returns:**
```typescript
{
  page: number;
  limit: number;
  offset: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
  setLimit: (limit: number) => void;
}
```

**Usage:**
```typescript
import { usePagination } from '@/hooks/usePagination';

function PaginatedList({ totalItems }) {
  const {
    page,
    limit,
    offset,
    totalPages,
    nextPage,
    previousPage
  } = usePagination({
    initialLimit: 50,
    totalItems
  });

  const { data } = useTransactions({ page, limit });

  return (
    <div>
      <TransactionList transactions={data} />
      <div>
        <button onClick={previousPage} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={nextPage} disabled={page === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}
```

### useCrud

Generic CRUD operations for any entity.

**Parameters:**
```typescript
interface UseCrudOptions<T> {
  endpoint: string;
  queryKey: string[];
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}
```

**Returns:**
```typescript
{
  create: (data: Partial<T>) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}
```

**Usage:**
```typescript
import { useCrud } from '@/hooks/useCrud';

function CategoryManager() {
  const {
    create,
    update,
    delete: deleteCategory,
    isCreating
  } = useCrud<Category>({
    endpoint: '/categories',
    queryKey: ['categories'],
    onSuccess: () => {
      toast.success('Category saved');
    }
  });

  const handleCreate = async (data) => {
    await create({ name: 'Food', type: 'EXPENSE' });
  };

  return (
    <button onClick={handleCreate} disabled={isCreating}>
      {isCreating ? 'Creating...' : 'Create Category'}
    </button>
  );
}
```

### useEntityForm

Manages entity form state with validation.

**Parameters:**
```typescript
interface UseEntityFormOptions<T> {
  entity?: T;
  schema: ZodSchema;
  onSubmit: (data: T) => void | Promise<void>;
  mode?: 'create' | 'edit';
}
```

**Returns:**
```typescript
{
  form: UseFormReturn<T>;
  isSubmitting: boolean;
  isDirty: boolean;
  errors: FieldErrors<T>;
  handleSubmit: (e: FormEvent) => void;
  reset: () => void;
}
```

**Usage:**
```typescript
import { useEntityForm } from '@/hooks/useEntityForm';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(3),
  amount: z.number().positive()
});

function BudgetForm({ budget }) {
  const { form, handleSubmit, isSubmitting } = useEntityForm({
    entity: budget,
    schema,
    onSubmit: async (data) => {
      await saveBudget(data);
    },
    mode: budget ? 'edit' : 'create'
  });

  return (
    <form onSubmit={handleSubmit}>
      <TextField name="name" control={form.control} />
      <CurrencyField name="amount" control={form.control} />
      <button type="submit" disabled={isSubmitting}>
        Save
      </button>
    </form>
  );
}
```

### useWebSocket

Manages WebSocket connection and events.

**Returns:**
```typescript
{
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  on: (event: string, callback: Function) => void;
  off: (event: string, callback: Function) => void;
  emit: (event: string, data: any) => void;
}
```

**Usage:**
```typescript
import { useWebSocket } from '@/hooks/useWebSocket';

function NotificationListener() {
  const { isConnected, on } = useWebSocket();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    on('notification.new', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      toast.info(notification.message);
    });

    on('budget.alert', (alert) => {
      toast.warning(alert.message);
    });
  }, [on]);

  return (
    <div>
      <span>Connection: {isConnected ? '🟢' : '🔴'}</span>
      <NotificationList notifications={notifications} />
    </div>
  );
}
```

### useTheme

Manages theme state (light/dark/system).

**Returns:**
```typescript
{
  theme: 'light' | 'dark' | 'system';
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
}
```

**Usage:**
```typescript
import { useTheme } from '@/hooks/useTheme';

function ThemeToggle() {
  const { theme, toggleTheme, effectiveTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      {effectiveTheme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
```

### useFeatureAccess

Check if user has access to a feature based on subscription.

**Parameters:**
- `feature` - Feature name

**Returns:**
```typescript
{
  hasAccess: boolean;
  requiredTier: SubscriptionTier;
  currentTier: SubscriptionTier;
}
```

**Usage:**
```typescript
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

function AICategorization() {
  const { hasAccess } = useFeatureAccess('AI_CATEGORIZATION');

  if (!hasAccess) {
    return <UpgradePrompt feature="AI Categorization" />;
  }

  return <AICategorySelector />;
}
```

### useVirtualScroll

Implements virtual scrolling for large lists.

**Parameters:**
```typescript
interface UseVirtualScrollOptions {
  count: number;
  estimateSize: number;
  overscan?: number;
  getScrollElement: () => HTMLElement | null;
}
```

**Returns:**
```typescript
{
  virtualItems: VirtualItem[];
  totalSize: number;
  scrollToIndex: (index: number) => void;
}
```

**Usage:**
```typescript
import { useVirtualScroll } from '@/hooks/useVirtualScroll';

function VirtualTransactionList({ transactions }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const { virtualItems, totalSize } = useVirtualScroll({
    count: transactions.length,
    estimateSize: 60,
    overscan: 5,
    getScrollElement: () => parentRef.current
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${totalSize}px`, position: 'relative' }}>
        {virtualItems.map((virtualRow) => {
          const transaction = transactions[virtualRow.index];
          return (
            <div
              key={transaction.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              <TransactionRow transaction={transaction} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### useInfiniteScroll

Implements infinite scrolling with automatic loading.

**Parameters:**
```typescript
interface UseInfiniteScrollOptions {
  fetchMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
}
```

**Returns:**
```typescript
{
  ref: RefObject<HTMLDivElement>;
  isFetching: boolean;
}
```

**Usage:**
```typescript
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

function InfiniteTransactionList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery(['transactions'], fetchTransactions);

  const { ref } = useInfiniteScroll({
    fetchMore: fetchNextPage,
    hasMore: hasNextPage,
    isLoading: isFetchingNextPage,
    threshold: 0.8 // Trigger at 80% scroll
  });

  return (
    <div ref={ref}>
      {data.pages.map((page) =>
        page.items.map((transaction) => (
          <TransactionCard key={transaction.id} transaction={transaction} />
        ))
      )}
      {isFetchingNextPage && <Spinner />}
    </div>
  );
}
```

### useI18n

Internationalization hook with language switching.

**Returns:**
```typescript
{
  t: (key: string, options?: any) => string;
  language: string;
  changeLanguage: (lang: string) => Promise<void>;
  availableLanguages: string[];
}
```

**Usage:**
```typescript
import { useI18n } from '@/hooks/useI18n';

function WelcomeMessage() {
  const { t, language, changeLanguage } = useI18n();

  return (
    <div>
      <h1>{t('welcome.message', { name: 'John' })}</h1>
      <select value={language} onChange={(e) => changeLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
      </select>
    </div>
  );
}
```

## Hook Patterns

### Composition

Hooks can be composed to create complex functionality:

```typescript
function useTransactionManager() {
  const { user } = useAuth();
  const { filters, setFilter } = useFilters();
  const { data, isLoading } = useTransactions({ filters });
  const { create, update, delete: deleteTransaction } = useCrud({
    endpoint: '/transactions',
    queryKey: ['transactions']
  });

  const addTransaction = async (data) => {
    const transaction = await create({
      ...data,
      userId: user.id
    });
    setFilter('page', 1); // Reset to first page
    return transaction;
  };

  return {
    transactions: data,
    isLoading,
    filters,
    setFilter,
    addTransaction,
    updateTransaction: update,
    deleteTransaction
  };
}
```

### Error Handling

All hooks include error handling:

```typescript
function useTransactions() {
  const { data, error, isLoading } = useQuery(
    ['transactions'],
    fetchTransactions,
    {
      onError: (error) => {
        toast.error('Failed to load transactions');
        console.error(error);
      },
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
    }
  );

  return { data, error, isLoading };
}
```

### Type Safety

All hooks are fully typed:

```typescript
import { Transaction, TransactionFilters } from '@/types';

function useTransactions(
  options: UseTransactionsOptions
): UseTransactionsReturn {
  // Implementation with full type safety
}
```

## Testing Hooks

### Test Setup

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
```

### Example Test

```typescript
describe('useTransactions', () => {
  it('fetches transactions successfully', async () => {
    const { result } = renderHook(() => useTransactions(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toHaveLength(10);
  });

  it('handles errors gracefully', async () => {
    server.use(
      rest.get('/api/transactions', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result } = renderHook(() => useTransactions(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });
});
```

## Best Practices

1. **Naming** - Prefix all hooks with `use`
2. **Single Responsibility** - Each hook should do one thing well
3. **Composition** - Build complex hooks from simpler ones
4. **Type Safety** - Fully type all parameters and returns
5. **Error Handling** - Always handle errors gracefully
6. **Documentation** - Document parameters, returns, and usage
7. **Testing** - Write tests for all custom hooks
8. **Performance** - Memoize expensive calculations
9. **Dependencies** - Minimize dependencies to prevent rerenders
10. **Cleanup** - Clean up subscriptions and timers

## Related Documentation
- [Components](../components/README.md) - React components
- [Features](../features/README.md) - Feature modules
- [Services](../services/README.md) - API services
- [Utils](../utils/README.md) - Utility functions
