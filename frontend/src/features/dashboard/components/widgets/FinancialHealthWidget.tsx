import { Activity, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface HealthMetrics {
  score: number;
  savingsRate: number;
  debtToIncomeRatio: number;
  emergencyFundMonths: number;
  budgetAdherence: number;
}

interface Props {
  metrics?: HealthMetrics;
  config?: Record<string, any>;
}

export function FinancialHealthWidget({ metrics, config }: Props) {
  const score = metrics?.score || 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-8 w-8 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="h-8 w-8 text-yellow-600" />;
    return <XCircle className="h-8 w-8 text-red-600" />;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          {config?.title || 'Financial Health Score'}
        </h3>
        <Activity className="h-5 w-5 text-purple-500" />
      </div>

      <div className="flex items-center gap-4 mb-4">
        {getScoreIcon(score)}
        <div>
          <p className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}/100</p>
          <p className="text-sm text-gray-600">{getScoreLabel(score)}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Savings Rate</span>
          <span className="font-semibold text-gray-900">
            {metrics?.savingsRate?.toFixed(1) || 0}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Debt to Income</span>
          <span className="font-semibold text-gray-900">
            {metrics?.debtToIncomeRatio?.toFixed(1) || 0}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Emergency Fund</span>
          <span className="font-semibold text-gray-900">
            {metrics?.emergencyFundMonths?.toFixed(1) || 0} months
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Budget Adherence</span>
          <span className="font-semibold text-gray-900">
            {metrics?.budgetAdherence?.toFixed(0) || 0}%
          </span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          {score >= 80 && "Great job! Your finances are in excellent shape."}
          {score >= 60 && score < 80 && "You're doing well. Consider increasing savings."}
          {score < 60 && "Focus on building emergency savings and reducing debt."}
        </p>
      </div>
    </div>
  );
}
