import { ReactNode } from 'react';

export type FilterType = 'text' | 'select' | 'date' | 'number' | 'dateRange' | 'numberRange';

export interface FilterOption {
  label: string;
  value: string | number;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: FilterType;
  placeholder?: string;
  options?: FilterOption[];
  icon?: ReactNode;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface FiltersProps {
  filters: FilterConfig[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onClear?: () => void;
  className?: string;
}

export function Filters({ filters, values, onChange, onClear, className = '' }: FiltersProps) {
  const renderFilter = (filter: FilterConfig) => {
    const value = values[filter.key];

    switch (filter.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(filter.key, e.target.value || undefined)}
            placeholder={filter.placeholder}
            className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(filter.key, e.target.value || undefined)}
            className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
          >
            <option value="" className="bg-background text-foreground">{filter.placeholder || 'All'}</option>
            {filter.options?.map((option) => (
              <option key={option.value} value={option.value} className="bg-background text-foreground">
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(filter.key, e.target.value || undefined)}
            className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(filter.key, e.target.value || undefined)}
            placeholder={filter.placeholder}
            min={filter.min}
            max={filter.max}
            step={filter.step}
            className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        );

      case 'dateRange':
        return (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={value?.start || ''}
              onChange={(e) => onChange(filter.key, { ...value, start: e.target.value || undefined })}
              placeholder="Start date"
              className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
            <input
              type="date"
              value={value?.end || ''}
              onChange={(e) => onChange(filter.key, { ...value, end: e.target.value || undefined })}
              placeholder="End date"
              className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>
        );

      case 'numberRange':
        return (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={value?.min || ''}
              onChange={(e) => onChange(filter.key, { ...value, min: e.target.value || undefined })}
              placeholder="Min"
              step={filter.step}
              className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
            <input
              type="number"
              value={value?.max || ''}
              onChange={(e) => onChange(filter.key, { ...value, max: e.target.value || undefined })}
              placeholder="Max"
              step={filter.step}
              className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {filters.map((filter) => (
        <div key={filter.key} className={filter.className}>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            {filter.icon && <span className="mr-2">{filter.icon}</span>}
            {filter.label}
          </label>
          {renderFilter(filter)}
        </div>
      ))}
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="text-sm text-primary hover:text-primary/80"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
