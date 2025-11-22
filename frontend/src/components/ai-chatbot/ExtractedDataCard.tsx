import { useState } from 'react';
import { Edit2, Check, X, Calendar, DollarSign, Store, Tag, CheckCircle2 } from 'lucide-react';

interface ExtractedData {
  merchantName: string | null;
  amount: number;
  date: string | null;
  category: string;
  categoryId: string | null;
  description: string;
  confidence: 'high' | 'medium' | 'low';
  items?: string[];
  paymentMethod?: string | null;
}

interface ExtractedDataCardProps {
  data: ExtractedData;
  onConfirm: (data: ExtractedData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function ExtractedDataCard({ data, onConfirm, onCancel, isSubmitting }: ExtractedDataCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ExtractedData>(data);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedData(data);
    setIsEditing(false);
  };

  const handleConfirm = () => {
    onConfirm(editedData);
  };

  const getConfidenceBadge = (confidence: string) => {
    const colors = {
      high: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-red-100 text-red-800',
    };
    return colors[confidence as keyof typeof colors] || colors.medium;
  };

  return (
    <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">Data Extracted</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${getConfidenceBadge(editedData.confidence)}`}>
            {editedData.confidence} confidence
          </span>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="rounded p-1 hover:bg-blue-100"
              aria-label="Edit data"
            >
              <Edit2 className="h-4 w-4 text-blue-600" />
            </button>
          )}
        </div>
      </div>

      {/* Data Fields */}
      <div className="space-y-3">
        {/* Merchant */}
        <div className="flex items-start gap-2">
          <Store className="mt-0.5 h-4 w-4 text-gray-500" />
          <div className="flex-1">
            <p className="text-xs text-gray-600">Merchant</p>
            {isEditing ? (
              <input
                type="text"
                value={editedData.merchantName || ''}
                onChange={(e) => setEditedData({ ...editedData, merchantName: e.target.value })}
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                placeholder="Merchant name"
              />
            ) : (
              <p className="font-medium text-gray-900">{editedData.merchantName || 'Not specified'}</p>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="flex items-start gap-2">
          <DollarSign className="mt-0.5 h-4 w-4 text-gray-500" />
          <div className="flex-1">
            <p className="text-xs text-gray-600">Amount</p>
            {isEditing ? (
              <input
                type="number"
                step="0.01"
                value={editedData.amount}
                onChange={(e) => setEditedData({ ...editedData, amount: parseFloat(e.target.value) })}
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
              />
            ) : (
              <p className="font-medium text-gray-900">${editedData.amount.toFixed(2)}</p>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="flex items-start gap-2">
          <Calendar className="mt-0.5 h-4 w-4 text-gray-500" />
          <div className="flex-1">
            <p className="text-xs text-gray-600">Date</p>
            {isEditing ? (
              <input
                type="date"
                value={editedData.date || ''}
                onChange={(e) => setEditedData({ ...editedData, date: e.target.value })}
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
              />
            ) : (
              <p className="font-medium text-gray-900">
                {editedData.date ? new Date(editedData.date).toLocaleDateString() : 'Today'}
              </p>
            )}
          </div>
        </div>

        {/* Category */}
        <div className="flex items-start gap-2">
          <Tag className="mt-0.5 h-4 w-4 text-gray-500" />
          <div className="flex-1">
            <p className="text-xs text-gray-600">Category</p>
            {isEditing ? (
              <input
                type="text"
                value={editedData.category}
                onChange={(e) => setEditedData({ ...editedData, category: e.target.value })}
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                placeholder="Category"
              />
            ) : (
              <p className="font-medium text-gray-900">{editedData.category}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="flex items-start gap-2">
          <div className="mt-0.5 h-4 w-4" />
          <div className="flex-1">
            <p className="text-xs text-gray-600">Description</p>
            {isEditing ? (
              <textarea
                value={editedData.description}
                onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                rows={2}
                placeholder="Transaction description"
              />
            ) : (
              <p className="text-sm text-gray-900">{editedData.description}</p>
            )}
          </div>
        </div>

        {/* Items (if available) */}
        {editedData.items && editedData.items.length > 0 && (
          <div className="rounded bg-white p-2">
            <p className="mb-1 text-xs font-medium text-gray-600">Items</p>
            <ul className="list-inside list-disc space-y-1 text-xs text-gray-700">
              {editedData.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-2">
        {isEditing ? (
          <>
            <button
              onClick={handleSaveEdit}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              <Check className="h-4 w-4" />
              Save Changes
            </button>
            <button
              onClick={handleCancelEdit}
              className="flex items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Adding...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Add as Transaction
                </>
              )}
            </button>
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
