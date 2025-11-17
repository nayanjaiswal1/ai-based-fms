import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import api from '@/services/api';
import { Link } from 'react-router-dom';

interface EmailMessage {
  id: string;
  from: string;
  subject: string;
  emailDate: string;
  parsingStatus: 'pending' | 'processing' | 'success' | 'failed' | 'skipped' | 'manually_edited';
  parsedAt?: string;
  parseAttempts: number;
  parsingError?: string;
  parsedData?: {
    transactions?: Array<{
      amount: number;
      currency?: string;
      date: string;
      description: string;
      merchant?: string;
      type: 'income' | 'expense';
      confidence: number;
      saved?: boolean;
      transactionId?: string;
    }>;
    orders?: any[];
    aiProvider?: string;
    aiModel?: string;
  };
  connection?: {
    id: string;
    email: string;
    provider: string;
  };
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
  pending: 'secondary',
  processing: 'default',
  success: 'success',
  failed: 'destructive',
  skipped: 'warning',
  manually_edited: 'outline',
};

const EmailMessagesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [hasTransactions, setHasTransactions] = useState(false);
  const [page, setPage] = useState(0);
  const limit = 20;

  // Fetch emails
  const { data, isLoading } = useQuery({
    queryKey: ['email-messages', selectedStatus, hasTransactions, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: (page * limit).toString(),
      });

      if (selectedStatus !== 'all') {
        params.append('parsingStatus', selectedStatus);
      }

      if (hasTransactions) {
        params.append('hasTransactions', 'true');
      }

      const response = await api.get<{
        emails: EmailMessage[];
        total: number;
        limit: number;
        offset: number;
      }>(`/email/messages?${params.toString()}`);
      return response.data;
    },
  });

  // Reparse mutation
  const reparseMutation = useMutation({
    mutationFn: async (emailId: string) => {
      const response = await api.post(`/email/messages/${emailId}/reparse`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-messages'] });
      toast.success('Email reparsed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reparse email');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (emailId: string) => {
      const response = await api.delete(`/email/messages/${emailId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-messages'] });
      toast.success('Email deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete email');
    },
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Email Messages</h1>
        <p className="text-gray-600 mt-2">
          View all synced emails with parsed transaction data
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(0);
              }}
              className="p-2 border rounded"
            >
              <option value="all">All</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="skipped">Skipped</option>
              <option value="manually_edited">Manually Edited</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={hasTransactions}
                onChange={(e) => {
                  setHasTransactions(e.target.checked);
                  setPage(0);
                }}
                className="rounded"
              />
              <span className="text-sm">Has Transactions</span>
            </label>
          </div>

          <div className="ml-auto text-sm text-gray-600">
            {data ? `${data.total} total emails` : ''}
          </div>
        </div>
      </Card>

      {/* Email List */}
      {isLoading ? (
        <div className="text-center py-12">Loading emails...</div>
      ) : !data?.emails || data.emails.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No emails found</p>
          <p className="text-sm text-gray-400 mt-2">
            Sync your email to see messages here
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.emails.map((email) => (
            <Card key={email.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center space-x-3 mb-2">
                    <Badge variant={STATUS_VARIANTS[email.parsingStatus]}>
                      {email.parsingStatus}
                    </Badge>

                    {email.parsedData?.aiProvider && (
                      <span className="text-xs text-gray-500">
                        {email.parsedData.aiProvider}
                        {email.parsedData.aiModel && ` (${email.parsedData.aiModel})`}
                      </span>
                    )}

                    <span className="text-xs text-gray-400">
                      {new Date(email.emailDate).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Email Info */}
                  <Link
                    to={`/email/messages/${email.id}`}
                    className="block hover:text-blue-600"
                  >
                    <h3 className="font-semibold text-lg">{email.subject}</h3>
                    <p className="text-sm text-gray-600 mt-1">{email.from}</p>
                  </Link>

                  {/* Parsed Transactions */}
                  {email.parsedData?.transactions && email.parsedData.transactions.length > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <p className="text-sm font-medium mb-2">
                        {email.parsedData.transactions.length} Transaction(s) Found:
                      </p>
                      <div className="space-y-2">
                        {email.parsedData.transactions.map((tx, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{tx.description}</span>
                            <div className="flex items-center space-x-3">
                              <span
                                className={`font-medium ${
                                  tx.type === 'expense' ? 'text-red-600' : 'text-green-600'
                                }`}
                              >
                                {tx.type === 'expense' ? '-' : '+'}${tx.amount.toFixed(2)}
                              </span>
                              {tx.saved && (
                                <Badge variant="success">
                                  Saved
                                </Badge>
                              )}
                              <span className="text-xs text-gray-500">
                                {(tx.confidence * 100).toFixed(0)}% confident
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {email.parsingError && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-700">
                        <strong>Error:</strong> {email.parsingError}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 ml-4">
                  <Link to={`/email/messages/${email.id}`}>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </Link>

                  {(email.parsingStatus === 'failed' || email.parsingStatus === 'skipped') && (
                    <Button
                      size="sm"
                      onClick={() => reparseMutation.mutate(email.id)}
                      disabled={reparseMutation.isPending}
                    >
                      {reparseMutation.isPending ? 'Reparsing...' : 'Reparse'}
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this email?')) {
                        deleteMutation.mutate(email.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-6">
          <Button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            variant="outline"
          >
            Previous
          </Button>

          <span className="text-sm text-gray-600">
            Page {page + 1} of {totalPages}
          </span>

          <Button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmailMessagesPage;
