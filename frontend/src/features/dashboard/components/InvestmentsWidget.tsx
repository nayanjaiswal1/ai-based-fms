import { ArrowRight } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

interface PortfolioStats {
  totalCurrentValue: number;
  totalROI: number;
  totalROIPercentage: number;
}

interface InvestmentsWidgetProps {
  portfolioStats: PortfolioStats;
  onClick: () => void;
}

export function InvestmentsWidget({ portfolioStats, onClick }: InvestmentsWidgetProps) {
  const { symbol } = useCurrency();
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Investments</h2>
        <ArrowRight className="h-5 w-5 text-gray-400" />
      </div>
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Portfolio Value</span>
          <span className="font-semibold text-gray-900">
            {symbol()}{portfolioStats.totalCurrentValue.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total Return</span>
          <span
            className={`font-semibold ${
              portfolioStats.totalROI >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {portfolioStats.totalROI >= 0 ? '+' : ''}{symbol()}{portfolioStats.totalROI.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">ROI</span>
          <span
            className={`font-semibold ${
              portfolioStats.totalROIPercentage >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {portfolioStats.totalROIPercentage >= 0 ? '+' : ''}
            {portfolioStats.totalROIPercentage.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}
