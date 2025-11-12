import { ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Settings, Eye, EyeOff } from 'lucide-react';
import { WidgetConfig } from '../api/dashboard-preferences.api';
import { getSizeClass } from '../config/widgetRegistry';

interface Props {
  widget: WidgetConfig;
  children: ReactNode;
  isCustomizing?: boolean;
  onRemove?: () => void;
  onConfigure?: () => void;
  onToggleVisibility?: () => void;
}

export function WidgetWrapper({
  widget,
  children,
  isCustomizing = false,
  onRemove,
  onConfigure,
  onToggleVisibility,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: widget.id,
    disabled: !isCustomizing,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${getSizeClass(widget.size)} ${isDragging ? 'z-50' : ''}`}
    >
      <div
        className={`relative h-full ${
          isCustomizing ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
        }`}
      >
        {/* Customization Overlay */}
        {isCustomizing && (
          <div className="absolute inset-0 bg-black bg-opacity-5 rounded-lg z-10 pointer-events-none" />
        )}

        {/* Control Bar */}
        {isCustomizing && (
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-white rounded-lg shadow-lg p-1 pointer-events-auto">
            {/* Drag Handle */}
            <button
              {...attributes}
              {...listeners}
              className="p-1.5 hover:bg-gray-100 rounded cursor-move transition-colors"
              title="Drag to reorder"
            >
              <GripVertical className="h-4 w-4 text-gray-600" />
            </button>

            {/* Visibility Toggle */}
            <button
              onClick={onToggleVisibility}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title={widget.visible ? 'Hide widget' : 'Show widget'}
            >
              {widget.visible ? (
                <Eye className="h-4 w-4 text-gray-600" />
              ) : (
                <EyeOff className="h-4 w-4 text-gray-600" />
              )}
            </button>

            {/* Configure */}
            <button
              onClick={onConfigure}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title="Configure widget"
            >
              <Settings className="h-4 w-4 text-gray-600" />
            </button>

            {/* Remove */}
            <button
              onClick={onRemove}
              className="p-1.5 hover:bg-red-100 rounded transition-colors"
              title="Remove widget"
            >
              <X className="h-4 w-4 text-red-600" />
            </button>
          </div>
        )}

        {/* Widget Content */}
        <div className={`h-full ${!widget.visible && isCustomizing ? 'opacity-50' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
