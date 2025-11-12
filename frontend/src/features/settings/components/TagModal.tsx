import { tagsApi } from '@services/api';
import { ModernModal } from '@components/ui/ModernModal';
import { ConfigurableForm } from '@components/form/ConfigurableForm';
import { useEntityForm } from '@hooks/useEntityForm';
import { getTagFormConfig, TagFormData } from '../../tags/config/tagFormConfig';

interface TagModalProps {
  tag?: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function TagModal({ tag, isOpen, onClose }: TagModalProps) {
  // Get form config
  const formConfig = getTagFormConfig(tag);

  // Use entity form hook
  const { handleSubmit, isLoading } = useEntityForm<TagFormData>({
    api: {
      create: tagsApi.create,
      update: (id, data) => tagsApi.update(String(id), data),
    },
    queryKey: ['tags'],
    entityId: tag?.id,
    onSuccess: onClose,
  });

  return (
    <ModernModal
      isOpen={isOpen}
      onClose={onClose}
      title={formConfig.title || ''}
      description={formConfig.description}
      size="md"
    >
      <ConfigurableForm
        config={formConfig}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onCancel={onClose}
        submitLabel={tag ? 'Update Tag' : 'Create Tag'}
      />
    </ModernModal>
  );
}
