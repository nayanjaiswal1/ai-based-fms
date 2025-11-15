import { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface InlineEditableCellProps {
  value: any;
  type: 'text' | 'number' | 'date' | 'select' | 'currency';
  options?: { value: string; label: string }[];
  onSave: (value: any) => void;
  onCancel?: () => void;
  isEditing: boolean;
  onStartEdit: () => void;
  placeholder?: string;
  className?: string;
  renderDisplay?: (value: any) => React.ReactNode;
}

export function InlineEditableCell({
  value,
  type,
  options = [],
  onSave,
  onCancel,
  isEditing,
  onStartEdit,
  placeholder,
  className = '',
  renderDisplay,
}: InlineEditableCellProps) {
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement && type !== 'date') {
        inputRef.current.select();
      }
    }
  }, [isEditing, type]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    let finalValue = editValue;

    if (type === 'number' || type === 'currency') {
      finalValue = parseFloat(editValue) || 0;
    }

    onSave(finalValue);
  };

  const handleCancel = () => {
    setEditValue(value);
    onCancel?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (!isEditing) {
    return (
      <div
        onClick={onStartEdit}
        className={`cursor-pointer rounded px-2 py-1 hover:bg-gray-100 ${className}`}
      >
        {renderDisplay ? renderDisplay(value) : value || placeholder || '—'}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {type === 'select' ? (
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="flex-1 rounded border border-blue-500 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={type === 'currency' ? 'number' : type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          placeholder={placeholder}
          step={type === 'currency' || type === 'number' ? '0.01' : undefined}
          className="flex-1 rounded border border-blue-500 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
      <button
        onClick={handleSave}
        className="rounded p-1 text-green-600 hover:bg-green-50"
      >
        <Check className="h-4 w-4" />
      </button>
      <button
        onClick={handleCancel}
        className="rounded p-1 text-red-600 hover:bg-red-50"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
