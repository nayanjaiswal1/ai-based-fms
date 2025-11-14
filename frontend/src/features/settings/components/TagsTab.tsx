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
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading tags...</p>
          </div>
        </div>
      ) : tags?.data?.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/50 p-12 text-center">
          <p className="text-muted-foreground">No tags yet. Add your first tag!</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {tags?.data?.map((tag: any) => (
            <div
              key={tag.id}
              className="group relative flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-sm hover:shadow-md transition-all"
              style={{ backgroundColor: tag.color }}
            >
              <span className="truncate flex-1">{tag.name}</span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(tag)}
                  className="rounded p-1.5 hover:bg-white hover:bg-opacity-20 transition-colors"
                  aria-label="Edit tag"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(tag.id, tag.name)}
                  className="rounded p-1.5 hover:bg-white hover:bg-opacity-20 transition-colors"
                  aria-label="Delete tag"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TagModal
        isOpen={isModalOpen}
        tag={selectedTag}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTag(null);
        }}
      />

      <ConfirmDialog {...confirmState} onClose={closeConfirm} />
    </div>
  );
}
