import { ReactNode } from 'react';
import { Search, Filter } from 'lucide-react';

interface PageHeaderButton {
  label: string;
  icon?: any;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  disabled?: boolean;
}

interface PageHeaderProps {
  // Search functionality
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;

  // Filter functionality
  showFilter?: boolean;
  onFilterClick?: () => void;
  activeFiltersCount?: number;

  // Action buttons
  buttons?: PageHeaderButton[];

  // Custom content (for special cases)
  customLeft?: ReactNode;
  customRight?: ReactNode;

  // Styling
  className?: string;
}

export function PageHeader({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  showSearch = false,
  showFilter = false,
  onFilterClick,
  activeFiltersCount = 0,
  buttons = [],
  customLeft,
  customRight,
  className = '',
}: PageHeaderProps) {
  const getButtonClasses = (variant: PageHeaderButton['variant'] = 'secondary') => {
    const baseClasses = 'flex items-center gap-2 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap';

    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700`;
      case 'outline':
        return `${baseClasses} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`;
      case 'secondary':
      default:
        return `${baseClasses} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`;
    }
  };

  return (
    <div className={`flex flex-col gap-3 sm:gap-0 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      {/* Left side: Search or custom content */}
      <div className="flex-1 min-w-0">
        {customLeft ? (
          customLeft
        ) : showSearch ? (
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        ) : (
          <div /> // Empty placeholder to maintain layout
        )}
      </div>

      {/* Right side: Filter + Buttons or custom content */}
      <div className="flex flex-wrap items-center gap-2">
        {customRight ? (
          customRight
        ) : (
          <>
            {/* Filter button */}
            {showFilter && (
              <button
                onClick={onFilterClick}
                className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap"
              >
                <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="rounded-full bg-blue-600 px-1.5 sm:px-2 py-0.5 text-xs text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            )}

            {/* Action buttons */}
            {buttons.map((button, index) => {
              const Icon = button.icon;
              return (
                <button
                  key={index}
                  onClick={button.onClick}
                  disabled={button.disabled}
                  className={`${getButtonClasses(button.variant)} ${button.className || ''} ${
                    button.disabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {Icon && <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                  {button.label}
                </button>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
