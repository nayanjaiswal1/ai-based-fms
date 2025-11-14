import { DollarSign, TrendingUp, TrendingDown, Percent, LucideIcon } from 'lucide-react';

interface PortfolioStats {
  totalInvested: number;
  totalCurrentValue: number;
  totalROI: number;
  totalROIPercentage: number;
}

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
  valueColor?: string;
}

function StatCard({ label, value, icon: Icon, bgColor, iconColor, valueColor = 'text-gray-900' }: StatCardProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bgColor}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

interface PortfolioSummaryProps {
  stats: PortfolioStats;
}

export function PortfolioSummary({ stats }: PortfolioSummaryProps) {
  const totalInvested = stats?.totalInvested ?? 0;
  const totalCurrentValue = stats?.totalCurrentValue ?? 0;
  const totalROI = stats?.totalROI ?? 0;
  const totalROIPercentage = stats?.totalROIPercentage ?? 0;

  const isROIPositive = totalROI >= 0;
  const isROIPercentagePositive = totalROIPercentage >= 0;

  return (
    <div className="grid gap-6 md:grid-cols-4">
      <StatCard
        label="Total Invested"
        value={`$${totalInvested.toFixed(2)}`}
        icon={DollarSign}
        bgColor="bg-blue-100"
        iconColor="text-blue-600"
      />

      <StatCard
        label="Current Value"
        value={`$${totalCurrentValue.toFixed(2)}`}
        icon={TrendingUp}
        bgColor="bg-green-100"
        iconColor="text-green-600"
      />

      <StatCard
        label="Total Return"
        value={`${isROIPositive ? '+' : ''}$${totalROI.toFixed(2)}`}
        icon={isROIPositive ? TrendingUp : TrendingDown}
        bgColor={isROIPositive ? 'bg-green-100' : 'bg-red-100'}
        iconColor={isROIPositive ? 'text-green-600' : 'text-red-600'}
        valueColor={isROIPositive ? 'text-green-600' : 'text-red-600'}
      />

      <StatCard
        label="ROI %"
        value={`${isROIPercentagePositive ? '+' : ''}${totalROIPercentage.toFixed(2)}%`}
        icon={Percent}
        bgColor={isROIPercentagePositive ? 'bg-green-100' : 'bg-red-100'}
        iconColor={isROIPercentagePositive ? 'text-green-600' : 'text-red-600'}
        valueColor={isROIPercentagePositive ? 'text-green-600' : 'text-red-600'}
      />
    </div>
  );
}
