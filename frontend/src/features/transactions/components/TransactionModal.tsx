import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { accountsApi, categoriesApi, tagsApi, transactionsApi } from '@services/api';
import Modal from '@components/ui/Modal';
import { ConfigurableForm } from '@components/form/ConfigurableForm';
import { useEntityForm } from '@hooks/useEntityForm';
import { useFormProtection } from '@hooks/useFormProtection';
import { getTransactionFormConfig, TransactionFormData } from '../config/transactionFormConfig';
import { MultiItemTransactionForm } from './MultiItemTransactionForm';
import { Checkbox } from '@components/ui/checkbox';
import { Label } from '@components/ui/label';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

interface TransactionModalProps {
  transaction?: any;
  isOpen: boolean;
  onClose: () => void;
  onImportClick?: () => void;
}

interface LineItem {
  categoryId: string;
  description: string;
  amount: number;
}

export default function TransactionModal({ transaction, isOpen, onClose, onImportClick }: TransactionModalProps) {
  const queryClient = useQueryClient();
  const [isMultiItem, setIsMultiItem] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  // Form protection to prevent accidental data loss
  const { setIsDirty, checkBeforeClose, reset } = useFormProtection({
    confirmMessage: 'You have unsaved changes. Are you sure you want to close this form?',
  });

  // Load existing line items when editing a transaction
  useEffect(() => {
    if (transaction?.lineItems?.length) {
      setIsMultiItem(true);
      setLineItems(
        transaction.lineItems.map((item: any) => ({
          categoryId: item.categoryId,
          description: item.description,
          amount: Number(item.amount),
        }))
      );
    } else {
      setIsMultiItem(false);
      setLineItems([]);
    }
  }, [transaction]);

  // Fetch dropdown data using hooks
  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountsApi.getAll,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.getAll,
  });

  // Handler to create new category
  const handleCreateCategory = async (name: string): Promise<string> => {
    try {
      const response = await categoriesApi.create({
        name,
        type: 'expense', // Default to expense, user can change later
        color: '#' + Math.floor(Math.random()*16777215).toString(16), // Random color
      });
      // Invalidate categories query to refetch
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      return response.data.id;
    } catch (error) {
      console.error('Failed to create category:', error);
      throw error;
    }
  };

  // Handler to create new tag
  const handleCreateTag = async (name: string): Promise<string> => {
    try {
      const response = await tagsApi.create({
        name,
        color: '#' + Math.floor(Math.random()*16777215).toString(16), // Random color
      });
      // Invalidate tags query to refetch
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      return response.data.id;
    } catch (error) {
      console.error('Failed to create tag:', error);
      throw error;
    }
  };

  // Get form config with dynamic data and create handlers
  const formConfig = getTransactionFormConfig(
    transaction,
    accounts?.data || [],
    categories?.data || [],
    tags?.data || [],
    handleCreateCategory,
    handleCreateTag,
    isMultiItem // Pass multi-item mode to config
  );

  // Validate line items
  const validateLineItems = (): boolean => {
    if (isMultiItem && lineItems.length === 0) {
      toast.error('Please add at least one item');
      return false;
    }

    if (isMultiItem && lineItems.some(item => !item.categoryId || !item.amount)) {
      toast.error('All items must have a category and amount');
      return false;
    }

    return true;
  };

  // Use entity form hook with custom submission handler
  const { handleSubmit, isLoading } = useEntityForm<TransactionFormData>({
    api: {
      create: async (data) => {
        if (isMultiItem && !validateLineItems()) {
          throw new Error('Validation failed');
        }
        const payload = isMultiItem
          ? { ...data, lineItems, categoryId: undefined, amount: undefined }
          : data;
        return transactionsApi.create(payload);
      },
      update: async (id, data) => {
        if (isMultiItem && !validateLineItems()) {
          throw new Error('Validation failed');
        }
        const payload = isMultiItem
          ? { ...data, lineItems, categoryId: undefined, amount: undefined }
          : data;
        return transactionsApi.update(String(id), payload);
      },
    },
    queryKey: ['transactions'],
    entityId: transaction?.id,
    onSuccess: () => {
      reset(); // Clear dirty state on successful submit
      onClose();
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={formConfig.title || ''}
      description={formConfig.description}
      size="xl"
      onBeforeClose={checkBeforeClose}
    >
      <div className="space-y-4">
        {/* Import from File button - Only show when creating new transaction */}
        {!transaction && onImportClick && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                onClose();
                onImportClick();
              }}
              className="btn-outline flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import from File
            </button>
          </div>
        )}

        {/* Multi-item toggle */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
          <Checkbox
            id="multi-item-toggle"
            checked={isMultiItem}
            onCheckedChange={(checked) => {
              setIsMultiItem(!!checked);
              if (checked && lineItems.length === 0) {
                // Initialize with one empty item
                setLineItems([{ categoryId: '', description: '', amount: 0 }]);
              }
            }}
          />
          <Label htmlFor="multi-item-toggle" className="cursor-pointer">
            Multiple items with different categories
          </Label>
        </div>

        {/* Multi-item form or standard form */}
        {isMultiItem ? (
          <div className="space-y-4">
            <MultiItemTransactionForm
              categories={categories?.data || []}
              value={lineItems}
              onChange={setLineItems}
            />
          </div>
        ) : null}

        <ConfigurableForm
          config={formConfig}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={onClose}
          submitLabel={transaction ? 'Update Transaction' : 'Add Transaction'}
          onDirtyChange={setIsDirty}
        />
      </div>
    </Modal>
  );
}
