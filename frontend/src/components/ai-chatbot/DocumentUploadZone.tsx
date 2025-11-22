import { useState, useCallback } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react';
import { ProviderSelector } from './ProviderSelector';

interface DocumentUploadZoneProps {
  onFileSelected: (file: File, provider?: string) => void;
  isProcessing?: boolean;
  selectedProvider?: string;
  onProviderChange?: (provider: string) => void;
}

export default function DocumentUploadZone({
  onFileSelected,
  isProcessing,
  selectedProvider = 'ocr_space',
  onProviderChange,
}: DocumentUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [provider, setProvider] = useState(selectedProvider);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return 'Only JPG, PNG, and PDF files are allowed';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    return null;
  };

  const handleProviderChange = useCallback((newProvider: string) => {
    setProvider(newProvider);
    if (onProviderChange) {
      onProviderChange(newProvider);
    }
  }, [onProviderChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      const error = validateFile(file);

      if (error) {
        alert(error);
        return;
      }

      setSelectedFile(file);
      onFileSelected(file, provider);
    }
  }, [onFileSelected, provider]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const error = validateFile(file);

      if (error) {
        alert(error);
        return;
      }

      setSelectedFile(file);
      onFileSelected(file, provider);
    }
  }, [onFileSelected, provider]);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />;
    }
    return <FileText className="h-8 w-8 text-red-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (selectedFile) {
    return (
      <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
        <div className="flex items-start gap-3">
          {getFileIcon(selectedFile)}
          <div className="flex-1">
            <p className="font-medium text-gray-900">{selectedFile.name}</p>
            <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
            {isProcessing && (
              <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing document...</span>
              </div>
            )}
          </div>
          {!isProcessing && (
            <button
              onClick={handleRemoveFile}
              className="rounded p-1 hover:bg-gray-200"
              aria-label="Remove file"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Provider Selector */}
      <ProviderSelector
        value={provider}
        onChange={handleProviderChange}
        disabled={isProcessing}
      />

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
        }`}
      >
        <input
          type="file"
          id="document-upload"
          className="hidden"
          accept="image/jpeg,image/jpg,image/png,application/pdf"
          onChange={handleFileInput}
          disabled={isProcessing}
        />
        <label htmlFor="document-upload" className="cursor-pointer">
          <Upload className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm font-medium text-gray-700">
            Drop invoice or receipt here
          </p>
          <p className="mt-1 text-xs text-gray-500">
            or click to browse
          </p>
          <p className="mt-2 text-xs text-gray-400">
            JPG, PNG, PDF • Max 10MB
          </p>
        </label>
      </div>
    </div>
  );
}
