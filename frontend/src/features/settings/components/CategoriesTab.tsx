import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { categoriesApi } from '@services/api';
import { Plus, Edit, Trash2, ChevronRight } from 'lucide-react';
import CategoryModal from './CategoryModal';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function CategoriesTab() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { confirmState, confirm, closeConfirm } = useConfirm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  // Debug logging
  console.log('📦 Categories data:', categories);
  console.log('🔄 Is loading:', isLoading);
  console.log('📊 Categories array:', categories?.data);
  console.log('🔢 Categories count:', categories?.data?.length);

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
    const filtered = categories?.data?.filter((c: any) => {
      // Handle null, undefined, and empty string as "no parent"
      const categoryParentId = c.parentId || null;
      const searchParentId = parentId || null;
      return categoryParentId === searchParentId;
    }) || [];

    if (level === 0) {
      console.log('🎯 Root categories (parentId=null):', filtered);
      console.log('🔍 Sample category structure:', categories?.data?.[0]);
      console.log('📊 Parent ID types:', categories?.data?.slice(0, 5).map((c: any) => ({
        name: c.name,
        parentId: c.parentId,
        type: typeof c.parentId,
        isNull: c.parentId === null,
        isUndefined: c.parentId === undefined,
        isEmpty: c.parentId === ''
      })));
    }

    return filtered.map((category: any) => (
      <div key={category.id}>
        <div
          className="flex items-center justify-between py-4 px-4 hover:bg-accent/50 transition-colors cursor-pointer group"
          style={{ paddingLeft: `${16 + level * 24}px` }}
          onClick={() => navigate(`/categories/${category.id}`)}
        >
          <div className="flex items-center gap-3 flex-1">
            {level > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            <div
              className="h-5 w-5 rounded-full flex-shrink-0 ring-2 ring-offset-2 ring-offset-background ring-transparent"
              style={{ backgroundColor: category.color || '#3B82F6' }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground truncate">{category.name}</p>
                {category.isReadOnly && (
                  <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-md">
                    Default
                  </span>
                )}
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span className="capitalize">{category.type}</span>
                {category.icon && <span>• {category.icon}</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {!category.isReadOnly && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(category);
                  }}
                  className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors"
                  aria-label="Edit category"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(category.id, category.name);
                  }}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                  aria-label="Delete category"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
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
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading categories...</p>
          </div>
        </div>
      ) : !categories?.data || categories?.data?.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/50 p-12 text-center">
          <p className="text-muted-foreground">No categories yet. Add your first category!</p>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-border bg-card divide-y divide-border">
          {renderCategories()}
        </div>
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
