import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ReconciliationWizard } from '../components/ReconciliationWizard';

export const ReconciliationPage: React.FC = () => {
  const { reconciliationId } = useParams<{ reconciliationId?: string }>();
  const [searchParams] = useSearchParams();
  const accountId = searchParams.get('accountId');
  const accountName = searchParams.get('accountName') || 'Account';

  if (!accountId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Not Specified</h1>
          <p className="text-gray-600">Please select an account to reconcile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <ReconciliationWizard
        accountId={accountId}
        accountName={accountName}
        reconciliationId={reconciliationId}
      />
    </div>
  );
};
