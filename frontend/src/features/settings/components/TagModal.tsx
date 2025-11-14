import { tagsApi } from '@services/api';
import { ModernModal } from '@components/ui/ModernModal';
import { ConfigurableForm } from '@components/form/ConfigurableForm';
import { useEntityForm } from '@hooks/useEntityForm';
import { useFormProtection } from '@hooks/useFormProtection';
import { getTagFormConfig, TagFormData } from '../../tags/config/tagFormConfig';

interface TagModalProps {
  tag?: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function TagModal({ tag, isOpen, onClose }: TagModalProps) {
  // Get form config
  const formConfig = getTagFormConfig(tag);

  // Form protection to prevent accidental data loss
  const { setIsDirty, checkBeforeClose, reset } = useFormProtection({
    confirmMessage: 'You have unsaved changes. Are you sure you want to close this form?',
  });

  // Use entity form hook
  const { handleSubmit, isLoading } = useEntityForm<TagFormData>({
    api: {
      create: tagsApi.create,
      update: (id, data) => tagsApi.update(String(id), data),
    },
    queryKey: ['tags'],
    entityId: tag?.id,
    onSuccess: () => {
      reset(); // Clear dirty state on successful submit
      onClose();
    },
  });

  return (
    <ModernModal
      isOpen={isOpen}
      onClose={onClose}
      title={formConfig.title || ''}
      description={formConfig.description}
      size="md"
      onBeforeClose={checkBeforeClose}
    >
      <ConfigurableForm
        config={formConfig}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onCancel={onClose}
        submitLabel={tag ? 'Update Tag' : 'Create Tag'}
        onDirtyChange={setIsDirty}
      />
    </ModernModal>
  );
}
