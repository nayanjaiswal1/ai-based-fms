import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { groupsApi } from '@services/api';
import { X, DollarSign, Users, Zap } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

interface QuickExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  members: any[];
}

export function QuickExpenseModal({ isOpen, onClose, groupId, members }: QuickExpenseModalProps) {
  const queryClient = useQueryClient();
  const { getCurrencySymbol } = useCurrency();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState<'equal' | 'you-paid' | 'they-paid'>('equal');

  const addTransactionMutation = useMutation({
    mutationFn: (data: any) => groupsApi.addTransaction(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-transactions', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-balances', groupId] });
      handleClose();
    },
  });

  const handleClose = () => {
    setAmount('');
    setDescription('');
    setPaidBy('');
    setSplitType('equal');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !paidBy) return;

    const amountNum = parseFloat(amount);
    let splits: Record<string, number> = {};

    // Calculate splits based on type
    if (splitType === 'equal') {
      const perPerson = amountNum / members.length;
      members.forEach(member => {
        const memberId = member.userId || member.id;
        splits[memberId] = perPerson;
      });
    } else if (splitType === 'you-paid') {
      // You paid, other person owes all
      const otherMember = members.find(m => (m.userId || m.id) !== paidBy);
      if (otherMember) {
        splits[otherMember.userId || otherMember.id] = amountNum;
      }
    } else if (splitType === 'they-paid') {
      // They paid, you owe all
      splits[paidBy] = amountNum;
    }

    addTransactionMutation.mutate({
      description: description || 'Quick expense',
      amount: amountNum,
      date: new Date().toISOString().split('T')[0],
      paidBy,
      splitType: 'custom',
      splits,
    });
  };

  // Quick presets
  const presets = [10, 20, 50, 100, 200, 500];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-900">Quick Expense</h2>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Input */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-2xl font-semibold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            {/* Quick Amount Presets */}
            <div className="mt-2 flex flex-wrap gap-2">
              {presets.map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {getCurrencySymbol()}{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Description (Optional) */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Lunch, Coffee, Groceries..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Who Paid */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Who paid?
            </label>
            <div className="space-y-2">
              {members.map(member => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setPaidBy(member.userId || member.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    paidBy === (member.userId || member.id)
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">
                      {member.isExternalContact
                        ? member.externalName
                        : `${member.user?.firstName} ${member.user?.lastName}` || 'You'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Split Type (Simple Options) */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              How to split?
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setSplitType('equal')}
                className={`w-full rounded-lg border p-3 text-left ${
                  splitType === 'equal'
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">Split Equally</div>
                <div className="text-sm opacity-75">Everyone pays equal share</div>
              </button>

              {members.length === 2 && (
                <>
                  <button
                    type="button"
                    onClick={() => setSplitType('you-paid')}
                    className={`w-full rounded-lg border p-3 text-left ${
                      splitType === 'you-paid'
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">You paid for them</div>
                    <div className="text-sm opacity-75">They owe you the full amount</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSplitType('they-paid')}
                    className={`w-full rounded-lg border p-3 text-left ${
                      splitType === 'they-paid'
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">They paid for you</div>
                    <div className="text-sm opacity-75">You owe them the full amount</div>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!amount || !paidBy || addTransactionMutation.isPending}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {addTransactionMutation.isPending ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
