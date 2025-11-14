import { useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '@services/api';
import Modal from '@components/ui/Modal';
import { ConfigurableForm } from '@components/form/ConfigurableForm';
import { useFormProtection } from '@hooks/useFormProtection';
import { usePreferencesStore } from '@stores/preferencesStore';
import { getGroupFormConfig, GroupFormData } from '../config/groupFormConfig';

interface GroupModalProps {
  group?: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (groupId: string) => void;
}

export default function GroupModal({ group, isOpen, onClose, onSuccess }: GroupModalProps) {
  const queryClient = useQueryClient();
  const formConfig = getGroupFormConfig(group);
  const isEditMode = !!group;
  const userCurrency = usePreferencesStore((state) => state.preferences.currency);

  // Form protection to prevent accidental data loss
  const { setIsDirty, checkBeforeClose, reset } = useFormProtection({
    confirmMessage: 'You have unsaved changes. Are you sure you want to close this form?',
  });

  const createMutation = useMutation({
    mutationFn: groupsApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      reset(); // Clear dirty state on successful submit
      if (onSuccess && data?.data?.id) {
        onSuccess(data.data.id);
      } else {
        onClose();
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: GroupFormData) => groupsApi.update(group.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      reset(); // Clear dirty state on successful submit
      onClose();
    },
  });

  const handleSubmit = async (data: GroupFormData) => {
    // Ensure currency is always set from user preference
    const dataWithCurrency = {
      ...data,
      currency: data.currency || userCurrency,
    };

    return isEditMode
      ? updateMutation.mutateAsync(dataWithCurrency)
      : createMutation.mutateAsync(dataWithCurrency);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={formConfig.title || ''}
      description={formConfig.description}
      size="lg"
      onBeforeClose={checkBeforeClose}
    >
      <ConfigurableForm
        config={formConfig}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onCancel={onClose}
        submitLabel={group ? 'Update Group' : 'Create Group'}
        onDirtyChange={setIsDirty}
      />
    </Modal>
  );
}
