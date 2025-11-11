import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { remindersApi } from '@services/api';
import { Plus, Edit, Trash2, Bell, Clock } from 'lucide-react';
import { format } from 'date-fns';
import ReminderModal from './ReminderModal';

export default function RemindersTab() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<any>(null);

  const { data: reminders, isLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => remindersApi.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: remindersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });

  const dismissMutation = useMutation({
    mutationFn: remindersApi.dismiss,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });

  const handleEdit = (reminder: any) => {
    setSelectedReminder(reminder);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this reminder?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleDismiss = async (id: string) => {
    await dismissMutation.mutateAsync(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Reminders</h2>
          <p className="text-sm text-gray-600">Set up payment and bill reminders</p>
        </div>
        <button
          onClick={() => {
            setSelectedReminder(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Reminder
        </button>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-gray-500">Loading reminders...</p>
      ) : reminders?.data?.length === 0 ? (
        <p className="py-8 text-center text-gray-500">No reminders yet. Add your first reminder!</p>
      ) : (
        <div className="mt-4 space-y-3">
          {reminders?.data?.map((reminder: any) => (
            <div
              key={reminder.id}
              className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  {reminder.frequency === 'once' ? (
                    <Bell className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{reminder.title}</p>
                  <div className="mt-1 flex gap-2 text-sm text-gray-500">
                    <span>{format(new Date(reminder.reminderDate), 'MMM dd, yyyy')}</span>
                    <span>•</span>
                    <span className="capitalize">{reminder.frequency}</span>
                    {reminder.amount && (
                      <>
                        <span>•</span>
                        <span>${Number(reminder.amount).toFixed(2)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {reminder.status === 'active' && (
                  <button
                    onClick={() => handleDismiss(reminder.id)}
                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Dismiss
                  </button>
                )}
                <button
                  onClick={() => handleEdit(reminder)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(reminder.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <ReminderModal
          reminder={selectedReminder}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedReminder(null);
          }}
        />
      )}
    </div>
  );
}
