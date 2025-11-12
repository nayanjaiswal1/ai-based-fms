import { useState } from 'react';
import { Settings, Plus, RotateCcw, Save, X } from 'lucide-react';
import { useWidgetPreferences } from '../hooks/useWidgetPreferences';
import { WidgetGallery } from './WidgetGallery';

interface Props {
  isCustomizing: boolean;
  onToggleCustomizing: () => void;
}

export function DashboardCustomizer({ isCustomizing, onToggleCustomizing }: Props) {
  const { resetToDefault, isResetting } = useWidgetPreferences();
  const [showGallery, setShowGallery] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    resetToDefault();
    setShowResetConfirm(false);
    onToggleCustomizing();
  };

  return (
    <>
      {/* Customization Toolbar */}
      {isCustomizing ? (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-white rounded-lg shadow-2xl border border-gray-200">
          <div className="flex items-center gap-2 px-4 py-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg">
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium">Customizing Dashboard</span>
            </div>

            <div className="h-6 w-px bg-gray-300" />

            <button
              onClick={() => setShowGallery(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Widget
            </button>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Default
            </button>

            <div className="h-6 w-px bg-gray-300" />

            <button
              onClick={onToggleCustomizing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              Done
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={onToggleCustomizing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Settings className="h-4 w-4" />
          Customize Dashboard
        </button>
      )}

      {/* Widget Gallery */}
      <WidgetGallery isOpen={showGallery} onClose={() => setShowGallery(false)} />

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowResetConfirm(false)} />

            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <RotateCcw className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Reset Dashboard Layout?
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    This will reset your dashboard to the default layout and remove all customizations. This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={isResetting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReset}
                      disabled={isResetting}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {isResetting ? 'Resetting...' : 'Reset'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Tooltip */}
      {isCustomizing && (
        <div className="fixed top-20 right-6 z-40 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-sm">
          <h4 className="font-semibold text-blue-900 mb-2">Customization Mode</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Drag widgets to reorder them</li>
            <li>• Click the eye icon to show/hide widgets</li>
            <li>• Click the gear icon to configure widgets</li>
            <li>• Click the X icon to remove widgets</li>
            <li>• Click "Add Widget" to add more widgets</li>
          </ul>
          <button
            onClick={onToggleCustomizing}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Got it
          </button>
        </div>
      )}
    </>
  );
}
