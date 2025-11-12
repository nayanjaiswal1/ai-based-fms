interface AmountFiltersProps {
  minAmount?: string;
  maxAmount?: string;
  onAmountChange: (minAmount?: string, maxAmount?: string) => void;
}

export function AmountFilters({ minAmount, maxAmount, onAmountChange }: AmountFiltersProps) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Amount Range</label>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="minAmount" className="block text-sm text-gray-600">
            Min
          </label>
          <input
            type="number"
            id="minAmount"
            name="minAmount"
            value={minAmount || ''}
            onChange={(e) => onAmountChange(e.target.value, maxAmount)}
            placeholder="0.00"
            step="0.01"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="maxAmount" className="block text-sm text-gray-600">
            Max
          </label>
          <input
            type="number"
            id="maxAmount"
            name="maxAmount"
            value={maxAmount || ''}
            onChange={(e) => onAmountChange(minAmount, e.target.value)}
            placeholder="0.00"
            step="0.01"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
