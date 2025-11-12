import { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, X, ChevronRight } from 'lucide-react';
import { useImportSession } from '../hooks/useImportSession';

export default function ImportPage() {
  const [dragActive, setDragActive] = useState(false);
  const {
    sessionId,
    step,
    preview,
    uploadMutation,
    confirmMutation,
    cancelMutation,
    handleUpload,
    handleConfirm,
    handleCancel,
  } = useImportSession();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    await handleUpload(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import Transactions</h1>
        <p className="mt-1 text-sm text-gray-600">
          Import transactions from CSV, Excel, or PDF files
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between rounded-lg bg-white p-6 shadow">
        <StepIndicator
          number={1}
          title="Upload"
          active={step === 'upload'}
          completed={step !== 'upload'}
        />
        <ChevronRight className="h-5 w-5 text-gray-400" />
        <StepIndicator
          number={2}
          title="Preview"
          active={step === 'preview'}
          completed={step === 'mapping' || step === 'confirm'}
        />
        <ChevronRight className="h-5 w-5 text-gray-400" />
        <StepIndicator
          number={3}
          title="Confirm"
          active={step === 'confirm'}
          completed={false}
        />
      </div>

      {/* Upload Step */}
      {step === 'upload' && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`rounded-lg border-2 border-dashed bg-white p-12 text-center shadow transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            Drop your file here, or click to browse
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Supports CSV, Excel (.xlsx), and PDF files
          </p>
          <input
            type="file"
            id="file-upload"
            accept=".csv,.xlsx,.xls,.pdf"
            onChange={handleChange}
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className="mt-6 inline-block cursor-pointer rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Choose File
          </label>

          {uploadMutation.isPending && (
            <p className="mt-4 text-sm text-blue-600">Uploading...</p>
          )}
        </div>
      )}

      {/* Preview Step */}
      {step === 'preview' && preview?.data && (
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Preview Transactions</h2>
              <p className="text-sm text-gray-600">
                Found {preview.data.transactions?.length || 0} transactions
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep('confirm')}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {preview.data.transactions?.slice(0, 10).map((transaction: any, index: number) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      ${Number(transaction.amount).toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          transaction.type === 'income'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.data.transactions?.length > 10 && (
              <p className="mt-4 text-center text-sm text-gray-500">
                ... and {preview.data.transactions.length - 10} more transactions
              </p>
            )}
          </div>
        </div>
      )}

      {/* Confirm Step */}
      {step === 'confirm' && preview?.data && (
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Confirm Import</h2>
            <p className="text-sm text-gray-600">
              Ready to import {preview.data.transactions?.length || 0} transactions
            </p>
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex gap-3">
              <CheckCircle className="h-6 w-6 flex-shrink-0 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Import Summary</p>
                <ul className="mt-2 space-y-1 text-sm text-blue-800">
                  <li>• {preview.data.transactions?.length || 0} transactions will be created</li>
                  <li>• Duplicate detection will be applied</li>
                  <li>• AI categorization will be attempted</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setStep('preview')}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleCancel}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirmMutation.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {confirmMutation.isPending ? 'Importing...' : 'Confirm Import'}
            </button>
          </div>
        </div>
      )}

      {/* Import History */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Imports</h2>
        <ImportHistory />
      </div>
    </div>
  );
}

function StepIndicator({
  number,
  title,
  active,
  completed,
}: {
  number: number;
  title: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          completed
            ? 'bg-green-600 text-white'
            : active
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-600'
        }`}
      >
        {completed ? <CheckCircle className="h-5 w-5" /> : number}
      </div>
      <span className={`font-medium ${active ? 'text-gray-900' : 'text-gray-500'}`}>
        {title}
      </span>
    </div>
  );
}

function ImportHistory() {
  const { data: history } = useQuery({
    queryKey: ['import-history'],
    queryFn: importApi.getHistory,
  });

  return (
    <div className="space-y-3">
      {history?.data?.length === 0 ? (
        <p className="py-8 text-center text-gray-500">No import history yet</p>
      ) : (
        history?.data?.map((item: any) => (
          <div key={item.id} className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{item.fileName}</p>
                <p className="text-sm text-gray-500">
                  {item.transactionCount} transactions • {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                item.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : item.status === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {item.status}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
