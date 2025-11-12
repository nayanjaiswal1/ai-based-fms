export enum InsightType {
  SPENDING = 'spending',
  BUDGET = 'budget',
  SAVINGS = 'savings',
  ANOMALY = 'anomaly',
  TREND = 'trend',
  HEALTH = 'health',
  PREDICTION = 'prediction',
}

export enum InsightSeverity {
  INFO = 'info',
  WARNING = 'warning',
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface Insight {
  id: string;
  type: string;
  severity: InsightSeverity;
  title: string;
  description: string;
  actionable?: string;
  impact?: string;
  category?: string;
  amount?: number;
  percentage?: number;
  relatedData?: any;
  createdAt: Date;
}

export interface FinancialHealth {
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'needs_improvement';
  breakdown: {
    savingsRate: { score: number; value: number };
    budgetAdherence: { score: number; value: number };
    expenseRatio: { score: number; value: number };
    stability: { score: number; value: number };
  };
  trend: {
    change: number;
    direction: 'up' | 'down' | 'stable';
  };
  recommendations: string[];
}

export interface SavingsOpportunity {
  id: string;
  category: string;
  description: string;
  potentialSavings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeframe: 'immediate' | 'short_term' | 'long_term';
  actionable: string;
}

export interface CategoryTrend {
  category: string;
  currentMonth: number;
  lastMonth: number;
  threeMonthAvg: number;
  change: number;
  changePercentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonality?: string;
}

export interface Prediction {
  category: string;
  predictedAmount: number;
  confidence: number;
  historicalAverage: number;
  basis: string;
}

export interface InsightsResponse {
  summary: {
    totalInsights: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  };
  insights: Insight[];
  financialHealth?: FinancialHealth;
  savingsOpportunities?: SavingsOpportunity[];
  categoryTrends?: CategoryTrend[];
  predictions?: {
    nextMonthExpenses: number;
    expectedSavings: number;
    budgetRisks: string[];
    confidence: number;
    byCategory: Prediction[];
  };
  generatedAt: Date;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface InsightsOptions {
  startDate?: string;
  endDate?: string;
  types?: InsightType[];
  useAI?: boolean;
  includePredictions?: boolean;
}
