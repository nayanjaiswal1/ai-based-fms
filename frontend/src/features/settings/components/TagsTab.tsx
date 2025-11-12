import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagsApi } from '@services/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
import TagModal from './TagModal';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function TagsTab() {
  const queryClient = useQueryClient();
  const { confirmState, confirm, closeConfirm } = useConfirm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<any>(null);

  const { data: tags, isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: tagsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });

  const handleEdit = (tag: any) => {
    setSelectedTag(tag);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    confirm({
      title: 'Delete Tag',
      message: `Are you sure you want to delete the tag "${name}"? This action cannot be undone.`,
      variant: 'danger',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id);
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
          <p className="text-sm text-gray-600">Label and organize your transactions</p>
        </div>
        <button
          onClick={() => {
            setSelectedTag(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Tag
        </button>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-gray-500">Loading tags...</p>
      ) : tags?.data?.length === 0 ? (
        <p className="py-8 text-center text-gray-500">No tags yet. Add your first tag!</p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-3">
          {tags?.data?.map((tag: any) => (
            <div
              key={tag.id}
              className="group relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: tag.color }}
            >
              <span>{tag.name}</span>
              <div className="ml-2 hidden items-center gap-1 group-hover:flex">
                <button
                  onClick={() => handleEdit(tag)}
                  className="rounded p-1 hover:bg-white hover:bg-opacity-20"
                >
                  <Edit className="h-3 w-3" />
                </button>
                <button
                  onClick={() => handleDelete(tag.id, tag.name)}
                  className="rounded p-1 hover:bg-white hover:bg-opacity-20"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <TagModal
          tag={selectedTag}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTag(null);
          }}
        />
      )}

      <ConfirmDialog {...confirmState} onClose={closeConfirm} />
    </div>
  );
}
