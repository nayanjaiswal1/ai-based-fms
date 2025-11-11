import { useQuery } from '@tanstack/react-query';
import { accountsApi, categoriesApi, tagsApi } from '@services/api';
import { useCrud } from '@hooks/useCrud';
import { transactionsApi } from '@services/api';
import Modal from '@components/ui/Modal';
import Form, { FormField } from '@components/ui/Form';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  accountId: string;
  categoryId?: string;
  notes?: string;
}

interface TransactionModalProps {
  transaction?: Transaction;
  onClose: () => void;
}

interface TransactionFormData {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  accountId: string;
  categoryId?: string;
  tagIds?: string[];
  notes?: string;
}

export default function TransactionModal({ transaction, onClose }: TransactionModalProps) {
  const { create, update, isMutating } = useCrud<Transaction>({
    queryKey: 'transactions',
    api: transactionsApi,
  });

  // Fetch dropdown options
  const { data: accounts } = useQuery({ queryKey: ['accounts'], queryFn: accountsApi.getAll });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.getAll });
  const { data: tags } = useQuery({ queryKey: ['tags'], queryFn: tagsApi.getAll });

  const handleSubmit = async (data: TransactionFormData) => {
    if (transaction) {
      await update({ id: transaction.id, data });
    } else {
      await create(data);
    }
    onClose();
  };

  const fields: FormField<TransactionFormData>[] = [
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      required: true,
      options: [
        { value: 'income', label: 'Income' },
        { value: 'expense', label: 'Expense' },
      ],
    },
    {
      name: 'amount',
      label: 'Amount',
      type: 'number',
      required: true,
      min: 0.01,
      step: 0.01,
      placeholder: '0.00',
    },
    {
      name: 'date',
      label: 'Date',
      type: 'date',
      required: true,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'text',
      required: true,
      placeholder: 'e.g., Grocery shopping',
    },
    {
      name: 'accountId',
      label: 'Account',
      type: 'select',
      required: true,
      options: accounts?.data?.map((a) => ({ value: a.id, label: a.name })) || [],
    },
    {
      name: 'categoryId',
      label: 'Category',
      type: 'select',
      options: categories?.data?.map((c) => ({ value: c.id, label: c.name })) || [],
    },
    {
      name: 'notes',
      label: 'Notes (optional)',
      type: 'textarea',
      placeholder: 'Add any additional notes...',
    },
  ];

  const defaultValues: TransactionFormData = {
    type: transaction?.type || 'expense',
    amount: transaction?.amount || 0,
    description: transaction?.description || '',
    date: transaction?.date
      ? format(new Date(transaction.date), 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd'),
    accountId: transaction?.accountId || '',
    categoryId: transaction?.categoryId || '',
    notes: transaction?.notes || '',
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={transaction ? 'Edit Transaction' : 'Add Transaction'}
      maxWidth="lg"
    >
      <Form
        fields={fields}
        onSubmit={handleSubmit}
        defaultValues={defaultValues}
        isLoading={isMutating}
        submitLabel={transaction ? 'Update' : 'Create'}
        cancelLabel="Cancel"
        onCancel={onClose}
      />
    </Modal>
  );
}
