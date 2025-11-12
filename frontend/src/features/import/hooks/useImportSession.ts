import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { importApi } from '@services/api';

export function useImportSession() {
  const queryClient = useQueryClient();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'mapping' | 'confirm'>('upload');

  const { data: preview } = useQuery({
    queryKey: ['import-preview', sessionId],
    queryFn: () => importApi.preview(sessionId!),
    enabled: !!sessionId && step === 'preview',
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => importApi.uploadFile(formData),
    onSuccess: (response) => {
      setSessionId(response.data.sessionId);
      setStep('preview');
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (sessionId: string) => importApi.confirm(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      resetSession();
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (sessionId: string) => importApi.cancel(sessionId),
    onSuccess: () => {
      resetSession();
    },
  });

  const resetSession = () => {
    setStep('upload');
    setSessionId(null);
  };

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    await uploadMutation.mutateAsync(formData);
  };

  const handleConfirm = async () => {
    if (sessionId) {
      await confirmMutation.mutateAsync(sessionId);
    }
  };

  const handleCancel = async () => {
    if (sessionId) {
      await cancelMutation.mutateAsync(sessionId);
    }
  };

  return {
    sessionId,
    step,
    preview,
    uploadMutation,
    confirmMutation,
    cancelMutation,
    handleUpload,
    handleConfirm,
    handleCancel,
    resetSession,
  };
}
