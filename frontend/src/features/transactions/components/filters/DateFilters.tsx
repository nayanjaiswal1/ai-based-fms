import { TRANSACTION_DATE_PRESETS, getTransactionDateRange, type TransactionDatePreset } from '@/config/datePresets.config';

interface DateFiltersProps {
  startDate?: string;
  endDate?: string;
  onDateChange: (startDate?: string, endDate?: string) => void;
}

export function DateFilters({ startDate, endDate, onDateChange }: DateFiltersProps) {
  const handlePresetClick = (preset: TransactionDatePreset) => {
    const { startDate: start, endDate: end } = getTransactionDateRange(preset);
    onDateChange(start, end);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Date Range</label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {TRANSACTION_DATE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => handlePresetClick(preset.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            From
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={startDate || ''}
            onChange={(e) => onDateChange(e.target.value, endDate)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            To
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={endDate || ''}
            onChange={(e) => onDateChange(startDate, e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
