import React, { useState, useEffect } from 'react';
import { X, History, Download } from 'lucide-react';
import { auditApi } from '@services/api';
import { AuditTrail } from '@components/audit/AuditTrail';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: string;
  date: string;
  category?: {
    id: string;
    name: string;
  };
  account?: {
    id: string;
    name: string;
  };
}

interface TransactionHistoryModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <History className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {transaction.description || 'Untitled Transaction'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Transaction Summary */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Current Amount</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${transaction.amount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Type</p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    transaction.type === 'income'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {transaction.type}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Category</p>
                <p className="text-sm font-medium text-gray-900">
                  {transaction.category?.name || 'Uncategorized'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Account</p>
                <p className="text-sm font-medium text-gray-900">
                  {transaction.account?.name || 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          {/* Audit Trail */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 280px)' }}>
            <AuditTrail
              entityType="Transaction"
              entityId={transaction.id}
              showExport={true}
              maxHeight="none"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistoryModal;
