# TODO: Multi-Item Transaction Form Integration

## Status
✅ **MultiItemTransactionForm component created**
✅ **Backend supports line items**
⏳ **Needs integration into TransactionModal**

## Integration Steps

### 1. Update TransactionModal.tsx

Add multi-item toggle and conditional rendering:

```tsx
import { MultiItemTransactionForm } from './MultiItemTransactionForm';

const [isMultiItem, setIsMultiItem] = useState(false);
const [lineItems, setLineItems] = useState<LineItem[]>([]);

// In the form:
<div className="space-y-4">
  {/* Toggle for multi-item */}
  <div className="flex items-center gap-2">
    <Switch
      checked={isMultiItem}
      onCheckedChange={setIsMultiItem}
      id="multi-item"
    />
    <Label htmlFor="multi-item">
      Multiple items with different categories
    </Label>
  </div>

  {/* Conditional rendering */}
  {isMultiItem ? (
    <MultiItemTransactionForm
      categories={categories}
      value={lineItems}
      onChange={setLineItems}
    />
  ) : (
    // Existing single category field
    <CategorySelect {...} />
  )}
</div>
```

### 2. Update Form Submission

```tsx
const handleSubmit = async (data: any) => {
  const payload = {
    ...data,
    ...(isMultiItem && {
      lineItems,
      // Don't include single category if multi-item
      categoryId: undefined,
    }),
  };

  await transactionsApi.create(payload);
};
```

### 3. Update Edit Mode

Load existing line items when editing:

```tsx
useEffect(() => {
  if (transaction?.lineItems?.length) {
    setIsMultiItem(true);
    setLineItems(transaction.lineItems.map(item => ({
      categoryId: item.categoryId,
      description: item.description,
      amount: item.amount,
    })));
  }
}, [transaction]);
```

### 4. Validation

Add validation for line items:

```tsx
const validateLineItems = () => {
  if (isMultiItem && lineItems.length === 0) {
    toast.error('Add at least one item');
    return false;
  }

  if (isMultiItem && lineItems.some(item => !item.categoryId || !item.amount)) {
    toast.error('All items must have category and amount');
    return false;
  }

  return true;
};
```

## Files to Modify

- [ ] `frontend/src/features/transactions/components/TransactionModal.tsx`
- [ ] Add Switch component from UI library
- [ ] Update transaction type definitions

## Testing Checklist

- [ ] Create single-item transaction (existing behavior)
- [ ] Create multi-item transaction (new)
- [ ] Edit single-item transaction
- [ ] Edit multi-item transaction
- [ ] Switch between single/multi-item mode
- [ ] Validate total calculation
- [ ] Verify API payload structure
- [ ] Test with empty line items
- [ ] Test with partial line item data

## Estimated Effort

**Time:** 1-2 hours
**Complexity:** Medium

## Notes

- The backend already supports `lineItems` in the DTO
- The `MultiItemTransactionForm` component is ready to use
- Just needs integration into the modal
- Consider adding a "Convert to multi-item" button for existing transactions
