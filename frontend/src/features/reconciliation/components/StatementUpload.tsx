import React, { useState } from 'react';
import { Upload, Plus, Trash2, FileText } from 'lucide-react';
import Papa from 'papaparse';
import { useCurrency } from '@/hooks/useCurrency';

interface StatementTransaction {
  amount: number;
  date: string;
  description: string;
  referenceNumber?: string;
}

interface StatementUploadProps {
  onUpload: (transactions: StatementTransaction[]) => void;
  isLoading?: boolean;
}

export const StatementUpload: React.FC<StatementUploadProps> = ({ onUpload, isLoading }) => {
  const { symbol } = useCurrency();
  const [transactions, setTransactions] = useState<StatementTransaction[]>([]);
  const [manualEntry, setManualEntry] = useState({
    amount: '',
    date: '',
    description: '',
    referenceNumber: '',
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const parsedTransactions: StatementTransaction[] = results.data
          .map((row: any) => {
            // Try to parse common CSV formats
            const amount = parseFloat(row.amount || row.Amount || row.AMOUNT || '0');
            const date = row.date || row.Date || row.DATE || '';
            const description = row.description || row.Description || row.DESCRIPTION || '';
            const referenceNumber = row.reference || row.Reference || row.REFERENCE || '';

            if (!isNaN(amount) && date && description) {
              return {
                amount,
                date,
                description,
                referenceNumber: referenceNumber || undefined,
              };
            }
            return null;
          })
          .filter(Boolean) as StatementTransaction[];

        setTransactions(parsedTransactions);
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        alert('Failed to parse CSV file. Please check the format.');
      },
    });
  };

  const handleAddManualTransaction = () => {
    if (!manualEntry.amount || !manualEntry.date || !manualEntry.description) {
      alert('Please fill in all required fields');
      return;
    }

    const newTransaction: StatementTransaction = {
      amount: parseFloat(manualEntry.amount),
      date: manualEntry.date,
      description: manualEntry.description,
      referenceNumber: manualEntry.referenceNumber || undefined,
    };

    setTransactions([...transactions, newTransaction]);
    setManualEntry({ amount: '', date: '', description: '', referenceNumber: '' });
  };

  const handleRemoveTransaction = (index: number) => {
    setTransactions(transactions.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (transactions.length === 0) {
      alert('Please add at least one transaction');
      return;
    }
    onUpload(transactions);
  };

  return (
    <div className="space-y-6">
      {/* Upload Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CSV Upload */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload CSV File
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload a CSV file with columns: amount, date, description, and optionally reference.
          </p>
          <label className="block">
            <div className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-blue-400 focus:outline-none">
              <span className="flex items-center space-x-2">
                <FileText className="w-6 h-6 text-gray-600" />
                <span className="font-medium text-gray-600">
                  Drop CSV file here or click to browse
                </span>
              </span>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </label>
        </div>

        {/* Manual Entry */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Transaction Manually
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={manualEntry.amount}
                onChange={(e) => setManualEntry({ ...manualEntry, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={manualEntry.date}
                onChange={(e) => setManualEntry({ ...manualEntry, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={manualEntry.description}
                onChange={(e) => setManualEntry({ ...manualEntry, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Transaction description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Number
              </label>
              <input
                type="text"
                value={manualEntry.referenceNumber}
                onChange={(e) =>
                  setManualEntry({ ...manualEntry, referenceNumber: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional"
              />
            </div>
            <button
              onClick={handleAddManualTransaction}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Transaction
            </button>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Statement Transactions ({transactions.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((tx, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{tx.description}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {tx.referenceNumber || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                      {symbol()}{Math.abs(tx.amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleRemoveTransaction(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Uploading...' : 'Upload & Match Transactions'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
