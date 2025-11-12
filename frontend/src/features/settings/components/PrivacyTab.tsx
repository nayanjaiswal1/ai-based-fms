import { useState } from 'react';
import { Download, Trash2, AlertTriangle, Clock } from 'lucide-react';
import { gdprApi } from '@/services/api';
import toast from 'react-hot-toast';
import DeleteAccountModal from './DeleteAccountModal';

export default function PrivacyTab() {
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [lastExportTime, setLastExportTime] = useState<Date | null>(null);

  const handleExportData = async () => {
    setIsExporting(true);

    try {
      const data = await gdprApi.exportData();

      // Create a blob from the data
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fms-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setLastExportTime(new Date());
      toast.success('Data exported successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to export data';

      // Check if rate limited
      if (error.response?.status === 429) {
        toast.error('Rate limit exceeded. Please try again in an hour.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const estimateDataSize = () => {
    // This is a rough estimate - in a real app, you might want to calculate this server-side
    return '~2-5 MB';
  };

  return (
    <div className="space-y-6">
      {/* Data Export Section */}
      <div className="rounded-lg border border-gray-200 p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Export Your Data</h3>
            <p className="mt-1 text-sm text-gray-600">
              Download all your data in JSON format. This includes your profile, transactions,
              accounts, budgets, investments, and more.
            </p>
          </div>
          <Download className="h-6 w-6 text-gray-400" />
        </div>

        <div className="mb-4 space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="font-medium">Estimated size:</span>
            <span>{estimateDataSize()}</span>
          </div>

          {lastExportTime && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Last exported: {lastExportTime.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="rounded-lg bg-blue-50 p-3 mb-4">
          <p className="text-xs text-blue-800">
            Rate limit: You can export your data once per hour. The download will be in JSON format
            and can be opened with any text editor.
          </p>
        </div>

        <button
          onClick={handleExportData}
          disabled={isExporting}
          className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          <span>{isExporting ? 'Exporting...' : 'Export Data'}</span>
        </button>
      </div>

      {/* Account Deletion Section */}
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-red-900">Delete Account</h3>
            <p className="mt-1 text-sm text-red-800">
              Permanently delete your account and all associated data.
            </p>
          </div>
          <Trash2 className="h-6 w-6 text-red-600" />
        </div>

        <div className="mb-4 rounded-lg bg-red-100 p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <div className="space-y-2 text-sm text-red-900">
              <p className="font-semibold">This action cannot be undone!</p>
              <p>When you delete your account, the following will be permanently removed:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>All transactions and financial records</li>
                <li>All accounts and balances</li>
                <li>All budgets and financial goals</li>
                <li>All investments and portfolio data</li>
                <li>All groups (you'll be removed from all groups)</li>
                <li>All personal data and preferences</li>
                <li>All custom categories and tags</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 mb-4">
          <p className="text-xs text-yellow-800">
            We recommend exporting your data before deleting your account if you want to keep a copy
            of your financial records.
          </p>
        </div>

        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete My Account</span>
        </button>
      </div>

      {/* GDPR Compliance Notice */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h4 className="mb-2 text-sm font-semibold text-gray-900">GDPR Compliance</h4>
        <p className="text-xs text-gray-600">
          In accordance with GDPR regulations, you have the right to access and delete your personal
          data. We ensure that all your data is handled securely and in compliance with data
          protection laws. If you have any questions about your data or our privacy practices,
          please contact our support team.
        </p>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
