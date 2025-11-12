import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { StatementUpload } from './StatementUpload';
import { TransactionMatching } from './TransactionMatching';
import { ReconciliationSummary } from './ReconciliationSummary';
import { useReconciliation } from '../hooks/useReconciliation';

interface ReconciliationWizardProps {
  accountId: string;
  accountName: string;
  reconciliationId?: string;
}

export const ReconciliationWizard: React.FC<ReconciliationWizardProps> = ({
  accountId,
  accountName,
  reconciliationId: initialReconciliationId,
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [reconciliationId, setReconciliationId] = useState<string | undefined>(
    initialReconciliationId
  );
  const [startData, setStartData] = useState({
    startDate: '',
    endDate: '',
    statementBalance: '',
  });

  const {
    reconciliation,
    isLoadingReconciliation,
    startReconciliation,
    uploadStatement,
    matchTransaction,
    unmatchTransaction,
    completeReconciliation,
    cancelReconciliation,
    isLoading,
  } = useReconciliation(reconciliationId);

  useEffect(() => {
    if (reconciliation && !initialReconciliationId) {
      setReconciliationId(reconciliation.id);
    }
  }, [reconciliation, initialReconciliationId]);

  const steps = [
    { number: 1, title: 'Start', description: 'Enter reconciliation details' },
    { number: 2, title: 'Upload', description: 'Upload statement transactions' },
    { number: 3, title: 'Match', description: 'Review and match transactions' },
    { number: 4, title: 'Complete', description: 'Review and complete' },
  ];

  const handleStart = async () => {
    if (!startData.startDate || !startData.endDate || !startData.statementBalance) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const result = await startReconciliation({
        accountId,
        startDate: startData.startDate,
        endDate: startData.endDate,
        statementBalance: parseFloat(startData.statementBalance),
      });
      setReconciliationId(result.id);
      setCurrentStep(2);
    } catch (error) {
      console.error('Failed to start reconciliation:', error);
    }
  };

  const handleUploadStatement = async (transactions: any[]) => {
    if (!reconciliationId) return;

    try {
      await uploadStatement({
        reconciliationId,
        data: { transactions },
      });
      setCurrentStep(3);
    } catch (error) {
      console.error('Failed to upload statement:', error);
    }
  };

  const handleMatch = async (reconciliationTransactionId: string, transactionId: string) => {
    if (!reconciliationId) return;

    try {
      await matchTransaction({
        reconciliationId,
        data: {
          reconciliationTransactionId,
          transactionId,
          isManual: true,
        },
      });
    } catch (error) {
      console.error('Failed to match transaction:', error);
    }
  };

  const handleUnmatch = async (reconciliationTransactionId: string) => {
    if (!reconciliationId) return;

    try {
      await unmatchTransaction({
        reconciliationId,
        data: { reconciliationTransactionId },
      });
    } catch (error) {
      console.error('Failed to unmatch transaction:', error);
    }
  };

  const handleComplete = async () => {
    if (!reconciliationId) return;

    try {
      await completeReconciliation({
        reconciliationId,
        data: {},
      });
      navigate('/accounts');
    } catch (error) {
      console.error('Failed to complete reconciliation:', error);
    }
  };

  const handleCancel = async () => {
    if (!reconciliationId) {
      navigate('/accounts');
      return;
    }

    if (window.confirm('Are you sure you want to cancel this reconciliation?')) {
      try {
        await cancelReconciliation(reconciliationId);
        navigate('/accounts');
      } catch (error) {
        console.error('Failed to cancel reconciliation:', error);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reconcile Account</h1>
        <p className="text-gray-600">{accountName}</p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                    currentStep > step.number
                      ? 'bg-green-600 text-white'
                      : currentStep === step.number
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step.number ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div className="text-sm font-medium text-gray-900">{step.title}</div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 rounded ${
                    currentStep > step.number ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Start Reconciliation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startData.startDate}
                  onChange={(e) => setStartData({ ...startData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startData.endDate}
                  onChange={(e) => setStartData({ ...startData, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statement Balance <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={startData.statementBalance}
                onChange={(e) => setStartData({ ...startData, statementBalance: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                required
              />
            </div>
            <div className="flex justify-between pt-4">
              <button
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStart}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Upload Statement</h2>
            <StatementUpload onUpload={handleUploadStatement} isLoading={isLoading} />
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && reconciliation && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Match Transactions</h2>
            <TransactionMatching
              reconciliation={reconciliation}
              onMatch={handleMatch}
              onUnmatch={handleUnmatch}
            />
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                Review
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {currentStep === 4 && reconciliation && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Review & Complete</h2>
            <ReconciliationSummary
              reconciliation={reconciliation}
              onComplete={handleComplete}
              onCancel={handleCancel}
            />
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Matching
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
