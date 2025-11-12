import { useState } from 'react';
import { X, Search, Plus, Check } from 'lucide-react';
import { getAllWidgets, WidgetCategory, WidgetDefinition } from '../config/widgetRegistry';
import { useWidgetPreferences } from '../hooks/useWidgetPreferences';
import { WidgetConfig } from '../api/dashboard-preferences.api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const categoryLabels: Record<WidgetCategory, string> = {
  financial: 'Financial',
  budgets: 'Budgets',
  analytics: 'Analytics',
  goals: 'Goals',
  investments: 'Investments',
};

export function WidgetGallery({ isOpen, onClose }: Props) {
  const { widgets, addWidget } = useWidgetPreferences();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<WidgetCategory | 'all'>('all');

  const allWidgets = getAllWidgets();

  const filteredWidgets = allWidgets.filter((widget) => {
    const matchesSearch =
      widget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      widget.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || widget.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isWidgetAdded = (widgetType: string) => {
    return widgets.some((w) => w.type === widgetType);
  };

  const handleAddWidget = (definition: WidgetDefinition) => {
    const newWidget: WidgetConfig = {
      id: `${definition.type}-${Date.now()}`,
      type: definition.type,
      position: widgets.length,
      size: definition.defaultSize,
      visible: true,
      config: {},
    };
    addWidget(newWidget);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Widget Gallery</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search widgets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Widgets
              </button>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key as WidgetCategory)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Widget Grid */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 220px)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWidgets.map((widget) => {
                const added = isWidgetAdded(widget.type);
                return (
                  <div
                    key={widget.id}
                    className={`border rounded-lg p-4 hover:shadow-lg transition-all ${
                      added ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{widget.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{widget.description}</p>
                        <span className="inline-block px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded">
                          {categoryLabels[widget.category]}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => !added && handleAddWidget(widget)}
                      disabled={added}
                      className={`w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        added
                          ? 'bg-green-100 text-green-700 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {added ? (
                        <>
                          <Check className="h-4 w-4" />
                          Added
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Add Widget
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {filteredWidgets.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No widgets found matching your search</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
