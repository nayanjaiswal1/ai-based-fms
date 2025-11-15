import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, FileText, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { transactionsApi } from '@services/api';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FileUploadModal({ isOpen, onClose }: FileUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (fileData: File) => {
      const formData = new FormData();
      formData.append('file', fileData);

      // Use the AI service to parse the file
      const response = await fetch(`${import.meta.env.VITE_API_URL}/transactions/parse-file`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to parse file');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(`Successfully parsed file! Found ${data.data?.transactions?.length || 0} transactions.`);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      onClose();
      setFile(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to parse file');
    },
  });

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
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }
    uploadMutation.mutate(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-lg bg-white p-6 shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Upload Receipt/Invoice</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
            }`}
          >
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-12 w-12 text-blue-600" />
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                <button
                  onClick={() => setFile(null)}
                  className="mt-2 text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm font-medium text-gray-900">
                  Drop your file here, or click to browse
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Supports PDF, images (JPG, PNG), and text files
                </p>
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf,.jpg,.jpeg,.png,.txt"
                  onChange={handleChange}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="mt-4 inline-block cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Choose File
                </label>
              </>
            )}
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-900">How it works:</p>
            <ul className="mt-2 space-y-1 text-xs text-blue-800">
              <li>• AI will extract transaction details from your file</li>
              <li>• Amount, date, description, and merchant will be auto-detected</li>
              <li>• Category will be suggested based on the content</li>
              <li>• You can review and edit before saving</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploadMutation.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {uploadMutation.isPending ? 'Parsing...' : 'Upload & Parse'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
