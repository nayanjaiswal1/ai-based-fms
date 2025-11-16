import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrency } from '@/hooks/useCurrency';

interface LineItem {
  categoryId: string;
  description: string;
  amount: number;
}

interface MultiItemTransactionFormProps {
  categories: any[];
  value: LineItem[];
  onChange: (items: LineItem[]) => void;
}

export function MultiItemTransactionForm({
  categories,
  value,
  onChange,
}: MultiItemTransactionFormProps) {
  const { symbol } = useCurrency();
  const handleAddItem = () => {
    onChange([...value, { categoryId: '', description: '', amount: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = value.filter((_, i) => i !== index);
    onChange(newItems);
  };

  const handleUpdateItem = (
    index: number,
    field: keyof LineItem,
    itemValue: any,
  ) => {
    const newItems = [...value];
    newItems[index] = { ...newItems[index], [field]: itemValue };
    onChange(newItems);
  };

  const totalAmount = value.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Transaction Items</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddItem}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="space-y-3">
        {value.map((item, index) => (
          <div
            key={index}
            className="flex gap-2 items-start p-3 border rounded-lg bg-gray-50"
          >
            <div className="flex-1 grid grid-cols-3 gap-2">
              {/* Category */}
              <div>
                <Label className="text-xs">Category</Label>
                <Select
                  value={item.categoryId}
                  onValueChange={(val) =>
                    handleUpdateItem(index, 'categoryId', val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div>
                <Label className="text-xs">Description</Label>
                <Input
                  placeholder="Item description"
                  value={item.description}
                  onChange={(e) =>
                    handleUpdateItem(index, 'description', e.target.value)
                  }
                />
              </div>

              {/* Amount */}
              <div>
                <Label className="text-xs">Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={item.amount || ''}
                  onChange={(e) =>
                    handleUpdateItem(index, 'amount', parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </div>

            {/* Remove Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveItem(index)}
              className="mt-5"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>

      {value.length > 0 && (
        <div className="flex justify-end items-center gap-2 pt-2 border-t">
          <span className="text-sm font-medium text-gray-600">Total:</span>
          <span className="text-lg font-bold text-gray-900">
            {symbol()}{totalAmount.toFixed(2)}
          </span>
        </div>
      )}

      {value.length === 0 && (
        <div className="text-center py-6 text-gray-500 text-sm">
          No items added. Click "Add Item" to start.
        </div>
      )}
    </div>
  );
}
