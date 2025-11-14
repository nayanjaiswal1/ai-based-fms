import { useState, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';

export interface StatusBarItem {
  id: string;
  label: string;
  value: string | number;
  icon?: LucideIcon;
  color?: string;
  bgColor?: string;
  details?: {
    label: string;
    value: string | number;
  }[];
}

interface StatusBarProps {
  items: StatusBarItem[];
  className?: string;
}

export function StatusBar({ items, className = '' }: StatusBarProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [ctrlPressed, setCtrlPressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        setCtrlPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        setCtrlPressed(false);
        setShowDetails(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleClick = () => {
    if (ctrlPressed) {
      setShowDetails(!showDetails);
    }
  };

  return (
    <>
      {/* Status Bar - Offset for sidebar on desktop */}
      <div
        className={`fixed bottom-0 left-0 md:left-64 right-0 bg-gradient-to-r from-slate-800 to-slate-900 border-t border-slate-700 z-40 ${className}`}
        onClick={handleClick}
        style={{ cursor: ctrlPressed ? 'pointer' : 'default' }}
      >
        <div className="flex items-center h-8 px-4 gap-6 overflow-x-auto">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex items-center gap-1.5 flex-shrink-0"
              >
                {Icon && (
                  <Icon
                    className="h-3.5 w-3.5"
                    style={{ color: item.color || '#94a3b8' }}
                  />
                )}
                <span className="text-xs text-slate-400">{item.label}:</span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: item.color || '#e2e8f0' }}
                >
                  {item.value}
                </span>
              </div>
            );
          })}

          {/* Hint for Ctrl+Click */}
          {ctrlPressed && (
            <div className="ml-auto flex-shrink-0 text-xs text-slate-400 animate-pulse">
              Click for details
            </div>
          )}
        </div>
      </div>

      {/* Details Panel (Excel-style) */}
      {showDetails && (
        <div className="fixed bottom-8 right-4 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-50 w-80 max-h-96 overflow-y-auto">
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-2 border-b border-slate-600">
            <h3 className="text-sm font-semibold text-slate-200">Statistics</h3>
          </div>
          <div className="p-3 space-y-2">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="space-y-1">
                  {/* Main Item */}
                  <div
                    className="flex items-center justify-between py-1.5 px-2 rounded"
                    style={{ backgroundColor: item.bgColor || 'transparent' }}
                  >
                    <div className="flex items-center gap-2">
                      {Icon && (
                        <Icon
                          className="h-4 w-4"
                          style={{ color: item.color || '#94a3b8' }}
                        />
                      )}
                      <span className="text-xs font-medium text-slate-300">
                        {item.label}
                      </span>
                    </div>
                    <span
                      className="text-sm font-bold"
                      style={{ color: item.color || '#e2e8f0' }}
                    >
                      {item.value}
                    </span>
                  </div>

                  {/* Details */}
                  {item.details && item.details.length > 0 && (
                    <div className="ml-6 space-y-0.5">
                      {item.details.map((detail, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-0.5"
                        >
                          <span className="text-xs text-slate-400">
                            {detail.label}
                          </span>
                          <span className="text-xs font-medium text-slate-300">
                            {detail.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="bg-slate-900 px-4 py-2 border-t border-slate-700">
            <p className="text-xs text-slate-500 text-center">
              Press Ctrl again to close
            </p>
          </div>
        </div>
      )}
    </>
  );
}
