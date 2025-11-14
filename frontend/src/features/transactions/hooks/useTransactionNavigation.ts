import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '@/services/api';
import { LinkIcon } from 'lucide-react';

export enum TransactionSourceType {
  MANUAL = 'manual',
  INVESTMENT = 'investment',
  SHARED_EXPENSE = 'shared_expense',
  RECURRING = 'recurring',
}

export interface TransactionSource {
  sourceType: TransactionSourceType;
  sourceId: string | null;
  navigationUrl: string | null;
}

export function useTransactionNavigation() {
  const navigate = useNavigate();

  const handleTransactionClick = async (
    transactionId: string,
    fallbackCallback?: () => void,
  ) => {
    try {
      const source: TransactionSource = await transactionsApi.getSource(transactionId);

      if (
        !source.sourceType ||
        source.sourceType === TransactionSourceType.MANUAL ||
        !source.navigationUrl
      ) {
        // No source or manual transaction - use fallback (open detail modal)
        if (fallbackCallback) {
          fallbackCallback();
        }
        return;
      }

      // Navigate to source
      navigate(source.navigationUrl);
    } catch (error) {
      console.error('Failed to get transaction source:', error);
      // Fallback to modal on error
      if (fallbackCallback) {
        fallbackCallback();
      }
    }
  };

  const getSourceIndicator = (transaction: any): boolean => {
    // Returns true if transaction has a navigable source
    return (
      transaction.sourceType &&
      transaction.sourceType !== TransactionSourceType.MANUAL &&
      transaction.sourceId !== null
    );
  };

  return {
    handleTransactionClick,
    getSourceIndicator,
    TransactionSourceType,
  };
}

// Hook to fetch transaction source (for display purposes)
export function useTransactionSource(transactionId: string | undefined) {
  return useQuery<TransactionSource>({
    queryKey: ['transaction-source', transactionId],
    queryFn: () => transactionsApi.getSource(transactionId!),
    enabled: !!transactionId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
