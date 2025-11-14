import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Mail, Download, FileText, FileSpreadsheet, FilePdf, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportApi } from '@services/api';
import { useAuthStore } from '@stores/authStore';

type ExportFormat = 'csv' | 'excel' | 'pdf';
type ExportEntity = 'transactions' | 'accounts' | 'budgets' | 'analytics';

interface ExportConfig {
  entities: ExportEntity[];
  format: ExportFormat;
  includeFilters: boolean;
}

const entityLabels: Record<ExportEntity, string> = {
  transactions: 'Transactions',
  accounts: 'Accounts',
  budgets: 'Budgets',
  analytics: 'Analytics & Reports',
};

const formatIcons = {
  csv: FileText,
  excel: FileSpreadsheet,
  pdf: FilePdf,
};

export default function ExportTab() {
  const { user } = useAuthStore();
  const [config, setConfig] = useState<ExportConfig>({
    entities: [],
    format: 'csv',
    includeFilters: false,
  });

  // Mutation for email export
  const exportMutation = useMutation({
    mutationFn: async (exportConfig: ExportConfig) => {
      // Call backend API to generate export and send via email
      const response = await exportApi.requestEmailExport({
        entities: exportConfig.entities,
        format: exportConfig.format,
        includeFilters: exportConfig.includeFilters,
      });
      return response;
    },
    onSuccess: () => {
      toast.success(`Export request submitted! Check your email (${user?.email}) in a few minutes.`, {
        duration: 5000,
      });
      // Reset selection
      setConfig({
        entities: [],
        format: 'csv',
        includeFilters: false,
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to request export');
    },
  });

  const toggleEntity = (entity: ExportEntity) => {
    setConfig((prev) => ({
      ...prev,
      entities: prev.entities.includes(entity)
        ? prev.entities.filter((e) => e !== entity)
        : [...prev.entities, entity],
    }));
  };

  const handleExport = () => {
    if (config.entities.length === 0) {
      toast.error('Please select at least one data type to export');
      return;
    }
    exportMutation.mutate(config);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Data Export</h3>
        <p className="mt-1 text-sm text-gray-600">
          Export your financial data and receive it via email. Select what you want to export and the
          format.
        </p>
      </div>

      {/* Email notification banner */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Email Delivery</h4>
            <p className="mt-1 text-sm text-blue-700">
              Exports will be sent to <strong>{user?.email}</strong>. The file will be attached to the
              email.
            </p>
          </div>
        </div>
      </div>

      {/* Select data to export */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Select Data to Export</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(Object.keys(entityLabels) as ExportEntity[]).map((entity) => {
            const isSelected = config.entities.includes(entity);
            return (
              <button
                key={entity}
                onClick={() => toggleEntity(entity)}
                className={`relative rounded-lg border-2 p-4 text-left transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Download className="h-5 w-5 text-gray-600" />
                      <span className="font-medium text-gray-900">{entityLabels[entity]}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Select format */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Export Format</h4>
        <div className="grid grid-cols-3 gap-3">
          {(['csv', 'excel', 'pdf'] as ExportFormat[]).map((format) => {
            const Icon = formatIcons[format];
            const isSelected = config.format === format;
            return (
              <button
                key={format}
                onClick={() => setConfig((prev) => ({ ...prev, format }))}
                className={`rounded-lg border-2 p-4 text-center transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <Icon
                  className={`mx-auto h-8 w-8 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}
                />
                <span
                  className={`mt-2 block text-sm font-medium ${
                    isSelected ? 'text-blue-900' : 'text-gray-900'
                  }`}
                >
                  {format.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Export Options</h4>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.includeFilters}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, includeFilters: e.target.checked }))
            }
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <div className="text-sm font-medium text-gray-900">Include current filters</div>
            <div className="text-sm text-gray-600">
              Export data based on currently active filters (date range, categories, etc.)
            </div>
          </div>
        </label>
      </div>

      {/* Export button */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="text-sm text-gray-600">
          {config.entities.length > 0 ? (
            <span>
              Ready to export <strong>{config.entities.length}</strong> data type(s) as{' '}
              <strong>{config.format.toUpperCase()}</strong>
            </span>
          ) : (
            <span>Select data to export</span>
          )}
        </div>
        <button
          onClick={handleExport}
          disabled={exportMutation.isPending || config.entities.length === 0}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exportMutation.isPending ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Processing...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4" />
              Send to Email
            </>
          )}
        </button>
      </div>

      {/* Info */}
      <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong>Note:</strong> Large exports may take a few minutes to generate. You'll receive an
            email once your export is ready. The download link will be valid for 24 hours.
          </div>
        </div>
      </div>
    </div>
  );
}
