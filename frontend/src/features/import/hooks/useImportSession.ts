import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { importApi } from '@services/api';

export function useImportSession() {
  const queryClient = useQueryClient();
  const [sessionId, setSessionId] = useState<string | null>(null); // stores importId
  const [step, setStep] = useState<'upload' | 'preview' | 'mapping' | 'confirm'>('upload');
  const [preview, setPreview] = useState<any | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Determine file type
      const ext = file.name.split('.').pop()?.toLowerCase();
      const fileType = ext === 'csv' ? 'CSV' : ext === 'pdf' ? 'PDF' : 'EXCEL';

      // Create import log
      const createResp = await importApi.createLog({ type: fileType, fileName: file.name });

      // Read file as base64
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Parse file
      const parseResp = await importApi.parse({ fileContent, fileType });

      // Maintain shape similar to axios response for ImportPage consumption
      setPreview({ data: parseResp.data });
      setSessionId(createResp.data.id);
      setStep('preview');

      return parseResp;
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async () => {
      if (!sessionId || !preview?.data?.transactions) return;
      await importApi.confirm({
        importId: sessionId,
        transactions: preview.data.transactions,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      resetSession();
    },
  });

  const resetSession = () => {
    setStep('upload');
    setSessionId(null);
    setPreview(null);
  };

  const handleUpload = async (file: File) => {
    await uploadMutation.mutateAsync(file);
    return true;
  };

  const handleConfirm = async () => {
    await confirmMutation.mutateAsync();
  };

  const handleCancel = async () => {
    resetSession();
  };

  return {
    sessionId,
    step,
    preview,
    uploadMutation,
    confirmMutation,
    cancelMutation: { isPending: false },
    handleUpload,
    handleConfirm,
    handleCancel,
    resetSession,
  };
}
