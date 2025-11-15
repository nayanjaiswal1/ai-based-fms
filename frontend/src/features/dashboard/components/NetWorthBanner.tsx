import { ArrowRight } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

interface NetWorthData {
  netWorth: number;
}

interface NetWorthBannerProps {
  data: NetWorthData | null | undefined;
  onClick: () => void;
}

export function NetWorthBanner({ data, onClick }: NetWorthBannerProps) {
  const { symbol } = useCurrency();
  if (!data) return null;

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white shadow-lg transition-shadow hover:shadow-xl"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">Net Worth</p>
          <p className="mt-2 text-4xl font-bold">{symbol()}{data.netWorth.toFixed(2)}</p>
        </div>
        <ArrowRight className="h-6 w-6 opacity-75" />
      </div>
    </div>
  );
}
