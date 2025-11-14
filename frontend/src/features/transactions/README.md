# Transactions Feature

## Overview
The Transactions feature is the core of the Finance Management System frontend, providing a comprehensive interface for viewing, creating, editing, and analyzing financial transactions.

## Features
- **Advanced Filtering** - Filter by date, type, category, amount, tags, and more
- **Bulk Operations** - Select multiple transactions for bulk delete/categorize
- **Virtual Scrolling** - Handle thousands of transactions efficiently
- **Duplicate Detection** - Find and merge duplicate transactions
- **Quick Actions** - Edit, delete, duplicate transactions quickly
- **Transaction Details** - Detailed view with all information
- **Import Integration** - Import from CSV, Excel, PDF
- **Export Options** - Export filtered transactions
- **Real-time Updates** - WebSocket integration for live updates

## Feature Structure

```
transactions/
├── components/
│   ├── TransactionList.tsx           # Main transaction list
│   ├── TransactionTable.tsx          # Table with virtual scrolling
│   ├── TransactionCard.tsx           # Card view for mobile
│   ├── TransactionFilters.tsx        # Advanced filter panel
│   ├── TransactionForm.tsx           # Create/edit form
│   ├── TransactionDetails.tsx        # Detail modal
│   ├── BulkActions.tsx               # Bulk operation toolbar
│   ├── DuplicateDetector.tsx         # Duplicate finder
│   └── QuickAddTransaction.tsx       # Quick add button
├── pages/
│   ├── TransactionsPage.tsx          # Main transactions page
│   └── TransactionDetailsPage.tsx    # Full page detail view
├── hooks/
│   ├── useTransactions.ts            # Transaction queries
│   ├── useTransactionForm.ts         # Form state
│   ├── useTransactionFilters.ts      # Filter state
│   └── useBulkActions.ts             # Bulk operation logic
└── README.md                         # This file
```

## Components

### TransactionList

Main component that displays transactions with filtering and pagination.

**Props:**
```typescript
interface TransactionListProps {
  accountId?: string;        // Filter by account
  categoryId?: string;       // Filter by category
  viewMode?: 'table' | 'card'; // Display mode
  onSelectTransaction?: (id: string) => void;
}
```

**Usage:**
```typescript
import { TransactionList } from '@/features/transactions';

function TransactionsPage() {
  return <TransactionList viewMode="table" />;
}
```

### TransactionTable

High-performance table with virtual scrolling for large datasets.

**Features:**
- Virtual scrolling (only renders visible rows)
- Sortable columns
- Selectable rows
- Inline editing
- Row actions menu

**Columns:**
- Date
- Description
- Category
- Account
- Amount
- Tags
- Actions

**Usage:**
```typescript
import { TransactionTable } from '@/features/transactions';

function MyTable() {
  const { data, isLoading } = useTransactions();

  return (
    <TransactionTable
      transactions={data}
      isLoading={isLoading}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}
```

### TransactionFilters

Comprehensive filter panel with all filter options.

**Filter Options:**
- **Date Range**: Today, Yesterday, This Week, This Month, Custom
- **Transaction Type**: Income, Expense, Transfer, Lend, Borrow
- **Category**: Hierarchical category select
- **Account**: Multi-select accounts
- **Amount Range**: Min and max amount
- **Tags**: Multi-select tags
- **Search**: Full-text search in description/notes
- **Status**: All, Reconciled, Unreconciled

**Usage:**
```typescript
import { TransactionFilters, useTransactionFilters } from '@/features/transactions';

function FilteredTransactions() {
  const { filters, setFilter, clearFilters } = useTransactionFilters();

  return (
    <>
      <TransactionFilters
        filters={filters}
        onChange={setFilter}
        onClear={clearFilters}
      />
      <TransactionList filters={filters} />
    </>
  );
}
```

### TransactionForm

Form for creating and editing transactions.

**Fields:**
- **Type** (required) - Income, Expense, Transfer, etc.
- **Amount** (required) - Currency input
- **Description** (required) - Text input
- **Date** (required) - Date picker
- **Account** (required) - Account select
- **Category** (optional) - Category select with AI suggestion
- **Destination Account** (for transfers) - Account select
- **Tags** (optional) - Multi-select tag input
- **Notes** (optional) - Textarea
- **Attachment** (optional) - File upload

**Validation:**
```typescript
const schema = z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER', 'LEND', 'BORROW']),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(3, 'Description too short').max(200, 'Description too long'),
  date: z.date().max(new Date(), 'Date cannot be in future'),
  accountId: z.string().uuid('Invalid account'),
  categoryId: z.string().uuid().optional(),
  destinationAccountId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().max(1000).optional()
});
```

**Usage:**
```typescript
import { TransactionForm } from '@/features/transactions';

function AddTransaction() {
  const mutation = useCreateTransaction();

  const handleSubmit = (data) => {
    mutation.mutate(data, {
      onSuccess: () => {
        toast.success('Transaction created');
      }
    });
  };

  return <TransactionForm onSubmit={handleSubmit} />;
}
```

### BulkActions

Toolbar for bulk operations on selected transactions.

**Actions:**
- **Bulk Delete** - Delete multiple transactions
- **Bulk Categorize** - Assign category to multiple transactions
- **Bulk Tag** - Add tags to multiple transactions
- **Export Selected** - Export selected transactions
- **Merge Duplicates** - Merge selected duplicate transactions

**Usage:**
```typescript
import { BulkActions } from '@/features/transactions';

function TransactionsWithBulk() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleBulkDelete = async () => {
    await bulkDeleteTransactions(selectedIds);
    setSelectedIds([]);
  };

  return (
    <>
      {selectedIds.length > 0 && (
        <BulkActions
          selectedCount={selectedIds.length}
          onDelete={handleBulkDelete}
          onCategorize={handleBulkCategorize}
        />
      )}
      <TransactionTable
        onSelect={setSelectedIds}
        selectedIds={selectedIds}
      />
    </>
  );
}
```

### DuplicateDetector

Find and manage duplicate transactions.

**Features:**
- Adjustable similarity threshold
- Group duplicates by similarity
- Preview before merging
- Merge or mark as not duplicate

**Algorithm:**
Compares transactions based on:
- Description (60% weight)
- Amount (30% weight)
- Date proximity (10% weight)

**Usage:**
```typescript
import { DuplicateDetector } from '@/features/transactions';

function FindDuplicates() {
  return (
    <DuplicateDetector
      threshold={0.85}
      onMerge={handleMerge}
    />
  );
}
```

## State Management

### Transaction Queries

```typescript
import { useTransactions } from '@/features/transactions';

// Fetch transactions with filters
const {
  data,
  isLoading,
  error,
  fetchNextPage,
  hasNextPage
} = useTransactions({
  filters: {
    type: 'EXPENSE',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    categoryId: 'uuid'
  },
  pagination: {
    page: 1,
    limit: 50
  }
});
```

### Transaction Mutations

```typescript
import {
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  useBulkDelete
} from '@/features/transactions';

// Create transaction
const createMutation = useCreateTransaction();
createMutation.mutate({
  type: 'EXPENSE',
  amount: 50.00,
  description: 'Groceries',
  // ... other fields
});

// Update transaction
const updateMutation = useUpdateTransaction();
updateMutation.mutate({
  id: 'uuid',
  data: { amount: 55.00 }
});

// Delete transaction
const deleteMutation = useDeleteTransaction();
deleteMutation.mutate('transaction-id');

// Bulk delete
const bulkDeleteMutation = useBulkDelete();
bulkDeleteMutation.mutate(['id1', 'id2', 'id3']);
```

## Filtering

### Filter State

```typescript
interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  type?: TransactionType[];
  categoryId?: string[];
  accountId?: string[];
  minAmount?: number;
  maxAmount?: number;
  tags?: string[];
  search?: string;
  isReconciled?: boolean;
}
```

### Filter Hook

```typescript
import { useTransactionFilters } from '@/features/transactions';

function FilterExample() {
  const { filters, setFilter, clearFilters, activeFilterCount } = useTransactionFilters();

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

### URL Params Sync

Filters are synchronized with URL parameters for shareable links:

```
/transactions?type=EXPENSE&startDate=2025-01-01&categoryId=uuid
```

```typescript
// URL params are automatically synced
const { filters } = useTransactionFilters(); // Reads from URL
setFilter('type', ['EXPENSE']); // Updates URL
```

## Virtual Scrolling

For handling large datasets efficiently:

```typescript
import { useVirtualScroll } from '@/hooks/useVirtualScroll';

function VirtualTransactionList({ transactions }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualScroll({
    count: transactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Row height
    overscan: 10 // Render extra rows for smooth scrolling
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
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

## Real-time Updates

### WebSocket Integration

```typescript
import { useWebSocket } from '@/hooks/useWebSocket';
import { useQueryClient } from '@tanstack/react-query';

function TransactionListWithLiveUpdates() {
  const queryClient = useQueryClient();
  const { on } = useWebSocket();

  useEffect(() => {
    // Listen for new transactions
    on('transaction.created', (transaction) => {
      queryClient.invalidateQueries(['transactions']);
      toast.success('New transaction added');
    });

    // Listen for transaction updates
    on('transaction.updated', (transaction) => {
      queryClient.setQueryData(['transaction', transaction.id], transaction);
      queryClient.invalidateQueries(['transactions']);
    });

    // Listen for transaction deletions
    on('transaction.deleted', (id) => {
      queryClient.invalidateQueries(['transactions']);
    });
  }, [on, queryClient]);

  return <TransactionList />;
}
```

## Keyboard Shortcuts

```typescript
const shortcuts = {
  'n': 'New transaction',
  'e': 'Edit selected',
  'd': 'Delete selected',
  '/': 'Focus search',
  'f': 'Open filters',
  'Escape': 'Close modal/Clear selection',
  'Ctrl+A': 'Select all',
  'Ctrl+D': 'Deselect all'
};

// Implementation
useKeyboardShortcut('n', () => openNewTransactionForm());
useKeyboardShortcut('/', (e) => {
  e.preventDefault();
  searchInputRef.current?.focus();
});
```

## Mobile Optimization

### Card View

On mobile, transactions display as cards instead of table:

```typescript
function ResponsiveTransactionView() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return isMobile ? (
    <TransactionCardList transactions={data} />
  ) : (
    <TransactionTable transactions={data} />
  );
}
```

### Swipe Actions

```typescript
import { useSwipeable } from 'react-swipeable';

function SwipeableTransactionCard({ transaction }) {
  const handlers = useSwipeable({
    onSwipedLeft: () => handleDelete(transaction.id),
    onSwipedRight: () => handleEdit(transaction.id)
  });

  return (
    <div {...handlers}>
      <TransactionCard transaction={transaction} />
    </div>
  );
}
```

## Performance Optimizations

### Memoization

```typescript
const MemoizedTransactionRow = memo(TransactionRow, (prev, next) => {
  return (
    prev.transaction.id === next.transaction.id &&
    prev.transaction.updatedAt === next.transaction.updatedAt &&
    prev.isSelected === next.isSelected
  );
});
```

### Pagination

```typescript
// Infinite scroll pagination
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
} = useInfiniteQuery({
  queryKey: ['transactions', filters],
  queryFn: ({ pageParam = 1 }) => fetchTransactions({ page: pageParam, ...filters }),
  getNextPageParam: (lastPage, pages) => {
    if (lastPage.hasMore) return pages.length + 1;
    return undefined;
  }
});

// Load more on scroll
const handleScroll = (e) => {
  const { scrollTop, scrollHeight, clientHeight } = e.target;
  if (scrollHeight - scrollTop <= clientHeight * 1.5) {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }
};
```

## Accessibility

### Keyboard Navigation

- Tab through transactions
- Arrow keys for selection
- Enter to open details
- Space to select/deselect
- Ctrl+A to select all

### Screen Reader Support

```typescript
<tr
  role="row"
  aria-selected={isSelected}
  aria-label={`Transaction: ${transaction.description}, ${formatCurrency(transaction.amount)}, ${formatDate(transaction.date)}`}
>
  <td>{transaction.description}</td>
  <td>{formatCurrency(transaction.amount)}</td>
</tr>
```

### Focus Management

```typescript
// Focus first transaction after filter
useEffect(() => {
  if (data && data.length > 0) {
    const firstRow = document.querySelector('[data-transaction-row]');
    (firstRow as HTMLElement)?.focus();
  }
}, [filters]);
```

## Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionList } from './TransactionList';

describe('TransactionList', () => {
  it('displays transactions', () => {
    const transactions = [
      { id: '1', description: 'Groceries', amount: 50 }
    ];
    render(<TransactionList transactions={transactions} />);
    expect(screen.getByText('Groceries')).toBeInTheDocument();
  });

  it('handles transaction selection', () => {
    const onSelect = jest.fn();
    render(<TransactionList onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('checkbox', { name: /select/i }));
    expect(onSelect).toHaveBeenCalled();
  });

  it('opens transaction form on add click', () => {
    render(<TransactionList />);
    fireEvent.click(screen.getByText('Add Transaction'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
```

## API Integration

### Endpoints Used

- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Get transaction details
- `PATCH /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `POST /api/transactions/bulk-delete` - Bulk delete
- `POST /api/transactions/bulk-categorize` - Bulk categorize
- `GET /api/transactions/duplicates` - Find duplicates
- `POST /api/transactions/merge` - Merge duplicates

## Best Practices

1. **Use virtual scrolling** for lists > 100 items
2. **Debounce search input** to reduce API calls
3. **Cache filter results** for better performance
4. **Sync filters with URL** for shareable links
5. **Provide bulk actions** for efficiency
6. **Enable keyboard shortcuts** for power users
7. **Show loading skeletons** during fetch
8. **Handle errors gracefully** with retry options
9. **Optimize for mobile** with touch gestures
10. **Make it accessible** with proper ARIA labels

## Related Features
- [Accounts](../accounts/README.md) - Transaction accounts
- [Categories](../categories/README.md) - Transaction categories
- [Tags](../tags/README.md) - Transaction tags
- [Budgets](../budgets/README.md) - Budget tracking
- [Analytics](../analytics/README.md) - Transaction analytics
- [Import](../import/README.md) - Import transactions
- [Export](../export/README.md) - Export transactions

## Future Enhancements
- Transaction templates
- Recurring transactions UI
- Split transactions
- Multi-currency support
- Receipt attachment viewer
- Transaction timeline view
- Advanced analytics inline
- Batch editing
