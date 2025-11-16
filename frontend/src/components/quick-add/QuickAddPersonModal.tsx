import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi, lendBorrowApi } from '@services/api';
import { X, User, Mail, Phone, DollarSign, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface QuickAddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'lend' | 'borrow' | 'group-expense';
}

export function QuickAddPersonModal({ isOpen, onClose, mode }: QuickAddPersonModalProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const [step, setStep] = useState<'person' | 'amount'>('person');

  // Person details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Transaction details
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const createLendBorrowMutation = useMutation({
    mutationFn: lendBorrowApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lend-borrow'] });
      toast.success(`${mode === 'lend' ? 'Lend' : 'Borrow'} record created successfully`);
      handleClose();
    },
  });

  const createGroupWithExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
      // First create group with external contact
      const response = await groupsApi.create({
        name: `${data.personName}`,
        description: `Quick group with ${data.personName}`,
        currency: 'USD',
      });

      const groupId = response.data.id;

      // Add external member
      await groupsApi.addMember(groupId, {
        isExternalContact: true,
        externalName: data.personName,
        externalEmail: data.personEmail,
        externalPhone: data.personPhone,
        role: 'member',
      });

      // Add initial expense
      const members = await groupsApi.getMembers(groupId);
      const externalMember = members.data.find((m: any) => m.isExternalContact);
      const currentMember = members.data.find((m: any) => !m.isExternalContact);

      await groupsApi.addTransaction(groupId, {
        description: data.description || 'Quick expense',
        amount: parseFloat(data.amount),
        date: new Date().toISOString().split('T')[0],
        paidBy: currentMember?.userId || currentMember?.id,
        splitType: 'equal',
        splits: {
          [currentMember?.userId || currentMember?.id]: parseFloat(data.amount) / 2,
          [externalMember.id]: parseFloat(data.amount) / 2,
        },
      });

      return { groupId };
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Group created and expense added!');
      navigate(`/groups/${response.groupId}`);
      handleClose();
    },
  });

  const handleClose = () => {
    setStep('person');
    setName('');
    setEmail('');
    setPhone('');
    setAmount('');
    setDescription('');
    onClose();
  };

  const handleNext = () => {
    if (!name.trim()) {
      toast.error('Please enter a name');
      return;
    }
    setStep('amount');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (mode === 'lend' || mode === 'borrow') {
      createLendBorrowMutation.mutate({
        type: mode,
        personName: name,
        personEmail: email || undefined,
        personPhone: phone || undefined,
        amount: parseFloat(amount),
        description: description || `Quick ${mode}`,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
      });
    } else {
      // Group expense - create group and add transaction
      createGroupWithExpenseMutation.mutate({
        personName: name,
        personEmail: email || undefined,
        personPhone: phone || undefined,
        amount,
        description: description || 'Quick expense',
        paidBy: currentUser?.id,
        currentUserId: currentUser?.id,
      });
    }
  };

  const presets = [10, 20, 50, 100, 200, 500];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Quick Add {mode === 'lend' ? 'Lend' : mode === 'borrow' ? 'Borrow' : 'Expense'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Step indicator */}
          <div className="mb-6 flex items-center justify-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              step === 'person' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
            }`}>
              1
            </div>
            <div className={`h-1 w-16 ${step === 'amount' ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              step === 'amount' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              2
            </div>
          </div>

          {/* Step 1: Person Details */}
          {step === 'person' && (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Friend's name"
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email (optional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Phone (optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 234 567 8900"
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700"
              >
                Next: Add Amount
              </button>
            </div>
          )}

          {/* Step 2: Amount */}
          {step === 'amount' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Amount <span className="text-red-500">*</span>
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

                {/* Quick presets */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {presets.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset.toString())}
                      className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      ${preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this for?"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('person')}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={createLendBorrowMutation.isPending || createGroupWithExpenseMutation.isPending}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {(createLendBorrowMutation.isPending || createGroupWithExpenseMutation.isPending)
                    ? 'Creating...'
                    : 'Create'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
