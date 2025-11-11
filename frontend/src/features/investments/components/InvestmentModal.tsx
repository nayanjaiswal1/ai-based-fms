import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { investmentsApi } from '@services/api';
import { X } from 'lucide-react';
import { format } from 'date-fns';

interface InvestmentModalProps {
  investment?: any;
  onClose: () => void;
}

export default function InvestmentModal({ investment, onClose }: InvestmentModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: investment?.name || '',
    type: investment?.type || 'stock',
    symbol: investment?.symbol || '',
    investedAmount: investment?.investedAmount || '',
    currentValue: investment?.currentValue || '',
    quantity: investment?.quantity || '',
    purchaseDate: investment?.purchaseDate
      ? format(new Date(investment.purchaseDate), 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd'),
    notes: investment?.notes || '',
  });

  const createMutation = useMutation({
    mutationFn: investmentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      investmentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      onClose();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      investedAmount: parseFloat(formData.investedAmount),
      currentValue: parseFloat(formData.currentValue),
      quantity: formData.quantity ? parseFloat(formData.quantity) : undefined,
      symbol: formData.symbol || undefined,
      notes: formData.notes || undefined,
    };

    if (investment) {
      await updateMutation.mutateAsync({ id: investment.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {investment ? 'Edit Investment' : 'Add Investment'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Investment Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Apple Inc."
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="stock">Stock</option>
                <option value="bond">Bond</option>
                <option value="mutual_fund">Mutual Fund</option>
                <option value="etf">ETF</option>
                <option value="crypto">Cryptocurrency</option>
                <option value="real_estate">Real Estate</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Symbol and Purchase Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="symbol" className="block text-sm font-medium text-gray-700">
                Symbol/Ticker (optional)
              </label>
              <input
                type="text"
                id="symbol"
                name="symbol"
                value={formData.symbol}
                onChange={handleChange}
                placeholder="e.g., AAPL"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700">
                Purchase Date
              </label>
              <input
                type="date"
                id="purchaseDate"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="investedAmount" className="block text-sm font-medium text-gray-700">
                Invested Amount
              </label>
              <input
                type="number"
                id="investedAmount"
                name="investedAmount"
                value={formData.investedAmount}
                onChange={handleChange}
                step="0.01"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="currentValue" className="block text-sm font-medium text-gray-700">
                Current Value
              </label>
              <input
                type="number"
                id="currentValue"
                name="currentValue"
                value={formData.currentValue}
                onChange={handleChange}
                step="0.01"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Quantity (optional)
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                step="0.001"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* ROI Preview */}
          {formData.investedAmount && formData.currentValue && (
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-600">Expected ROI:</p>
              <div className="mt-2 flex items-center gap-4">
                <div>
                  <p className="text-sm text-gray-500">Return</p>
                  <p
                    className={`text-lg font-semibold ${
                      parseFloat(formData.currentValue) - parseFloat(formData.investedAmount) >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {parseFloat(formData.currentValue) - parseFloat(formData.investedAmount) >= 0
                      ? '+'
                      : ''}
                    $
                    {(
                      parseFloat(formData.currentValue) - parseFloat(formData.investedAmount)
                    ).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ROI %</p>
                  <p
                    className={`text-lg font-semibold ${
                      ((parseFloat(formData.currentValue) - parseFloat(formData.investedAmount)) /
                        parseFloat(formData.investedAmount)) *
                        100 >=
                      0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {((parseFloat(formData.currentValue) - parseFloat(formData.investedAmount)) /
                      parseFloat(formData.investedAmount)) *
                      100 >=
                    0
                      ? '+'
                      : ''}
                    {(
                      ((parseFloat(formData.currentValue) - parseFloat(formData.investedAmount)) /
                        parseFloat(formData.investedAmount)) *
                      100
                    ).toFixed(2)}
                    %
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Add any additional notes..."
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : investment
                  ? 'Update Investment'
                  : 'Add Investment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
