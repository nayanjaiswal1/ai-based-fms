import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { WidgetConfig } from '../api/dashboard-preferences.api';
import { getWidgetDefinition, WidgetSize } from '../config/widgetRegistry';
import { useWidgetPreferences } from '../hooks/useWidgetPreferences';

interface Props {
  widget: WidgetConfig | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WidgetConfigModal({ widget, isOpen, onClose }: Props) {
  const { updateWidget } = useWidgetPreferences();
  const [config, setConfig] = useState(widget?.config || {});
  const [size, setSize] = useState(widget?.size || 'medium');
  const [title, setTitle] = useState(widget?.config?.title || '');

  if (!isOpen || !widget) return null;

  const definition = getWidgetDefinition(widget.type);
  if (!definition) return null;

  const handleSave = () => {
    updateWidget(widget.id, {
      size: size as WidgetSize,
      config: {
        ...config,
        title: title || undefined,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Configure Widget</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Widget Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Widget Type
              </label>
              <p className="text-gray-900 font-semibold">{definition.name}</p>
              <p className="text-sm text-gray-600">{definition.description}</p>
            </div>

            {/* Custom Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={definition.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Size Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Widget Size
              </label>
              <div className="grid grid-cols-2 gap-2">
                {definition.allowedSizes.map((sizeOption) => (
                  <button
                    key={sizeOption}
                    onClick={() => setSize(sizeOption)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      size === sizeOption
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {sizeOption === 'small' && 'Small'}
                    {sizeOption === 'medium' && 'Medium'}
                    {sizeOption === 'large' && 'Large'}
                    {sizeOption === 'full-width' && 'Full Width'}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range (if applicable) */}
            {widget.type.includes('trend') || widget.type.includes('flow') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <select
                  value={config.dateRange || '30days'}
                  onChange={(e) => setConfig({ ...config, dateRange: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="3months">Last 3 Months</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="1year">Last Year</option>
                </select>
              </div>
            )}

            {/* Refresh Interval */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Auto-Refresh Interval
              </label>
              <select
                value={config.refreshInterval || 0}
                onChange={(e) =>
                  setConfig({ ...config, refreshInterval: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>Manual Only</option>
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
                <option value={300}>5 minutes</option>
                <option value={600}>10 minutes</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
