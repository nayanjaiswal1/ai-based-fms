import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '@services/api';
import { Plus, Edit, Trash2, ChevronRight } from 'lucide-react';
import CategoryModal from './CategoryModal';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function CategoriesTab() {
  const queryClient = useQueryClient();
  const { confirmState, confirm, closeConfirm } = useConfirm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const handleEdit = (category: any) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    confirm({
      title: 'Delete Category',
      message: `Are you sure you want to delete the category "${name}"? This action cannot be undone.`,
      variant: 'danger',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id);
      },
    });
  };

  const renderCategories = (parentId: string | null = null, level: number = 0) => {
    const filtered = categories?.data?.filter((c: any) => c.parentId === parentId) || [];

    return filtered.map((category: any) => (
      <div key={category.id}>
        <div
          className="flex items-center justify-between border-b py-3"
          style={{ paddingLeft: `${level * 24}px` }}
        >
          <div className="flex items-center gap-3">
            {level > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: category.color || '#3B82F6' }}
            />
            <div>
              <p className="font-medium text-gray-900">{category.name}</p>
              <div className="flex gap-2 text-xs text-gray-500">
                <span className="capitalize">{category.type}</span>
                {category.icon && <span>• {category.icon}</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(category)}
              className="text-blue-600 hover:text-blue-900"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(category.id, category.name)}
              className="text-red-600 hover:text-red-900"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        {renderCategories(category.id, level + 1)}
      </div>
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
          <p className="text-sm text-gray-600">Organize your transactions with categories</p>
        </div>
        <button
          onClick={() => {
            setSelectedCategory(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-gray-500">Loading categories...</p>
      ) : categories?.data?.length === 0 ? (
        <p className="py-8 text-center text-gray-500">No categories yet. Add your first category!</p>
      ) : (
        <div className="mt-4">{renderCategories()}</div>
      )}

      <CategoryModal
        isOpen={isModalOpen}
        category={selectedCategory}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCategory(null);
        }}
      />

      <ConfirmDialog {...confirmState} onClose={closeConfirm} />
    </div>
  );
}
