import { useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '@services/api';
import { ModernModal } from '@components/ui/ModernModal';
import { ConfigurableForm } from '@components/form/ConfigurableForm';
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

  const createMutation = useMutation({
    mutationFn: groupsApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
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
      onClose();
    },
  });

  const handleSubmit = async (data: GroupFormData) => {
    return isEditMode
      ? updateMutation.mutateAsync(data)
      : createMutation.mutateAsync(data);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <ModernModal
      isOpen={isOpen}
      onClose={onClose}
      title={formConfig.title || ''}
      description={formConfig.description}
      size="lg"
    >
      <ConfigurableForm
        config={formConfig}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onCancel={onClose}
        submitLabel={group ? 'Update Group' : 'Create Group'}
      />
    </ModernModal>
  );
}
