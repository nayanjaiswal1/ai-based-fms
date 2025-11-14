import { remindersApi } from '@services/api';
import { ModernModal } from '@components/ui/ModernModal';
import { ConfigurableForm } from '@components/form/ConfigurableForm';
import { useEntityForm } from '@hooks/useEntityForm';
import { useFormProtection } from '@hooks/useFormProtection';
import { getReminderFormConfig, ReminderFormData } from '../../reminders/config/reminderFormConfig';

interface ReminderModalProps {
  reminder?: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReminderModal({ reminder, isOpen, onClose }: ReminderModalProps) {
  const formConfig = getReminderFormConfig(reminder);

  // Form protection to prevent accidental data loss
  const { setIsDirty, checkBeforeClose, reset } = useFormProtection({
    confirmMessage: 'You have unsaved changes. Are you sure you want to close this form?',
  });

  const { handleSubmit, isLoading } = useEntityForm<ReminderFormData>({
    api: {
      create: remindersApi.create,
      update: (id, data) => remindersApi.update(String(id), data),
    },
    queryKey: ['reminders'],
    entityId: reminder?.id,
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
      size="lg"
      onBeforeClose={checkBeforeClose}
    >
      <ConfigurableForm
        config={formConfig}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onCancel={onClose}
        submitLabel={reminder ? 'Update Reminder' : 'Add Reminder'}
        onDirtyChange={setIsDirty}
      />
    </ModernModal>
  );
}
