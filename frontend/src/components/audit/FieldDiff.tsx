import React from 'react';
import { format } from 'date-fns';
import { getCurrencySymbol } from '@/stores/preferencesStore';

interface FieldDiffProps {
  fieldName: string;
  before: any;
  after: any;
  type?: 'text' | 'number' | 'date' | 'object' | 'array';
}

export const FieldDiff: React.FC<FieldDiffProps> = ({ fieldName, before, after, type = 'text' }) => {
  // Auto-detect type if not provided
  const detectedType = type || detectType(before, after);

  // Format field name (convert camelCase to Title Case)
  const formattedFieldName = fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();

  const renderValue = (value: any, isOld: boolean = false) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">None</span>;
    }

    switch (detectedType) {
      case 'number':
        return renderNumberValue(value, isOld);
      case 'date':
        return renderDateValue(value);
      case 'object':
        return renderObjectValue(value);
      case 'array':
        return renderArrayValue(value);
      default:
        return renderTextValue(value, isOld);
    }
  };

  const renderTextValue = (value: string, isOld: boolean) => {
    return (
      <span className={isOld ? 'line-through text-red-600' : 'text-green-600 font-medium'}>
        {value}
      </span>
    );
  };

  const renderNumberValue = (value: number, isOld: boolean) => {
    const difference = !isOld && before ? value - before : 0;
    const isIncrease = difference > 0;
    const isDecrease = difference < 0;

    // Check if this is a currency field based on field name
    const currencyFields = ['amount', 'price', 'cost', 'balance', 'total', 'spent', 'income', 'expense', 'savings', 'invested', 'value', 'payment', 'deposit', 'withdrawal'];
    const isCurrency = currencyFields.some(field => fieldName.toLowerCase().includes(field));

    return (
      <span
        className={`font-medium ${
          isOld
            ? 'text-red-600 line-through'
            : isIncrease
            ? 'text-green-600'
            : isDecrease
            ? 'text-red-600'
            : 'text-blue-600'
        }`}
      >
        {typeof value === 'number' ? (isCurrency ? `${getCurrencySymbol()}${value.toFixed(2)}` : value) : value}
      </span>
    );
  };

  const renderDateValue = (value: string | Date) => {
    try {
      const date = typeof value === 'string' ? new Date(value) : value;
      return <span className="text-blue-600 font-medium">{format(date, 'MMM dd, yyyy')}</span>;
    } catch {
      return <span>{String(value)}</span>;
    }
  };

  const renderObjectValue = (value: any) => {
    if (value.name) {
      return <span className="text-blue-600 font-medium">{value.name}</span>;
    }
    return <span className="text-blue-600 font-medium">{JSON.stringify(value)}</span>;
  };

  const renderArrayValue = (value: any[]) => {
    if (value.length === 0) {
      return <span className="text-gray-400 italic">None</span>;
    }
    return (
      <span className="text-blue-600 font-medium">
        {value.map((item) => (typeof item === 'object' ? item.name : item)).join(', ')}
      </span>
    );
  };

  const renderArrayDiff = () => {
    const beforeArray = Array.isArray(before) ? before : [];
    const afterArray = Array.isArray(after) ? after : [];

    const beforeNames = beforeArray.map((item) => (typeof item === 'object' ? item.name : item));
    const afterNames = afterArray.map((item) => (typeof item === 'object' ? item.name : item));

    const added = afterNames.filter((name) => !beforeNames.includes(name));
    const removed = beforeNames.filter((name) => !afterNames.includes(name));

    if (added.length === 0 && removed.length === 0) {
      return null;
    }

    return (
      <div className="space-y-1">
        {removed.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-red-600 text-sm">Removed:</span>
            {removed.map((name, index) => (
              <span key={index} className="text-red-600 line-through text-sm">
                {name}
                {index < removed.length - 1 && ','}
              </span>
            ))}
          </div>
        )}
        {added.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-green-600 text-sm">Added:</span>
            {added.map((name, index) => (
              <span key={index} className="text-green-600 font-medium text-sm">
                {name}
                {index < added.length - 1 && ','}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Check if values are the same
  if (JSON.stringify(before) === JSON.stringify(after)) {
    return null;
  }

  return (
    <div className="flex items-start gap-2 py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-gray-600 font-medium min-w-[120px]">{formattedFieldName}:</span>
      <div className="flex-1">
        {detectedType === 'array' && before && after ? (
          renderArrayDiff()
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            {before !== null && before !== undefined && (
              <>
                {renderValue(before, true)}
                <span className="text-gray-400">→</span>
              </>
            )}
            {renderValue(after, false)}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to detect type
function detectType(before: any, after: any): 'text' | 'number' | 'date' | 'object' | 'array' {
  const value = after !== null && after !== undefined ? after : before;

  if (Array.isArray(value)) return 'array';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'object' && value !== null) {
    // Check if it's a date
    if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
      return 'date';
    }
    return 'object';
  }
  // Check if string is a date
  if (typeof value === 'string' && !isNaN(Date.parse(value)) && value.includes('-')) {
    return 'date';
  }
  return 'text';
}

export default FieldDiff;
