import { useState } from 'react';
import { Plus, Zap, TrendingUp, TrendingDown, Users, X } from 'lucide-react';
import { QuickAddPersonModal } from './QuickAddPersonModal';

export function QuickAddFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'lend' | 'borrow' | 'group-expense' | null>(null);

  const handleOpenModal = (mode: 'lend' | 'borrow' | 'group-expense') => {
    setModalMode(mode);
    setIsOpen(false); // Close the menu
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        {/* Action Menu */}
        {isOpen && (
          <div className="mb-4 flex flex-col gap-3">
            {/* Lend Money */}
            <button
              onClick={() => handleOpenModal('lend')}
              className="group flex items-center gap-3 rounded-full bg-white shadow-lg transition-all hover:shadow-xl"
            >
              <span className="whitespace-nowrap rounded-l-full bg-white px-4 py-2 text-sm font-medium text-gray-700 opacity-0 transition-opacity group-hover:opacity-100">
                Lend Money
              </span>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white">
                <TrendingUp className="h-5 w-5" />
              </div>
            </button>

            {/* Borrow Money */}
            <button
              onClick={() => handleOpenModal('borrow')}
              className="group flex items-center gap-3 rounded-full bg-white shadow-lg transition-all hover:shadow-xl"
            >
              <span className="whitespace-nowrap rounded-l-full bg-white px-4 py-2 text-sm font-medium text-gray-700 opacity-0 transition-opacity group-hover:opacity-100">
                Borrow Money
              </span>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white">
                <TrendingDown className="h-5 w-5" />
              </div>
            </button>

            {/* Group Expense */}
            <button
              onClick={() => handleOpenModal('group-expense')}
              className="group flex items-center gap-3 rounded-full bg-white shadow-lg transition-all hover:shadow-xl"
            >
              <span className="whitespace-nowrap rounded-l-full bg-white px-4 py-2 text-sm font-medium text-gray-700 opacity-0 transition-opacity group-hover:opacity-100">
                Share Expense
              </span>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500 text-white">
                <Users className="h-5 w-5" />
              </div>
            </button>
          </div>
        )}

        {/* Main FAB Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all hover:shadow-xl ${
            isOpen
              ? 'bg-gray-700 rotate-45'
              : 'bg-gradient-to-r from-blue-600 to-purple-600'
          }`}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <Zap className="h-6 w-6 text-white" />
          )}
        </button>
      </div>

      {/* Quick Add Modal */}
      <QuickAddPersonModal
        isOpen={modalMode !== null}
        onClose={() => setModalMode(null)}
        mode={modalMode || 'lend'}
      />
    </>
  );
}
