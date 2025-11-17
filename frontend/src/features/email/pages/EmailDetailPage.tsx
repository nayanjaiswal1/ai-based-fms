import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import api from '@/services/api';

interface ParsedTransaction {
  amount: number;
  currency?: string;
  date: string;
  description: string;
  merchant?: string;
  type: 'income' | 'expense';
  confidence: number;
  saved?: boolean;
  transactionId?: string;
}

const EmailDetailPage: React.FC = () => {
  const { emailId } = useParams<{ emailId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editedTransactions, setEditedTransactions] = useState<ParsedTransaction[]>([]);

  // Fetch email details
  const { data: email, isLoading } = useQuery({
    queryKey: ['email-message', emailId],
    queryFn: async () => {
      const response = await api.get(`/email/messages/${emailId}`);
      return response.data;
    },
    enabled: !!emailId,
  });

  // Update parsed data mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { transactions: ParsedTransaction[] }) => {
      const response = await api.patch(`/email/messages/${emailId}/parsed-data`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-message', emailId] });
      queryClient.invalidateQueries({ queryKey: ['email-messages'] });
      setIsEditing(false);
      toast.success('Parsed data updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update data');
    },
  });

  // Reparse mutation
  const reparseMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/email/messages/${emailId}/reparse`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-message', emailId] });
      toast.success('Email reparsed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reparse email');
    },
  });

  const handleStartEdit = () => {
    setEditedTransactions(email?.parsedData?.transactions || []);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    updateMutation.mutate({ transactions: editedTransactions });
  };

  const handleAddTransaction = () => {
    setEditedTransactions([
      ...editedTransactions,
      {
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        description: '',
        type: 'expense',
        confidence: 1.0,
      },
    ]);
  };

  const handleRemoveTransaction = (index: number) => {
    setEditedTransactions(editedTransactions.filter((_, i) => i !== index));
  };

  const handleUpdateTransaction = (index: number, field: string, value: any) => {
    const updated = [...editedTransactions];
    updated[index] = { ...updated[index], [field]: value };
    setEditedTransactions(updated);
  };

  if (isLoading) {
    return <div className="p-6">Loading email details...</div>;
  }

  if (!email) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <p className="text-gray-500">Email not found</p>
          <Button onClick={() => navigate('/email/messages')} className="mt-4">
            Back to List
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Button onClick={() => navigate('/email/messages')} variant="outline" size="sm">
            ← Back to List
          </Button>
          <h1 className="text-3xl font-bold mt-2">Email Details</h1>
        </div>

        <div className="flex space-x-2">
          {(email.parsingStatus === 'failed' || email.parsingStatus === 'skipped') && (
            <Button
              onClick={() => reparseMutation.mutate()}
              disabled={reparseMutation.isPending}
            >
              {reparseMutation.isPending ? 'Reparsing...' : 'Reparse Email'}
            </Button>
          )}
        </div>
      </div>

      {/* Email Information */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Email Information</h2>
          <Badge variant={email.parsingStatus === 'success' ? 'success' : 'destructive'}>
            {email.parsingStatus}
          </Badge>
        </div>

        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-gray-600">From:</span>
            <p className="text-gray-900">{email.from}</p>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-600">Subject:</span>
            <p className="text-gray-900">{email.subject}</p>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-600">Date:</span>
            <p className="text-gray-900">
              {new Date(email.emailDate).toLocaleString()}
            </p>
          </div>

          {email.parsedData?.aiProvider && (
            <div>
              <span className="text-sm font-medium text-gray-600">Parsed by:</span>
              <p className="text-gray-900">
                {email.parsedData.aiProvider}
                {email.parsedData.aiModel && ` (${email.parsedData.aiModel})`}
              </p>
            </div>
          )}

          {email.parsedAt && (
            <div>
              <span className="text-sm font-medium text-gray-600">Parsed at:</span>
              <p className="text-gray-900">
                {new Date(email.parsedAt).toLocaleString()}
              </p>
            </div>
          )}

          {email.parsingError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <span className="text-sm font-medium text-red-700">Error:</span>
              <p className="text-red-600 mt-1">{email.parsingError}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Email Content */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Email Content</h2>
        <div className="prose max-w-none">
          <div className="p-4 bg-gray-50 rounded max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {email.textContent || 'No text content'}
            </pre>
          </div>
        </div>
      </Card>

      {/* Parsed Transactions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Parsed Transactions</h2>
          <div className="flex space-x-2">
            {!isEditing ? (
              <Button onClick={handleStartEdit} variant="outline">
                Edit Transactions
              </Button>
            ) : (
              <>
                <Button onClick={handleAddTransaction} variant="outline">
                  Add Transaction
                </Button>
                <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="outline">
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        {!isEditing ? (
          // View Mode
          email.parsedData?.transactions && email.parsedData.transactions.length > 0 ? (
            <div className="space-y-3">
              {email.parsedData.transactions.map((tx, idx) => (
                <div key={idx} className="p-4 border rounded hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold">{tx.description}</h3>
                        {tx.saved && <Badge variant="success">Saved</Badge>}
                        {tx.merchant && (
                          <span className="text-sm text-gray-600">from {tx.merchant}</span>
                        )}
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Date: {new Date(tx.date).toLocaleDateString()}</div>
                        <div>Type: {tx.type}</div>
                        <div>Confidence: {(tx.confidence * 100).toFixed(0)}%</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-2xl font-bold ${
                          tx.type === 'expense' ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {tx.type === 'expense' ? '-' : '+'}${tx.amount.toFixed(2)}
                      </div>
                      {tx.currency && tx.currency !== 'USD' && (
                        <div className="text-sm text-gray-500">{tx.currency}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No transactions found in this email</p>
          )
        ) : (
          // Edit Mode
          <div className="space-y-4">
            {editedTransactions.map((tx, idx) => (
              <div key={idx} className="p-4 border rounded">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <input
                      type="text"
                      value={tx.description}
                      onChange={(e) =>
                        handleUpdateTransaction(idx, 'description', e.target.value)
                      }
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={tx.amount}
                      onChange={(e) =>
                        handleUpdateTransaction(idx, 'amount', parseFloat(e.target.value))
                      }
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <input
                      type="date"
                      value={tx.date?.split('T')[0] || ''}
                      onChange={(e) => handleUpdateTransaction(idx, 'date', e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                      value={tx.type}
                      onChange={(e) => handleUpdateTransaction(idx, 'type', e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Merchant</label>
                    <input
                      type="text"
                      value={tx.merchant || ''}
                      onChange={(e) => handleUpdateTransaction(idx, 'merchant', e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Confidence (0-1)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={tx.confidence}
                      onChange={(e) =>
                        handleUpdateTransaction(idx, 'confidence', parseFloat(e.target.value))
                      }
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>

                <Button
                  onClick={() => handleRemoveTransaction(idx)}
                  variant="destructive"
                  size="sm"
                  className="mt-3"
                >
                  Remove Transaction
                </Button>
              </div>
            ))}

            {editedTransactions.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No transactions. Click "Add Transaction" to create one.
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default EmailDetailPage;
